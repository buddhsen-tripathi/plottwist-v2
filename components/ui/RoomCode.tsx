"use client";

import { useState } from "react";

interface RoomCodeProps {
  code: string;
}

export function RoomCode({ code }: RoomCodeProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API not available
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="group flex items-center gap-1 cursor-pointer select-none"
      title="Tap to copy"
    >
      <div className="flex gap-2">
        {code.split("").map((char, i) => (
          <span
            key={i}
            className="glass text-3xl md:text-4xl font-extrabold text-gold tracking-widest w-12 h-14 md:w-14 md:h-16 flex items-center justify-center gold-glow"
          >
            {char}
          </span>
        ))}
      </div>
      <span className="text-xs text-foreground-muted ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {copied ? "Copied!" : "Copy"}
      </span>
    </button>
  );
}
