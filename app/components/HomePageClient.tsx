"use client";
import { siteConfig } from "../../site.config";


import { SiteFooter } from "./SiteFooter";


import { ThemeModeControl } from "./ThemeModeControl";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUp, CaretDown, CaretLeft, CaretRight, Clock, CalendarBlank,
  Folder, Tag, TextAa,
  List, X, PushPin,
} from "@phosphor-icons/react";
import { postCategories, type LocalPost, type PostCategory } from "../data/posts";
import { MobileNavigation } from "./MobileNavigation";
import { HeroSocialLinks } from "./HeroSocialLinks";
import { SiteStats } from "./SiteStats";
import styles from "./HomePage.module.css";

export type HomePost = LocalPost & { wordCount: number | null; readingMinutes: number | null; excerpt: string };

const navigation = [
  { label: "首页", href: "/" }, { label: "品鉴", href: "/collection" },
  { label: "友链", href: "/friends" }, { label: "归档", href: "/archive" },
  { label: "关于", href: "/about" },
];
const pageSize = 8;
const pinnedPostSlugs: string[] = ["hello-world"];
const getCategory = (post: LocalPost) => post.category;

const defaultPostCovers = [siteConfig.defaultCover];

const homeMotionStyles = `
  [data-home-intro] { --home-entry-ease: cubic-bezier(.1,.9,.2,1); }
  [data-home-intro] [data-home-motion="portrait"] { animation: home-portrait-pop .2s ease-out backwards; }
  [data-home-intro] [data-home-portrait]::before {
    content: ""; position: absolute; inset: 0; border-radius: 50%; background: rgba(243,200,210,.55);
    z-index: -1; pointer-events: none;
    animation: home-portrait-ripple 1s cubic-bezier(.64,0,0,1) .1s both;
  }
  /* Keep the primary introduction visible on the first paint. */
  [data-home-intro] [data-home-motion="title"],
  [data-home-intro] [data-home-motion="subtitle"],
  [data-home-intro] [data-home-motion="badge"] { animation: none; }
  [data-home-intro] [data-home-terminal] { display: inline-block; margin-left: .55em; animation: home-terminal-blink 1.2s step-end infinite; }
  [data-home-intro] [data-home-motion="scroll"] { animation: home-scroll-in 1s var(--home-entry-ease) .6s backwards; }
  [data-home-intro] nav[aria-label="Social links"] > a { animation: home-social-in .5s var(--home-entry-ease) .7s backwards; }
  [data-home-intro] nav[aria-label="Social links"] > a:nth-child(2) { animation-delay: .75s; }
  [data-home-intro] nav[aria-label="Social links"] > a:nth-child(3) { animation-delay: .8s; }
  [data-home-intro] nav[aria-label="Social links"] > a:nth-child(4) { animation-delay: .85s; }
  [data-home-intro] nav[aria-label="Social links"] > a:nth-child(5) { animation-delay: .9s; }
  [data-home-intro] [data-home-article] {
    animation-name: home-article-in;
    animation-duration: min(.96s,calc(.8s + var(--article-order) * .02s));
    animation-delay: min(.4s,calc(var(--article-order) * .05s));
    animation-timing-function: var(--home-entry-ease);
    animation-fill-mode: backwards;
  }
  [data-home-intro] [data-home-article-motion="false"] [data-home-article] { animation: none; }
  [data-home-intro] [data-home-page-motion] { animation: home-page-in .26s cubic-bezier(.22,1,.36,1) backwards; }
  /* Cards own their entrance, so their parent skips the shared page entrance. */
  [data-home-intro] #home-articles[data-page-transition] > [data-page-enter] { animation: none !important; }
  @keyframes home-portrait-pop { from { opacity: 0; transform: scale(0); } to { opacity: 1; transform: scale(1); } }
  @keyframes home-portrait-ripple { from { opacity: .8; transform: scale(0); } to { opacity: 0; transform: scale(2); } }
  @keyframes home-copy-in { from { opacity: 0; transform: translateX(50vw); } to { opacity: 1; transform: translateX(0); } }
  @keyframes home-scroll-in { from { opacity: 0; transform: translateY(-2rem); } to { opacity: 1; transform: translateY(0); } }
  @keyframes home-social-in { from { opacity: 0; transform: translateX(80vw) scale(0); } to { opacity: 1; transform: translateX(0) scale(1); } }
  @keyframes home-article-in { from { opacity: 0; transform: translateX(-150%); } to { opacity: 1; transform: translateX(0); } }
  @keyframes home-page-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes home-terminal-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
  @media (prefers-reduced-motion: reduce) {
    [data-home-intro], [data-home-intro] *, [data-home-intro] *::before, [data-home-intro] *::after {
      animation-duration: 0s !important; animation-delay: 0s !important; animation-iteration-count: 1 !important;
      transition-duration: 0s !important;
    }
  }
`;

function SummaryCard({ post, order, eager = false }: { post: HomePost & { cover: string }; order: number; eager?: boolean }) {
  return <article className={styles.summaryCard} data-home-article style={{ "--article-order": order } as CSSProperties}>
    <Link prefetch={false} href={`/posts/${post.slug}`} className={styles.summaryLink} aria-label={`${post.title}，阅读全文`}>
      <div className={styles.summaryText}>
        <div className={styles.summaryMeta}>
          {pinnedPostSlugs.includes(post.slug) && <span className={styles.pinnedBadge}><PushPin size={14} weight="fill" aria-hidden="true" />置顶</span>}
          <span><Folder size={15} aria-hidden="true" />{post.category}</span>
          <span><CalendarBlank size={16} aria-hidden="true" /><time dateTime={post.date}>{post.date}</time></span>
          {post.wordCount !== null && <span><TextAa size={16} aria-hidden="true" />{post.wordCount.toLocaleString("en-US")} 字</span>}
          {post.readingMinutes !== null && <span><Clock size={16} aria-hidden="true" />{post.readingMinutes} 分钟</span>}
        </div>
        <h2 title={post.title}>{post.title}</h2><p>{post.excerpt || post.description}</p>
        <div className={styles.summaryFooter}>
          <div className={styles.summaryTags} aria-label="文章标签">{post.tags.map(tag => <span key={tag}><Tag size={13} weight="fill" aria-hidden="true" />{tag}</span>)}</div>
        </div>
      </div>
      <div className={styles.summaryCover}><Image src={post.cover} fill sizes="(max-width: 600px) 100vw, 440px" loading={eager ? "eager" : "lazy"} unoptimized={post.cover.endsWith(".webp")} alt="" /></div>
    </Link>
  </article>;
}

export function HomePageClient({ posts, runningDays, showHero = true }: { posts: HomePost[]; runningDays: number; showHero?: boolean }) {
  const layoutRef = useRef<HTMLElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [overHero, setOverHero] = useState(showHero);
  const [scrollHintVisible, setScrollHintVisible] = useState(true);
  const [page, setPage] = useState(1);
  const [articleMotion, setArticleMotion] = useState(true);
  const [category, setCategory] = useState<PostCategory | "全部">("全部");
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const categories = useMemo(() => ["全部", ...postCategories.filter(name => posts.some(post => post.category === name))] as const, [posts]);

  useEffect(() => {
    const sidebar = sidebarRef.current;
    const layout = layoutRef.current;
    if (!sidebar || !layout) return;
    const observer = new ResizeObserver(([entry]) => layout.style.setProperty("--home-sidebar-height", `${Math.ceil(entry.contentRect.height)}px`));
    observer.observe(sidebar);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const hero = document.getElementById("home-hero");
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) => setOverHero(entry.isIntersecting), { rootMargin: "-70px 0px 0px 0px" });
    // Hide the cue before it reaches the sticky header above the article list.
    const hintObserver = new IntersectionObserver(([entry]) => setScrollHintVisible(entry.isIntersecting), { rootMargin: "-160px 0px 0px 0px" });
    observer.observe(hero);
    hintObserver.observe(hero);
    return () => { observer.disconnect(); hintObserver.disconnect(); };
  }, []);

  useEffect(() => {
    if (menuOpen) return;
    const desktop = window.matchMedia("(min-width: 1024px) and (pointer: fine)");
    let distance = 0;
    let lastWheel = 0;
    let lockedUntil = 0;
    const onWheel = (event: WheelEvent) => {
      if (!desktop.matches || event.ctrlKey || event.defaultPrevented || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      if (event.deltaY <= 0) { distance = 0; lockedUntil = 0; return; }
      const target = event.target;
      if (!(target instanceof Element) || target.closest("dialog, textarea, select, [contenteditable=true]")) return;
      // Preserve independent scroll areas, including the sticky profile rail.
      for (let node: Element | null = target; node && node !== document.body; node = node.parentElement) {
        if (node.scrollHeight > node.clientHeight && /auto|scroll/.test(getComputedStyle(node).overflowY)) return;
      }
      const now = performance.now();
      if (now < lockedUntil) { event.preventDefault(); return; }
      const main = layoutRef.current;
      const hero = document.getElementById("home-hero");
      if (!main || !hero || hero.getBoundingClientRect().bottom <= 130 || main.getBoundingClientRect().top <= 140) return;
      if (now - lastWheel > 250) distance = 0;
      lastWheel = now;
      distance += event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1);
      // A normal wheel notch (3 lines) advances the full introduction. Tiny
      // touchpad movements accumulate before triggering the same transition.
      if (distance < 40) return;
      event.preventDefault();
      distance = 0;
      lockedUntil = now + 900;
      main.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [menuOpen]);

  useEffect(() => {
    const requestedCategory = new URLSearchParams(window.location.search).get("category");
    const frame = window.requestAnimationFrame(() => {
      if (categories.includes(requestedCategory as PostCategory | "全部")) setCategory(requestedCategory as PostCategory | "全部");
    });
    const closeMenu = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", closeMenu);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", closeMenu);
    };
  }, [categories]);

  const sortedPosts = useMemo(() => {
    let fallbackIndex = 0;
    return [...posts].sort((a, b) => b.date.localeCompare(a.date)).map(post => ({
      ...post,
      cover: post.cover || defaultPostCovers[fallbackIndex++ % defaultPostCovers.length],
    }));
  }, [posts]);
  const filteredPosts = sortedPosts.filter(post => category === "全部" || post.category === category);
  const pinnedPosts = pinnedPostSlugs.flatMap(slug => filteredPosts.find(post => post.slug === slug) ?? []);
  const regularPosts = filteredPosts.filter(post => !pinnedPostSlugs.includes(post.slug));
  const pageCount = Math.max(1, Math.ceil(regularPosts.length / pageSize));
  const pagePosts = regularPosts.slice((page - 1) * pageSize, page * pageSize);
  const siteStats = [
    { label: "文章", value: posts.length },
    { label: "分类", value: new Set(posts.map(getCategory)).size },
    { label: "书签", value: new Set(posts.flatMap(post => post.tags)).size },
    { label: "总字数", value: posts.every(post => post.wordCount !== null) ? posts.reduce((sum, post) => sum + (post.wordCount ?? 0), 0) : null },
    { label: "运行天数", value: runningDays, unit: "天" },
  ];
  const changePage = (next: number) => {
    if (next === page || next < 1 || next > pageCount) return;
    setArticleMotion(false);
    setPage(next);
    window.requestAnimationFrame(() => document.getElementById("home-feed")?.scrollIntoView({ behavior: "instant", block: "start" }));
  };
  const changeCategory = (next: PostCategory | "全部") => {
    setCategory(next);
    setPage(1);
    window.requestAnimationFrame(() => document.getElementById("home-feed")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  return (
    <div className={`${styles.home} ${styles.homePage}`} id="top" data-home-intro>
      <style>{homeMotionStyles}</style>
      <header className={styles.header} data-over-hero={overHero}>
        <div className={styles.headerInner}>
          <Link prefetch={false} className={styles.brand} href="/" aria-current="page">
            <Image src={siteConfig.avatar} width={36} height={36} alt="" />
            <span>{siteConfig.title}</span>
          </Link>
          <nav className={styles.navigation} id="home-navigation" aria-label="主导航">
            {navigation.map(({ label, href }) => <Link prefetch={false} href={href} key={href} aria-current={href === "/" ? "page" : undefined} onClick={() => setMenuOpen(false)}>{label}</Link>)}
          </nav>
          <div className={styles.headerActions}>
            <ThemeModeControl />
            <button className={`${styles.iconButton} ${styles.menuButton}`} onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "关闭菜单" : "打开菜单"} aria-expanded={menuOpen} aria-controls="mobile-navigation">{menuOpen ? <X size={23} /> : <List size={23} />}</button>
          </div>
        </div>
      </header>
      {menuOpen && <MobileNavigation active="/" category={category} onCategory={changeCategory} siteStats={siteStats} onClose={() => setMenuOpen(false)} />}

      {showHero && <section className={styles.hero} id="home-hero" aria-labelledby="home-hero-title">
        <div className={styles.heroInner}>
          <div className={styles.heroPortrait} data-home-portrait>
            <Link prefetch={false} className={styles.heroPortraitPop} href="/about" aria-label={`关于 ${siteConfig.author}`} data-home-motion="portrait">
              <span className={styles.heroPortraitFloat}>
                <Image src={siteConfig.avatar} width={640} height={640} sizes="(max-width: 800px) clamp(160px, 44vw, 200px), 258px" alt={`${siteConfig.author} 的圆形头像`} preload fetchPriority="high" decoding="async" />
              </span>
            </Link>
          </div>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle} id="home-hero-title" data-home-motion="title">Hi, I’m <strong>{siteConfig.author}</strong></h1>
            <p className={styles.heroSubtitle} data-home-motion="subtitle">{siteConfig.subtitle}</p>
            <div className={styles.heroMeta}>
              <span className={styles.heroBadge} data-home-motion="badge">
                <span>A personal</span>
                <span className={styles.aiWebsiteBadge}>Journal<span data-home-terminal aria-hidden="true">&gt;_</span></span>
              </span>
              <HeroSocialLinks />
            </div>
          </div>
        </div>
        <a className={styles.scrollHint} href="#home-articles" aria-label="向下滚动，浏览文章" hidden={!scrollHintVisible}>
          <span className={styles.scrollHintMotion} data-home-motion="scroll">
            <CaretDown size={28} weight="bold" aria-hidden="true" />
          </span>
        </a>
      </section>}

      <main className={styles.main} id="home-articles" aria-label="文章与站点信息" ref={layoutRef}>
        <aside className={`${styles.sidebar} ${styles.followSidebar}`} aria-label="文章分类与站点信息" ref={sidebarRef}>
        <section className={styles.sidebarProfile} aria-label="个人介绍">
          <Link prefetch={false} className={styles.sidebarAvatarLink} href="/about" aria-label={`关于 ${siteConfig.author}`}>
            <Image src={siteConfig.avatar} width={240} height={240} sizes="(max-width: 1023px) 240px, 216px" alt={`${siteConfig.author} 的头像`} />
          </Link>
          <h2>{siteConfig.author}</h2>
          <p>{siteConfig.tagline}</p>
        </section>
        <SiteStats stats={siteStats} />
        <section className={styles.categoryPanel} aria-labelledby="home-category-title">
          <h2 id="home-category-title">分类</h2>
          <div className={styles.categoryList} id="home-category-list">
            {categories.map((name, index) => <button key={name} type="button" hidden={!categoriesExpanded && index >= 3} aria-pressed={category === name} onClick={() => changeCategory(name)}>
              <span>{name}</span><span>{name === "全部" ? posts.length : posts.filter(post => post.category === name).length}</span>
            </button>)}
          </div>
          {categories.length > 3 && <button type="button" className={styles.categoryToggle} aria-expanded={categoriesExpanded} aria-controls="home-category-list" onClick={() => setCategoriesExpanded(!categoriesExpanded)}>
            <span aria-hidden="true">···</span>{categoriesExpanded ? "收起" : "更多"}
          </button>}
        </section>
        </aside>

        <section className={styles.feed} id="home-feed" aria-label="文章列表" data-home-article-motion={articleMotion}>
          {!showHero && <h1 className={styles.indexTitle}>文章索引</h1>}
          <div key={`${page}-${category}`} data-home-page-motion={articleMotion ? undefined : page}>
          {page === 1 && pinnedPosts.length > 0 && <section className={styles.feedSection} aria-labelledby="home-pinned-title">
            <h2 className={styles.feedSectionTitle} id="home-pinned-title">置顶文章</h2>
            <div className={styles.summaryList}>
              {pinnedPosts.map((post, index) => <SummaryCard post={post} order={index} eager={!showHero} key={post.slug} />)}
            </div>
          </section>}
          {(pagePosts.length > 0 || pinnedPosts.length === 0) && <section className={styles.feedSection} aria-labelledby="home-posts-title">
            <h2 className={styles.feedSectionTitle} id="home-posts-title">文章列表</h2>
            <div className={styles.summaryList} key={`all-${page}-${category}`}>
              {pagePosts.map((post, index) => <SummaryCard post={post} order={index + (page === 1 ? pinnedPosts.length : 0)} eager={!showHero} key={post.slug} />)}
              {pagePosts.length === 0 && <p>暂无符合条件的文章。</p>}
            </div>
          </section>}
          </div>
          {(pageCount > 1 || !showHero) && <nav className={styles.pagination} aria-label="文章分页"><button className={styles.paginationDirection} onClick={() => changePage(page - 1)} disabled={page === 1}><CaretLeft size={17} aria-hidden="true" />上一页</button>{Array.from({ length: pageCount }, (_, index) => index + 1).map(number => <button className={page === number ? styles.currentPage : ""} aria-current={page === number ? "page" : undefined} aria-label={`第 ${number} 页`} key={number} onClick={() => changePage(number)}>{number}</button>)}<button className={styles.paginationDirection} onClick={() => changePage(page + 1)} disabled={page === pageCount}>下一页<CaretRight size={17} aria-hidden="true" /></button></nav>}
        </section>
      </main>

      <SiteFooter />
      <a className={styles.backTop} href="#top" aria-label="回到顶部"><ArrowUp size={18} /></a>
    </div>
  );
}
