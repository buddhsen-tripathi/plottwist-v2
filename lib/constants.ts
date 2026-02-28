import type { RoomSettings, Stage, PromptPack } from "@/types/game";

// =========================
// Game Stage Order
// =========================
export const STAGE_ORDER: Stage[] = [
  "LOBBY",
  "PROMPT",
  "SUBMIT",
  "GENERATE",
  "SHOWCASE",
  "VOTING",
  "REVEAL",
  "ROUND_RESULT",
  "FINAL_RESULT",
];

// =========================
// Limits
// =========================
export const MAX_PLAYERS = 10;
export const MIN_PLAYERS_TO_START = 3;
export const MAX_TWIST_LENGTH = 80;
export const ROOM_CODE_LENGTH = 4;
export const PROMPT_COUNTDOWN_SECONDS = 3;
export const MAX_VEO_POLL_SECONDS = 180;
export const VEO_POLL_INTERVAL_MS = 4000;
export const MEMORY_CALLBACK_CHANCE = 0.4;

// =========================
// Default Settings
// =========================
export const DEFAULT_SETTINGS: RoomSettings = {
  rounds: 3,
  promptPack: "noir",
  narrationStyle: "dramatic",
  submitTimerSeconds: 30,
  voteTimerSeconds: 20,
  mediaMode: "image",
};

// =========================
// Avatars (16 emojis)
// =========================
export const AVATARS: string[] = [
  "🦊", "🐙", "🦅", "🐺", "🦁", "🐸", "🦇", "🐲",
  "🦄", "🐧", "🦋", "🐬", "🦎", "🐝", "🦚", "🐾",
];

// =========================
// Player Colors (8)
// =========================
export const PLAYER_COLORS: string[] = [
  "#FF6B6B", // coral
  "#4ECDC4", // teal
  "#FFD93D", // yellow
  "#6C5CE7", // purple
  "#FF8A5C", // orange
  "#A8E6CF", // mint
  "#FF6F91", // pink
  "#88D8B0", // sage
];

// =========================
// Prompt Packs (5 prompts each)
// =========================
export const PROMPT_PACKS: Record<PromptPack, string[]> = {
  noir: [
    "A detective finds a mysterious letter under the door of a jazz club at midnight.",
    "The city lights flicker as a stranger whispers a secret in a rain-soaked alley.",
    "A femme fatale walks into the office holding a briefcase full of old photographs.",
    "The sound of a gunshot echoes through an empty parking garage at 3 AM.",
    "A retired cop discovers a coded message hidden inside a vintage record player.",
  ],
  sciFi: [
    "The last human colony receives an unexpected transmission from a dead star.",
    "A time traveler arrives in the wrong century carrying a device that won't stop beeping.",
    "The AI running the space station suddenly starts painting portraits of the crew.",
    "A wormhole opens in the middle of a crowded marketplace on a distant planet.",
    "Scientists discover that the moon has been sending binary messages for centuries.",
  ],
  fantasy: [
    "A dragon lands in the town square and demands to speak with the local baker.",
    "The enchanted forest rearranges itself every full moon, trapping a group of travelers.",
    "A young wizard accidentally turns the king's throne into a sentient being.",
    "The ancient map in the library starts bleeding ink that forms new paths at night.",
    "A phoenix egg is found in the fireplace of an ordinary cottage in the village.",
  ],
};

// =========================
// Mock Player Names (for testing)
// =========================
export const MOCK_PLAYER_NAMES: string[] = [
  "Shadow", "Blaze", "Frost", "Neon", "Pixel",
  "Storm", "Echo", "Viper", "Sage", "Drift",
];
