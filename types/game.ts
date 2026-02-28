// =========================
// PlotTwist — Single source of truth for all data shapes
// =========================

export type Stage =
  | "LOBBY"
  | "PROMPT"
  | "SUBMIT"
  | "GENERATE"
  | "SHOWCASE"
  | "VOTING"
  | "REVEAL"
  | "ROUND_RESULT"
  | "FINAL_RESULT";

export type NarrationStyle = "dramatic" | "screenplay";

export type PromptPack = "noir" | "sciFi" | "fantasy";

export type MediaMode = "video" | "image" | "none";

export interface RoomSettings {
  rounds: number;
  promptPack: PromptPack;
  narrationStyle: NarrationStyle;
  submitTimerSeconds: number;
  voteTimerSeconds: number;
  mediaMode: MediaMode;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  color: string;
  isHost: boolean;
  isConnected: boolean;
  joinedAt: number;
}

export interface Submission {
  playerId: string;
  playerName: string;
  twist: string;
  narration?: string;
  mediaUrl?: string;
  mediaType?: "video" | "image";
  generationStatus?: "pending" | "running" | "done" | "failed";
  votes: number;
}

export interface Memory {
  round: number;
  winningTwist: string;
  winnerName: string;
  winnerAvatar: string;
  narration: string;
  mediaUrl?: string;
}

export interface PlayerScore {
  playerId: string;
  playerName: string;
  avatar: string;
  color: string;
  totalScore: number;
  roundScores: number[];
  votesReceived: number;
  streak: number;
  isTopTwo: boolean;
}

export interface RoundState {
  roundNumber: number;
  prompt: string;
  submissions: Record<string, Submission>;
  showcaseIndex: number;
  votes: Record<string, string>; // voterId -> submissionPlayerId
  winnerId?: string;
}

export interface Room {
  code: string;
  stage: Stage;
  hostId: string;
  players: Record<string, Player>;
  settings: RoomSettings;
  currentRound: RoundState | null;
  scores: Record<string, PlayerScore>;
  memories: Memory[];
  timerEndsAt: number | null;
  createdAt: number;
  updatedAt: number;
}

// Engine action types
export type Action =
  | { type: "JOIN"; player: Player }
  | { type: "LEAVE"; playerId: string }
  | { type: "UPDATE_SETTINGS"; settings: Partial<RoomSettings>; playerId: string }
  | { type: "START_GAME"; playerId: string }
  | { type: "SUBMIT"; playerId: string; twist: string }
  | { type: "CLOSE_SUBMISSIONS" }
  | { type: "SET_GENERATION_STATUS"; playerId: string; status: Submission["generationStatus"]; narration?: string; mediaUrl?: string; mediaType?: "video" | "image" }
  | { type: "START_SHOWCASE" }
  | { type: "START_VOTING" }
  | { type: "VOTE"; voterId: string; targetPlayerId: string }
  | { type: "CLOSE_VOTING" }
  | { type: "NEXT_STAGE"; playerId: string }
  | { type: "RESET"; playerId: string };
