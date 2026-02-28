import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { kv } from "@vercel/kv";
import { hasKvConfig } from "@/lib/env";
import type { CandidateSessionRecord, RoleTemplateRecord } from "@/lib/interviews";

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
const allSessionsKey = "candidate_sessions:all";
const localStorageFile = path.join(process.cwd(), ".data", "storage.json");
const localListLimit = 25;

interface LocalStorageSnapshot {
  roles: Record<string, RoleTemplateRecord>;
  recentRoleIds: string[];
  sessions: Record<string, CandidateSessionRecord>;
  recentSessionIds: string[];
  roleSessionIds: Record<string, string[]>;
}

let localWriteQueue = Promise.resolve<LocalStorageSnapshot | void>(undefined);

function getStorageBackend() {
  return hasKvConfig() ? "kv" : "local-file";
}

function createEmptySnapshot(): LocalStorageSnapshot {
  return {
    roles: {},
    recentRoleIds: [],
    sessions: {},
    recentSessionIds: [],
    roleSessionIds: {},
  };
}

function prependUniqueId(ids: string[], id: string, limit = localListLimit) {
  return [id, ...ids.filter((existingId) => existingId !== id)].slice(0, limit);
}

function dedupeIds(ids: string[]) {
  return [...new Set(ids)];
}

function getSessionSortTimestamp(record: CandidateSessionRecord) {
  const candidates = [record.sessionEndedAt, record.sessionStartedAt, record.createdAt];

  for (const value of candidates) {
    if (!value) {
      continue;
    }

    const timestamp = Date.parse(value);

    if (!Number.isNaN(timestamp)) {
      return timestamp;
    }
  }

  return 0;
}

function sortCandidateSessions(records: CandidateSessionRecord[]) {
  return [...records].sort((left, right) => {
    const timestampDifference =
      getSessionSortTimestamp(right) - getSessionSortTimestamp(left);

    if (timestampDifference !== 0) {
      return timestampDifference;
    }

    return right.id.localeCompare(left.id);
  });
}

async function listArchivedSessionIdsFromKv(limit?: number) {
  const rangeEnd = typeof limit === "number" ? Math.max(limit - 1, 0) : -1;
  const archivedIds = ((await kv.lrange(allSessionsKey, 0, rangeEnd)) ?? []) as string[];
  const dedupedArchivedIds = dedupeIds(archivedIds);

  if (typeof limit === "number" && dedupedArchivedIds.length >= limit) {
    return dedupedArchivedIds.slice(0, limit);
  }

  const scannedIds: string[] = [];

  for await (const key of kv.scanIterator({ match: `${sessionKey("*")}` })) {
    if (!key.startsWith("candidate_session:")) {
      continue;
    }

    scannedIds.push(key.slice("candidate_session:".length));
  }

  const mergedIds = dedupeIds([...dedupedArchivedIds, ...scannedIds]);

  if (typeof limit === "number") {
    return mergedIds.slice(0, limit);
  }

  return mergedIds;
}

async function readLocalSnapshot() {
  try {
    const raw = await readFile(localStorageFile, "utf8");
    const parsed = JSON.parse(raw) as Partial<LocalStorageSnapshot>;

    return {
      roles: parsed.roles ?? {},
      recentRoleIds: parsed.recentRoleIds ?? [],
      sessions: parsed.sessions ?? {},
      recentSessionIds: parsed.recentSessionIds ?? [],
      roleSessionIds: parsed.roleSessionIds ?? {},
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return createEmptySnapshot();
    }

    throw error;
  }
}

async function getLocalSnapshot() {
  return readLocalSnapshot();
}

async function persistLocalSnapshot(snapshot: LocalStorageSnapshot) {
  await mkdir(path.dirname(localStorageFile), { recursive: true });
  await writeFile(localStorageFile, JSON.stringify(snapshot, null, 2), "utf8");
}

async function updateLocalSnapshot(mutator: (snapshot: LocalStorageSnapshot) => void) {
  const nextWrite = localWriteQueue.then(async () => {
    const snapshot = await readLocalSnapshot();
    mutator(snapshot);
    await persistLocalSnapshot(snapshot);
    return snapshot;
  });

  localWriteQueue = nextWrite.catch(() => undefined);
  await nextWrite;
}

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

  await updateLocalSnapshot((snapshot) => {
    snapshot.roles[record.id] = record;
    if (shouldIndex) {
      snapshot.recentRoleIds = prependUniqueId(snapshot.recentRoleIds, record.id);
    }
  });
}

export async function getRoleTemplate(id: string) {
  if (hasKvConfig()) {
    const record = await kv.get<RoleTemplateRecord>(roleKey(id));
    return record ?? null;
  }

  const snapshot = await getLocalSnapshot();
  return snapshot.roles[id] ?? null;
}

export async function listRecentRoleTemplates(limit = 6) {
  if (hasKvConfig()) {
    const ids = ((await kv.lrange(recentRolesKey, 0, Math.max(limit - 1, 0))) ?? []) as string[];
    const records = await Promise.all(ids.map((id) => getRoleTemplate(id)));

    return records.filter((record): record is RoleTemplateRecord => Boolean(record));
  }

  const snapshot = await getLocalSnapshot();

  return snapshot.recentRoleIds
    .slice(0, limit)
    .map((id) => snapshot.roles[id])
    .filter((record): record is RoleTemplateRecord => Boolean(record));
}

export async function saveCandidateSession(
  record: CandidateSessionRecord,
  options?: { index?: boolean },
) {
  const shouldIndex = options?.index ?? true;

  console.info("[storage] saveCandidateSession:start", {
    backend: getStorageBackend(),
    sessionId: record.id,
    roleId: record.roleId,
    status: record.status,
    hasAgentId: Boolean(record.agentId),
    shouldIndex,
  });

  if (hasKvConfig()) {
    await kv.set(sessionKey(record.id), record);
    if (shouldIndex) {
      await kv.lpush(recentSessionsKey, record.id);
      await kv.ltrim(recentSessionsKey, 0, 24);
      await kv.lpush(allSessionsKey, record.id);
      await kv.lpush(roleSessionsKey(record.roleId), record.id);
      await kv.ltrim(roleSessionsKey(record.roleId), 0, 24);
    }

    console.info("[storage] saveCandidateSession:done", {
      backend: "kv",
      sessionId: record.id,
      status: record.status,
      hasAgentId: Boolean(record.agentId),
    });
    return;
  }

  await updateLocalSnapshot((snapshot) => {
    snapshot.sessions[record.id] = record;

    if (shouldIndex) {
      snapshot.recentSessionIds = prependUniqueId(snapshot.recentSessionIds, record.id);
      snapshot.roleSessionIds[record.roleId] = prependUniqueId(
        snapshot.roleSessionIds[record.roleId] ?? [],
        record.id,
      );
    }
  });

  console.info("[storage] saveCandidateSession:done", {
    backend: "local-file",
    sessionId: record.id,
    status: record.status,
    hasAgentId: Boolean(record.agentId),
    localStorageFile,
  });
}

export async function getCandidateSession(id: string) {
  if (hasKvConfig()) {
    const record = await kv.get<CandidateSessionRecord>(sessionKey(id));
    console.info("[storage] getCandidateSession", {
      backend: "kv",
      sessionId: id,
      found: Boolean(record),
      hasAgentId: Boolean(record?.agentId),
      status: record?.status,
    });
    return record ?? null;
  }

  const snapshot = await getLocalSnapshot();
  const record = snapshot.sessions[id] ?? null;
  console.info("[storage] getCandidateSession", {
    backend: "local-file",
    sessionId: id,
    found: Boolean(record),
    hasAgentId: Boolean(record?.agentId),
    status: record?.status,
    totalLocalSessions: Object.keys(snapshot.sessions).length,
    localStorageFile,
  });
  return record;
}

export async function updateCandidateSession(
  id: string,
  updater: (record: CandidateSessionRecord) => CandidateSessionRecord,
) {
  const record = await getCandidateSession(id);

  if (!record) {
    console.warn("[storage] updateCandidateSession:missing", {
      backend: getStorageBackend(),
      sessionId: id,
    });
    return null;
  }

  const updated = updater(record);
  await saveCandidateSession(updated, { index: false });
  console.info("[storage] updateCandidateSession:done", {
    backend: getStorageBackend(),
    sessionId: id,
    previousStatus: record.status,
    nextStatus: updated.status,
    hasAgentId: Boolean(updated.agentId),
  });
  return updated;
}

export async function listRecentCandidateSessions(limit = 6) {
  return listCandidateSessions(limit);
}

export async function listCandidateSessions(limit?: number) {
  if (hasKvConfig()) {
    const ids = await listArchivedSessionIdsFromKv(limit);
    const records = await Promise.all(ids.map((id) => getCandidateSession(id)));

    return sortCandidateSessions(
      records.filter((record): record is CandidateSessionRecord => Boolean(record)),
    );
  }

  const snapshot = await getLocalSnapshot();

  const records = sortCandidateSessions(Object.values(snapshot.sessions));

  if (typeof limit === "number") {
    return records.slice(0, limit);
  }

  return records;
}
