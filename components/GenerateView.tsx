"use client";

import { useEffect, useState, useRef } from "react";
import type { Room } from "@/types/game";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface GenerateViewProps {
  room: Room;
  playerId: string;
}

export function GenerateView({ room, playerId }: GenerateViewProps) {
  const [elapsed, setElapsed] = useState(0);
  const triggered = useRef(false);
  const submissions = Object.values(room.currentRound?.submissions ?? {});
  const total = submissions.length;
  const done = submissions.filter(
    (s) => s.generationStatus === "done" || s.generationStatus === "failed"
  ).length;
  const progress = total > 0 ? (done / total) * 100 : 0;

  useEffect(() => {
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-trigger generation for host (once only)
  const isHost = room.hostId === playerId;
  useEffect(() => {
    if (!isHost || triggered.current) return;
    // Only trigger if all submissions are still pending
    const allPending = submissions.every((s) => s.generationStatus === "pending");
    if (!allPending) return;

    triggered.current = true;
    console.log("[GenerateView] Host triggering generation for", room.code);

    fetch(`/api/generate-scene`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomCode: room.code }),
    }).catch((err) => console.error("[GenerateView] Generation trigger failed:", err));
  }, [isHost, room.code, submissions]);

  return (
    <div className="min-h-dvh flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-8 text-center">
        <div className="space-y-2">
          <span className="text-sm font-semibold text-gold uppercase tracking-wider">
            Round {room.currentRound?.roundNumber}
          </span>
          <h2 className="text-2xl font-bold text-foreground">Generating Scenes</h2>
          <p className="text-foreground-muted">
            AI is crafting your story moments ({room.settings.mediaMode} mode)...
          </p>
        </div>

        <ProgressBar progress={progress} label="Overall Progress" />

        <div className="space-y-2">
          {submissions.map((sub) => (
            <div key={sub.playerId} className="glass p-3 flex items-center gap-3">
              <span className="text-lg">
                {room.players[sub.playerId]?.avatar ?? "?"}
              </span>
              <span className="text-sm font-semibold text-foreground flex-1 text-left truncate">
                {sub.playerName}
              </span>
              <StatusBadge status={sub.generationStatus ?? "pending"} />
            </div>
          ))}
        </div>

        <p className="text-xs text-foreground-muted">
          Elapsed: {elapsed}s
        </p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; color: string }> = {
    pending: { label: "Waiting", color: "text-foreground-muted" },
    running: { label: "Generating...", color: "text-gold" },
    done: { label: "Done", color: "text-timer-green" },
    failed: { label: "Failed", color: "text-destructive" },
  };

  const { label, color } = config[status] ?? config.pending;

  return (
    <span className={`text-xs font-bold ${color}`}>
      {status === "running" && (
        <span className="inline-block w-3 h-3 border-2 border-gold/30 border-t-gold rounded-full animate-spin mr-1 align-middle" />
      )}
      {label}
    </span>
  );
}
