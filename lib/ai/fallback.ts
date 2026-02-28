// Demo/placeholder media URLs for when AI generation fails

const FALLBACK_IMAGES = [
  "https://placehold.co/1024x576/1a1a2e/ffd600?text=Scene+1",
  "https://placehold.co/1024x576/16213e/ffd600?text=Scene+2",
  "https://placehold.co/1024x576/0f3460/ffd600?text=Scene+3",
  "https://placehold.co/1024x576/1a1a2e/ff6b6b?text=Scene+4",
  "https://placehold.co/1024x576/16213e/4ecdc4?text=Scene+5",
];

const FALLBACK_NARRATIONS = [
  "The scene unfolds with an unexpected twist that nobody saw coming...",
  "In a dramatic turn of events, the story takes a surprising direction...",
  "What happens next defies all expectations and changes everything...",
  "The plot thickens as this new development reshapes the entire narrative...",
  "An unforeseen revelation casts everything in a completely new light...",
];

let imageIndex = 0;
let narrationIndex = 0;

export function getFallbackImage(): string {
  const url = FALLBACK_IMAGES[imageIndex % FALLBACK_IMAGES.length];
  imageIndex++;
  return url;
}

export function getFallbackNarration(): string {
  const text = FALLBACK_NARRATIONS[narrationIndex % FALLBACK_NARRATIONS.length];
  narrationIndex++;
  return text;
}
