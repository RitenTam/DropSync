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
    <section className="panel-surface rounded-2xl p-4 md:p-5 space-y-5 shadow-sm">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold">Expiry window</p>
        </div>
        <p className="text-xs text-muted-foreground">Choose when this share automatically expires.</p>
        <div className="grid grid-cols-3 gap-2">
          {EXPIRY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onExpiryChange(opt.value)}
              className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all lift-hover ${
                expiry === opt.value
                  ? "bg-primary text-primary-foreground glow-box"
                  : "bg-secondary/80 text-secondary-foreground hover:bg-secondary"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-secondary/65 p-3 md:p-4 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold">One-time access</p>
            </div>
            <p className="text-xs text-muted-foreground">Invalidate link immediately after the first successful open.</p>
          </div>
          <Switch checked={oneTime} onCheckedChange={onOneTimeChange} />
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold">Password protection</p>
            </div>
            <p className="text-xs text-muted-foreground">Add an extra layer before the recipient can view content.</p>
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
              className="h-11 w-full rounded-xl border border-border/70 bg-card px-3 text-sm shadow-sm outline-none transition-all focus:ring-2 focus:ring-primary/30"
            />
          </div>
        )}
      </div>
    </section>
  );
}
