import { ensureAndReadStoreJson } from '../lib/jsonFile.js';

const BASE = 'get_v1_resources_schema';

export function loadGetV1ResourcesSchemaData(): unknown {
  return ensureAndReadStoreJson(BASE, []);
}
