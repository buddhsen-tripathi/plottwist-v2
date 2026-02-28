"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Room } from "@/types/game";
import { Button } from "@/components/ui/Button";
import { Timer } from "@/components/ui/Timer";
import { MediaDisplay } from "@/components/ui/MediaDisplay";

interface VoteViewProps {
  room: Room;
  playerId: string;
}

export function VoteView({ room, playerId }: VoteViewProps) {
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showcaseIdx, setShowcaseIdx] = useState(0);
  const autoClosedRef = useRef(false);

  const isHost = room.hostId === playerId;
  const submissions = Object.values(room.currentRound?.submissions ?? {});
  const votes = room.currentRound?.votes ?? {};
  const hasVoted = !!votes[playerId] || voted;
  const isShowcase = room.stage === "SHOWCASE";

  const handleVote = async (targetPlayerId: string) => {
    if (hasVoted || targetPlayerId === playerId) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/rooms/${room.code}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, targetPlayerId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to vote");
      setVoted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleStartVoting = async () => {
    await fetch(`/api/rooms/${room.code}/next-stage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId }),
    });
  };

  const handleCloseVoting = useCallback(async () => {
    await fetch(`/api/rooms/${room.code}/close-voting`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId }),
    });
  }, [room.code, playerId]);

  // Host auto-closes voting when timer expires
  useEffect(() => {
    if (!isHost || !room.timerEndsAt || autoClosedRef.current || isShowcase) return;
    const remaining = room.timerEndsAt - Date.now();
    if (remaining <= 0) {
      autoClosedRef.current = true;
      handleCloseVoting();
      return;
    }
    const timer = setTimeout(() => {
      if (!autoClosedRef.current) {
        autoClosedRef.current = true;
        handleCloseVoting();
      }
    }, remaining);
    return () => clearTimeout(timer);
  }, [isHost, room.timerEndsAt, isShowcase, handleCloseVoting]);

  // SHOWCASE phase: host navigates through submissions
  if (isShowcase) {
    const currentSub = submissions[showcaseIdx];
    const isLast = showcaseIdx >= submissions.length - 1;

    return (
      <div className="min-h-dvh flex items-center justify-center p-4">
        <div className="w-full max-w-lg space-y-6 text-center">
          <span className="text-sm font-semibold text-gold uppercase tracking-wider">
            Showcase {showcaseIdx + 1} of {submissions.length}
          </span>

          {currentSub && (
            <div className="glass-elevated p-6 space-y-4 stage-enter">
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">
                  {room.players[currentSub.playerId]?.avatar}
                </span>
                <span className="font-bold text-foreground">{currentSub.playerName}</span>
              </div>

              <p className="text-lg font-semibold text-gold">
                &ldquo;{currentSub.twist}&rdquo;
              </p>

              {currentSub.narration && (
                <p className="text-sm text-foreground-muted italic leading-relaxed">
                  {currentSub.narration}
                </p>
              )}

              {currentSub.mediaUrl && (
                <MediaDisplay
                  url={currentSub.mediaUrl}
                  type={currentSub.mediaType}
                />
              )}
            </div>
          )}

          {isHost && (
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowcaseIdx((i) => Math.max(0, i - 1))}
                disabled={showcaseIdx === 0}
              >
                Prev
              </Button>

              {!isLast ? (
                <Button
                  variant="gold"
                  size="lg"
                  onClick={() => setShowcaseIdx((i) => i + 1)}
                >
                  Next
                </Button>
              ) : (
                <Button variant="gold" size="lg" onClick={handleStartVoting}>
                  Start Voting
                </Button>
              )}
            </div>
          )}

          {!isHost && (
            <p className="text-foreground-muted text-sm">
              Host is presenting the twists...
            </p>
          )}
        </div>
      </div>
    );
  }

  // VOTING phase
  return (
    <div className="min-h-dvh flex flex-col items-center p-4 pt-8">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Vote for the Best Twist</h2>
          <p className="text-foreground-muted text-sm">
            {hasVoted ? "Vote recorded! Waiting for others..." : "Tap a submission to vote"}
          </p>
        </div>

        <div className="flex justify-center">
          <Timer
            timerEndsAt={room.timerEndsAt}
            totalSeconds={room.settings.voteTimerSeconds}
          />
        </div>

        <div className="space-y-3">
          {submissions.map((sub) => {
            const isOwn = sub.playerId === playerId;
            const isSelected = votes[playerId] === sub.playerId;

            return (
              <button
                key={sub.playerId}
                onClick={() => handleVote(sub.playerId)}
                disabled={hasVoted || isOwn || loading}
                className={`w-full text-left glass p-4 transition-all cursor-pointer ${
                  isOwn
                    ? "opacity-50 cursor-not-allowed"
                    : isSelected
                    ? "gold-glow-box border-gold"
                    : hasVoted
                    ? "opacity-60"
                    : "hover:bg-white/10"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5">
                    {room.players[sub.playerId]?.avatar}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-foreground text-sm">
                        {sub.playerName}
                      </span>
                      {isOwn && (
                        <span className="text-xs text-foreground-muted">(you)</span>
                      )}
                    </div>
                    <p className="text-base text-foreground">
                      &ldquo;{sub.twist}&rdquo;
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {error && <p className="text-destructive text-sm text-center">{error}</p>}

        {isHost && (
          <Button variant="default" size="sm" className="w-full" onClick={handleCloseVoting}>
            Close Voting & Reveal
          </Button>
        )}
      </div>
    </div>
  );
}
