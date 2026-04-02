import { useCallback, useState, useRef } from "react";
import { Upload, FileText, Image, File as FileIcon, FolderUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DropZoneProps {
  onFilesDrop: (files: File[]) => void;
}

export default function DropZone({ onFilesDrop }: DropZoneProps) {
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
    <div className="space-y-4">
      <div
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => void openMultiFilePicker()}
        className={`relative overflow-hidden rounded-2xl border p-6 md:p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragging
            ? "border-primary bg-primary/10 glow-box"
            : droppedFiles.length > 0
            ? "border-primary/35 bg-primary/5"
            : "border-border/80 bg-card hover:border-primary/35 hover:bg-secondary/45 lift-hover"
        }`}
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-primary/10 blur-2xl" />
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
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative z-10 space-y-4"
            >
              <div className="mx-auto flex w-fit items-center gap-3 rounded-xl bg-card/80 px-4 py-2 shadow-sm">
                <span className="text-primary">{getFileIcon(droppedFiles[0].type)}</span>
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground">
                    {droppedFiles.length} item{droppedFiles.length > 1 ? "s" : ""} ready to share
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">{totalKB} KB total</p>
                </div>
              </div>

              <p className="mx-auto max-w-[340px] truncate text-xs font-mono text-muted-foreground">
                {droppedFiles.slice(0, 3).map((file) => file.webkitRelativePath || file.name).join(" • ")}
                {droppedFiles.length > 3 ? " • ..." : ""}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    void openMultiFilePicker();
                  }}
                  className="rounded-lg bg-card px-3 py-2 text-xs font-semibold text-foreground shadow-sm transition-colors hover:bg-secondary"
                >
                  Add files
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    folderInputRef.current?.click();
                  }}
                  className="rounded-lg bg-card px-3 py-2 text-xs font-semibold text-foreground shadow-sm transition-colors hover:bg-secondary"
                >
                  Add folder
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFiles();
                  }}
                  className="rounded-lg px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-destructive"
                >
                  Remove all
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative z-10 space-y-3"
            >
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Upload className={`h-7 w-7 transition-colors ${isDragging ? "text-primary" : "text-primary/90"}`} />
              </div>
              <div className="space-y-1">
                <p className="text-base font-semibold text-foreground">
                  {isDragging ? "Release to upload" : "Drop files or folders"}
                </p>
                <p className="text-sm text-muted-foreground">Drag and drop here, or choose from your device.</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    void openMultiFilePicker();
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-card px-3 py-2 text-xs font-semibold text-foreground shadow-sm transition-colors hover:bg-secondary"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Choose files
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    folderInputRef.current?.click();
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-card px-3 py-2 text-xs font-semibold text-foreground shadow-sm transition-colors hover:bg-secondary"
                >
                  <FolderUp className="h-3.5 w-3.5" />
                  Choose folder
                </button>
              </div>
              <p className="text-xs font-mono text-muted-foreground">Tip: you can also paste files from clipboard.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
