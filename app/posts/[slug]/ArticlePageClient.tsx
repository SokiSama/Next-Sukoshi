"use client";

import { SiteFooter } from "../../components/SiteFooter";


import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import {
  ArrowLeft, CalendarBlank, Clock, Folder, Hash,
} from "@phosphor-icons/react";
import { JournalHeader } from "../../components/JournalHeader";
import { TwikooComments } from "../../components/TwikooComments";
import type { LocalPost } from "../../data/posts";
import homeStyles from "../../components/HomePage.module.css";
import styles from "./ArticlePage.module.css";

function ArticleCodeBlock({ children }: { children?: ReactNode }) {
  return (
    <div className={styles.codeBlock}>
      <figure className={styles.codePanel}>
        <pre>{children}</pre>
      </figure>
    </div>
  );
}

type TocItem = { id: string; level: 1 | 2 | 3; title: string };

const cleanHeading = (heading: string) => heading
  .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
  .replace(/[*_`~]/g, "")
  .trim();

function extractToc(markdown: string): TocItem[] {
  let fence = "";
  return markdown.split(/\r?\n/).flatMap((line, index) => {
    const fenceMatch = /^\s*(`{3,}|~{3,})/.exec(line);
    if (fenceMatch) {
      if (!fence) fence = fenceMatch[1];
      else if (fenceMatch[1][0] === fence[0] && fenceMatch[1].length >= fence.length) fence = "";
      return [];
    }
    if (fence) return [];
    const match = /^(#{1,3})\s+(.+?)\s*#*$/.exec(line.trim());
    if (!match) return [];
    return [{ id: `article-heading-${index + 1}`, level: match[1].length as 1 | 2 | 3, title: cleanHeading(match[2]) }];
  });
}

function ArticleReadingProgress({ items }: { items: TocItem[] }) {
  const [progress, setProgress] = useState(0);
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const topLevel = items.length ? Math.min(...items.map(item => item.level)) : 1;

  useEffect(() => {
    const updateReadingState = () => {
      const article = document.getElementById("article-content");
      if (!article) return;
      const articleTop = article.getBoundingClientRect().top + window.scrollY;
      const readingRange = Math.max(1, article.scrollHeight - window.innerHeight);
      const value = (window.scrollY - articleTop) / readingRange * 100;
      setProgress(Math.min(100, Math.max(0, Math.round(value))));
      const headings = items.map(item => document.getElementById(item.id)).filter((heading): heading is HTMLElement => Boolean(heading));
      const current = [...headings].reverse().find(heading => heading.getBoundingClientRect().top <= 150) ?? headings[0];
      if (current) setActiveId(current.id);
    };
    updateReadingState();
    const resizeObserver = new ResizeObserver(updateReadingState);
    const article = document.getElementById("article-content");
    if (article) resizeObserver.observe(article);
    window.addEventListener("scroll", updateReadingState, { passive: true });
    window.addEventListener("resize", updateReadingState);
    return () => { resizeObserver.disconnect(); window.removeEventListener("scroll", updateReadingState); window.removeEventListener("resize", updateReadingState); };
  }, [items]);

  return (
    <aside className={styles.progressSidebar}>
      <nav className={styles.toc} aria-label="文章目录">
        <h2 className={styles.tocTitle}>目录</h2>
        {items.length ? <ol className={styles.tocList}>{items.map(item => <li style={{ "--toc-depth": item.level - topLevel } as CSSProperties} key={item.id}><a className={`${styles.tocLink} ${activeId === item.id ? styles.tocActive : ""}`} href={`#${item.id}`} aria-current={activeId === item.id ? "location" : undefined}>{item.title}</a></li>)}</ol> : <p className={styles.tocEmpty}>这篇文章暂时没有章节标题。</p>}
        <div className={styles.tocProgress}>
          <div className={styles.tocProgressTrack} role="progressbar" aria-label="阅读进度" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
            <span style={{ width: `${progress}%` }} />
          </div>
          <span className={styles.tocProgressValue}>{progress}%</span>
        </div>
      </nav>
    </aside>
  );
}

type ArticlePageProps = { slug: string; post: LocalPost | null; content: string; failed: boolean };

export default function ArticlePageClient({ slug, post, content, failed }: ArticlePageProps) {
  const tocItems = useMemo(() => extractToc(content), [content]);
  const reading = useMemo(() => {
    const text = content.replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/<[^>]*>/g, "").replace(/https?:\/\/\S+/g, "");
    const count = text.match(/[\p{Script=Han}]|[\p{Script=Latin}\p{N}]+/gu)?.length ?? 0;
    return { count, minutes: Math.max(1, Math.ceil(count / 250)) };
  }, [content]);

  const category = post ? post.category || (post.type === "travel" ? "旅行" : post.tags[0] || "技术") : "";
  return (
    <>
      <div className={`${homeStyles.home} ${styles.page}`} id="top">
        <JournalHeader />
        {!post ? <main className={styles.missing}><h1>没有找到这篇文章</h1><Link href="/">返回首页</Link></main> : (
          <main className={styles.articleMain}>
            <header className={styles.articleHeader}>
              <Link className={styles.back} href="/"><ArrowLeft size={16} />返回首页</Link>
              <h1>{post.title}</h1>
              <div className={styles.meta}><span><CalendarBlank size={15} /><time dateTime={post.date}>{post.date}</time></span><span><Folder size={15} />{category}</span>{post.tags[0] && <span><Hash size={15} />{post.tags[0]}</span>}</div>
              <div className={styles.readingStats} aria-live="polite"><span>{content ? reading.count : "—"} 字</span><span><Clock size={15} />{content ? reading.minutes : "—"} 分钟</span></div>
            </header>
            <div className={styles.readingLayout}>
              <ArticleReadingProgress items={tocItems} />
              <article id="article-content" className={styles.prose}>
                {failed && <p className={styles.status} role="alert">文章暂时无法读取，请稍后刷新页面。</p>}
                {content && <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} components={{
                  pre: ({ children }) => <ArticleCodeBlock>{children}</ArticleCodeBlock>,
                  // Markdown contains external images without known intrinsic dimensions.
                  // eslint-disable-next-line @next/next/no-img-element
                  img: ({ alt, ...props }) => <img {...props} alt={alt || "文章插图"} loading="lazy" />,
                  h1: ({ node, children, ...props }) => { const id = `article-heading-${node?.position?.start.line ?? 0}`; return <h2 {...props} id={id}>{children}<a className={styles.headingAnchor} href={`#${id}`} aria-label="链接到此章节">#</a></h2>; },
                  h2: ({ node, children, ...props }) => { const id = `article-heading-${node?.position?.start.line ?? 0}`; return <h2 {...props} id={id}>{children}<a className={styles.headingAnchor} href={`#${id}`} aria-label="链接到此章节">#</a></h2>; },
                  h3: ({ node, children, ...props }) => { const id = `article-heading-${node?.position?.start.line ?? 0}`; return <h3 {...props} id={id}>{children}<a className={styles.headingAnchor} href={`#${id}`} aria-label="链接到此章节">#</a></h3>; },
                  a: ({ href, children, ...props }) => { const external = /^https?:\/\//.test(href || ""); return <a {...props} href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>{children}</a>; },
                }}>{content}</ReactMarkdown>}
              </article>
            </div>
            <div className={styles.comments}><TwikooComments path={`/posts/${slug}`} /></div>
          </main>
        )}
        <SiteFooter />
      </div>
    </>
  );
}
