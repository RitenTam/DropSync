import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Download, FileText, Image, File, Copy, Check, Lock, AlertTriangle } from "lucide-react";
import { getShare, markDownloaded, formatFileSize, type ShareItem } from "@/lib/shareStore";

export default function ViewSharePage() {
  const { code } = useParams<{ code: string }>();
  const [item, setItem] = useState<ShareItem | null | undefined>(undefined);
  const [passwordInput, setPasswordInput] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (code) {
      getShare(code).then((found) => {
        setItem(found ?? null);
        if (found && !found.password) setUnlocked(true);
      });
    }
  }, [code]);

  const handleUnlock = () => {
    if (item && passwordInput === item.password) {
      setUnlocked(true);
      setError("");
    } else {
      setError("Wrong password");
    }
  };

  const handleDownload = () => {
    if (!item || item.type !== "file" || !item.fileUrl) return;
    const link = document.createElement("a");
    link.href = item.fileUrl;
    link.download = item.fileName || "download";
    link.target = "_blank";
    link.click();
    markDownloaded(code!);
  };

  const handleCopyText = async () => {
    if (!item?.content) return;
    await navigator.clipboard.writeText(item.content);
    setCopied(true);
    markDownloaded(code!);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFileIcon = (type?: string) => {
    if (!type) return <File className="w-8 h-8" />;
    if (type.startsWith("image/")) return <Image className="w-8 h-8" />;
    if (type.includes("pdf") || type.includes("document")) return <FileText className="w-8 h-8" />;
    return <File className="w-8 h-8" />;
  };

  return (
    <div className="min-h-screen flex flex-col scanline">
      <header className="border-b border-border px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <span className="font-mono font-bold text-foreground tracking-tight">DropSync</span>
          </a>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg space-y-6"
        >
          {item === undefined && (
            <p className="text-center text-muted-foreground font-mono text-sm">Loading...</p>
          )}

          {item === null && (
            <div className="text-center space-y-3">
              <AlertTriangle className="w-10 h-10 mx-auto text-destructive" />
              <h2 className="font-mono font-bold text-foreground">Not Found or Expired</h2>
              <p className="text-xs text-muted-foreground font-mono">
                This share may have expired or been already downloaded.
              </p>
              <Link to="/" className="inline-block text-xs font-mono text-primary hover:underline">
                [create new share]
              </Link>
            </div>
          )}

          {item && !unlocked && (
            <div className="space-y-4 text-center">
              <Lock className="w-10 h-10 mx-auto text-primary" />
              <h2 className="font-mono font-bold text-foreground">Password Protected</h2>
              <div className="flex gap-2 max-w-xs mx-auto">
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
                  placeholder="Enter password"
                  className="flex-1 bg-secondary border border-border rounded-md px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  autoFocus
                />
                <button
                  onClick={handleUnlock}
                  className="px-4 py-2 bg-primary text-primary-foreground font-mono text-sm rounded-md hover:opacity-90 transition-opacity"
                >
                  Unlock
                </button>
              </div>
              {error && <p className="text-xs text-destructive font-mono">{error}</p>}
            </div>
          )}

          {item && unlocked && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-1">
                  Shared Content
                </p>
                <p className="text-2xl font-mono font-bold text-primary tracking-[0.2em]">{item.code}</p>
              </div>

              {item.type === "text" && item.content && (
                <div className="space-y-2">
                  <div className="bg-secondary border border-border rounded-md p-4 max-h-64 overflow-auto">
                    <pre className="text-sm font-mono text-foreground whitespace-pre-wrap break-words">
                      {item.content}
                    </pre>
                  </div>
                  <button
                    onClick={handleCopyText}
                    className="w-full py-2 bg-primary text-primary-foreground font-mono text-sm rounded-md hover:opacity-90 transition-all glow-box inline-flex items-center justify-center gap-2"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied!" : "Copy to Clipboard"}
                  </button>
                </div>
              )}

              {item.type === "file" && (
                <div className="space-y-3">
                  <div className="bg-secondary border border-border rounded-md p-6 flex items-center justify-center gap-4">
                    <span className="text-primary">{getFileIcon(item.fileType)}</span>
                    <div>
                      <p className="font-mono text-sm text-foreground">{item.fileName}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {item.fileSize ? formatFileSize(item.fileSize) : ""}
                      </p>
                    </div>
                  </div>

                  {item.fileType?.startsWith("image/") && item.fileUrl && (
                    <div className="border border-border rounded-md overflow-hidden">
                      <img src={item.fileUrl} alt={item.fileName} className="w-full" />
                    </div>
                  )}

                  <button
                    onClick={handleDownload}
                    className="w-full py-3 bg-primary text-primary-foreground font-mono text-sm font-semibold rounded-md hover:opacity-90 transition-all glow-box inline-flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download File
                  </button>
                </div>
              )}

              <div className="flex justify-between text-xs font-mono text-muted-foreground">
                <span>Expires: {new Date(item.expiresAt).toLocaleTimeString()}</span>
                <span>{item.oneTimeDownload ? "One-time link" : ""}</span>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
