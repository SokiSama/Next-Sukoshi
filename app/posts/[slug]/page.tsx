import { readFile } from "node:fs/promises";
import path from "node:path";
import { notFound } from "next/navigation";
import { localPostMap } from "../../data/posts";
import ArticlePageClient from "./ArticlePageClient";

export default async function LocalPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = Object.hasOwn(localPostMap, slug) ? localPostMap[slug] : null;
  if (!post) notFound();
  let content = "";
  let failed = false;
  if (post) {
    try {
      const markdown = await readFile(path.join(process.cwd(), "public", post.source.replace(/^\/+/, "")), "utf8");
      content = markdown.replace(/^---[\s\S]*?---\s*/, "");
    } catch {
      failed = true;
    }
  }
  return <ArticlePageClient slug={slug} post={post} content={content} failed={failed} />;
}
