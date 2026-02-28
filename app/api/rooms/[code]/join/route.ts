import { NextRequest, NextResponse } from "next/server";
import { getRoom, setRoom } from "@/lib/firebase-admin";
import { dispatch, EngineError } from "@/lib/engine";
import { AVATARS, PLAYER_COLORS, MAX_PLAYERS } from "@/lib/constants";
import type { Player } from "@/types/game";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const { playerName, playerId } = await req.json();

    if (!playerName || !playerId) {
      return NextResponse.json({ error: "Missing playerName or playerId" }, { status: 400 });
    }

    const room = await getRoom(code);
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const playerCount = Object.keys(room.players).length;
    const usedAvatars = new Set(Object.values(room.players).map((p) => p.avatar));
    const availableAvatar = AVATARS.find((a) => !usedAvatars.has(a)) ?? AVATARS[0];
    const color = PLAYER_COLORS[playerCount % PLAYER_COLORS.length];

    const player: Player = {
      id: playerId,
      name: playerName.slice(0, 20),
      avatar: availableAvatar,
      color,
      isHost: false,
      isConnected: true,
      joinedAt: Date.now(),
    };

    try {
      const newRoom = dispatch(room, { type: "JOIN", player });
      await setRoom(code, newRoom);
      return NextResponse.json({ code, playerId });
    } catch (err) {
      if (err instanceof EngineError) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
      throw err;
    }
  } catch (err) {
    console.error("Join room error:", err);
    return NextResponse.json({ error: "Failed to join room" }, { status: 500 });
  }
}
