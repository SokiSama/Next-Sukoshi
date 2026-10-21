"use client";

import { ArrowRight, ClockCounterClockwise } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

type HistoricalEvent = {
  year: number | null;
  text: string;
  thumbnail: string | null;
  url: string;
};

type OnThisDayResponse = { ok: boolean; event?: HistoricalEvent | null };

const emptyMessage = "历史仍在书写，今天也将成为其中一页。";

export function OnThisDayCard() {
  const [event, setEvent] = useState<HistoricalEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const now = new Date();
    const date = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
    ].join("-");

    fetch(`/api/on-this-day?date=${date}`, { signal: controller.signal })
      .then(async (response) => response.json() as Promise<OnThisDayResponse>)
      .then((payload) => {
        if (active && payload.ok && payload.event) setEvent(payload.event);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  return (
    <section className="card side-card on-this-day-card" aria-live="polite">
      <h3>历史上的今天</h3>
      {event ? <article>
        {event.thumbnail && <div className="on-this-day-cover"><img src={event.thumbnail} alt="历史事件相关图片" loading="lazy" referrerPolicy="no-referrer" /></div>}
        {event.year !== null && <span className="on-this-day-year">{event.year} 年</span>}
        <p>{event.text}</p>
        <a href={event.url} target="_blank" rel="noreferrer">了解这一天 <ArrowRight aria-hidden="true" /></a>
      </article> : <div className="on-this-day-empty">
        <ClockCounterClockwise aria-hidden="true" weight="duotone" />
        <p>{loading ? "正在翻阅历史的书页…" : emptyMessage}</p>
      </div>}
      <small>数据来源：小小API</small>
    </section>
  );
}
