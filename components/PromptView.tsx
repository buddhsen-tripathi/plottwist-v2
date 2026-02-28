"use client";

import { useEffect, useState, useRef } from "react";
import type { Room } from "@/types/game";
import { PROMPT_COUNTDOWN_SECONDS } from "@/lib/constants";

interface PromptViewProps {
  room: Room;
  playerId: string;
}

export function PromptView({ room, playerId }: PromptViewProps) {
  const [countdown, setCountdown] = useState(PROMPT_COUNTDOWN_SECONDS);
  const advancedRef = useRef(false);
  const isHost = room.hostId === playerId;
  const prompt = room.currentRound?.prompt ?? "";
  const roundNumber = room.currentRound?.roundNumber ?? 1;

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Host auto-advances when countdown ends
  useEffect(() => {
    if (!isHost || countdown > 0 || advancedRef.current) return;
    advancedRef.current = true;
    fetch(`/api/rooms/${room.code}/next-stage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId }),
    }).catch((err) => console.error("[PromptView] Auto-advance failed:", err));
  }, [isHost, countdown, room.code, playerId]);

  return (
    <div className="min-h-dvh flex items-center justify-center p-4">
      <div className="w-full max-w-lg text-center space-y-8">
        <div className="space-y-2">
          <span className="text-sm font-semibold text-gold uppercase tracking-wider">
            Round {roundNumber} of {room.settings.rounds}
          </span>
          <h2 className="text-xl font-bold text-foreground-muted">The Prompt</h2>
        </div>

        <div className="glass-elevated p-8">
          <p className="text-xl md:text-2xl font-bold text-foreground leading-relaxed">
            {prompt}
          </p>
        </div>

        {countdown > 0 ? (
          <div className="space-y-2">
            <div className="text-6xl font-extrabold text-gold gold-glow">{countdown}</div>
            <p className="text-foreground-muted text-sm">Get ready to write your twist...</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="w-8 h-8 border-4 border-gold/30 border-t-gold rounded-full animate-spin mx-auto" />
            <p className="text-foreground-muted text-sm">Starting submissions...</p>
          </div>
        )}
      </div>
    </div>
  );
}
