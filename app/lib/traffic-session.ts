export type TrafficCounts = { views: number; visitors: number };
type VisitSnapshot = TrafficCounts & { lastSeen: number };

export const trafficStorageKey = "journal-traffic-session-v1";
export const visitIdleTimeout = 30 * 60 * 1000;

export function parseTrafficCounts(data: unknown): TrafficCounts {
  const { site_pv: views, site_uv: visitors } = (data ?? {}) as Record<string, unknown>;
  if (!Number.isSafeInteger(views) || !Number.isSafeInteger(visitors) || Number(views) < 0 || Number(visitors) < 0) {
    throw new Error("Invalid traffic response");
  }
  return { views: Number(views), visitors: Number(visitors) };
}

// The original service has no documented read-only API. Reuse its last confirmed
// totals during an active visit instead of incrementing them on every reload.
export async function readOrCountVisit({ storage, countVisit, now = Date.now }: {
  storage: Pick<Storage, "getItem" | "setItem"> | null;
  countVisit: () => Promise<TrafficCounts>;
  now?: () => number;
}): Promise<TrafficCounts> {
  let cached: VisitSnapshot | null = null;
  try {
    const raw = storage?.getItem(trafficStorageKey);
    if (raw) {
      const value = JSON.parse(raw);
      cached = { ...parseTrafficCounts({ site_pv: value.views, site_uv: value.visitors }), lastSeen: value.lastSeen };
    }
  } catch { /* Missing or blocked storage must not break the page. */ }

  const time = now();
  const active = cached && Number.isFinite(cached.lastSeen) && time >= cached.lastSeen && time - cached.lastSeen < visitIdleTimeout;
  let counts: TrafficCounts;
  try {
    counts = active && cached ? { views: cached.views, visitors: cached.visitors } : await countVisit();
  } catch (error) {
    if (cached) return { views: cached.views, visitors: cached.visitors };
    throw error;
  }
  try { storage?.setItem(trafficStorageKey, JSON.stringify({ ...counts, lastSeen: now() })); } catch { /* Private browsing may reject writes. */ }
  return counts;
}
