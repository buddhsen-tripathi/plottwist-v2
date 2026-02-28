import { NextRequest, NextResponse } from "next/server";
import { getRoom, setRoom } from "@/lib/firebase-admin";
import { dispatch } from "@/lib/engine";
import { generateScene } from "@/lib/ai/generateScene";

export async function POST(req: NextRequest) {
  try {
    const { roomCode } = await req.json();

    if (!roomCode) {
      return NextResponse.json({ error: "Missing roomCode" }, { status: 400 });
    }

    const room = await getRoom(roomCode);
    if (!room || room.stage !== "GENERATE") {
      return NextResponse.json({ error: "Room not in GENERATE stage" }, { status: 400 });
    }

    if (!room.currentRound) {
      return NextResponse.json({ error: "No active round" }, { status: 400 });
    }

    const submissions = Object.values(room.currentRound.submissions ?? {});

    // Process each submission sequentially
    let currentRoom = room;
    for (const sub of submissions) {
      // Mark as running
      currentRoom = dispatch(currentRoom, {
        type: "SET_GENERATION_STATUS",
        playerId: sub.playerId,
        status: "running",
      });
      await setRoom(roomCode, currentRoom);

      try {
        const result = await generateScene(sub, currentRoom);

        currentRoom = dispatch(currentRoom, {
          type: "SET_GENERATION_STATUS",
          playerId: sub.playerId,
          status: "done",
          narration: result.narration,
          mediaUrl: result.mediaUrl,
          mediaType: result.mediaType,
        });
      } catch (err) {
        console.error(`Generation failed for ${sub.playerName}:`, err);
        currentRoom = dispatch(currentRoom, {
          type: "SET_GENERATION_STATUS",
          playerId: sub.playerId,
          status: "failed",
        });
      }

      await setRoom(roomCode, currentRoom);
    }

    // Move to showcase
    currentRoom = dispatch(currentRoom, { type: "START_SHOWCASE" });
    await setRoom(roomCode, currentRoom);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Generate scene error:", err);
    return NextResponse.json({ error: "Failed to generate scenes" }, { status: 500 });
  }
}
