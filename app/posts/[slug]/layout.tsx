import { siteConfig } from "../../../site.config";
import "../../route-styles.css";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { localPostMap } from "../../data/posts";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = Object.hasOwn(localPostMap, slug) ? localPostMap[slug] : null;
  if (!post) return { title: `文章未找到 · ${siteConfig.title}`, robots: { index: false, follow: false } };

  const url = `${siteConfig.url}/posts/${encodeURIComponent(post.slug)}`;
  const images = post.cover ? [{ url: new URL(post.cover, siteConfig.url).href, alt: post.title }] : undefined;
  return {
    title: `${post.title} · ${siteConfig.title}`,
    description: post.description,
    keywords: post.tags,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url,
      siteName: siteConfig.title,
      locale: "zh_CN",
      publishedTime: `${post.date}T00:00:00+08:00`,
      tags: post.tags,
      images,
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title: post.title,
      description: post.description,
      images,
    },
  };
}

export default function ArticleLayout({ children }: { children: ReactNode }) {
  return <>
    {children}
  </>;
}
