import { useCallback, useState, useRef } from "react";
import { Upload, FileText, Image, File as FileIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DropZoneProps {
  onFilesDrop: (files: File[]) => void;
  textValue: string;
  onTextChange: (text: string) => void;
}

export default function DropZone({ onFilesDrop, textValue, onTextChange }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [droppedFiles, setDroppedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const mergeFiles = useCallback((incoming: File[]) => {
    if (incoming.length === 0) return;

    setDroppedFiles((prev) => {
      const map = new Map<string, File>();

      [...prev, ...incoming].forEach((file) => {
        const withPath = file as File & { webkitRelativePath?: string };
        const identity = `${withPath.webkitRelativePath || file.name}:${file.size}:${file.lastModified}`;
        map.set(identity, file);
      });

      const merged = Array.from(map.values());
      onFilesDrop(merged);
      return merged;
    });
  }, [onFilesDrop]);

  const openMultiFilePicker = useCallback(async () => {
    type PickerHandle = { getFile: () => Promise<File> };
    type PickerWindow = Window & {
      showOpenFilePicker?: (options?: { multiple?: boolean }) => Promise<PickerHandle[]>;
    };

    const pickerWindow = window as PickerWindow;

    if (!pickerWindow.showOpenFilePicker) {
      fileInputRef.current?.click();
      return;
    }

    try {
      const handles = await pickerWindow.showOpenFilePicker({ multiple: true });
      const selectedFiles = await Promise.all(handles.map((handle) => handle.getFile()));
      mergeFiles(selectedFiles);
    } catch {
      // User cancelled picker.
    }
  }, [mergeFiles]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      mergeFiles(Array.from(files));
    }
  }, [mergeFiles]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const files = e.clipboardData.files;
    if (files.length > 0) {
      e.preventDefault();
      mergeFiles(Array.from(files));
      return;
    }
    // Text paste handled by textarea onChange
  }, [mergeFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      mergeFiles(Array.from(selectedFiles));
    }
    // Reset value so selecting the same file again still triggers onChange.
    e.target.value = "";
  }, [mergeFiles]);

  const clearFiles = () => {
    setDroppedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (folderInputRef.current) folderInputRef.current.value = "";
    onFilesDrop([]);
  };

  const totalBytes = droppedFiles.reduce((sum, file) => sum + file.size, 0);
  const totalKB = (totalBytes / 1024).toFixed(1);

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <Image className="w-5 h-5" />;
    if (type.includes("pdf") || type.includes("document")) return <FileText className="w-5 h-5" />;
    return <FileIcon className="w-5 h-5" />;
  };

  return (
    <div className="space-y-3">
      {/* Text input */}
      <div className="relative">
        <textarea
          value={textValue}
          onChange={(e) => onTextChange(e.target.value)}
          onPaste={handlePaste}
          placeholder="Paste text, code, or anything here..."
          className="w-full h-32 bg-secondary border border-border rounded-md p-3 font-mono text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          disabled={droppedFiles.length > 0}
        />
        <span className="absolute bottom-2 right-2 text-muted-foreground text-xs font-mono">
          {textValue.length > 0 ? `${textValue.length} chars` : ""}
        </span>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-muted-foreground text-xs font-mono uppercase tracking-widest">or drop files/folders</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Drop zone */}
      <div
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => void openMultiFilePicker()}
        className={`relative border-2 border-dashed rounded-md p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? "border-primary bg-primary/5 glow-box"
            : droppedFiles.length > 0
            ? "border-primary/40 bg-secondary"
            : "border-border hover:border-primary/40 bg-secondary/50 hover:bg-secondary"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
        <input
          ref={folderInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
          onClick={(e) => e.stopPropagation()}
          {...({ webkitdirectory: "", directory: "" } as Record<string, string>)}
        />

        <AnimatePresence mode="wait">
          {droppedFiles.length > 0 ? (
            <motion.div
              key="file"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-center gap-3">
                <span className="text-primary">{getFileIcon(droppedFiles[0].type)}</span>
                <div className="text-left">
                  <p className="text-sm font-mono text-foreground">
                    {droppedFiles.length} item{droppedFiles.length > 1 ? "s" : ""} selected
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {totalKB} KB total
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); clearFiles(); }}
                  className="ml-2 text-xs text-muted-foreground hover:text-destructive font-mono transition-colors"
                >
                  [remove]
                </button>
              </div>
              <p className="text-xs text-muted-foreground font-mono truncate max-w-[320px] mx-auto">
                {droppedFiles.slice(0, 3).map((file) => file.webkitRelativePath || file.name).join(" • ")}
                {droppedFiles.length > 3 ? " • ..." : ""}
              </p>
              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    void openMultiFilePicker();
                  }}
                  className="px-3 py-1.5 rounded-md border border-border text-xs font-mono text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                >
                  Add files
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    folderInputRef.current?.click();
                  }}
                  className="px-3 py-1.5 rounded-md border border-border text-xs font-mono text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                >
                  Add folder
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              <Upload className={`w-8 h-8 mx-auto transition-colors ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
              <p className="text-sm text-muted-foreground font-mono">
                {isDragging ? "Drop it!" : "Drag & drop or click to browse files"}
              </p>
              <p className="text-xs text-muted-foreground font-mono">
                Tip: hold Ctrl/Shift to select multiple files in the chooser.
              </p>
              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    void openMultiFilePicker();
                  }}
                  className="px-3 py-1.5 rounded-md border border-border text-xs font-mono text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                >
                  Choose files
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    folderInputRef.current?.click();
                  }}
                  className="px-3 py-1.5 rounded-md border border-border text-xs font-mono text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                >
                  Choose folder
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
