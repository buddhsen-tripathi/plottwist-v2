import { NextRequest, NextResponse } from "next/server";
import { generateRoomCode } from "@/lib/room-code";
import { setRoom } from "@/lib/firebase-admin";
import { DEFAULT_SETTINGS } from "@/lib/constants";
import { AVATARS, PLAYER_COLORS } from "@/lib/constants";
import type { Room, Player } from "@/types/game";

export async function POST(req: NextRequest) {
  const routeStart = Date.now();
  console.log("[create] POST /api/rooms/create hit");

  try {
    const { playerName, playerId } = await req.json();
    console.log(`[create] playerName=${playerName}, playerId=${playerId?.slice(0, 8)}...`);

    if (!playerName || !playerId) {
      return NextResponse.json({ error: "Missing playerName or playerId" }, { status: 400 });
    }

    const code = generateRoomCode();
    console.log(`[create] Generated room code: ${code}`);

    const now = Date.now();
    const host: Player = {
      id: playerId,
      name: playerName.slice(0, 20),
      avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
      color: PLAYER_COLORS[0],
      isHost: true,
      isConnected: true,
      joinedAt: now,
    };

    const room: Room = {
      code,
      stage: "LOBBY",
      hostId: playerId,
      players: { [playerId]: host },
      settings: { ...DEFAULT_SETTINGS },
      currentRound: null,
      scores: {},
      memories: [],
      timerEndsAt: null,
      createdAt: now,
      updatedAt: now,
    };

    console.log(`[create] Calling setRoom...`);
    await setRoom(code, room);
    console.log(`[create] setRoom done. Total time: ${Date.now() - routeStart}ms`);

    return NextResponse.json({ code, playerId });
  } catch (err) {
    console.error(`[create] ERROR after ${Date.now() - routeStart}ms:`, err);
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
  }
}
