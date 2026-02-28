"use client";

import { useCallback, useEffect, useState } from "react";

interface PlayerIdentity {
  id: string;
  roomCode: string;
}

const STORAGE_KEY = "plottwist_player";

export function usePlayer() {
  const [player, setPlayer] = useState<PlayerIdentity | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        setPlayer(JSON.parse(stored));
      }
    } catch {
      // sessionStorage not available
    }
  }, []);

  const savePlayer = useCallback((identity: PlayerIdentity) => {
    setPlayer(identity);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
    } catch {
      // sessionStorage not available
    }
  }, []);

  const clearPlayer = useCallback(() => {
    setPlayer(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // sessionStorage not available
    }
  }, []);

  return { player, savePlayer, clearPlayer };
}
