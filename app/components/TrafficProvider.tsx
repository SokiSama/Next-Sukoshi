"use client";
import { siteConfig } from "../../site.config";


import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { parseTrafficCounts, readOrCountVisit, trafficStorageKey, type TrafficCounts } from "../lib/traffic-session";

const TrafficContext = createContext<TrafficCounts | null>(null);
let visitRequest: Promise<TrafficCounts> | undefined;

function countVisit(): Promise<TrafficCounts> {
  return new Promise((resolve, reject) => {
    const name = `JournalTraffic_${crypto.randomUUID().replaceAll("-", "")}`;
    const callbacks = window as unknown as Record<string, unknown>;
    const script = document.createElement("script");
    const cleanup = () => {
      clearTimeout(timer);
      script.remove();
      delete callbacks[name];
    };
    const timer = window.setTimeout(() => { cleanup(); reject(new Error("Traffic service timed out")); }, 10_000);
    callbacks[name] = (data: unknown) => {
      cleanup();
      try { resolve(parseTrafficCounts(data)); } catch (error) { reject(error); }
    };
    script.src = `https://busuanzi.ibruce.info/busuanzi?jsonpCallback=${name}`;
    script.async = true;
    script.referrerPolicy = "no-referrer-when-downgrade";
    script.onerror = () => { cleanup(); reject(new Error("Traffic service unavailable")); };
    document.head.appendChild(script);
  });
}

function loadCounts() {
  // One shared request also prevents React effect replays from counting twice.
  visitRequest ??= (async () => {
    let storage: Storage | null = null;
    try { storage = window.localStorage; } catch { /* Storage can be disabled. */ }
    const read = () => readOrCountVisit({ storage, countVisit });
    // Serialize the cache check and increment across tabs of this origin.
    return navigator.locks ? navigator.locks.request(trafficStorageKey, read) : read();
  })();
  return visitRequest;
}

export function TrafficProvider({ children }: { children: ReactNode }) {
  const [counts, setCounts] = useState<TrafficCounts | null>(null);
  const pathname = usePathname();
  useEffect(() => {
    // Local development and deployment previews must not inflate live totals.
    if (!siteConfig.traffic.enabled || !siteConfig.traffic.hostnames.includes(location.hostname)) return;
    let cancelled = false;
    let idle: number | undefined;
    const start = () => {
      idle = window.setTimeout(() => {
        void loadCounts().then(value => { if (!cancelled) setCounts(value); }).catch(() => { /* Keep the honest unavailable state. */ });
      }, 1000);
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("load", start);
      window.clearTimeout(idle);
    };
  }, []);
  useEffect(() => {
    if (!counts) return;
    // Route changes extend the current visit without contacting the counter.
    try { localStorage.setItem(trafficStorageKey, JSON.stringify({ ...counts, lastSeen: Date.now() })); } catch { /* Optional browser storage. */ }
  }, [pathname, counts]);
  return <TrafficContext.Provider value={counts}>{children}</TrafficContext.Provider>;
}

export function useTrafficCounts() { return useContext(TrafficContext); }
