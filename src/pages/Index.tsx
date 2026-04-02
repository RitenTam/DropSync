import { useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Zap, Loader2, ShieldCheck, Clock3, EyeOff, Sparkles } from "lucide-react";
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
        return;
      }

      clearFile();
    },
    [clearFile]
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

  const createShareLink = async (shareType: "file" | "text") => {
    const hasText = text.trim().length > 0;
    const hasFiles = files.length > 0;

    if (shareType === "text" && !hasText) return;
    if (shareType === "file" && !hasFiles) return;

    setIsSharing(true);
    const currentUploadId = ++uploadIdRef.current;

    try {
      const hasFolderSelection = files.some((f) => {
        const fileWithPath = f as File & { webkitRelativePath?: string };
        return !!fileWithPath.webkitRelativePath;
      });

      const uploadFile = shareType === "file"
        ? files.length === 1 && !hasFolderSelection
          ? files[0]
          : await buildZipFromFiles(files)
        : undefined;

      const item = await createShare({
        type: shareType,
        content: shareType === "text" ? text.trim() : undefined,
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

  const handleShare = async () => {
    if (canShareFiles) {
      await createShareLink("file");
    } else if (canShareText) {
      await createShareLink("text");
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

  const canShareFiles = files.length > 0;
  const canShareText = text.trim().length > 0;
  const trustPoints = [
    { icon: ShieldCheck, label: "Secure sharing" },
    { icon: EyeOff, label: "No tracking" },
    { icon: Clock3, label: "Auto-expiry" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-4 py-4 md:px-8">
        <div className="mx-auto flex w-full max-w-6xl items-center rounded-2xl border border-border/65 bg-card/80 px-4 py-3 shadow-sm backdrop-blur-md">
          <a href="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Zap className="h-4 w-4" />
            </span>
            <span className="text-lg font-extrabold tracking-tight">
              DropSync
            </span>
          </a>
        </div>
      </header>

      <main className="flex-1 px-4 pb-10 pt-3 md:px-8 md:pt-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto grid w-full max-w-6xl gap-5 lg:grid-cols-12"
        >
          <section className="lg:col-span-8 space-y-4">
            <div className="hero-dot-grid rounded-3xl border border-border/60 bg-card/55 p-5 md:p-7">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-primary/12 px-3 py-1 text-xs font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Fast and secure sharing
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight text-foreground">
                Share files, folders, or text in seconds
              </h1>
              <p className="mt-3 max-w-2xl text-sm md:text-base text-muted-foreground">
                No login required. Configure expiry, optional one-time access, and password protection,
                then generate a share link your recipients can open instantly.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                {trustPoints.map((point) => (
                  <span
                    key={point.label}
                    className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm"
                  >
                    <point.icon className="h-3.5 w-3.5 text-primary" />
                    {point.label}
                  </span>
                ))}
                <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground">
                  No login
                </span>
              </div>
            </div>

            {!shareResult ? (
              <div className="grid gap-4 xl:grid-cols-2">
                <div className="space-y-4 rounded-3xl border border-border/65 bg-card p-4 md:p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Upload files</p>
                      <p className="text-xs text-muted-foreground">Drop files or folders, then generate a link.</p>
                    </div>
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
                      Files
                    </span>
                  </div>

                  <DropZone onFilesDrop={handleFilesDrop} />

                  <button
                    type="button"
                    onClick={handleShare}
                    disabled={(!canShareFiles && !canShareText) || isSharing}
                    className={`group relative w-full overflow-hidden rounded-2xl px-5 py-4 text-base font-bold transition-all duration-300 ${
                      (canShareFiles || canShareText)
                        ? "bg-primary text-primary-foreground glow-box-strong hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0"
                        : "bg-secondary text-muted-foreground cursor-not-allowed"
                    }`}
                  >
                    <span className="relative z-10 inline-flex items-center gap-2">
                      {isSharing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      {isSharing ? "Generating secure link..." : "Generate Share Link"}
                    </span>
                    {(canShareFiles || canShareText) ? (
                      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                    ) : null}
                  </button>

                  <div className="pt-1 text-center">
                    <Link
                      to="/receive"
                      className="text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                    >
                      Receive link
                    </Link>
                  </div>

                  <AnimatePresence>
                    {isSharing && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="rounded-xl border border-border/70 bg-secondary/75 px-3 py-2"
                      >
                        <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                          <span>Encrypting and uploading</span>
                          <span>Please wait...</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-card">
                          <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: "180%" }}
                            transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                            className="h-full w-1/3 rounded-full bg-primary"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {isSharing ? (
                    <button
                      type="button"
                      onClick={clearFile}
                      className="w-full rounded-xl border border-destructive/40 bg-destructive/10 py-2.5 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/15"
                    >
                      Cancel upload
                    </button>
                  ) : null}
                </div>

                <div className="space-y-4 rounded-3xl border border-border/65 bg-card p-4 md:p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Share text</p>
                      <p className="text-xs text-muted-foreground">Paste notes, snippets, or messages and share them directly.</p>
                    </div>
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
                      Text
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">Paste text</p>
                      <p className="text-xs font-mono text-muted-foreground">{text.length} chars</p>
                    </div>
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Share code snippets, notes, logs, or quick messages..."
                      className="h-56 w-full resize-none rounded-2xl border border-border/70 bg-secondary/75 p-3 text-sm text-foreground shadow-inner outline-none transition-all focus:border-primary/35 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Use the Generate Share Link button in the file panel above to share your text.
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-border/65 bg-card p-4 md:p-6 shadow-sm">
                <ShareResult item={shareResult} onReset={handleReset} />
              </div>
            )}
          </section>

          <aside className="lg:col-span-4 space-y-4">
            {!shareResult ? (
              <ShareOptions
                expiry={expiry}
                onExpiryChange={setExpiry}
                oneTime={oneTime}
                onOneTimeChange={setOneTime}
                password={password}
                onPasswordChange={setPassword}
              />
            ) : null}

            <section className="panel-surface rounded-2xl p-4 md:p-5 shadow-sm">
              <p className="text-sm font-semibold text-foreground">How it works</p>
              <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>1. Add your files/folders or paste text.</li>
                <li>2. Set expiry and optional security controls.</li>
                <li>3. Generate and copy your secure share link.</li>
              </ol>
            </section>
          </aside>
        </motion.div>
      </main>

      <footer className="px-4 pb-8 pt-2 text-center md:px-8">
        <p className="text-xs text-muted-foreground">
          No login · No tracking · Auto-expires · E2E
        </p>
        <p className="text-xs text-muted-foreground">
          Developed by Ritendra Tamang
        </p>
      </footer>
    </div>
  );
};

export default Index;
