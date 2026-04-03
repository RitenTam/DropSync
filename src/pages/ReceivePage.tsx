import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, ArrowRight } from "lucide-react";

export default function ReceivePage() {
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length >= 4) {
      navigate(`/s/${code.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="scanline-shell min-h-screen flex flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(128,255,96,0.08),transparent_28%),radial-gradient(circle_at_10%_12%,rgba(128,255,96,0.05),transparent_20%)]" />

      <header className="relative z-10 px-4 py-4">
        <div className="mx-auto flex max-w-[560px] items-center justify-between text-[11px] font-medium tracking-[0.28em] text-foreground/70">
          <a href="/" className="inline-flex items-center gap-2 transition-colors hover:text-primary">
            <span className="grid h-7 w-7 place-items-center rounded-full border border-primary/30 bg-primary/10 text-primary">
              <Zap className="h-3.5 w-3.5" />
            </span>
            <span>DropSync</span>
          </a>
          <a href="/" className="transition-colors hover:text-primary">[share]</a>
        </div>
      </header>

      <main className="relative z-10 flex-1 px-4 pb-10 pt-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto w-full max-w-[460px] space-y-6 text-center"
        >
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              Enter code<span className="text-primary animate-blink">_</span>
            </h1>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Type the 6-character room code to receive content.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
              placeholder="ABC123"
              maxLength={6}
              className="terminal-input w-full rounded-xl px-4 py-4 text-center text-3xl font-semibold tracking-[0.4em] outline-none placeholder:text-muted-foreground/30 focus:ring-2 focus:ring-primary/25"
              autoFocus
            />
            <button
              type="submit"
              disabled={code.length < 4}
              className={`w-full py-3 font-mono font-semibold text-sm rounded-md transition-all inline-flex items-center justify-center gap-2 ${
                code.length >= 4
                  ? "bg-primary text-primary-foreground hover:opacity-90 glow-box"
                  : "border border-border/70 bg-[#111515] text-muted-foreground cursor-not-allowed"
              }`}
            >
              Open <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
