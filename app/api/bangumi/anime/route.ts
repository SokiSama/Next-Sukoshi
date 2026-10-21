import { NextResponse } from "next/server";
import { readAllAnimeCollections, type BangumiCollectionPage } from "../../../lib/bangumiCollection";
import animeCovers from "../../../../data/anime-covers.json";

export const dynamic = "force-dynamic";
const localAnimeCovers: Record<string, string> = animeCovers;

type Subject = {
  images?: { large?: string; common?: string; medium?: string };
  name?: string;
  name_cn?: string;
  date?: string;
  summary?: string;
  rating?: { score?: number };
  tags?: Array<{ name?: string }>;
  infobox?: Array<{ key?: string; value?: unknown }>;
};

const statusText = (type?: number) => ({ 1: "想看", 2: "看过", 3: "在看", 4: "搁置", 5: "抛弃" })[type ?? 0] ?? "未知";

function valueText(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.map(valueText).filter(Boolean).join(" / ");
  if (value && typeof value === "object") {
    const item = value as Record<string, unknown>;
    return valueText(item.v ?? item.value ?? item.name ?? "");
  }
  return "";
}

function production(infobox?: Subject["infobox"]) {
  const row = infobox?.find((item) => ["动画制作", "制作", "製作"].includes(item.key ?? ""));
  return row ? valueText(row.value).trim() || "未知" : "未知";
}

async function fetchJson<T>(url: string, headers: HeadersInit): Promise<T> {
  const response = await fetch(url, { headers, next: { revalidate: 600 }, signal: AbortSignal.timeout(15000) });
  const text = await response.text();
  if (!response.ok) throw new Error(text.slice(0, 300) || `HTTP ${response.status}`);
  return JSON.parse(text) as T;
}

async function mapConcurrent<T, R>(items: T[], limit: number, worker: (item: T) => Promise<R>) {
  const result = new Array<R>(items.length);
  let index = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) {
      const current = index++;
      result[current] = await worker(items[current]);
    }
  }));
  return result;
}

export async function GET() {
  try {
    const user = process.env.BANGUMI_USER_ID || process.env.BANGUMI_USERNAME || "";
    if (!user) return NextResponse.json({ success: true, configured: false, data: { user: "", total: 0, items: [] } });
    const headers: HeadersInit = { Accept: "application/json", "User-Agent": "JournalBlog/1.0 (https://example.com)" };
    if (process.env.BANGUMI_ACCESS_TOKEN) headers.Authorization = `Bearer ${process.env.BANGUMI_ACCESS_TOKEN}`;

    const collectionsUrl = new URL(`https://api.bgm.tv/v0/users/${encodeURIComponent(user)}/collections`);
    collectionsUrl.searchParams.set("subject_type", "2");
    collectionsUrl.searchParams.set("limit", "50");
    const collections = await readAllAnimeCollections(async offset => {
      collectionsUrl.searchParams.set("offset", String(offset));
      return fetchJson<BangumiCollectionPage>(collectionsUrl.toString(), headers);
    });
    const entries = collections.entries;
    const subjects = await mapConcurrent(entries, 6, async (entry) => {
      const id = entry.subject?.id;
      if (!id) return null;
      // A failed subject must not hide the rest of the user's collection.
      const detail = await fetchJson<Subject>(`https://api.bgm.tv/v0/subjects/${id}`, headers).catch(() => null);
      const totalEpisodes = entry.subject?.eps ?? 0;
      const watchedEpisodes = entry.ep_status ?? 0;
      return {
        id,
        title: entry.subject?.name_cn?.trim() || entry.subject?.name || detail?.name_cn || detail?.name || `#${id}`,
        originalTitle: entry.subject?.name || detail?.name || "",
        cover: localAnimeCovers[id] || detail?.images?.large || detail?.images?.common || detail?.images?.medium || "/assets/cover.svg",
        statusText: statusText(entry.type),
        watchedEpisodes,
        totalEpisodes,
        progressText: totalEpisodes ? `${watchedEpisodes}/${totalEpisodes}` : String(watchedEpisodes),
        date: detail?.date || "",
        year: detail?.date?.slice(0, 4) || "未知",
        production: production(detail?.infobox),
        summary: (detail?.summary || entry.subject?.short_summary || "").trim(),
        summaryUnavailable: detail === null,
        score: detail?.rating?.score || 0,
        tags: (detail?.tags ?? []).map((tag) => tag.name?.trim()).filter((tag): tag is string => Boolean(tag)).slice(0, 12),
      };
    });

    return NextResponse.json({ success: true, data: { user, total: entries.length, items: subjects.filter(Boolean) } }, {
      headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600" },
    });
  } catch {
    return NextResponse.json({ success: false, error: "Bangumi 数据暂时无法读取" }, { status: 500 });
  }
}
