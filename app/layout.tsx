import type { Metadata } from "next";
import { IBM_Plex_Mono, Onest, Schibsted_Grotesk } from "next/font/google";
import "./globals.css";

const sans = Onest({
  subsets: ["latin"],
  variable: "--font-onest",
});

const display = Schibsted_Grotesk({
  subsets: ["latin"],
  variable: "--font-schibsted",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: "AI Engineer Screener | Role-Driven Interview Console",
  description:
    "Create reusable role-based ElevenLabs screening flows, collect candidate materials, and review transcript-based scorecards after each session.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${display.variable} ${mono.variable}`}>{children}</body>
    </html>
  );
}
