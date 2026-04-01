import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, '../data/store');
const start = Date.parse('2026-03-31T03:20:00Z');
const list = [];
for (let i = 0; i < 289; i++) {
  const stat_time = new Date(start + i * 300000).toISOString().replace('.000Z', 'Z');
  const w = 0.5 + 0.5 * Math.sin(i / 18);
  const a = 50000 + w * 6e6;
  const b = 35000 + w * 200000;
  const round2 = (n) => Math.round(n * 100) / 100;
  list.push({
    stat_time,
    avg_in_bits_per_sec: round2(a),
    avg_out_bits_per_sec: round2(b),
    avg_bits_per_sec: round2(a + b),
    max_in_bits_per_sec: round2(a * 1.1),
    max_out_bits_per_sec: round2(b * 1.15),
    max_bits_per_sec: round2(a + b * 1.1),
    min_in_bits_per_sec: round2(a * 0.85),
    min_out_bits_per_sec: round2(b * 0.8),
    min_bits_per_sec: round2(a * 0.85 + b * 0.8),
  });
}

const trafficSummary = {
  avg_in_bytes_per_sec: 4594.6,
  avg_out_bits_per_sec: 36062.4,
  avg_bytes_per_sec: 9102.4,
  avg_out_bytes_per_sec: 4507.8,
  avg_out_packets_per_sec: 32.2,
  avg_in_bits_per_sec: 36756.8,
  active_sessions: 111,
  avg_in_packets_per_sec: 28.4,
  list,
  avg_bits_per_sec: 72819.2,
  avg_packets_per_sec: 60.6,
  avg_sessions_per_sec: 5,
};

fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(
  path.join(dir, 'get_v1_dashboards_traffic_summary.example.json'),
  `${JSON.stringify(trafficSummary, null, 2)}\n`,
);
