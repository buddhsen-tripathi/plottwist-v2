import type { Memory, NarrationStyle } from "@/types/game";
import { MEMORY_CALLBACK_CHANCE } from "@/lib/constants";

function buildMemoryContext(memories: Memory[]): string {
  if (memories.length === 0) return "";

  // 40% chance to reference a previous memory
  if (Math.random() > MEMORY_CALLBACK_CHANCE) return "";

  const memory = memories[Math.floor(Math.random() * memories.length)];
  return `\n\nCallback to earlier: In round ${memory.round}, ${memory.winnerName}'s twist was "${memory.winningTwist}". Subtly reference or connect to this earlier event.`;
}

export function buildNarrationPrompt(
  storyPrompt: string,
  twist: string,
  playerName: string,
  style: NarrationStyle,
  memories: Memory[]
): string {
  const memoryContext = buildMemoryContext(memories);

  if (style === "screenplay") {
    return `You are a screenwriter creating a mini screenplay scene.

STORY PROMPT: ${storyPrompt}
PLAYER TWIST (by ${playerName}): ${twist}
${memoryContext}

Write a vivid mini screenplay (3-5 lines of action/dialogue) that dramatically incorporates this twist into the story. Use standard screenplay format with scene headings, action lines, and dialogue. Keep it punchy and entertaining. Max 150 words.`;
  }

  return `You are a dramatic narrator telling an interactive story.

STORY PROMPT: ${storyPrompt}
PLAYER TWIST (by ${playerName}): ${twist}
${memoryContext}

Write a dramatic narration (2-3 sentences) that vividly incorporates this twist into the story. Use rich, evocative language. Build tension and surprise. Keep it under 100 words.`;
}

export function buildImagePrompt(
  storyPrompt: string,
  twist: string,
  narration: string
): string {
  return `Create a cinematic, dramatic scene illustration. Style: dark moody lighting, rich colors, film noir meets fantasy. Scene: ${storyPrompt} — with this twist: ${twist}. The mood should match: ${narration.slice(0, 100)}. No text or letters in the image.`;
}

export function buildVideoPrompt(
  storyPrompt: string,
  twist: string,
  narration: string
): string {
  return `Cinematic short clip, dark atmospheric lighting, dramatic camera movement. Scene: ${storyPrompt}. The twist: ${twist}. Mood: ${narration.slice(0, 80)}. Film quality, no text overlays.`;
}
