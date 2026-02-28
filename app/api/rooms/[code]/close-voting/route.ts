import { NextRequest, NextResponse } from "next/server";
import { getRoom, setRoom } from "@/lib/firebase-admin";
import { dispatch, EngineError } from "@/lib/engine";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const { playerId } = await req.json();

    console.log(`[close-voting] code=${code}, playerId=${playerId?.slice(0, 8)}...`);

    const room = await getRoom(code);
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (playerId !== room.hostId) {
      return NextResponse.json({ error: "Only host can close voting" }, { status: 403 });
    }

    try {
      const newRoom = dispatch(room, { type: "CLOSE_VOTING" });
      await setRoom(code, newRoom);
      console.log(`[close-voting] Done. Winner: ${newRoom.currentRound?.winnerId}`);
      return NextResponse.json({ ok: true });
    } catch (err) {
      if (err instanceof EngineError) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
      throw err;
    }
  } catch (err) {
    console.error("[close-voting] Error:", err);
    return NextResponse.json({ error: "Failed to close voting" }, { status: 500 });
  }
}
