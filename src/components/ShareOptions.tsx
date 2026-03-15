import { useState } from "react";
import { Clock, Lock, Download } from "lucide-react";

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
    <div className="space-y-3">
      {/* Expiry */}
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground font-mono w-16">Expires:</span>
        <div className="flex gap-1">
          {EXPIRY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onExpiryChange(opt.value)}
              className={`px-2 py-1 text-xs font-mono rounded transition-all ${
                expiry === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-border"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* One-time download */}
      <div className="flex items-center gap-2">
        <Download className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground font-mono w-16">One-time:</span>
        <button
          onClick={() => onOneTimeChange(!oneTime)}
          className={`px-2 py-1 text-xs font-mono rounded transition-all ${
            oneTime
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-border"
          }`}
        >
          {oneTime ? "ON" : "OFF"}
        </button>
      </div>

      {/* Password */}
      <div className="flex items-center gap-2">
        <Lock className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground font-mono w-16">Password:</span>
        <button
          onClick={() => { setShowPassword(!showPassword); if (showPassword) onPasswordChange(""); }}
          className={`px-2 py-1 text-xs font-mono rounded transition-all ${
            showPassword
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-border"
          }`}
        >
          {showPassword ? "ON" : "OFF"}
        </button>
        {showPassword && (
          <input
            type="password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder="Enter password"
            className="flex-1 bg-secondary border border-border rounded px-2 py-1 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        )}
      </div>
    </div>
  );
}
