import { useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import DropZone from "@/components/DropZone";
import ShareOptions from "@/components/ShareOptions";
import ShareResult from "@/components/ShareResult";
import { createShare, type ShareItem } from "@/lib/shareStore";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
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
    setFile(null);
    cancelUpload(true);
  }, [cancelUpload]);

  const handleFileDrop = useCallback(
    (f: File | null) => {
      if (f) {
        setFile(f);
        setText("");
        return;
      }

      clearFile();
    },
    [clearFile, setText]
  );

  const handleShare = async () => {
    if (!text && !file) return;

    setIsSharing(true);
    const currentUploadId = ++uploadIdRef.current;

    try {
      const item = await createShare({
        type: file ? "file" : "text",
        content: file ? undefined : text,
        file: file ?? undefined,
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
    setFile(null);
    setPassword("");
    setOneTime(false);
    setShareResult(null);
    setIsSharing(false);
  };

  const canShare = text.length > 0 || file !== null;

  return (
    <div className="min-h-screen flex flex-col scanline">
      <header className="border-b border-border px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <span className="font-mono font-bold text-foreground tracking-tight">
              DropSync
            </span>
          </div>
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
                onFileDrop={handleFileDrop}
                onTextPaste={() => {}}
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
      </footer>
    </div>
  );
};

export default Index;
