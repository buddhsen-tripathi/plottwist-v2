"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Room } from "@/types/game";
import { Button } from "@/components/ui/Button";
import { Timer } from "@/components/ui/Timer";
import { MAX_TWIST_LENGTH } from "@/lib/constants";

interface SubmitViewProps {
  room: Room;
  playerId: string;
}

export function SubmitView({ room, playerId }: SubmitViewProps) {
  const [twist, setTwist] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const autoClosedRef = useRef(false);

  const isHost = room.hostId === playerId;
  const prompt = room.currentRound?.prompt ?? "";
  const submissions = room.currentRound?.submissions ?? {};
  const playerCount = Object.keys(room.players).length;
  const submissionCount = Object.keys(submissions).length;
  const hasSubmitted = !!submissions[playerId] || submitted;

  const handleSubmit = async () => {
    if (!twist.trim()) {
      setError("Write something!");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/rooms/${room.code}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, twist: twist.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit");
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleForceClose = useCallback(async () => {
    await fetch(`/api/rooms/${room.code}/close-submissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId }),
    });
  }, [room.code, playerId]);

  // Host auto-closes when timer expires
  useEffect(() => {
    if (!isHost || !room.timerEndsAt || autoClosedRef.current) return;
    const remaining = room.timerEndsAt - Date.now();
    if (remaining <= 0) {
      autoClosedRef.current = true;
      handleForceClose();
      return;
    }
    const timer = setTimeout(() => {
      if (!autoClosedRef.current) {
        autoClosedRef.current = true;
        handleForceClose();
      }
    }, remaining);
    return () => clearTimeout(timer);
  }, [isHost, room.timerEndsAt, handleForceClose]);

  return (
    <div className="min-h-dvh flex flex-col items-center p-4 pt-8">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="text-sm font-semibold text-gold uppercase tracking-wider">
            Round {room.currentRound?.roundNumber ?? 1}
          </span>
          <h2 className="text-lg font-bold text-foreground-muted">Write Your Twist</h2>
        </div>

        {/* Prompt */}
        <div className="glass p-4 text-center">
          <p className="text-base font-semibold text-foreground">{prompt}</p>
        </div>

        {/* Timer */}
        <div className="flex justify-center">
          <Timer
            timerEndsAt={room.timerEndsAt}
            totalSeconds={room.settings.submitTimerSeconds}
          />
        </div>

        {/* Submission Area */}
        {!hasSubmitted ? (
          <div className="space-y-4">
            <div className="relative">
              <textarea
                value={twist}
                onChange={(e) => setTwist(e.target.value.slice(0, MAX_TWIST_LENGTH))}
                placeholder="What happens next? Write your plot twist..."
                className="glass-input w-full p-4 text-lg min-h-[120px] resize-none"
                maxLength={MAX_TWIST_LENGTH}
                autoFocus
              />
              <span className="absolute bottom-3 right-3 text-xs text-foreground-muted">
                {twist.length}/{MAX_TWIST_LENGTH}
              </span>
            </div>

            <Button
              variant="gold"
              size="lg"
              className="w-full"
              onClick={handleSubmit}
              disabled={loading || !twist.trim()}
            >
              {loading ? "Submitting..." : "Submit Twist"}
            </Button>

            {error && <p className="text-destructive text-sm text-center">{error}</p>}
          </div>
        ) : (
          <div className="glass-elevated p-6 text-center space-y-2">
            <div className="text-3xl">&#10003;</div>
            <p className="text-gold font-bold">Twist Submitted!</p>
            <p className="text-foreground-muted text-sm">Waiting for others...</p>
          </div>
        )}

        {/* Host Dashboard */}
        {isHost && (
          <div className="glass p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground-muted">Submissions</span>
              <span className="text-sm font-bold text-gold">
                {submissionCount} / {playerCount}
              </span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-2">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${(submissionCount / playerCount) * 100}%`,
                  background: "linear-gradient(90deg, var(--gold-dim), var(--gold))",
                }}
              />
            </div>
            <Button
              variant="default"
              size="sm"
              className="w-full"
              onClick={handleForceClose}
            >
              Force Close & Continue
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
