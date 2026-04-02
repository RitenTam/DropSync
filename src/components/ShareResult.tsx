import { useState } from "react";
import { Copy, Check, QrCode, ExternalLink } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import type { ShareItem } from "@/lib/shareStore";

interface ShareResultProps {
  item: ShareItem;
  onReset: () => void;
}

export default function ShareResult({ item, onReset }: ShareResultProps) {
  const [copiedTarget, setCopiedTarget] = useState<"code" | "link" | null>(null);
  const [showQR, setShowQR] = useState(false);

  const shareUrl = `${window.location.origin}/s/${item.code}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopiedTarget("link");
    setTimeout(() => setCopiedTarget(null), 1600);
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(item.code);
    setCopiedTarget("code");
    setTimeout(() => setCopiedTarget(null), 1600);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary">
        Share ready. Send the link or code to your recipient.
      </div>

      <div className="text-center space-y-2 rounded-2xl border border-border/70 bg-card px-4 py-5 shadow-sm">
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">Share Code</p>
        <button
          type="button"
          onClick={copyCode}
          className="text-4xl font-mono font-semibold tracking-[0.28em] text-primary glow-text transition-opacity hover:opacity-80"
        >
          {item.code}
        </button>
        <p className="text-xs text-muted-foreground">Tap the code to copy</p>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card p-3 shadow-sm">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Share link</p>
        <div className="flex items-center gap-2 rounded-xl bg-secondary/80 p-2">
          <span className="flex-1 truncate px-1 text-xs font-mono text-secondary-foreground">{shareUrl}</span>
          <button
            type="button"
            onClick={copyLink}
            className="rounded-lg bg-card p-2 text-primary shadow-sm transition-all hover:-translate-y-0.5 hover:bg-card/95"
            aria-label="Copy link"
          >
            {copiedTarget === "link" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-card p-2 text-primary shadow-sm transition-all hover:-translate-y-0.5 hover:bg-card/95"
            aria-label="Open link"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={() => setShowQR(!showQR)}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
        >
          <QrCode className="h-4 w-4" />
          {showQR ? "Hide QR" : "Show QR Code"}
        </button>
      </div>

      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex justify-center overflow-hidden"
          >
            <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
              <QRCodeSVG
                value={shareUrl}
                size={160}
                bgColor="hsl(0, 0%, 100%)"
                fgColor="hsl(222, 35%, 16%)"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between rounded-xl bg-secondary/70 px-3 py-2 text-xs text-muted-foreground">
        <span>
          Expires: {new Date(item.expiresAt).toLocaleTimeString()}
        </span>
        <span>
          {item.oneTimeDownload ? "One-time link" : "Multi-use"}
        </span>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="w-full rounded-xl border border-border/80 bg-card py-2.5 text-sm font-semibold text-muted-foreground transition-all hover:border-primary/30 hover:text-primary"
      >
        Start new share
      </button>

      <AnimatePresence>
        {copiedTarget && (
          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-center text-xs text-primary"
          >
            {copiedTarget === "link" ? "Link copied to clipboard" : "Code copied to clipboard"}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
