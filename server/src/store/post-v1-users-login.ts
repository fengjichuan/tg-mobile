import path from 'node:path';

import { ensureJsonFromExample, getStoreDir, readJsonFile, writeJsonAtomic } from '../lib/jsonFile.js';

const FILE = 'post_v1_users_login.json';
const EXAMPLE = 'post_v1_users_login.example.json';

export type LoginStoredUser = {
  user_id: number;
  username: string;
  password: string;
};

type SessionEntry = { token: string; user_id: number; createdAt: string };

type LoginStoreRoot = {
  users: LoginStoredUser[];
  sessions: SessionEntry[];
};

let writeChain: Promise<void> = Promise.resolve();

function targetPath(): string {
  return path.join(getStoreDir(), FILE);
}

function examplePath(): string {
  return path.join(getStoreDir(), EXAMPLE);
}

export function ensurePostV1UsersLoginStore(): void {
  ensureJsonFromExample(targetPath(), examplePath(), {
    users: [],
    sessions: [],
  } satisfies LoginStoreRoot);
}

function readRoot(): LoginStoreRoot {
  ensurePostV1UsersLoginStore();
  const root = readJsonFile<LoginStoreRoot>(targetPath(), { users: [], sessions: [] });
  if (!Array.isArray(root.users)) root.users = [];
  if (!Array.isArray(root.sessions)) root.sessions = [];
  return root;
}

export function findUserByCredentials(
  username: string,
  password: string,
): LoginStoredUser | undefined {
  return readRoot().users.find((u) => u.username === username && u.password === password);
}

export function appendSession(token: string, user_id: number): Promise<void> {
  const createdAt = new Date().toISOString();
  writeChain = writeChain.then(async () => {
    ensurePostV1UsersLoginStore();
    const root = readRoot();
    root.sessions.push({ token, user_id, createdAt });
    writeJsonAtomic(targetPath(), root);
  });
  return writeChain;
}

export function findUserIdByToken(token: string): number | undefined {
  const t = token.trim();
  if (!t) return undefined;
  const { sessions } = readRoot();
  for (let i = sessions.length - 1; i >= 0; i--) {
    if (sessions[i].token === t) return sessions[i].user_id;
  }
  return undefined;
}
