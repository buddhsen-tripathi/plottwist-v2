"use client";

import { useState } from "react";
import type { Room } from "@/types/game";
import { Button } from "@/components/ui/Button";
import { MediaDisplay } from "@/components/ui/MediaDisplay";

interface FinalResultViewProps {
  room: Room;
  playerId: string;
}

export function FinalResultView({ room, playerId }: FinalResultViewProps) {
  const isHost = room.hostId === playerId;
  const scores = Object.values(room.scores ?? {}).sort((a, b) => b.totalScore - a.totalScore);
  const champion = scores[0];
  const memories = room.memories ?? [];
  const hasMedia = memories.some((m) => m.mediaUrl);
  const isVideoMode = memories.some((m) => m.mediaType === "video");
  const [tab, setTab] = useState<"results" | "story">("results");

  const handlePlayAgain = async () => {
    await fetch(`/api/rooms/${room.code}/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId }),
    });
  };

  return (
    <div className="min-h-dvh flex flex-col items-center p-4 pt-6 pb-12">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="text-sm font-semibold text-gold uppercase tracking-wider">
            Game Over
          </span>
          <h2 className="text-3xl font-extrabold text-foreground">Final Results</h2>
        </div>

        {/* Tab switcher */}
        {hasMedia && (
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setTab("results")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === "results"
                  ? "bg-gold/20 text-gold"
                  : "glass text-foreground-muted hover:text-foreground"
              }`}
            >
              Leaderboard
            </button>
            <button
              onClick={() => setTab("story")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === "story"
                  ? "bg-gold/20 text-gold"
                  : "glass text-foreground-muted hover:text-foreground"
              }`}
            >
              {isVideoMode ? "Video Reel" : "Comic Recap"}
            </button>
          </div>
        )}

        {tab === "results" && (
          <>
            {/* Champion spotlight */}
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
          </>
        )}

        {tab === "story" && (
          <div className="space-y-4">
            {isVideoMode ? (
              /* ── Video Reel: play each round's winning clip sequentially ── */
              <div className="space-y-6">
                {memories.map((m, i) => (
                  <div key={i} className="glass-elevated overflow-hidden rounded-2xl">
                    {m.mediaUrl && (
                      <MediaDisplay url={m.mediaUrl} type={m.mediaType} />
                    )}
                    <div className="p-4 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{m.winnerAvatar}</span>
                        <span className="text-gold font-bold text-sm">{m.winnerName}</span>
                        <span className="text-foreground-muted text-xs ml-auto">Round {m.round}</span>
                      </div>
                      <p className="text-sm text-foreground italic">&ldquo;{m.winningTwist}&rdquo;</p>
                      {m.narration && (
                        <p className="text-xs text-foreground-muted leading-relaxed">{m.narration}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* ── Comic Grid: panel layout with images ── */
              <div className="space-y-1">
                <div
                  className={`grid gap-2 ${
                    memories.length === 1 ? "grid-cols-1" :
                    memories.length === 2 ? "grid-cols-2" :
                    memories.length <= 4 ? "grid-cols-2" : "grid-cols-3"
                  }`}
                >
                  {memories.map((m, i) => (
                    <div
                      key={i}
                      className="glass-elevated overflow-hidden rounded-xl border-2 border-foreground/10 relative group"
                    >
                      {m.mediaUrl ? (
                        <MediaDisplay url={m.mediaUrl} type={m.mediaType} />
                      ) : (
                        <div className="aspect-square bg-surface-2 flex items-center justify-center">
                          <span className="text-4xl">{m.winnerAvatar}</span>
                        </div>
                      )}
                      {/* Comic-style caption overlay */}
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-xs bg-gold/90 text-black font-extrabold px-1.5 py-0.5 rounded">
                            R{m.round}
                          </span>
                          <span className="text-xs text-white font-semibold truncate">{m.winnerName}</span>
                        </div>
                        <p className="text-xs text-white/90 leading-snug line-clamp-2">
                          &ldquo;{m.winningTwist}&rdquo;
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Narration strip below the grid */}
                <div className="glass p-3 space-y-2 mt-3">
                  {memories.map((m, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-xs bg-gold/20 text-gold font-bold px-1.5 py-0.5 rounded shrink-0">
                        {m.round}
                      </span>
                      <p className="text-xs text-foreground-muted italic leading-relaxed">
                        {m.narration || m.winningTwist}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Text-only story fallback when no media */}
        {!hasMedia && memories.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground-muted uppercase tracking-wider text-center">
              The Complete Story
            </h3>
            <div className="glass p-4 space-y-3">
              {memories.map((m, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="flex flex-col items-center">
                    <span className="text-lg">{m.winnerAvatar}</span>
                    {i < memories.length - 1 && (
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
        <div className="text-center pt-2">
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
