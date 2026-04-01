import path from 'node:path';

import { ensureJsonFromExample, getStoreDir, readJsonFile } from '../lib/jsonFile.js';

const FILE = 'get_v1_users_dash.json';
const EXAMPLE = 'get_v1_users_dash.example.json';

type DashStoreRoot = {
  byUserId: Record<string, Record<string, unknown>>;
};

function targetPath(): string {
  return path.join(getStoreDir(), FILE);
}

function examplePath(): string {
  return path.join(getStoreDir(), EXAMPLE);
}

export function ensureGetV1UsersDashStore(): void {
  ensureJsonFromExample(targetPath(), examplePath(), { byUserId: {} } satisfies DashStoreRoot);
}

export function loadProfileForUserId(userId: number): Record<string, unknown> | undefined {
  ensureGetV1UsersDashStore();
  const root = readJsonFile<DashStoreRoot>(targetPath(), { byUserId: {} });
  if (!root.byUserId || typeof root.byUserId !== 'object') return undefined;
  const raw = root.byUserId[String(userId)];
  if (!raw || typeof raw !== 'object') return undefined;
  return structuredClone(raw) as Record<string, unknown>;
}
