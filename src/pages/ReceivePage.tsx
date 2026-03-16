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
          className="w-full max-w-sm space-y-6 text-center"
        >
          <div className="space-y-1">
            <h1 className="text-xl font-mono font-bold text-foreground">
              Enter code<span className="text-primary animate-blink">_</span>
            </h1>
            <p className="text-xs text-muted-foreground font-mono">
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
              className="w-full text-center text-3xl font-mono font-bold tracking-[0.4em] bg-secondary border border-border rounded-md p-4 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              autoFocus
            />
            <button
              type="submit"
              disabled={code.length < 4}
              className={`w-full py-3 font-mono font-semibold text-sm rounded-md transition-all inline-flex items-center justify-center gap-2 ${
                code.length >= 4
                  ? "bg-primary text-primary-foreground hover:opacity-90 glow-box"
                  : "bg-secondary text-muted-foreground cursor-not-allowed"
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
