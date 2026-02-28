"use client";

import { useEffect, useState, useRef } from "react";
import { subscribeToRoom } from "@/lib/firebase";
import type { Room } from "@/types/game";

const CONNECTION_TIMEOUT_MS = 8000;

export function useRoom(code: string | null) {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const receivedData = useRef(false);

  useEffect(() => {
    if (!code) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    receivedData.current = false;

    // Timeout: if Firebase never fires the callback, stop loading
    const timeout = setTimeout(() => {
      if (!receivedData.current) {
        setLoading(false);
        setError("Could not connect to room. Check your connection or room code.");
      }
    }, CONNECTION_TIMEOUT_MS);

    let unsub: (() => void) | undefined;
    try {
      unsub = subscribeToRoom(
        code,
        (data) => {
          receivedData.current = true;
          setRoom(data);
          setLoading(false);
          setError(null);
        },
        (err) => {
          receivedData.current = true;
          setLoading(false);
          setError(`Firebase error: ${err.message}. Check RTDB rules — they must allow reads.`);
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect");
      setLoading(false);
    }

    return () => {
      clearTimeout(timeout);
      unsub?.();
    };
  }, [code]);

  return { room, loading, error };
}
