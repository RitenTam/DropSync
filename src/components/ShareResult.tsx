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
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const shareUrl = `${window.location.origin}/s/${item.code}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(item.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Code display */}
      <div className="text-center space-y-2">
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">Room Code</p>
        <button
          onClick={copyCode}
          className="text-4xl font-mono font-bold text-primary tracking-[0.3em] glow-text hover:opacity-80 transition-opacity"
        >
          {item.code}
        </button>
      </div>

      {/* Link */}
      <div className="flex items-center gap-2 bg-secondary rounded-md p-2 border border-border">
        <span className="flex-1 text-xs font-mono text-secondary-foreground truncate">{shareUrl}</span>
        <button
          onClick={copyLink}
          className="p-1.5 rounded bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
        <a
          href={shareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* QR Toggle */}
      <div className="text-center">
        <button
          onClick={() => setShowQR(!showQR)}
          className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-primary transition-colors"
        >
          <QrCode className="w-4 h-4" />
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
            <div className="bg-foreground p-3 rounded-md">
              <QRCodeSVG
                value={shareUrl}
                size={160}
                bgColor="hsl(120, 100%, 90%)"
                fgColor="hsl(220, 15%, 6%)"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Meta */}
      <div className="flex justify-between text-xs font-mono text-muted-foreground">
        <span>
          Expires: {new Date(item.expiresAt).toLocaleTimeString()}
        </span>
        <span>
          {item.oneTimeDownload ? "One-time link" : "Multi-use"}
        </span>
      </div>

      {/* New share */}
      <button
        onClick={onReset}
        className="w-full py-2 text-xs font-mono text-muted-foreground hover:text-primary border border-border hover:border-primary/40 rounded-md transition-all"
      >
        [new share]
      </button>
    </motion.div>
  );
}
