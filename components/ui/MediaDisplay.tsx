"use client";

interface MediaDisplayProps {
  url: string;
  type?: "video" | "image";
  className?: string;
}

export function MediaDisplay({ url, type, className = "" }: MediaDisplayProps) {
  if (!url) return null;

  if (type === "video") {
    return (
      <div className={`rounded-xl overflow-hidden ${className}`}>
        <video
          src={url}
          controls
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-auto"
        />
      </div>
    );
  }

  return (
    <div className={`rounded-xl overflow-hidden ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="Scene" className="w-full h-auto" />
    </div>
  );
}
