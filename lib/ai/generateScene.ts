import type { Submission, Room } from "@/types/game";
import { containsProfanity, sanitize } from "./safety";
import { buildNarrationPrompt, buildImagePrompt, buildVideoPrompt } from "./narration";
import { getFallbackImage, getFallbackNarration } from "./fallback";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const VEO_POLL_INTERVAL = 4000;
const VEO_MAX_POLL_TIME = 180_000; // 3 min

interface GenerateResult {
  narration: string;
  mediaUrl?: string;
  mediaType?: "video" | "image";
}

async function generateNarration(
  prompt: string,
  twist: string,
  playerName: string,
  room: Room
): Promise<string> {
  if (!GEMINI_API_KEY) return getFallbackNarration();

  try {
    const narrationPrompt = buildNarrationPrompt(
      prompt,
      twist,
      playerName,
      room.settings.narrationStyle,
      room.memories
    );

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: narrationPrompt }] }],
          generationConfig: { maxOutputTokens: 256, temperature: 0.9 },
        }),
      }
    );

    if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return text || getFallbackNarration();
  } catch (err) {
    console.error("[generateScene] Narration generation failed:", err);
    return getFallbackNarration();
  }
}

async function generateImage(
  prompt: string,
  twist: string,
  narration: string
): Promise<string | null> {
  if (!GEMINI_API_KEY) return null;

  try {
    const imagePrompt = buildImagePrompt(prompt, twist, narration);
    console.log("[generateScene] Generating image...");

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: imagePrompt }] }],
          generationConfig: {
            responseModalities: ["IMAGE", "TEXT"],
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!res.ok) throw new Error(`Image generation error: ${res.status}`);
    const data = await res.json();
    const parts = data.candidates?.[0]?.content?.parts;
    const imagePart = parts?.find((p: { inlineData?: unknown }) => p.inlineData);
    if (imagePart?.inlineData) {
      console.log("[generateScene] Image generated successfully");
      return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
    }
    return null;
  } catch (err) {
    console.error("[generateScene] Image generation failed:", err);
    return null;
  }
}

async function generateVideo(
  prompt: string,
  twist: string,
  narration: string
): Promise<string | null> {
  if (!GEMINI_API_KEY) return null;

  try {
    const videoPrompt = buildVideoPrompt(prompt, twist, narration);
    console.log("[generateScene] Starting video generation (Veo)...");

    // Step 1: Submit generation request
    const submitRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/veo-2.0-generate-001:predictLongRunning?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instances: [{ prompt: videoPrompt }],
          parameters: {
            aspectRatio: "16:9",
            sampleCount: 1,
            durationSeconds: 5,
          },
        }),
      }
    );

    if (!submitRes.ok) {
      const errBody = await submitRes.text();
      console.error("[generateScene] Veo submit error:", submitRes.status, errBody);
      return null;
    }

    const submitData = await submitRes.json();
    const operationName = submitData.name;
    if (!operationName) {
      console.error("[generateScene] No operation name from Veo");
      return null;
    }

    console.log("[generateScene] Veo operation:", operationName);

    // Step 2: Poll for completion
    const startTime = Date.now();
    while (Date.now() - startTime < VEO_MAX_POLL_TIME) {
      await new Promise((r) => setTimeout(r, VEO_POLL_INTERVAL));

      const pollRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/${operationName}?key=${GEMINI_API_KEY}`
      );

      if (!pollRes.ok) {
        console.error("[generateScene] Veo poll error:", pollRes.status);
        continue;
      }

      const pollData = await pollRes.json();

      if (pollData.done) {
        const videoUri =
          pollData.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
        if (videoUri) {
          console.log("[generateScene] Video generated successfully");
          return videoUri;
        }
        console.error("[generateScene] Veo done but no video URI in response");
        return null;
      }
    }

    console.error("[generateScene] Veo timed out after 3min");
    return null;
  } catch (err) {
    console.error("[generateScene] Video generation failed:", err);
    return null;
  }
}

export async function generateScene(
  submission: Submission,
  room: Room
): Promise<GenerateResult> {
  const prompt = room.currentRound?.prompt ?? "";
  const twist = containsProfanity(submission.twist)
    ? sanitize(submission.twist)
    : submission.twist;

  console.log(`[generateScene] Processing "${submission.playerName}" — mode=${room.settings.mediaMode}`);

  // Generate narration
  const narration = await generateNarration(
    prompt,
    twist,
    submission.playerName,
    room
  );

  // Generate media based on room settings
  let mediaUrl: string | undefined;
  let mediaType: "video" | "image" | undefined;

  if (room.settings.mediaMode === "image") {
    const imageResult = await generateImage(prompt, twist, narration);
    if (imageResult) {
      mediaUrl = imageResult;
      mediaType = "image";
    } else {
      mediaUrl = getFallbackImage();
      mediaType = "image";
    }
  } else if (room.settings.mediaMode === "video") {
    const videoResult = await generateVideo(prompt, twist, narration);
    if (videoResult) {
      mediaUrl = videoResult;
      mediaType = "video";
    } else {
      // Fall back to image if video fails
      console.log("[generateScene] Video failed, falling back to image");
      const imageResult = await generateImage(prompt, twist, narration);
      if (imageResult) {
        mediaUrl = imageResult;
        mediaType = "image";
      } else {
        mediaUrl = getFallbackImage();
        mediaType = "image";
      }
    }
  }

  return { narration, mediaUrl, mediaType };
}
