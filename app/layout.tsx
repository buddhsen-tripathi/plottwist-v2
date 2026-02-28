import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PlotTwist — Multiplayer Story Game",
  description:
    "A Quiplash-style party game where players submit twists, AI generates scenes, and everyone votes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Nunito:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-game min-h-dvh antialiased">{children}</body>
    </html>
  );
}
