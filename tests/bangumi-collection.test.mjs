import assert from "node:assert/strict";
import test from "node:test";
import { readAllAnimeCollections, animeProgress } from "../app/lib/bangumiCollection.ts";

test("reads every page beyond 100 entries using the actual returned page size", async () => {
  const offsets = [];
  const source = Array.from({ length: 131 }, (_, i) => ({ subject: { id: i + 1 } }));
  const result = await readAllAnimeCollections(async offset => { offsets.push(offset); return { total: source.length, data: source.slice(offset, offset + 40) }; });
  assert.deepEqual(offsets, [0, 40, 80, 120]);
  assert.equal(result.total, 131);
  assert.equal(result.entries.length, 131);
  assert.equal(result.entries.at(-1).subject.id, 131);
});

test("rejects an incomplete collection instead of reporting partial data as complete", async () => {
  await assert.rejects(readAllAnimeCollections(async offset => ({ total: 51, data: offset ? [] : [{ subject: { id: 1 } }] })), /ended early/);
});

test("handles an empty collection and deduplicates repeated subjects", async () => {
  assert.deepEqual(await readAllAnimeCollections(async () => ({ total: 0, data: [] })), { total: 0, entries: [] });
  const result = await readAllAnimeCollections(async () => ({ total: 2, data: [{ subject: { id: 1 } }, { subject: { id: 1 } }] }));
  assert.equal(result.entries.length, 1);
});

test("keeps completed and unwatched progress distinct from actively watched episodes", () => {
  assert.equal(animeProgress("在看", 3, 12), "已看 3 / 12 话");
  assert.equal(animeProgress("看过", 0, 13), "全 13 话");
  assert.equal(animeProgress("想看", 0, 12), "全 12 话");
  assert.equal(animeProgress("搁置", 6, 25), "已看 6 / 25 话");
});
