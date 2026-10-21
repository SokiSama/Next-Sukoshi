import { localPosts } from "../../data/posts";
import { buildRssFeed } from "../../lib/rss";

export function GET() {
  return new Response(buildRssFeed(localPosts), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
