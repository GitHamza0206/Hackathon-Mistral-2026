import type { Metadata } from "next";
import { CandidateApply } from "@/components/candidate-apply";

interface ApplyPageProps {
  params: Promise<{ roleId: string }>;
}

export const metadata: Metadata = {
  title: "Candidate Apply | AI Engineer Screener",
  description:
    "Candidate intake page for role-aware AI engineering screening interviews powered by ElevenLabs.",
};


export default async function ApplyPage({ params }: ApplyPageProps) {
  const { roleId } = await params;
  return <CandidateApply roleId={roleId} />;
}
