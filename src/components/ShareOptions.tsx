import { useState } from "react";
import { Clock, Lock, Download } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface ShareOptionsProps {
  expiry: number;
  onExpiryChange: (ms: number) => void;
  oneTime: boolean;
  onOneTimeChange: (v: boolean) => void;
  password: string;
  onPasswordChange: (v: string) => void;
}

const EXPIRY_OPTIONS = [
  { label: "10 min", value: 10 * 60 * 1000 },
  { label: "1 hour", value: 60 * 60 * 1000 },
  { label: "24 hours", value: 24 * 60 * 60 * 1000 },
];

export default function ShareOptions({
  expiry, onExpiryChange, oneTime, onOneTimeChange, password, onPasswordChange,
}: ShareOptionsProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <section className="space-y-4 rounded-2xl border border-border/70 bg-[#0d1010] p-4 md:p-5 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-foreground/75">
        <Clock className="h-4 w-4 text-primary" />
        Expires
      </div>

      <div className="flex flex-wrap gap-2">
        {EXPIRY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onExpiryChange(opt.value)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              expiry === opt.value
                ? "bg-primary text-primary-foreground glow-box"
                : "border border-border/70 bg-[#111515] text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="space-y-3 border-t border-border/70 pt-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">One-time</p>
            </div>
            <p className="text-xs text-muted-foreground">Expire on first open.</p>
          </div>
          <Switch checked={oneTime} onCheckedChange={onOneTimeChange} />
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">Password</p>
            </div>
            <p className="text-xs text-muted-foreground">Protect the link with a passphrase.</p>
          </div>
          <Switch
            checked={showPassword}
            onCheckedChange={(checked) => {
              setShowPassword(checked);
              if (!checked) onPasswordChange("");
            }}
          />
        </div>

        {showPassword && (
          <div className="space-y-2">
            <label htmlFor="password" className="text-xs font-medium text-muted-foreground">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="Set a password"
              className="terminal-input h-11 w-full rounded-xl px-3 text-sm shadow-sm outline-none transition-all placeholder:text-muted-foreground/80 focus:ring-2 focus:ring-primary/25"
            />
          </div>
        )}
      </div>
    </section>
  );
}
