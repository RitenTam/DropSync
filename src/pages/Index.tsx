import { useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Zap, Loader2, ShieldCheck, Clock3, EyeOff, Sparkles, Instagram } from "lucide-react";
import JSZip from "jszip";
import DropZone from "@/components/DropZone";
import ShareOptions from "@/components/ShareOptions";
import ShareResult from "@/components/ShareResult";
import { createShare, type ShareItem } from "@/lib/shareStore";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const currentYear = new Date().getFullYear();
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
    <div className="scanline-shell min-h-screen overflow-hidden text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(128,255,96,0.08),transparent_28%),radial-gradient(circle_at_10%_12%,rgba(128,255,96,0.05),transparent_20%),radial-gradient(circle_at_90%_16%,rgba(128,255,96,0.05),transparent_20%)]" />

      <header className="relative z-10 px-4 pt-4 md:px-8 md:pt-6">
        <div className="mx-auto flex w-full max-w-[560px] items-center justify-between text-[11px] font-medium tracking-[0.28em] text-foreground/70">
          <a href="/" className="inline-flex items-center gap-2 text-foreground/90 transition-colors hover:text-primary">
            <span className="grid h-7 w-7 place-items-center rounded-full border border-primary/30 bg-primary/10 text-primary">
              <Zap className="h-3.5 w-3.5" />
            </span>
            <span>DropSync</span>
          </a>
          <Link
            to="/receive"
            className="inline-flex items-center rounded-full border border-primary/45 bg-primary/15 px-3 py-1.5 text-xs font-semibold tracking-[0.22em] text-primary shadow-[0_0_12px_rgba(128,255,96,0.2)] transition-all hover:bg-primary/25 hover:shadow-[0_0_16px_rgba(128,255,96,0.28)]"
          >
            [receive]
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex-1 px-4 pb-10 pt-9 md:px-8 md:pt-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto w-full max-w-[560px]"
        >
          <section className="space-y-6">
            <div className="space-y-4 text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-[#0d1010] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-primary/90">
                <Sparkles className="h-3.5 w-3.5" />
                Share anything
              </div>
              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl">
                Share anything<span className="animate-blink text-primary">_</span>
              </h1>
              <p className="mx-auto max-w-[44ch] text-sm leading-6 text-muted-foreground">
                Paste text, drop files. Get a code. Share instantly.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                {trustPoints.map((point) => (
                  <span
                    key={point.label}
                    className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-[#0d1010] px-3 py-1.5 text-[11px] font-medium text-muted-foreground"
                  >
                    <point.icon className="h-3.5 w-3.5 text-primary" />
                    {point.label}
                  </span>
                ))}
              </div>
            </div>

            {!shareResult ? (
              <div className="space-y-4">
                <div className="glass-panel rounded-xl p-2">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste text, code, or anything here..."
                    className="terminal-input min-h-[118px] w-full resize-none rounded-lg px-4 py-3 text-sm leading-6 outline-none placeholder:text-muted-foreground/75"
                  />
                </div>

                <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.35em] text-foreground/55">
                  <span className="h-px flex-1 bg-border/70" />
                  <span>OR DROP A FILE</span>
                  <span className="h-px flex-1 bg-border/70" />
                </div>

                <DropZone onFilesDrop={handleFilesDrop} />

                <ShareOptions
                  expiry={expiry}
                  onExpiryChange={setExpiry}
                  oneTime={oneTime}
                  onOneTimeChange={setOneTime}
                  password={password}
                  onPasswordChange={setPassword}
                />

                <button
                  type="button"
                  onClick={handleShare}
                  disabled={(!canShareFiles && !canShareText) || isSharing}
                  className={`group relative w-full overflow-hidden rounded-xl border px-5 py-3.5 text-sm font-semibold transition-all duration-300 ${
                    canShareFiles || canShareText
                      ? "border-primary/30 bg-primary text-primary-foreground glow-box-strong hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0"
                      : "border-border/70 bg-[#111515] text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  <span className="relative z-10 inline-flex items-center gap-2">
                    {isSharing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {isSharing ? "Generating Share Link" : "Generate Share Link"}
                  </span>
                  {(canShareFiles || canShareText) ? (
                    <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  ) : null}
                </button>

                <div className="text-center">
                  <Link to="/receive" className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-primary">
                    Receive instead
                  </Link>
                </div>

                <AnimatePresence>
                  {isSharing && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="glass-panel rounded-xl px-3 py-2"
                    >
                      <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Encrypting and uploading</span>
                        <span>Please wait...</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#111515]">
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
            ) : (
              <div className="glass-panel rounded-3xl p-4 md:p-6">
                <ShareResult item={shareResult} onReset={handleReset} />
              </div>
            )}
          </section>
        </motion.div>
      </main>

      <footer className="relative z-10 px-4 pb-8 pt-2 text-center md:px-8">
        <p className="text-xs text-muted-foreground">
          No login · No tracking · Auto-expires · E2E
        </p>
        <p className="mt-1 text-xs text-muted-foreground/80">
          © {currentYear} Ritendra Tamang. All rights reserved.
        </p>
        <a
          href="https://www.instagram.com/riten_07/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contact Ritendra on Instagram"
          className="mt-3 inline-flex items-center justify-center rounded-full border border-border/70 bg-[#0d1010] p-2 text-muted-foreground transition-colors hover:text-primary"
        >
          <Instagram className="h-4 w-4" />
        </a>
      </footer>
    </div>
  );
};

export default Index;
