import { NextRequest, NextResponse } from "next/server";
import { getRoom, setRoom } from "@/lib/firebase-admin";
import { dispatch, EngineError } from "@/lib/engine";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const { playerId, twist } = await req.json();

    if (!playerId || !twist) {
      return NextResponse.json({ error: "Missing playerId or twist" }, { status: 400 });
    }

    const room = await getRoom(code);
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    try {
      let newRoom = dispatch(room, { type: "SUBMIT", playerId, twist });

      // Auto-close if all players have submitted
      const playerCount = Object.keys(newRoom.players).length;
      const submissionCount = Object.keys(newRoom.currentRound?.submissions ?? {}).length;
      if (submissionCount >= playerCount) {
        newRoom = dispatch(newRoom, { type: "CLOSE_SUBMISSIONS" });
      }

      await setRoom(code, newRoom);
      return NextResponse.json({ ok: true });
    } catch (err) {
      if (err instanceof EngineError) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
      throw err;
    }
  } catch (err) {
    console.error("Submit error:", err);
    return NextResponse.json({ error: "Failed to submit" }, { status: 500 });
  }
}
