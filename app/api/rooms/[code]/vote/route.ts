import { NextRequest, NextResponse } from "next/server";
import { getRoom, setRoom } from "@/lib/firebase-admin";
import { dispatch, EngineError } from "@/lib/engine";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const { playerId, targetPlayerId } = await req.json();

    if (!playerId || !targetPlayerId) {
      return NextResponse.json({ error: "Missing playerId or targetPlayerId" }, { status: 400 });
    }

    const room = await getRoom(code);
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    try {
      const newRoom = dispatch(room, {
        type: "VOTE",
        voterId: playerId,
        targetPlayerId,
      });
      await setRoom(code, newRoom);
      return NextResponse.json({ ok: true });
    } catch (err) {
      if (err instanceof EngineError) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
      throw err;
    }
  } catch (err) {
    console.error("Vote error:", err);
    return NextResponse.json({ error: "Failed to vote" }, { status: 500 });
  }
}
