import { NextResponse } from "next/server";
import friends from "../../../../data/friends.json";
import { extractFriendArticleSummary } from "../../../lib/friend-feed-summary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 1800;
export const maxDuration = 30;

type Friend = { title: string; avatar: string; description: string; url: string; tags: string[]; rss?: string };

type FriendArticle = {
  title: string;
  summary: string;
  url: string;
  publishedAt: string;
  siteName: string;
  siteUrl: string;
  avatar: string;
};

type FriendFeedResult = {
  siteUrl: string;
  feedUrl: string;
  articles: FriendArticle[];
};

const requestHeaders = {
  Accept: "application/atom+xml, application/rss+xml, application/xml, text/xml, text/html;q=0.8",
  "User-Agent": "JournalBlog-FriendCircle/1.0 (+https://example.com/friends)",
};

const decodeEntities = (value: string) => value
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
  .replace(/<[^>]+>/g, "")
  .replace(/&amp;/g, "&")
  .replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">")
  .replace(/&quot;/g, "\"")
  .replace(/&#39;|&apos;/g, "'")
  .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 16)))
  .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
  .trim();

function readTag(source: string, names: string[]) {
  for (const name of names) {
    const match = source.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, "i"));
    if (match?.[1]) return decodeEntities(match[1]);
  }
  return "";
}

function readEntryLink(source: string) {
  const linkTags = source.match(/<link\b[^>]*>/gi) ?? [];
  const preferred = linkTags.find((tag) => {
    const rel = tag.match(/\brel=["']([^"']+)["']/i)?.[1];
    return !rel || rel === "alternate";
  });
  const href = preferred?.match(/\bhref=["']([^"']+)["']/i)?.[1];
  return href ? decodeEntities(href) : readTag(source, ["link", "guid"]);
}

function toAbsoluteUrl(value: string, base: string) {
  try {
    const url = new URL(value, base);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function parseFeed(xml: string, feedUrl: string, friend: Friend): FriendArticle[] {
  const entries = [
    ...(xml.match(/<item\b[\s\S]*?<\/item>/gi) ?? []),
    ...(xml.match(/<entry\b[\s\S]*?<\/entry>/gi) ?? []),
  ];

  return entries.slice(0, 12).flatMap((entry) => {
    const title = readTag(entry, ["title"]);
    const url = toAbsoluteUrl(readEntryLink(entry), feedUrl);
    const dateText = readTag(entry, ["pubDate", "published", "updated", "dc:date", "date"]);
    const date = new Date(dateText);

    if (!title || !url || !dateText || Number.isNaN(date.getTime())) return [];

    return [{
      title,
      summary: extractFriendArticleSummary(entry),
      url,
      publishedAt: date.toISOString(),
      siteName: friend.title,
      siteUrl: friend.url,
      avatar: friend.avatar,
    }];
  });
}

function discoverFeedLinks(html: string, pageUrl: string) {
  return (html.match(/<link\b[^>]*>/gi) ?? [])
    .filter((tag) => /\brel=["'][^"']*alternate[^"']*["']/i.test(tag))
    .filter((tag) => /\btype=["']application\/(?:rss|atom)\+xml["']/i.test(tag))
    .map((tag) => tag.match(/\bhref=["']([^"']+)["']/i)?.[1] ?? "")
    .map((href) => toAbsoluteUrl(decodeEntities(href), pageUrl))
    .filter(Boolean);
}

async function fetchText(url: string) {
  const response = await fetch(url, {
    headers: requestHeaders,
    signal: AbortSignal.timeout(5000),
    next: { revalidate: 1800 },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

async function tryFeedCandidates(candidates: string[], friend: Friend) {
  const results = await Promise.allSettled(candidates.map(async (candidate) => {
    const xml = await fetchText(candidate);
    if (!/<(?:rss|feed|rdf:RDF)\b/i.test(xml)) return [];
    const articles = parseFeed(xml, candidate, friend);
    return articles.length > 0 ? [{ feedUrl: candidate, articles }] : [];
  }));

  for (const result of results) {
    if (result.status === "fulfilled" && result.value.length > 0) return result.value[0];
  }
  return null;
}

async function readFriendFeed(friend: Friend): Promise<FriendFeedResult | null> {
  try {
    const pageUrl = new URL(friend.url);
    if (pageUrl.protocol !== "https:" && pageUrl.protocol !== "http:") return null;

    let discovered: string[] = [];
    try {
      const html = await fetchText(pageUrl.toString());
      discovered = discoverFeedLinks(html, pageUrl.toString());
    } catch {
      // Common feed paths below cover sites that block homepage crawlers.
    }

    const origin = pageUrl.origin;
    const candidates = Array.from(new Set([
      ...(friend.rss ? [friend.rss] : []),
      ...discovered,
      `${origin}/rss.xml`,
      `${origin}/atom.xml`,
      `${origin}/feed.xml`,
      `${origin}/index.xml`,
      `${origin}/feed`,
      `${origin}/rss`,
    ]));

    const firstBatch = await tryFeedCandidates(candidates.slice(0, 4), friend);
    const feed = firstBatch ?? await tryFeedCandidates(candidates.slice(4), friend);
    if (!feed && !friend.rss) return null;

    return {
      siteUrl: friend.url,
      feedUrl: feed?.feedUrl ?? friend.rss!,
      articles: feed?.articles ?? [],
    };
  } catch {
    return null;
  }
}

export async function GET() {
  const results = (await Promise.all(friends.map(readFriendFeed)))
    .filter((result): result is FriendFeedResult => result !== null);

  const articles = results
    .flatMap((result) => result.articles)
    .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt))
    .filter((article, index, list) => list.findIndex((item) => item.url === article.url) === index)
    .slice(0, 8);

  return NextResponse.json(
    {
      articles,
      feeds: results.map(({ siteUrl, feedUrl }) => ({ siteUrl, feedUrl })),
      updatedAt: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
      },
    },
  );
}
