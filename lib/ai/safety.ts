// Profanity filter — block list + regex patterns

const BLOCK_LIST = [
  "fuck", "shit", "ass", "bitch", "damn", "crap", "dick", "cock",
  "pussy", "bastard", "slut", "whore", "nigger", "faggot", "retard",
  "cunt", "twat", "wanker", "piss", "bollocks",
];

const PATTERNS = [
  /f+[u*@]+[c*@]+[k*@]+/gi,
  /s+h+[i*@1]+[t*@]+/gi,
  /b+[i*@1]+[t*@]+c+h+/gi,
  /a+[s$]+[s$]+h+o+l+e+/gi,
  /n+[i1]+g+[g]+[e3]+r+/gi,
  /f+[a@]+g+[g]*[o0]+t+/gi,
];

export function containsProfanity(text: string): boolean {
  const lower = text.toLowerCase();

  for (const word of BLOCK_LIST) {
    if (lower.includes(word)) return true;
  }

  for (const pattern of PATTERNS) {
    if (pattern.test(text)) return true;
  }

  return false;
}

export function sanitize(text: string): string {
  let result = text;
  for (const word of BLOCK_LIST) {
    const regex = new RegExp(word, "gi");
    result = result.replace(regex, "*".repeat(word.length));
  }
  return result;
}
