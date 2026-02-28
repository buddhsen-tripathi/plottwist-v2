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

    const room = await getRoom(code);
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Only host can force-close
    if (playerId !== room.hostId) {
      return NextResponse.json({ error: "Only host can close submissions" }, { status: 403 });
    }

    try {
      const newRoom = dispatch(room, { type: "CLOSE_SUBMISSIONS" });
      await setRoom(code, newRoom);
      return NextResponse.json({ ok: true });
    } catch (err) {
      if (err instanceof EngineError) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
      throw err;
    }
  } catch (err) {
    console.error("Close submissions error:", err);
    return NextResponse.json({ error: "Failed to close submissions" }, { status: 500 });
  }
}
