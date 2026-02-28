"use client";

import { useTimer } from "@/hooks/useTimer";

interface TimerProps {
  timerEndsAt: number | null;
  totalSeconds: number;
}

export function Timer({ timerEndsAt, totalSeconds }: TimerProps) {
  const { secondsLeft } = useTimer(timerEndsAt);

  if (!timerEndsAt) return null;

  const fraction = secondsLeft / totalSeconds;
  const circumference = 2 * Math.PI * 42;
  const strokeDashoffset = circumference * (1 - Math.max(0, Math.min(1, fraction)));

  const color =
    fraction > 0.5
      ? "var(--timer-green)"
      : fraction > 0.2
      ? "var(--timer-yellow)"
      : "var(--timer-red)";

  return (
    <div className="relative inline-flex items-center justify-center w-24 h-24">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="6"
        />
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: "stroke-dashoffset 0.3s ease, stroke 0.3s ease" }}
        />
      </svg>
      <span
        className="absolute text-2xl font-bold"
        style={{ color }}
      >
        {secondsLeft}
      </span>
    </div>
  );
}
