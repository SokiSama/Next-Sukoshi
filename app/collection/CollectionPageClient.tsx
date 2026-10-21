"use client";

import { SiteFooter } from "../components/SiteFooter";


import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Books, MagnifyingGlass, X } from "@phosphor-icons/react";
import { CollectionIcon } from "../components/CollectionIcon";
import { JournalHeader } from "../components/JournalHeader";
import homeStyles from "../components/HomePage.module.css";
import { collection, toCollectionEntry, type AnimeResponseItem, type CollectionEntry, type CollectionKind } from "./data";
import styles from "./CollectionPage.module.css";
import { orderAnimeBySeries } from "../lib/animeSeries";

export type CollectionTab = CollectionKind;

const sections = [
  { key: "books", label: "书籍", number: "01", placeholder: "搜索书名或作者…" },
  { key: "manga", label: "漫画", number: "02", placeholder: "搜索漫画…" },
  { key: "anime", label: "追番", number: "03", placeholder: "搜索番剧名称…" },
  { key: "games", label: "游戏", number: "04", placeholder: "搜索游戏名称…" },
] as const;
const groupLabel = (entry: CollectionEntry) => entry.kind === "games" ? (entry.category === "视觉小说" ? "视觉小说" : "其他游戏") : entry.kind === "anime" ? entry.status : entry.category;

function CollectionCard({ entry, onSelect }: { entry: CollectionEntry; onSelect: (entry: CollectionEntry) => void }) {
  return <button className={styles.entry} type="button" onClick={() => onSelect(entry)} aria-label={`查看 ${entry.title} 详情`}>
    <span className={`${styles.cover} ${entry.kind === "games" ? styles.gameCover : ""}`}>
      <Image src={entry.cover} alt={`${entry.title} 封面`} width={240} height={entry.kind === "games" ? 360 : 336} sizes="(max-width: 680px) 42vw, (max-width: 800px) 24vw, (max-width: 1100px) 20vw, 190px" unoptimized />
    </span>
    <strong>{entry.title}</strong>
    {entry.kind === "anime" ? <span className={styles.progress}>{entry.status}</span> : entry.kind !== "games" && <span className={styles.progress}>{entry.progress}</span>}
  </button>;
}

function GameReviewDetails({ entry, onClose }: { entry: CollectionEntry; onClose: () => void }) {
  return <article className={styles.memoriesDetail}>
    <button type="button" className={styles.closeButton} onClick={onClose} aria-label="关闭作品详情"><X size={22} /></button>
    <Image className={styles.memoriesHero} src={entry.banner!} alt={`${entry.title} 游戏横幅`} width={1920} height={620} sizes="(max-width: 680px) 95vw, 960px" priority />
    <div className={styles.memoriesBody}>
      <div className={styles.memoriesTopRow}>
      <div>
      <h2 id="collection-detail-title">{entry.title}</h2>
      <div className={styles.memoriesTags}>{entry.platforms?.map(platform => <span key={platform}>{platform}</span>)}<span>{entry.category}</span></div>
      </div>
      <dl className={styles.memoriesStats}><div><dt>游戏时长</dt><dd>{entry.playtimeHours}小时</dd></div></dl>
      </div>
      <p className={styles.memoriesReview}>{entry.review?.split(/\*\*(.+?)\*\*/g).map((part, index) => index % 2 ? <strong key={index}>{part}</strong> : part)}</p>
      {!!entry.screenshots?.length && <section className={styles.memoriesScreenshots} aria-labelledby="memories-screenshots-title">
        <h3 id="memories-screenshots-title">游戏截图</h3>
        <div>{entry.screenshots?.map(screenshot => <a href={screenshot.src} key={screenshot.src} target="_blank" rel="noreferrer" aria-label={`查看大图：${screenshot.alt}`}>
          <Image src={screenshot.src} alt={screenshot.alt} width={1920} height={1080} sizes="(max-width: 680px) 90vw, 430px" />
        </a>)}</div>
      </section>}
    </div>
  </article>;
}

function EntryDetails({ entry, onClose }: { entry: CollectionEntry | null; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const hasGameReview = entry?.kind === "games" && !!entry.review && !!entry.banner;
  const isBook = entry?.kind === "books" || entry?.kind === "manga";
  useEffect(() => {
    if (entry) dialog.current?.showModal();
    else dialog.current?.close();
  }, [entry]);
  useEffect(() => {
    if (!entry) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [entry]);

  return <dialog ref={dialog} className={`${styles.dialog}${isBook ? ` ${styles.bookDialog}` : ""}${hasGameReview ? ` ${styles.memoriesDialog}` : ""}`} aria-labelledby="collection-detail-title" onClose={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    {entry && (hasGameReview ? <GameReviewDetails entry={entry} onClose={onClose} /> : <div key={entry.id} className={`${styles.detail}${isBook ? ` ${styles.openBook}` : ""}`}>
      <button type="button" className={styles.closeButton} onClick={onClose} aria-label="关闭作品详情"><X size={22} /></button>
      <div className={isBook ? styles.bookLeftPage : undefined}><Image src={entry.cover} alt={`${entry.title} 封面`} width={320} height={448} className={styles.detailCover} unoptimized /></div>
      <div className={styles.detailText}>
        <span>{entry.kind === "anime" ? entry.status : `${groupLabel(entry)} · ${entry.status}`}</span>
        <div className={styles.detailHeading}>
          <h2 id="collection-detail-title">{entry.title}</h2>
          {entry.playtimeHours !== undefined && <span className={styles.playtime}>游戏时长：{entry.playtimeHours}小时</span>}
        </div>
        {(entry.kind === "books" || entry.kind === "manga") && <p>{entry.progress}</p>}
        {entry.review ? <section className={styles.summary} aria-label="游戏感想"><p>{entry.review}</p></section> : <section className={styles.summary} aria-labelledby="collection-summary-title">
          <h3 id="collection-summary-title">{entry.kind === "games" ? "游戏简介" : "作品简介"}</h3>
          <p>{entry.summary || (entry.summaryUnavailable ? "简介暂时无法读取，请稍后重试。" : "暂未提供这部作品的简介。")}</p>
        </section>}
        {entry.kind !== "games" && entry.url && <a href={entry.url} target="_blank" rel="noreferrer">{entry.kind === "anime" ? "Bangumi 作品页面" : "作品页面"}<ArrowUpRight size={16} /></a>}
      </div>
      {!!entry.screenshots?.length && <div className={styles.gameScreenshots} aria-label="游戏截图">
        {entry.screenshots.map(screenshot => <Image key={screenshot.src} src={screenshot.src} alt={screenshot.alt} width={1920} height={1080} sizes="(max-width: 680px) 90vw, 812px" />)}
      </div>}
    </div>)}
  </dialog>;
}

export default function CollectionPageClient({ initialKind = "books" }: { initialKind?: CollectionTab }) {
  const [kind, setKind] = useState<CollectionTab>(initialKind);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("全部");
  const [status, setStatus] = useState("全部");
  const [selected, setSelected] = useState<CollectionEntry | null>(null);
  const [anime, setAnime] = useState<CollectionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/bangumi/anime", { signal: controller.signal })
      .then(async response => {
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error("追番收藏暂时无法读取");
        return result.data.items as AnimeResponseItem[];
      })
      .then(items => { setAnime(orderAnimeBySeries(items).map(toCollectionEntry)); setError(""); setLoading(false); })
      .catch(reason => { if (!controller.signal.aborted) { setError(reason instanceof Error ? reason.message : "追番收藏暂时无法读取"); setLoading(false); } });
    return () => controller.abort();
  }, [retry]);
  const allEntries = [...collection, ...anime];
  const section = sections.find(item => item.key === kind)!;
  const entries = allEntries.filter(item => item.kind === kind);
  const categories = kind === "anime" ? ["看过", "未看"] : [...new Set(entries.map(groupLabel))];
  const statusOptions = ["全部", "看过", "未看"];
  const visible = entries.filter(item => (category === "全部" || category === groupLabel(item)) && (kind !== "anime" || status === "全部" || status === item.status) && [item.title, item.originalTitle, item.progress, groupLabel(item), ...(item.platforms ?? [])].join(" ").toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  const groups = categories.map(label => ({ label, entries: visible.filter(item => groupLabel(item) === label) })).filter(group => group.entries.length > 0);
  const animePending = kind === "anime" && (loading || error);

  return <div className={`${homeStyles.home} ${styles.page}`} id="top">
    <JournalHeader active="collection" />
    <main className={styles.main}>
      <aside className={styles.sidebar} aria-label="品鉴分类">
        <div className={styles.sideTitle}><h1>品鉴</h1><span>COLLECTION</span></div>
        <p className={styles.sideLabel}>馆藏</p>
        <nav className={styles.tabs} aria-label="馆藏分类">{sections.map(({ key, label }) => <button type="button" key={key} aria-pressed={kind === key} onClick={() => { setKind(key); setQuery(""); setCategory("全部"); setStatus("全部"); setSelected(null); window.history.replaceState(null, "", key === "books" ? "/collection" : `/collection?tab=${key}`); }}><CollectionIcon kind={key} /><span>{label}</span><small>{key === "anime" && loading ? "…" : allEntries.filter(item => item.kind === key).length}</small></button>)}</nav>
      </aside>
      <section key={kind} className={styles.content} aria-labelledby="collection-section-title">
        <header className={styles.intro} data-reveal><span>COLLECTION · {section.number}</span><h2 id="collection-section-title">{section.label}</h2></header>
        <div className={styles.stats}><span><strong>{animePending ? "—" : entries.length}</strong>{kind === "anime" ? "部收藏" : kind === "games" ? "款收藏" : "本收藏"}</span>{kind === "anime" ? ["看过", "未看"].map(label => <span key={label}><strong>{animePending ? "—" : entries.filter(item => item.status === label).length}</strong>部{label}</span>) : <span><strong>{categories.length}</strong>个类型</span>}</div>
        <div className={styles.filters}>
          {entries.length > 0 && kind !== "anime" && <div className={styles.filterGroup} role="group" aria-label="类型筛选"><span>类型</span>{["全部", ...categories].map(label => <button type="button" key={label} aria-pressed={category === label} onClick={() => setCategory(label)}>{label}</button>)}</div>}
          {entries.length > 0 && kind === "anime" && <div className={styles.filterGroup} role="group" aria-label="状态筛选"><span>状态</span>{statusOptions.map(label => <button type="button" key={label} aria-pressed={status === label} onClick={() => setStatus(label)}>{label}</button>)}</div>}
        <label className={styles.search}><MagnifyingGlass size={18} aria-hidden="true" /><input type="search" aria-label={`搜索${section.label}`} placeholder={section.placeholder} value={query} onChange={event => setQuery(event.target.value)} />{query && <button type="button" onClick={() => setQuery("")} aria-label="清空搜索"><X size={16} /></button>}</label>
        </div>
        <div key={`${kind}-${category}-${status}`} className={`${styles.shelf} ${homeStyles.articleTransition}`} aria-label={`${section.label}${kind === "anime" ? "观看状态" : "类型"}分组`} aria-live="polite">
          {animePending ? <div className={styles.empty} role="status"><Books size={34} weight="light" /><h3>{loading ? "正在读取 Bangumi 全部收藏…" : error}</h3>{!loading && <button type="button" onClick={() => { setLoading(true); setError(""); setRetry(value => value + 1); }}>重新加载</button>}</div> : visible.length ? groups.map((group, index) => <section className={styles.shelfGroup} key={group.label} aria-labelledby={`collection-group-${index}`}>
            <header className={styles.groupTitle}><h3 id={`collection-group-${index}`}>{group.label}</h3><span>（{group.entries.length}）</span><i aria-hidden="true" /></header>
            <div className={styles.grid} data-reveal-group>{group.entries.map(item => <CollectionCard key={item.id} entry={item} onSelect={setSelected} />)}</div>
          </section>) : <div className={styles.empty}><Books size={34} weight="light" /><h3>{entries.length ? "没有找到匹配的作品" : `还没有收录${section.label}`}</h3><p>{entries.length ? "试试其他关键词，或调整筛选条件。" : "慢慢收集，慢慢记录。"}</p>{entries.length > 0 && <button type="button" onClick={() => { setQuery(""); setCategory("全部"); setStatus("全部"); }}>重置筛选</button>}</div>}
        </div>
      </section>
    </main>
    <SiteFooter />
    <EntryDetails entry={selected} onClose={() => setSelected(null)} />
  </div>;
}
