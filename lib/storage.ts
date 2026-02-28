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
const localStorageFile = path.join(process.cwd(), ".data", "storage.json");
const localListLimit = 25;

interface LocalStorageSnapshot {
  roles: Record<string, RoleTemplateRecord>;
  recentRoleIds: string[];
  sessions: Record<string, CandidateSessionRecord>;
  recentSessionIds: string[];
  roleSessionIds: Record<string, string[]>;
}

let localSnapshotCache: LocalStorageSnapshot | null = null;
let localSnapshotPromise: Promise<LocalStorageSnapshot> | null = null;
let localWriteQueue = Promise.resolve();

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
  if (localSnapshotCache) {
    return localSnapshotCache;
  }

  if (!localSnapshotPromise) {
    localSnapshotPromise = readLocalSnapshot().then((snapshot) => {
      localSnapshotCache = snapshot;
      localSnapshotPromise = null;
      return snapshot;
    });
  }

  return localSnapshotPromise;
}

async function persistLocalSnapshot(snapshot: LocalStorageSnapshot) {
  await mkdir(path.dirname(localStorageFile), { recursive: true });
  await writeFile(localStorageFile, JSON.stringify(snapshot, null, 2), "utf8");
}

async function updateLocalSnapshot(mutator: (snapshot: LocalStorageSnapshot) => void) {
  const snapshot = await getLocalSnapshot();
  mutator(snapshot);
  localWriteQueue = localWriteQueue.then(() => persistLocalSnapshot(snapshot));
  await localWriteQueue;
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
}

export async function getCandidateSession(id: string) {
  if (hasKvConfig()) {
    const record = await kv.get<CandidateSessionRecord>(sessionKey(id));
    return record ?? null;
  }

  const snapshot = await getLocalSnapshot();
  return snapshot.sessions[id] ?? null;
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

  const snapshot = await getLocalSnapshot();

  return snapshot.recentSessionIds
    .slice(0, limit)
    .map((id) => snapshot.sessions[id])
    .filter((record): record is CandidateSessionRecord => Boolean(record));
}
