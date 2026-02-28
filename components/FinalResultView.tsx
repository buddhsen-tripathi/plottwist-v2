"use client";

import type { Room } from "@/types/game";
import { Button } from "@/components/ui/Button";

interface FinalResultViewProps {
  room: Room;
  playerId: string;
}

export function FinalResultView({ room, playerId }: FinalResultViewProps) {
  const isHost = room.hostId === playerId;
  const scores = Object.values(room.scores).sort((a, b) => b.totalScore - a.totalScore);
  const champion = scores[0];

  const handlePlayAgain = async () => {
    await fetch(`/api/rooms/${room.code}/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId }),
    });
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-8">
        {/* Champion spotlight */}
        <div className="text-center space-y-4">
          <span className="text-sm font-semibold text-gold uppercase tracking-wider">
            Game Over
          </span>
          <h2 className="text-3xl font-extrabold text-foreground">Final Results</h2>
        </div>

        {champion && (
          <div className="glass-elevated p-8 text-center space-y-4 gold-glow-box">
            <span className="text-6xl block">{champion.avatar}</span>
            <h3 className="text-3xl font-extrabold text-gold gold-glow">
              {champion.playerName}
            </h3>
            <p className="text-5xl font-extrabold text-foreground">
              {champion.totalScore}
            </p>
            <p className="text-sm text-foreground-muted">
              {champion.votesReceived} total votes &middot;{" "}
              {champion.roundScores.length} rounds played
            </p>
          </div>
        )}

        {/* Full leaderboard */}
        <div className="space-y-2">
          {scores.map((sc, i) => {
            const isYou = sc.playerId === playerId;
            const isFirst = i === 0;

            return (
              <div
                key={sc.playerId}
                className={`glass flex items-center gap-3 px-4 py-3 ${
                  isFirst ? "opacity-60" : ""
                }`}
              >
                <span
                  className={`text-lg font-extrabold w-6 text-center ${
                    i === 0 ? "text-gold" : i === 1 ? "text-gray-300" : i === 2 ? "text-amber-600" : "text-foreground-muted"
                  }`}
                >
                  {i === 0 ? "1st" : i === 1 ? "2nd" : i === 2 ? "3rd" : `${i + 1}`}
                </span>
                <span className="text-2xl">{sc.avatar}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground truncate">{sc.playerName}</span>
                    {isYou && <span className="text-xs text-gold font-semibold">(you)</span>}
                  </div>
                  <span className="text-xs text-foreground-muted">{sc.votesReceived} votes</span>
                </div>
                <span className="text-xl font-extrabold text-gold">{sc.totalScore}</span>
              </div>
            );
          })}
        </div>

        {/* Memory chain timeline */}
        {room.memories.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground-muted uppercase tracking-wider text-center">
              The Complete Story
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

        {/* Play Again */}
        <div className="text-center">
          {isHost ? (
            <Button variant="gold" size="lg" className="w-full max-w-xs" onClick={handlePlayAgain}>
              Play Again
            </Button>
          ) : (
            <p className="text-foreground-muted text-sm">
              Waiting for host to start a new game...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
