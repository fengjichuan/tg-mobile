import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, '../data/store');

const source_country_list = [
  'AT',
  'GB',
  'MS',
  'FR',
  'BE',
  'CN',
  'HK',
  'PH',
  'AG',
  'CA',
  'Private Network',
  'JP',
  'ID',
  'stats_dstip_srccountry_api_src_country',
  'TW',
  'intercept_source_country_ui',
  'NL',
  'MY',
  'sec_country_country_include_api',
  'KR',
  'SA',
  'AU',
  'DE',
  'CL',
  'KZ',
  'IN',
  'LU',
  'US',
  'SG',
  'IE',
];

const list = [
  {
    source_country: 'Private Network',
    destination_country: 'US',
    total_bytes: 1270061414,
    total_packets: 2327042,
    total_sessions: 175128,
  },
  {
    source_country: 'Private Network',
    destination_country: 'Private Network',
    total_bytes: 1697807813,
    total_packets: 3416060,
    total_sessions: 27135,
  },
  {
    source_country: 'Private Network',
    destination_country: null,
    total_bytes: 53384920,
    total_packets: 262712,
    total_sessions: 26385,
  },
  {
    source_country: 'US',
    destination_country: 'Private Network',
    total_bytes: 32095510,
    total_packets: 109311,
    total_sessions: 16693,
  },
  {
    source_country: 'Private Network',
    destination_country: 'HK',
    total_bytes: 1032713410,
    total_packets: 1248480,
    total_sessions: 11796,
  },
  {
    source_country: 'Private Network',
    destination_country: 'CN',
    total_bytes: 151677532,
    total_packets: 302096,
    total_sessions: 10272,
  },
  {
    source_country: 'US',
    destination_country: 'US',
    total_bytes: 62277660,
    total_packets: 128830,
    total_sessions: 7221,
  },
  {
    source_country: 'Private Network',
    destination_country: 'SG',
    total_bytes: 57589268,
    total_packets: 106467,
    total_sessions: 2770,
  },
  {
    source_country: 'Private Network',
    destination_country: 'JP',
    total_bytes: 50071695,
    total_packets: 74393,
    total_sessions: 1367,
  },
  {
    source_country: 'CN',
    destination_country: 'Private Network',
    total_bytes: 34544876,
    total_packets: 54045,
    total_sessions: 1299,
  },
];

for (let i = 0; i < 40; i++) {
  const s = source_country_list[i % source_country_list.length];
  const d = source_country_list[(i + 7) % source_country_list.length];
  list.push({
    source_country: s,
    destination_country: d,
    total_bytes: 100000 + i * 99999,
    total_packets: 500 + i * 100,
    total_sessions: 10 + (i % 50),
  });
}

const data = {
  total_bytes: 5855192735,
  unique_destination_ip: 5544,
  unique_source_country: 30,
  source_country_list,
  list,
};

fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(
  path.join(dir, 'get_v1_dashboards_traffic_map.example.json'),
  `${JSON.stringify(data, null, 2)}\n`,
);
