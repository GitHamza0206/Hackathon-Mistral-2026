import { AdminConsole } from "@/components/admin-console";
import { hasAdminSession } from "@/lib/admin-auth";
import { getPlatformCounters, listCandidateSessions, listRecentRoleTemplates } from "@/lib/storage";

export default async function Home() {
  const isAuthenticated = await hasAdminSession();
  const recentRoles = isAuthenticated ? await listRecentRoleTemplates(25) : [];
  const recentSessions = isAuthenticated ? await listCandidateSessions() : [];
  const counters = isAuthenticated ? await getPlatformCounters() : null;

  return (
    <>
      <div className="ambient ambient-left" aria-hidden="true" />
      <div className="ambient ambient-right" aria-hidden="true" />
      <AdminConsole
        isAuthenticated={isAuthenticated}
        recentRoles={recentRoles}
        recentSessions={recentSessions}
        counters={counters}
      />
    </>
  );
}
