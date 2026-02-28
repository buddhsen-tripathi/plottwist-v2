"use client";

import { useEffect, useState } from "react";

export function useTimer(timerEndsAt: number | null) {
  const [secondsLeft, setSecondsLeft] = useState<number>(0);

  useEffect(() => {
    if (!timerEndsAt) {
      setSecondsLeft(0);
      return;
    }

    function tick() {
      const remaining = Math.max(0, Math.ceil((timerEndsAt! - Date.now()) / 1000));
      setSecondsLeft(remaining);
    }

    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [timerEndsAt]);

  const fraction = timerEndsAt
    ? Math.max(0, (timerEndsAt - Date.now()) / (timerEndsAt - (timerEndsAt - secondsLeft * 1000)))
    : 0;

  return { secondsLeft, isExpired: timerEndsAt !== null && secondsLeft <= 0, fraction };
}
