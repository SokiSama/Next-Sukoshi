import { siteConfig } from "../../site.config.ts";
import type { LocalPost } from "../data/posts";

const siteUrl = siteConfig.url.replace(/\/$/, "");

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;",
  })[character]!);
}

function publicationDate(date: string): string {
  return new Date(`${date}T00:00:00+08:00`).toUTCString();
}

export function buildRssFeed(posts: LocalPost[]): string {
  const sortedPosts = [...posts].sort((a, b) => b.date.localeCompare(a.date));
  const items = sortedPosts.map((post) => {
    const url = `${siteUrl}/posts/${encodeURIComponent(post.slug)}`;
    const categories = [...new Set([post.category, ...post.tags].filter(Boolean))];
    return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${publicationDate(post.date)}</pubDate>
${categories.map((category) => `      <category>${escapeXml(category!)}</category>`).join("\n")}
    </item>`;
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteConfig.title)}</title>
    <link>${siteUrl}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>zh-CN</language>
    <atom:link href="${siteUrl}/api/rss" rel="self" type="application/rss+xml" />
${sortedPosts.length ? `    <lastBuildDate>${publicationDate(sortedPosts[0].date)}</lastBuildDate>\n` : ""}${items}
  </channel>
</rss>`;
}
