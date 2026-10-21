import { siteConfig } from '../../site.config';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { HomePost } from '../components/HomePageClient';
import { localPosts } from '../data/posts';

export async function getHomeData() {
  const posts: HomePost[] = await Promise.all(localPosts.map(async (post) => {
    try {
      const markdown = await readFile(path.join(process.cwd(), "public", post.source.replace(/^\/+/, "")), "utf8");
      const text = markdown
        .replace(/^---[\s\S]*?---\s*/, "")
        .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
        .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
        .replace(/<[^>]*>/g, "")
        .replace(/https?:\/\/\S+/g, "");
      const wordCount = text.match(/[\p{Script=Han}]|[\p{Script=Latin}\p{N}]+/gu)?.length ?? 0;
      const excerpt = text.replace(/^\s*(?:#{1,6}\s+.*|[-*_]{3,}|\|.*\||```.*)\s*$/gm, "").replace(/[*_`>~]/g, "").replace(/\s+/g, " ").trim().slice(0, 240);
      return { ...post, excerpt, wordCount, readingMinutes: Math.max(1, Math.ceil(wordCount / 250)) };
    } catch {
      return { ...post, excerpt: post.description, wordCount: null, readingMinutes: null };
    }
  }));
  const firstPostDate = [...posts].sort((a, b) => a.date.localeCompare(b.date))[0]?.date ?? `${siteConfig.startYear}-01-01`;
  // eslint-disable-next-line react-hooks/purity -- The cached server render refreshes the site's age hourly.
  const runningDays = Math.max(1, Math.floor((Date.now() - new Date(`${firstPostDate}T00:00:00+08:00`).getTime()) / 86_400_000) + 1);
  return { posts, runningDays };
}
