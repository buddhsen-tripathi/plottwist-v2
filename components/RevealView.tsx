"use client";

import type { Room } from "@/types/game";
import { Button } from "@/components/ui/Button";
import { MediaDisplay } from "@/components/ui/MediaDisplay";

interface RevealViewProps {
  room: Room;
  playerId: string;
}

export function RevealView({ room, playerId }: RevealViewProps) {
  const isHost = room.hostId === playerId;
  const winnerId = room.currentRound?.winnerId;
  const submissions = room.currentRound?.submissions ?? {};
  const winnerSub = winnerId ? submissions[winnerId] : null;
  const winnerPlayer = winnerId ? room.players[winnerId] : null;

  const handleNext = async () => {
    await fetch(`/api/rooms/${room.code}/next-stage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId }),
    });
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-4">
      <div className="w-full max-w-lg text-center space-y-8">
        <div className="space-y-2">
          <span className="text-sm font-semibold text-gold uppercase tracking-wider">
            Round {room.currentRound?.roundNumber} Winner
          </span>
          <h2 className="text-3xl font-extrabold text-foreground">
            The Best Twist
          </h2>
        </div>

        {winnerPlayer && winnerSub && (
          <div className="glass-elevated p-8 space-y-6 gold-glow-box">
            {/* Winner Avatar & Name */}
            <div className="flex items-center justify-center gap-3">
              <span className="text-5xl">{winnerPlayer.avatar}</span>
              <div>
                <p className="text-2xl font-extrabold text-gold gold-glow">
                  {winnerPlayer.name}
                </p>
                <p className="text-sm text-foreground-muted">
                  {winnerSub.votes} vote{winnerSub.votes !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* Winning Twist */}
            <p className="text-xl font-bold text-foreground leading-relaxed">
              &ldquo;{winnerSub.twist}&rdquo;
            </p>

            {/* Narration */}
            {winnerSub.narration && (
              <div className="glass p-4">
                <p className="text-sm text-foreground-muted italic leading-relaxed">
                  {winnerSub.narration}
                </p>
              </div>
            )}

            {/* Media */}
            {winnerSub.mediaUrl && (
              <MediaDisplay url={winnerSub.mediaUrl} type={winnerSub.mediaType} />
            )}
          </div>
        )}

        {isHost && (
          <Button variant="gold" size="lg" onClick={handleNext}>
            See Scoreboard
          </Button>
        )}

        {!isHost && (
          <p className="text-foreground-muted text-sm">
            Waiting for host to continue...
          </p>
        )}
      </div>
    </div>
  );
}
