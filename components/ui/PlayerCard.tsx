"use client";

import type { Player } from "@/types/game";

interface PlayerCardProps {
  player: Player;
  isCurrentPlayer?: boolean;
  showHost?: boolean;
}

export function PlayerCard({ player, isCurrentPlayer, showHost = true }: PlayerCardProps) {
  return (
    <div
      className={`glass flex items-center gap-3 px-4 py-3 ${
        isCurrentPlayer ? "gold-glow-box border-gold" : ""
      }`}
    >
      <span className="text-2xl">{player.avatar}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-foreground truncate">{player.name}</span>
          {isCurrentPlayer && (
            <span className="text-xs text-gold font-semibold">(you)</span>
          )}
        </div>
        {showHost && player.isHost && (
          <span className="text-xs text-gold-dim font-medium">Host</span>
        )}
      </div>
      <div
        className="w-3 h-3 rounded-full shrink-0"
        style={{ backgroundColor: player.color }}
      />
    </div>
  );
}
