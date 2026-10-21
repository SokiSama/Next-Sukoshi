import assert from "node:assert/strict";
import test from "node:test";
import { parseTrafficCounts, readOrCountVisit, trafficStorageKey, visitIdleTimeout } from "../app/lib/traffic-session.ts";

function memoryStorage() {
  const items = new Map();
  return { getItem: key => items.get(key) ?? null, setItem: (key, value) => items.set(key, value) };
}

test("reloads and repeated visits within 30 minutes reuse confirmed server totals", async () => {
  const storage = memoryStorage();
  let calls = 0;
  let time = 1000;
  const countVisit = async () => { calls++; return { views: 1200 + calls, visitors: 321 }; };
  const load = () => readOrCountVisit({ storage, countVisit, now: () => time });
  assert.deepEqual(await load(), { views: 1201, visitors: 321 });
  for (let i = 0; i < 5; i++) {
    time += 20 * 60 * 1000;
    assert.deepEqual(await load(), { views: 1201, visitors: 321 });
  }
  assert.equal(calls, 1);
  time += visitIdleTimeout;
  assert.deepEqual(await load(), { views: 1202, visitors: 321 });
  assert.equal(calls, 2);
});

test("concurrent tabs serialized by the provider's shared lock only count once", async () => {
  const storage = memoryStorage();
  let lock = Promise.resolve();
  let calls = 0;
  const countVisit = async () => { calls++; return { views: 9, visitors: 4 }; };
  const lockedVisit = () => {
    lock = lock.then(() => readOrCountVisit({ storage, countVisit, now: () => 1000 }));
    return lock;
  };
  const counts = await Promise.all(Array.from({ length: 8 }, lockedVisit));
  assert.equal(calls, 1);
  assert.ok(counts.every(value => value.views === 9 && value.visitors === 4));
});

test("provider failure preserves the last confirmed counts without extending the visit", async () => {
  const storage = memoryStorage();
  const original = JSON.stringify({ views: 90, visitors: 24, lastSeen: 1000 });
  storage.setItem(trafficStorageKey, original);
  const counts = await readOrCountVisit({ storage, now: () => 1000 + visitIdleTimeout, countVisit: async () => { throw new Error("offline"); } });
  assert.deepEqual(counts, { views: 90, visitors: 24 });
  assert.equal(storage.getItem(trafficStorageKey), original);
});

test("corrupt storage and clock rollback cannot suppress new visits indefinitely", async () => {
  for (const raw of ["invalid JSON", JSON.stringify({ views: -1, visitors: 4, lastSeen: 1000 }), JSON.stringify({ views: 8, visitors: 4, lastSeen: 999999 })]) {
    const storage = memoryStorage();
    storage.setItem(trafficStorageKey, raw);
    let calls = 0;
    await readOrCountVisit({ storage, now: () => 1000, countVisit: async () => { calls++; return { views: 9, visitors: 4 }; } });
    assert.equal(calls, 1);
  }
});

test("only actual nonnegative integer totals are accepted; unavailable data is never fabricated", async () => {
  for (const value of [null, {}, { site_pv: "10", site_uv: 4 }, { site_pv: 10, site_uv: -1 }, { site_pv: 2.2, site_uv: 4 }]) {
    assert.throws(() => parseTrafficCounts(value));
  }
  assert.deepEqual(parseTrafficCounts({ site_pv: 0, site_uv: 0 }), { views: 0, visitors: 0 });
  await assert.rejects(readOrCountVisit({ storage: null, countVisit: async () => { throw new Error("offline"); } }));
});
