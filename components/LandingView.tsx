"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { usePlayer } from "@/hooks/usePlayer";

export function LandingView() {
  const router = useRouter();
  const { savePlayer } = usePlayer();
  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"idle" | "create" | "join">("idle");

  const generateId = () => crypto.randomUUID();

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("Enter your name");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const playerId = generateId();
      const res = await fetch("/api/rooms/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName: name.trim(), playerId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create room");
      savePlayer({ id: playerId, roomCode: data.code });
      router.push(`/room/${data.code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!name.trim()) {
      setError("Enter your name");
      return;
    }
    if (!joinCode.trim() || joinCode.trim().length !== 4) {
      setError("Enter a valid 4-letter room code");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const playerId = generateId();
      const code = joinCode.trim().toUpperCase();
      const res = await fetch(`/api/rooms/${code}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName: name.trim(), playerId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to join room");
      savePlayer({ id: playerId, roomCode: data.code });
      router.push(`/room/${data.code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center space-y-2">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gold gold-glow font-[var(--font-display)] tracking-tight">
            PlotTwist
          </h1>
          <p className="text-foreground-muted text-lg">
            Submit twists. Shape the story. Vote to win.
          </p>
        </div>

        {/* Card */}
        <div className="glass-elevated p-8 space-y-6">
          <Input
            id="name"
            label="Your Name"
            placeholder="Enter your name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            autoComplete="off"
          />

          {mode === "idle" && (
            <div className="grid grid-cols-2 gap-3">
              <Button variant="gold" size="lg" onClick={() => setMode("create")}>
                Create Game
              </Button>
              <Button variant="default" size="lg" onClick={() => setMode("join")}>
                Join Game
              </Button>
            </div>
          )}

          {mode === "create" && (
            <div className="space-y-4 stage-enter">
              <Button
                variant="gold"
                size="lg"
                className="w-full"
                onClick={handleCreate}
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Room"}
              </Button>
              <button
                onClick={() => { setMode("idle"); setError(""); }}
                className="text-sm text-foreground-muted hover:text-foreground transition-colors w-full text-center cursor-pointer"
              >
                Back
              </button>
            </div>
          )}

          {mode === "join" && (
            <div className="space-y-4 stage-enter">
              <Input
                id="code"
                label="Room Code"
                placeholder="ABCD"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 4))}
                maxLength={4}
                autoComplete="off"
                className="text-center text-2xl font-bold tracking-[0.3em] uppercase"
              />
              <Button
                variant="gold"
                size="lg"
                className="w-full"
                onClick={handleJoin}
                disabled={loading}
              >
                {loading ? "Joining..." : "Join Room"}
              </Button>
              <button
                onClick={() => { setMode("idle"); setError(""); }}
                className="text-sm text-foreground-muted hover:text-foreground transition-colors w-full text-center cursor-pointer"
              >
                Back
              </button>
            </div>
          )}

          {error && (
            <p className="text-destructive text-sm text-center font-medium">{error}</p>
          )}
        </div>

        <p className="text-center text-xs text-foreground-muted/60">
          3-10 players &middot; AI-generated scenes &middot; Best story wins
        </p>
      </div>
    </div>
  );
}
