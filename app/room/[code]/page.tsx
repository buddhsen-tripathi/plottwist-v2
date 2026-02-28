"use client";

import { use } from "react";
import { useRoom } from "@/hooks/useRoom";
import { usePlayer } from "@/hooks/usePlayer";
import { LobbyView } from "@/components/LobbyView";
import { PromptView } from "@/components/PromptView";
import { SubmitView } from "@/components/SubmitView";
import { GenerateView } from "@/components/GenerateView";
import { VoteView } from "@/components/VoteView";
import { RevealView } from "@/components/RevealView";
import { RoundResultView } from "@/components/RoundResultView";
import { FinalResultView } from "@/components/FinalResultView";

export default function RoomPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const { room, loading, error } = useRoom(code);
  const { player } = usePlayer();

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin mx-auto" />
          <p className="text-foreground-muted">Connecting to room...</p>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="glass-elevated p-8 text-center space-y-4 max-w-sm">
          <h2 className="text-xl font-bold text-destructive">Room Not Found</h2>
          <p className="text-foreground-muted text-sm">
            {error || "This room doesn't exist or has been closed."}
          </p>
          <a href="/" className="glass-button-gold inline-block px-6 py-2.5 rounded-xl font-semibold">
            Back Home
          </a>
        </div>
      </div>
    );
  }

  const playerId = player?.id ?? "";

  const stageComponent = () => {
    switch (room.stage) {
      case "LOBBY":
        return <LobbyView room={room} playerId={playerId} />;
      case "PROMPT":
        return <PromptView room={room} playerId={playerId} />;
      case "SUBMIT":
        return <SubmitView room={room} playerId={playerId} />;
      case "GENERATE":
        return <GenerateView room={room} playerId={playerId} />;
      case "SHOWCASE":
      case "VOTING":
        return <VoteView room={room} playerId={playerId} />;
      case "REVEAL":
        return <RevealView room={room} playerId={playerId} />;
      case "ROUND_RESULT":
        return <RoundResultView room={room} playerId={playerId} />;
      case "FINAL_RESULT":
        return <FinalResultView room={room} playerId={playerId} />;
      default:
        return <LobbyView room={room} playerId={playerId} />;
    }
  };

  return <div className="stage-enter">{stageComponent()}</div>;
}
