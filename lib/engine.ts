import type { Room, Action, RoundState, Submission } from "@/types/game";
import {
  MAX_PLAYERS,
  MIN_PLAYERS_TO_START,
  MAX_TWIST_LENGTH,
  DEFAULT_SETTINGS,
  PROMPT_PACKS,
} from "./constants";
import { calculateRoundScores } from "./scoring";

export class EngineError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EngineError";
  }
}

function pickPrompt(room: Room): string {
  const pack = PROMPT_PACKS[room.settings.promptPack];
  const roundIndex = (room.currentRound?.roundNumber ?? 1) - 1;
  return pack[roundIndex % pack.length];
}

function initRound(room: Room, roundNumber: number): RoundState {
  return {
    roundNumber,
    prompt: "",
    submissions: {},
    showcaseIndex: 0,
    votes: {},
  };
}

export function dispatch(inputRoom: Room, action: Action): Room {
  const now = Date.now();
  // Firebase RTDB drops empty arrays/objects — normalize all nullable fields
  const normalizedRound = inputRoom.currentRound
    ? {
        ...inputRoom.currentRound,
        submissions: inputRoom.currentRound.submissions ?? {},
        votes: inputRoom.currentRound.votes ?? {},
      }
    : inputRoom.currentRound;
  const room: Room = {
    ...inputRoom,
    memories: inputRoom.memories ?? [],
    scores: inputRoom.scores ?? {},
    players: inputRoom.players ?? {},
    currentRound: normalizedRound,
  };
  const next = { ...room, updatedAt: now };

  switch (action.type) {
    case "JOIN": {
      if (room.stage !== "LOBBY") throw new EngineError("Room is not in lobby");
      const playerCount = Object.keys(room.players).length;
      if (playerCount >= MAX_PLAYERS) throw new EngineError("Room is full");
      const names = Object.values(room.players).map((p) => p.name.toLowerCase());
      if (names.includes(action.player.name.toLowerCase()))
        throw new EngineError("Name already taken");

      next.players = { ...room.players, [action.player.id]: action.player };
      return next;
    }

    case "LEAVE": {
      const { [action.playerId]: removed, ...remaining } = room.players;
      if (!removed) return next;
      next.players = remaining;

      // If host left, promote next player
      if (removed.isHost) {
        const nextHost = Object.values(remaining)[0];
        if (nextHost) {
          next.players = {
            ...remaining,
            [nextHost.id]: { ...nextHost, isHost: true },
          };
          next.hostId = nextHost.id;
        }
      }
      return next;
    }

    case "UPDATE_SETTINGS": {
      if (action.playerId !== room.hostId)
        throw new EngineError("Only host can update settings");
      if (room.stage !== "LOBBY")
        throw new EngineError("Can only update settings in lobby");
      next.settings = { ...room.settings, ...action.settings };
      return next;
    }

    case "START_GAME": {
      if (action.playerId !== room.hostId)
        throw new EngineError("Only host can start game");
      if (room.stage !== "LOBBY")
        throw new EngineError("Game already started");
      const playerCount = Object.keys(room.players).length;
      if (playerCount < MIN_PLAYERS_TO_START)
        throw new EngineError(`Need at least ${MIN_PLAYERS_TO_START} players`);

      const round = initRound(next, 1);
      round.prompt = pickPrompt({ ...next, currentRound: round });
      next.currentRound = round;
      next.stage = "PROMPT";

      // Init scores for all players
      const scores: Room["scores"] = {};
      for (const p of Object.values(room.players)) {
        scores[p.id] = {
          playerId: p.id,
          playerName: p.name,
          avatar: p.avatar,
          color: p.color,
          totalScore: 0,
          roundScores: [],
          votesReceived: 0,
          streak: 0,
          isTopTwo: false,
        };
      }
      next.scores = scores;
      next.memories = [];
      return next;
    }

    case "SUBMIT": {
      if (room.stage !== "SUBMIT")
        throw new EngineError("Not in submit stage");
      if (!room.players[action.playerId])
        throw new EngineError("Player not in room");
      if (!room.currentRound)
        throw new EngineError("No active round");
      if (room.currentRound.submissions[action.playerId])
        throw new EngineError("Already submitted");

      const twist = action.twist.slice(0, MAX_TWIST_LENGTH);
      const player = room.players[action.playerId];
      const submission: Submission = {
        playerId: action.playerId,
        playerName: player.name,
        twist,
        votes: 0,
        generationStatus: "pending",
      };

      next.currentRound = {
        ...room.currentRound,
        submissions: {
          ...room.currentRound.submissions,
          [action.playerId]: submission,
        },
      };
      return next;
    }

    case "CLOSE_SUBMISSIONS": {
      if (!room.currentRound)
        throw new EngineError("No active round");
      // Idempotent: if already past SUBMIT, no-op
      if (room.stage !== "SUBMIT") return next;

      // Fill missing submissions with defaults
      const subs = { ...room.currentRound.submissions };
      for (const p of Object.values(room.players)) {
        if (!subs[p.id]) {
          subs[p.id] = {
            playerId: p.id,
            playerName: p.name,
            twist: "...",
            votes: 0,
            generationStatus: "pending",
          };
        }
      }

      next.currentRound = { ...room.currentRound, submissions: subs };
      next.stage = "GENERATE";
      next.timerEndsAt = null;
      return next;
    }

    case "SET_GENERATION_STATUS": {
      if (!room.currentRound)
        throw new EngineError("No active round");
      const sub = room.currentRound.submissions[action.playerId];
      if (!sub) throw new EngineError("Submission not found");

      const updated: Submission = {
        ...sub,
        generationStatus: action.status,
        ...(action.narration && { narration: action.narration }),
        ...(action.mediaUrl && { mediaUrl: action.mediaUrl }),
        ...(action.mediaType && { mediaType: action.mediaType }),
      };

      next.currentRound = {
        ...room.currentRound,
        submissions: {
          ...room.currentRound.submissions,
          [action.playerId]: updated,
        },
      };
      return next;
    }

    case "START_SHOWCASE": {
      next.stage = "SHOWCASE";
      if (next.currentRound) {
        next.currentRound = { ...next.currentRound, showcaseIndex: 0 };
      }
      return next;
    }

    case "START_VOTING": {
      next.stage = "VOTING";
      next.timerEndsAt = now + room.settings.voteTimerSeconds * 1000;
      return next;
    }

    case "VOTE": {
      if (room.stage !== "VOTING")
        throw new EngineError("Not in voting stage");
      if (!room.currentRound)
        throw new EngineError("No active round");
      if (action.voterId === action.targetPlayerId)
        throw new EngineError("Cannot vote for yourself");
      if (!room.players[action.voterId])
        throw new EngineError("Voter not in room");
      if (!room.currentRound.submissions[action.targetPlayerId])
        throw new EngineError("Target has no submission");
      if (room.currentRound.votes[action.voterId])
        throw new EngineError("Already voted");

      // Record vote
      const votes = { ...room.currentRound.votes, [action.voterId]: action.targetPlayerId };

      // Update submission vote counts
      const subs = { ...room.currentRound.submissions };
      const targetSub = subs[action.targetPlayerId];
      subs[action.targetPlayerId] = { ...targetSub, votes: targetSub.votes + 1 };

      next.currentRound = { ...room.currentRound, submissions: subs, votes };
      return next;
    }

    case "CLOSE_VOTING": {
      if (!room.currentRound)
        throw new EngineError("No active round");
      // Idempotent: if already past VOTING, no-op
      if (room.stage !== "VOTING") return next;

      const { scores, winnerId, memory } = calculateRoundScores(room, room.currentRound);
      next.scores = scores;
      next.currentRound = { ...room.currentRound, winnerId };
      next.memories = [...room.memories, memory];
      next.stage = "REVEAL";
      next.timerEndsAt = null;
      return next;
    }

    case "NEXT_STAGE": {
      if (action.playerId !== room.hostId)
        throw new EngineError("Only host can advance stages");

      if (room.stage === "PROMPT") {
        next.stage = "SUBMIT";
        next.timerEndsAt = now + room.settings.submitTimerSeconds * 1000;
        return next;
      }

      if (room.stage === "SHOWCASE") {
        next.stage = "VOTING";
        next.timerEndsAt = now + room.settings.voteTimerSeconds * 1000;
        return next;
      }

      if (room.stage === "REVEAL") {
        next.stage = "ROUND_RESULT";
        return next;
      }

      if (room.stage === "ROUND_RESULT") {
        const currentRoundNum = room.currentRound?.roundNumber ?? 0;
        if (currentRoundNum >= room.settings.rounds) {
          next.stage = "FINAL_RESULT";
          next.currentRound = null;
          return next;
        }
        // Start next round
        const newRound = initRound(next, currentRoundNum + 1);
        newRound.prompt = pickPrompt({ ...next, currentRound: newRound });
        next.currentRound = newRound;
        next.stage = "PROMPT";
        return next;
      }

      throw new EngineError(`Cannot advance from stage: ${room.stage}`);
    }

    case "RESET": {
      if (action.playerId !== room.hostId)
        throw new EngineError("Only host can reset");

      next.stage = "LOBBY";
      next.currentRound = null;
      next.scores = {};
      next.memories = [];
      next.timerEndsAt = null;
      next.settings = { ...DEFAULT_SETTINGS };
      return next;
    }

    default:
      throw new EngineError(`Unknown action type`);
  }
}
