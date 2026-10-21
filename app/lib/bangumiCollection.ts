export type BangumiCollectionEntry = {
  type?: number;
  ep_status?: number;
  subject?: { id?: number; name?: string; name_cn?: string; eps?: number; short_summary?: string };
};
export type BangumiCollectionPage = { total?: number; data?: BangumiCollectionEntry[] };

// Advance by the actual page size so an upstream limit change cannot skip entries.
export async function readAllAnimeCollections(readPage: (offset: number) => Promise<BangumiCollectionPage>) {
  const entries: BangumiCollectionEntry[] = [];
  let total = 0;
  do {
    const page = await readPage(entries.length);
    total = page.total ?? page.data?.length ?? 0;
    const batch = page.data ?? [];
    if (!batch.length && entries.length < total) throw new Error("Bangumi collection pagination ended early");
    entries.push(...batch);
  } while (entries.length < total);
  return { total, entries: [...new Map(entries.filter(entry => entry.subject?.id).map(entry => [entry.subject!.id!, entry])).values()] };
}

export function animeProgress(status: string, watched: number, total: number) {
  if (status === "在看" || status === "搁置" || status === "抛弃") {
    return total > 0 ? `已看 ${watched} / ${total} 话` : `已看 ${watched} 话`;
  }
  return total > 0 ? `全 ${total} 话` : watched > 0 ? `已看 ${watched} 话` : "暂无集数信息";
}
