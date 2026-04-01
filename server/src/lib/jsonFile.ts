import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function getDataDir(): string {
  const fromEnv = process.env.DATA_DIR;
  if (fromEnv) return path.resolve(fromEnv);
  return path.resolve(__dirname, '../../data');
}

export function getStoreDir(): string {
  return path.join(getDataDir(), 'store');
}

export function readJsonFile<T>(file: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8')) as T;
  } catch {
    return fallback;
  }
}

export function writeJsonAtomic(file: string, value: unknown): void {
  const dir = path.dirname(file);
  fs.mkdirSync(dir, { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  fs.renameSync(tmp, file);
}

/** If `target` is missing, copy from `example` when it exists; otherwise write `fallbackValue` to `target`. */
export function ensureJsonFromExample(
  target: string,
  example: string,
  fallbackValue: unknown,
): void {
  if (fs.existsSync(target)) return;
  fs.mkdirSync(path.dirname(target), { recursive: true });
  if (fs.existsSync(example)) {
    fs.copyFileSync(example, target);
    return;
  }
  writeJsonAtomic(target, fallbackValue);
}

/** Basename without `.json` / `.example.json` under `data/store/`. */
export function ensureAndReadStoreJson(baseName: string, fallback: unknown): unknown {
  const dir = getStoreDir();
  const target = path.join(dir, `${baseName}.json`);
  const example = path.join(dir, `${baseName}.example.json`);
  ensureJsonFromExample(target, example, fallback);
  return readJsonFile(target, fallback);
}
