import { useCallback, useState, useRef } from "react";
import { Upload, FileText, Image, File as FileIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DropZoneProps {
  onFileDrop: (file: File | null) => void;
  onTextPaste: (text: string) => void;
  textValue: string;
  onTextChange: (text: string) => void;
}

export default function DropZone({ onFileDrop, onTextPaste, textValue, onTextChange }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [droppedFile, setDroppedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setDroppedFile(files[0]);
      onFileDrop(files[0]);
    }
  }, [onFileDrop]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const files = e.clipboardData.files;
    if (files.length > 0) {
      e.preventDefault();
      setDroppedFile(files[0]);
      onFileDrop(files[0]);
      return;
    }
    // Text paste handled by textarea onChange
  }, [onFileDrop]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setDroppedFile(files[0]);
      onFileDrop(files[0]);
    }
  }, [onFileDrop]);

  const clearFile = () => {
    setDroppedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onFileDrop(null);
  };

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
          disabled={!!droppedFile}
        />
        <span className="absolute bottom-2 right-2 text-muted-foreground text-xs font-mono">
          {textValue.length > 0 ? `${textValue.length} chars` : ""}
        </span>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-muted-foreground text-xs font-mono uppercase tracking-widest">or drop a file</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Drop zone */}
      <div
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !droppedFile && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-md p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? "border-primary bg-primary/5 glow-box"
            : droppedFile
            ? "border-primary/40 bg-secondary"
            : "border-border hover:border-primary/40 bg-secondary/50 hover:bg-secondary"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
        />

        <AnimatePresence mode="wait">
          {droppedFile ? (
            <motion.div
              key="file"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center justify-center gap-3"
            >
              <span className="text-primary">{getFileIcon(droppedFile.type)}</span>
              <div className="text-left">
                <p className="text-sm font-mono text-foreground truncate max-w-[200px]">{droppedFile.name}</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {(droppedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); clearFile(); }}
                className="ml-2 text-xs text-muted-foreground hover:text-destructive font-mono transition-colors"
              >
                [remove]
              </button>
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
                {isDragging ? "Drop it!" : "Drag & drop or click to browse"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
