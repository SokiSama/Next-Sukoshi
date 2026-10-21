export const BANGUMI_USER =
  process.env.BANGUMI_USER_ID || process.env.BANGUMI_USERNAME || "";

type Images = {
  large?: string;
  common?: string;
  medium?: string;
  small?: string;
  grid?: string;
};

type BangumiCollection = {
  type?: number;
  ep_status?: number;
  updated_at?: string;
  subject?: {
    id?: number;
    name?: string;
    name_cn?: string;
    eps?: number;
    score?: number;
    short_summary?: string;
    images?: Images;
  };
};

type BangumiCollectionResponse = {
  total?: number;
  data?: BangumiCollection[];
};

export type BangumiAnimeItem = {
  id: number;
  title: string;
  cover: string;
  url: string;
  score: number;
  badge: string;
  subtitle: string;
  progress: string;
  renewal: string;
};

export type BangumiAnimeData = {
  user: string;
  total: number;
  items: BangumiAnimeItem[];
};

const PAGE_SIZE = 50;
const statusText: Record<number, string> = {
  1: "想看",
  2: "看过",
  3: "在看",
  4: "搁置",
  5: "抛弃",
};

function coverUrl(images?: Images) {
  return images?.large || images?.medium || images?.common || images?.small || images?.grid || "";
}

async function fetchCollectionPage(offset: number): Promise<BangumiCollectionResponse> {
  const url = new URL(
    `https://api.bgm.tv/v0/users/${encodeURIComponent(BANGUMI_USER)}/collections`,
  );
  url.searchParams.set("subject_type", "2");
  url.searchParams.set("limit", String(PAGE_SIZE));
  url.searchParams.set("offset", String(offset));

  const headers: HeadersInit = {
    Accept: "application/json",
    "User-Agent": "JournalBlog/1.0 (https://example.com)",
  };
  if (process.env.BANGUMI_ACCESS_TOKEN) {
    headers.Authorization = `Bearer ${process.env.BANGUMI_ACCESS_TOKEN}`;
  }

  const response = await fetch(url, {
    headers,
    next: { revalidate: 1800 },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`Bangumi HTTP ${response.status}`);
  return response.json() as Promise<BangumiCollectionResponse>;
}

export async function getBangumiAnime(): Promise<BangumiAnimeData> {
  if (!BANGUMI_USER) return { user: "", total: 0, items: [] };
  const firstPage = await fetchCollectionPage(0);
  const total = firstPage.total ?? firstPage.data?.length ?? 0;
  const remainingOffsets = Array.from(
    { length: Math.max(0, Math.ceil(total / PAGE_SIZE) - 1) },
    (_, index) => (index + 1) * PAGE_SIZE,
  );
  const remainingPages = await Promise.all(
    remainingOffsets.map((offset) => fetchCollectionPage(offset)),
  );
  const sourceItems = [
    ...(firstPage.data ?? []),
    ...remainingPages.flatMap((page) => page.data ?? []),
  ];

  const items = sourceItems
    .map((entry) => {
      const subject = entry.subject;
      const id = subject?.id ?? 0;
      const totalEpisodes = subject?.eps ?? 0;
      const watchedEpisodes = entry.ep_status ?? 0;
      const progress = totalEpisodes > 0
        ? entry.type === 3
          ? `已看 ${watchedEpisodes}/${totalEpisodes} 话`
          : `全 ${totalEpisodes} 话`
        : watchedEpisodes > 0
          ? `已看 ${watchedEpisodes} 话`
          : "";

      return {
        id,
        title: subject?.name_cn?.trim() || subject?.name?.trim() || `条目 #${id}`,
        cover: coverUrl(subject?.images),
        url: `https://bgm.tv/subject/${id}`,
        score: subject?.score ?? 0,
        badge: statusText[entry.type ?? 0] || "番剧",
        subtitle: subject?.short_summary?.split(/\r?\n/).find(Boolean)?.trim() || "",
        progress,
        renewal: entry.updated_at?.slice(0, 10) || "",
      };
    })
    .filter((item) => item.id && item.cover);

  return { user: BANGUMI_USER, total, items };
}
