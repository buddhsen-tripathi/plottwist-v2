"use client";

interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
}

export function ProgressBar({ progress, label }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, progress));

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-sm text-foreground-muted">{label}</span>
          <span className="text-sm font-semibold text-gold">{Math.round(clamped)}%</span>
        </div>
      )}
      <div className="glass h-3 overflow-hidden p-0">
        <div
          className="h-full rounded-[inherit] transition-all duration-500 ease-out"
          style={{
            width: `${clamped}%`,
            background: "linear-gradient(90deg, var(--gold-dim), var(--gold))",
          }}
        />
      </div>
    </div>
  );
}
