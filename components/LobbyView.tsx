"use client";

import { useState } from "react";
import type { Room, PromptPack, NarrationStyle, MediaMode } from "@/types/game";
import { Button } from "@/components/ui/Button";
import { PlayerCard } from "@/components/ui/PlayerCard";
import { RoomCode } from "@/components/ui/RoomCode";
import { MIN_PLAYERS_TO_START, MOCK_PLAYER_NAMES, AVATARS, PLAYER_COLORS } from "@/lib/constants";

interface LobbyViewProps {
  room: Room;
  playerId: string;
}

export function LobbyView({ room, playerId }: LobbyViewProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isHost = room.hostId === playerId;
  const players = Object.values(room.players);
  const playerCount = players.length;
  const canStart = isHost && playerCount >= MIN_PLAYERS_TO_START;

  const updateSetting = async (settings: Record<string, unknown>) => {
    try {
      await fetch(`/api/rooms/${room.code}/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, settings }),
      });
    } catch {
      // silent
    }
  };

  const handleStart = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/rooms/${room.code}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const addMockPlayer = async () => {
    const usedNames = new Set(players.map((p) => p.name));
    const mockName = MOCK_PLAYER_NAMES.find((n) => !usedNames.has(n)) ?? `Bot${playerCount + 1}`;
    const mockId = crypto.randomUUID();
    try {
      await fetch(`/api/rooms/${room.code}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName: mockName, playerId: mockId }),
      });
    } catch {
      // silent
    }
  };

  return (
    <div className="min-h-dvh flex flex-col items-center p-4 pt-8 md:pt-12">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Game Lobby</h2>
          <RoomCode code={room.code} />
          <p className="text-foreground-muted text-sm">
            Share this code with friends to join
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Players */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground-muted uppercase tracking-wider">
              Players ({playerCount}/10)
            </h3>
            <div className="space-y-2">
              {players.map((p) => (
                <PlayerCard
                  key={p.id}
                  player={p}
                  isCurrentPlayer={p.id === playerId}
                />
              ))}
            </div>
            {isHost && (
              <Button variant="ghost" size="sm" onClick={addMockPlayer} className="w-full text-foreground-muted">
                + Add Mock Player
              </Button>
            )}
          </div>

          {/* Settings (host only can edit) */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground-muted uppercase tracking-wider">
              Settings
            </h3>
            <div className="glass p-4 space-y-4">
              {/* Rounds */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">Rounds</span>
                <div className="flex items-center gap-2">
                  {[2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => isHost && updateSetting({ rounds: n })}
                      className={`w-9 h-9 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                        room.settings.rounds === n
                          ? "bg-gold/20 text-gold border border-gold/30"
                          : "bg-white/5 text-foreground-muted hover:bg-white/10"
                      } ${!isHost ? "pointer-events-none" : ""}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompt Pack */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">Theme</span>
                <div className="flex items-center gap-2">
                  {(["noir", "sciFi", "fantasy"] as PromptPack[]).map((pack) => (
                    <button
                      key={pack}
                      onClick={() => isHost && updateSetting({ promptPack: pack })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        room.settings.promptPack === pack
                          ? "bg-gold/20 text-gold border border-gold/30"
                          : "bg-white/5 text-foreground-muted hover:bg-white/10"
                      } ${!isHost ? "pointer-events-none" : ""}`}
                    >
                      {pack === "sciFi" ? "Sci-Fi" : pack.charAt(0).toUpperCase() + pack.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Narration Style */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">Style</span>
                <div className="flex items-center gap-2">
                  {(["dramatic", "screenplay"] as NarrationStyle[]).map((style) => (
                    <button
                      key={style}
                      onClick={() => isHost && updateSetting({ narrationStyle: style })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        room.settings.narrationStyle === style
                          ? "bg-gold/20 text-gold border border-gold/30"
                          : "bg-white/5 text-foreground-muted hover:bg-white/10"
                      } ${!isHost ? "pointer-events-none" : ""}`}
                    >
                      {style.charAt(0).toUpperCase() + style.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Timer */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">Submit Timer</span>
                <div className="flex items-center gap-2">
                  {[20, 30, 45, 60].map((s) => (
                    <button
                      key={s}
                      onClick={() => isHost && updateSetting({ submitTimerSeconds: s })}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        room.settings.submitTimerSeconds === s
                          ? "bg-gold/20 text-gold border border-gold/30"
                          : "bg-white/5 text-foreground-muted hover:bg-white/10"
                      } ${!isHost ? "pointer-events-none" : ""}`}
                    >
                      {s}s
                    </button>
                  ))}
                </div>
              </div>

              {/* Media Mode */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">Media</span>
                <div className="flex items-center gap-2">
                  {(["image", "video", "none"] as MediaMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => isHost && updateSetting({ mediaMode: mode })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        room.settings.mediaMode === mode
                          ? "bg-gold/20 text-gold border border-gold/30"
                          : "bg-white/5 text-foreground-muted hover:bg-white/10"
                      } ${!isHost ? "pointer-events-none" : ""}`}
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="text-center space-y-2">
          {isHost ? (
            <Button
              variant="gold"
              size="lg"
              className="w-full max-w-xs"
              onClick={handleStart}
              disabled={!canStart || loading}
            >
              {loading
                ? "Starting..."
                : playerCount < MIN_PLAYERS_TO_START
                ? `Need ${MIN_PLAYERS_TO_START - playerCount} more player${MIN_PLAYERS_TO_START - playerCount > 1 ? "s" : ""}`
                : "Start Game"}
            </Button>
          ) : (
            <p className="text-foreground-muted text-sm">
              Waiting for host to start the game...
            </p>
          )}
          {error && <p className="text-destructive text-sm">{error}</p>}
        </div>
      </div>
    </div>
  );
}
