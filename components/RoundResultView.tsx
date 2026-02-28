"use client";

import type { Room } from "@/types/game";
import { Button } from "@/components/ui/Button";

interface RoundResultViewProps {
  room: Room;
  playerId: string;
}

export function RoundResultView({ room, playerId }: RoundResultViewProps) {
  const isHost = room.hostId === playerId;
  const scores = Object.values(room.scores).sort((a, b) => b.totalScore - a.totalScore);
  const roundNumber = room.currentRound?.roundNumber ?? 1;
  const winnerId = room.currentRound?.winnerId;

  const handleNext = async () => {
    await fetch(`/api/rooms/${room.code}/next-stage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId }),
    });
  };

  const isLastRound = roundNumber >= room.settings.rounds;

  return (
    <div className="min-h-dvh flex flex-col items-center p-4 pt-8">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <span className="text-sm font-semibold text-gold uppercase tracking-wider">
            Round {roundNumber} Results
          </span>
          <h2 className="text-2xl font-bold text-foreground">Scoreboard</h2>
        </div>

        {/* Scores */}
        <div className="space-y-2">
          {scores.map((sc, i) => {
            const isWinner = sc.playerId === winnerId;
            const isYou = sc.playerId === playerId;

            return (
              <div
                key={sc.playerId}
                className={`glass flex items-center gap-3 px-4 py-3 ${
                  isWinner ? "gold-glow-box border-gold" : ""
                }`}
              >
                <span className="text-lg font-extrabold text-foreground-muted w-6 text-center">
                  {i + 1}
                </span>
                <span className="text-2xl">{sc.avatar}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground truncate">
                      {sc.playerName}
                    </span>
                    {isYou && (
                      <span className="text-xs text-gold font-semibold">(you)</span>
                    )}
                    {isWinner && (
                      <span className="text-xs bg-gold/20 text-gold px-2 py-0.5 rounded-full font-bold">
                        Winner
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-foreground-muted">
                    <span>{sc.votesReceived} votes</span>
                    {sc.streak > 1 && (
                      <span className="text-gold">{sc.streak} streak</span>
                    )}
                  </div>
                </div>
                <span className="text-xl font-extrabold text-gold">{sc.totalScore}</span>
              </div>
            );
          })}
        </div>

        {/* Memory Chain */}
        {room.memories.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground-muted uppercase tracking-wider">
              Story So Far
            </h3>
            <div className="glass p-4 space-y-3">
              {room.memories.map((m, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="flex flex-col items-center">
                    <span className="text-lg">{m.winnerAvatar}</span>
                    {i < room.memories.length - 1 && (
                      <div className="w-px h-4 bg-gold/20" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground-muted">
                      Round {m.round} — <span className="text-gold font-semibold">{m.winnerName}</span>
                    </p>
                    <p className="text-sm text-foreground">&ldquo;{m.winningTwist}&rdquo;</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next action */}
        <div className="text-center">
          {isHost ? (
            <Button variant="gold" size="lg" onClick={handleNext}>
              {isLastRound ? "See Final Results" : "Next Round"}
            </Button>
          ) : (
            <p className="text-foreground-muted text-sm">
              Waiting for host to continue...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
