import { NextResponse } from "next/server";

export const revalidate = 86_400;
export const dynamic = "force-dynamic";

type XxApiResponse = {
  code?: number;
  msg?: string;
  data?: string[];
};

const sourceUrl = "https://xxapi.cn/doc/history";
const cacheHeaders = {
  "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=86400",
};

function parseEvent(value: string, index: number) {
  const normalized = value.replace(/\s+/g, " ").trim();
  const match = /^(-?\d{1,4})年(\d{1,2})月(\d{1,2})日\s*(.+)$/.exec(normalized);

  if (!match) {
    return {
      id: index,
      year: null,
      month: null,
      day: null,
      title: normalized,
      description: "",
      thumbnail: null,
      url: sourceUrl,
    };
  }

  const [, rawYear, rawMonth, rawDay, title] = match;
  return {
    id: index,
    year: Number(rawYear),
    month: Number(rawMonth),
    day: Number(rawDay),
    title: title.trim(),
    description: "",
    thumbnail: null,
    url: sourceUrl,
  };
}

export async function GET() {
  try {
    const response = await fetch("https://v2.xxapi.cn/api/history", {
      headers: {
        Accept: "application/json",
        "User-Agent": "JournalBlog/1.0 (https://example.com)",
      },
      next: { revalidate: 86_400 },
    });
    if (!response.ok) throw new Error(`History API returned ${response.status}`);

    const payload = await response.json() as XxApiResponse;
    if (payload.code !== 200 || !Array.isArray(payload.data)) {
      throw new Error(payload.msg || "History API request failed");
    }

    const events = payload.data
      .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      .map(parseEvent);
    if (!events.length) throw new Error("No events available");

    return NextResponse.json({
      ok: true,
      events,
      event: {
        year: events[0].year,
        text: events[0].title,
        thumbnail: null,
        url: sourceUrl,
      },
    }, { headers: cacheHeaders });
  } catch {
    return NextResponse.json(
      { ok: false, events: [], event: null },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  }
}
