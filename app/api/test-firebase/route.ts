import { NextResponse } from "next/server";

export async function GET() {
  const dbUrl = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
  console.log("[test-firebase] Testing connection to:", dbUrl);

  if (!dbUrl) {
    return NextResponse.json({ error: "NEXT_PUBLIC_FIREBASE_DATABASE_URL is not set" }, { status: 500 });
  }

  // Test 1: Can we even reach the URL?
  try {
    const start = Date.now();
    const res = await fetch(`${dbUrl}.json?shallow=true`, {
      signal: AbortSignal.timeout(5000),
    });
    const elapsed = Date.now() - start;
    const status = res.status;
    const body = await res.text();

    console.log(`[test-firebase] HTTP test: status=${status}, elapsed=${elapsed}ms, body=${body.slice(0, 200)}`);

    if (status === 200) {
      return NextResponse.json({
        ok: true,
        message: "Firebase RTDB is reachable!",
        elapsed: `${elapsed}ms`,
        dbUrl,
      });
    } else if (status === 401) {
      return NextResponse.json({
        ok: false,
        message: "RTDB reachable but auth denied. This is expected for a raw HTTP test — the Admin SDK should still work. If setRoom hangs, the database URL may be wrong.",
        status,
        body: body.slice(0, 200),
        dbUrl,
      });
    } else {
      return NextResponse.json({
        ok: false,
        message: `RTDB returned unexpected status ${status}. The database likely does not exist at this URL.`,
        status,
        body: body.slice(0, 200),
        dbUrl,
      });
    }
  } catch (err) {
    console.error("[test-firebase] Connection failed:", err);
    return NextResponse.json({
      ok: false,
      message: `Cannot reach RTDB: ${err instanceof Error ? err.message : String(err)}`,
      dbUrl,
    }, { status: 500 });
  }
}
