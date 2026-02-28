import type { Metadata } from "next";
import { InterviewSession } from "@/components/interview-session";

interface SessionPageProps {
  params: Promise<{ sessionId: string }>;
}

export const metadata: Metadata = {
  title: "Candidate Session | AI Engineer Screener",
  description: "Live candidate voice interview session powered by ElevenLabs React SDK.",
};

export default async function SessionPage({ params }: SessionPageProps) {
  const { sessionId } = await params;
  return <InterviewSession sessionId={sessionId} />;
}
