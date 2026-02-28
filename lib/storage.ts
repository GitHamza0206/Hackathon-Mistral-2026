import { kv } from "@vercel/kv";
import { hasKvConfig } from "@/lib/env";
import type { CandidateSessionRecord, RoleTemplateRecord } from "@/lib/interviews";

const memoryRoles = new Map<string, RoleTemplateRecord>();
const recentRoleIds: string[] = [];
const memorySessions = new Map<string, CandidateSessionRecord>();
const recentSessionIds: string[] = [];
const roleSessionIds = new Map<string, string[]>();

function roleKey(id: string) {
  return `role:${id}`;
}

function sessionKey(id: string) {
  return `candidate_session:${id}`;
}

function roleSessionsKey(roleId: string) {
  return `role_sessions:${roleId}`;
}

const recentRolesKey = "roles:recent";
const recentSessionsKey = "candidate_sessions:recent";

export async function saveRoleTemplate(
  record: RoleTemplateRecord,
  options?: { index?: boolean },
) {
  const shouldIndex = options?.index ?? true;

  if (hasKvConfig()) {
    await kv.set(roleKey(record.id), record);
    if (shouldIndex) {
      await kv.lpush(recentRolesKey, record.id);
      await kv.ltrim(recentRolesKey, 0, 24);
    }
    return;
  }

  memoryRoles.set(record.id, record);
  if (shouldIndex) {
    recentRoleIds.unshift(record.id);
  }
}

export async function getRoleTemplate(id: string) {
  if (hasKvConfig()) {
    const record = await kv.get<RoleTemplateRecord>(roleKey(id));
    return record ?? null;
  }

  return memoryRoles.get(id) ?? null;
}

export async function listRecentRoleTemplates(limit = 6) {
  if (hasKvConfig()) {
    const ids = ((await kv.lrange(recentRolesKey, 0, Math.max(limit - 1, 0))) ?? []) as string[];
    const records = await Promise.all(ids.map((id) => getRoleTemplate(id)));

    return records.filter((record): record is RoleTemplateRecord => Boolean(record));
  }

  return recentRoleIds
    .filter((id, index) => recentRoleIds.indexOf(id) === index && index < limit)
    .map((id) => memoryRoles.get(id))
    .filter((record): record is RoleTemplateRecord => Boolean(record));
}

export async function saveCandidateSession(
  record: CandidateSessionRecord,
  options?: { index?: boolean },
) {
  const shouldIndex = options?.index ?? true;

  if (hasKvConfig()) {
    await kv.set(sessionKey(record.id), record);
    if (shouldIndex) {
      await kv.lpush(recentSessionsKey, record.id);
      await kv.ltrim(recentSessionsKey, 0, 24);
      await kv.lpush(roleSessionsKey(record.roleId), record.id);
      await kv.ltrim(roleSessionsKey(record.roleId), 0, 24);
    }
    return;
  }

  memorySessions.set(record.id, record);

  if (shouldIndex) {
    recentSessionIds.unshift(record.id);
    const currentIds = roleSessionIds.get(record.roleId) ?? [];
    currentIds.unshift(record.id);
    roleSessionIds.set(record.roleId, currentIds);
  }
}

export async function getCandidateSession(id: string) {
  if (hasKvConfig()) {
    const record = await kv.get<CandidateSessionRecord>(sessionKey(id));
    return record ?? null;
  }

  return memorySessions.get(id) ?? null;
}

export async function updateCandidateSession(
  id: string,
  updater: (record: CandidateSessionRecord) => CandidateSessionRecord,
) {
  const record = await getCandidateSession(id);

  if (!record) {
    return null;
  }

  const updated = updater(record);
  await saveCandidateSession(updated, { index: false });
  return updated;
}

export async function listRecentCandidateSessions(limit = 6) {
  if (hasKvConfig()) {
    const ids =
      ((await kv.lrange(recentSessionsKey, 0, Math.max(limit - 1, 0))) ?? []) as string[];
    const records = await Promise.all(ids.map((id) => getCandidateSession(id)));

    return records.filter((record): record is CandidateSessionRecord => Boolean(record));
  }

  return recentSessionIds
    .filter((id, index) => recentSessionIds.indexOf(id) === index && index < limit)
    .map((id) => memorySessions.get(id))
    .filter((record): record is CandidateSessionRecord => Boolean(record));
}
