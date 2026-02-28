import { ROOM_CODE_LENGTH } from "./constants";

// Omit I and O to avoid confusion with 1 and 0
const ALLOWED_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ";

export function generateRoomCode(): string {
  let code = "";
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += ALLOWED_CHARS[Math.floor(Math.random() * ALLOWED_CHARS.length)];
  }
  return code;
}

export function isValidRoomCode(code: string): boolean {
  if (code.length !== ROOM_CODE_LENGTH) return false;
  return /^[A-HJ-NP-Z]{4}$/.test(code);
}
