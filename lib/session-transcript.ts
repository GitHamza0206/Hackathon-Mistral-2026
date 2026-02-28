import { fetchConversationTranscript } from "@/lib/elevenlabs";
import { preferSavedTranscript } from "@/lib/interviews";
import type { CandidateSessionRecord } from "@/lib/interviews";
import { updateCandidateSession } from "@/lib/storage";

export async function ensureSessionTranscript(
  session: CandidateSessionRecord,
): Promise<CandidateSessionRecord> {
  if (!session.conversationId || (session.transcript?.length ?? 0) > 0) {
    return session;
  }

  try {
    const remoteTranscript = await fetchConversationTranscript(session.conversationId);
    const transcript = preferSavedTranscript(session.transcript, remoteTranscript);

    if (transcript.length === 0) {
      return session;
    }

    return (
      (await updateCandidateSession(session.id, (current) => ({
        ...current,
        transcript: preferSavedTranscript(current.transcript, transcript),
      }))) ?? {
        ...session,
        transcript,
      }
    );
  } catch {
    return session;
  }
}
