export function formatBitsPerSec(bps: number | undefined | null): string {
  if (bps == null || Number.isNaN(bps)) return '—';
  const n = Number(bps);
  if (n >= 1e12) return `${(n / 1e12).toFixed(2)} Tbps`;
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)} Gbps`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)} Mbps`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(2)} Kbps`;
  return `${n.toFixed(0)} bps`;
}

export function formatNumber(n: number | undefined | null): string {
  if (n == null || Number.isNaN(n)) return '—';
  return Number(n).toLocaleString();
}

export function formatBytes(b: number | undefined | null): string {
  if (b == null || Number.isNaN(b)) return '—';
  const n = Number(b);
  if (n >= 1e12) return `${(n / 1e12).toFixed(2)} TB`;
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)} GB`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)} MB`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(2)} KB`;
  return `${n.toFixed(0)} B`;
}
