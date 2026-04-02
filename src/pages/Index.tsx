import { useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import JSZip from "jszip";
import DropZone from "@/components/DropZone";
import ShareOptions from "@/components/ShareOptions";
import ShareResult from "@/components/ShareResult";
import { createShare, type ShareItem } from "@/lib/shareStore";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [expiry, setExpiry] = useState(10 * 60 * 1000);
  const [oneTime, setOneTime] = useState(false);
  const [password, setPassword] = useState("");
  const [shareResult, setShareResult] = useState<ShareItem | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  const uploadIdRef = useRef(0);

  const cancelUpload = useCallback(
    (showNotification = false) => {
      // Cancel any in-flight upload so we don't get stuck in "Uploading..."
      uploadIdRef.current += 1;
      setIsSharing(false);

      if (showNotification && isSharing) {
        toast({
          title: "Upload cancelled",
          description: "You can now select a new file.",
          variant: "destructive",
        });
      }
    },
    [isSharing]
  );

  const clearFile = useCallback(() => {
    setFiles([]);
    cancelUpload(true);
  }, [cancelUpload]);

  const handleFilesDrop = useCallback(
    (selectedFiles: File[]) => {
      if (selectedFiles.length > 0) {
        setFiles(selectedFiles);
        setText("");
        return;
      }

      clearFile();
    },
    [clearFile, setText]
  );

  const buildZipFromFiles = useCallback(async (selectedFiles: File[]) => {
    const zip = new JSZip();

    selectedFiles.forEach((sourceFile) => {
      const fileWithPath = sourceFile as File & { webkitRelativePath?: string };
      const path = fileWithPath.webkitRelativePath || sourceFile.name;
      zip.file(path, sourceFile);
    });

    const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    return new File([blob], `dropsync-${timestamp}.zip`, { type: "application/zip" });
  }, []);

  const handleShare = async () => {
    if (!text && files.length === 0) return;

    setIsSharing(true);
    const currentUploadId = ++uploadIdRef.current;

    try {
      const hasFolderSelection = files.some((f) => {
        const fileWithPath = f as File & { webkitRelativePath?: string };
        return !!fileWithPath.webkitRelativePath;
      });

      const uploadFile = files.length === 0
        ? undefined
        : files.length === 1 && !hasFolderSelection
          ? files[0]
          : await buildZipFromFiles(files);

      const item = await createShare({
        type: uploadFile ? "file" : "text",
        content: uploadFile ? undefined : text,
        file: uploadFile,
        password: password || undefined,
        expiresAt: Date.now() + expiry,
        oneTimeDownload: oneTime,
      });

      // If the user cleared the file while uploading, ignore the result.
      if (currentUploadId !== uploadIdRef.current) return;

      setShareResult(item);
    } catch (err) {
      console.error("Share failed:", err);
    } finally {
      if (currentUploadId === uploadIdRef.current) {
        setIsSharing(false);
      }
    }
  };

  const handleReset = () => {
    // Cancel any in-flight upload so it doesn't update state after reset
    uploadIdRef.current += 1;

    setText("");
    setFiles([]);
    setPassword("");
    setOneTime(false);
    setShareResult(null);
    setIsSharing(false);
  };

  const canShare = text.length > 0 || files.length > 0;

  return (
    <div className="min-h-screen flex flex-col scanline">
      <header className="border-b border-border px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <span className="font-mono font-bold text-foreground tracking-tight">
              DropSync
            </span>
          </a>
          <Link
            to="/receive"
            className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors"
          >
            [receive]
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg space-y-6"
        >
          <div className="space-y-1">
            <h1 className="text-xl font-mono font-bold text-foreground">
              Share anything<span className="text-primary animate-blink">_</span>
            </h1>
            <p className="text-xs text-muted-foreground font-mono">
              Paste text, drop files. Get a code. Share instantly.
            </p>
          </div>

          {!shareResult ? (
            <>
              <DropZone
                onFilesDrop={handleFilesDrop}
                textValue={text}
                onTextChange={(v) => {
                  setText(v);
                  clearFile();
                }}
              />

              <ShareOptions
                expiry={expiry}
                onExpiryChange={setExpiry}
                oneTime={oneTime}
                onOneTimeChange={setOneTime}
                password={password}
                onPasswordChange={setPassword}
              />

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleShare}
                  disabled={!canShare || isSharing}
                  className={`w-full py-3 font-mono font-semibold text-sm rounded-md transition-all ${
                    canShare
                      ? "bg-primary text-primary-foreground hover:opacity-90 glow-box animate-pulse-glow"
                      : "bg-secondary text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  {isSharing ? "Uploading..." : "→ Generate Share Link"}
                </button>

                {isSharing ? (
                  <button
                    type="button"
                    onClick={clearFile}
                    className="w-full py-3 font-mono font-semibold text-sm rounded-md bg-destructive text-destructive-foreground hover:opacity-90"
                  >
                    Cancel upload
                  </button>
                ) : null}
              </div>
            </>
          ) : (
            <ShareResult item={shareResult} onReset={handleReset} />
          )}
        </motion.div>
      </main>

      <footer className="border-t border-border px-4 py-3 text-center">
        <p className="text-xs font-mono text-muted-foreground">
          No login · No tracking · Auto-expires · E2E
        </p>
        <p className="text-xs font-mono text-muted-foreground">
          Developed by Ritendra Tamang
        </p>
      </footer>
    </div>
  );
};

export default Index;
