import { AdminConsole } from "@/components/admin-console";
import { hasAdminSession } from "@/lib/admin-auth";
import { listRecentCandidateSessions, listRecentRoleTemplates } from "@/lib/storage";

export default async function Home() {
  const isAuthenticated = await hasAdminSession();
  const recentRoles = isAuthenticated ? await listRecentRoleTemplates() : [];
  const recentSessions = isAuthenticated ? await listRecentCandidateSessions() : [];

  return (
    <>
      <div className="ambient ambient-left" aria-hidden="true" />
      <div className="ambient ambient-right" aria-hidden="true" />
      <AdminConsole
        isAuthenticated={isAuthenticated}
        recentRoles={recentRoles}
        recentSessions={recentSessions}
      />
    </>
  );
}
