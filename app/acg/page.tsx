"use client";

import "../route-styles.css";

import { CSSProperties, useEffect, useMemo, useState } from "react";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { PageCoverBanner } from "../components/PageCoverBanner";

type AnimeItem = {
  id: number;
  title: string;
  originalTitle: string;
  cover?: string;
  statusText: string;
  watchedEpisodes: number;
  totalEpisodes: number;
  progressText: string;
  date: string;
  year: string;
  production: string;
  summary: string;
  score: number;
  tags: string[];
};

const filters = ["全部", "在看", "想看", "看过", "搁置", "抛弃"] as const;
const statusIcon: Record<string, string> = { 在看: "▷", 想看: "♡", 看过: "✓", 搁置: "Ⅱ", 抛弃: "×" };
const statusClass = (status: string) => `status-${({ 在看: "watching", 想看: "wish", 看过: "done", 搁置: "hold", 抛弃: "drop" } as Record<string, string>)[status] ?? "unknown"}`;

function CountCard({ items }: { items: AnimeItem[] }) {
  const rows = ["在看", "想看", "看过", "搁置", "抛弃"].map((status) => [status, items.filter((item) => item.statusText === status).length] as const);
  return <section className="card acg-side-card"><h3>追番进度</h3><ul className="acg-count-list">{rows.map(([status, count]) => <li key={status}><span className={statusClass(status)}>{statusIcon[status]}</span><b>{status}</b><em>{count}</em></li>)}</ul></section>;
}

function CategoryCard({ items }: { items: AnimeItem[] }) {
  const tags = useMemo(() => {
    const counts = new Map<string, number>();
    items.flatMap((item) => item.tags).forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1));
    return [...counts].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [items]);
  const total = Math.max(1, tags.reduce((sum, [, count]) => sum + count, 0));
  const colors = ["#ef77a8", "#67cff4", "#f5a6c7", "#9bdcf3", "#ed82b5"];
  const segments = tags.map(([, count], index) => {
    const start = tags.slice(0, index).reduce((sum, [, previousCount]) => sum + previousCount, 0) / total * 100;
    const end = start + count / total * 100;
    return `${colors[index]} ${start}% ${end}%`;
  }).join(", ");
  const donutStyle = { "--donut": `conic-gradient(${segments || "#fff0f7 0 100%"})` } as CSSProperties;
  return <section className="card acg-side-card category-card"><h3>分类统计</h3><div className="donut-wrap"><div className="donut" style={donutStyle} aria-label="分类占比图" /><ul>{tags.map(([tag, count], index) => <li key={tag}><i style={{ background: colors[index] }} /><span>{tag}</span><em>{Math.round(count / total * 100)}%</em></li>)}</ul></div></section>;
}

function TagCloud({ items }: { items: AnimeItem[] }) {
  const tags = [...new Set(items.flatMap((item) => item.tags))].slice(0, 16);
  return <section className="card acg-side-card tag-cloud"><h3>标签云</h3><div>{tags.map((tag, index) => <span className={`tag-tone-${index % 5}`} key={tag}>{tag}</span>)}</div></section>;
}

function AnimeRow({ item }: { item: AnimeItem }) {
  const progress = item.totalEpisodes > 0
    ? Math.min(100, Math.round(item.watchedEpisodes / item.totalEpisodes * 100))
    : 0;

  return <article className="anime-row">
    <a className="anime-cover" href={`https://bgm.tv/subject/${item.id}`} target="_blank" rel="noreferrer">
      <img src={item.cover} alt={item.title} referrerPolicy="no-referrer" loading="lazy" />
      <span className={`anime-cover-status ${statusClass(item.statusText)}`}><b>{statusIcon[item.statusText]}</b>{item.statusText === "看过" ? "已看" : item.statusText}</span>
      <strong className="anime-cover-score">★ {item.score ? item.score.toFixed(1) : "—"}</strong>
      {item.totalEpisodes > 0 && <span className="anime-cover-progress">
        <i><u style={{ width: `${progress}%` }} /></i>
        <b>{item.watchedEpisodes} / {item.totalEpisodes}（{progress}%）</b>
      </span>}
    </a>
    <div className="anime-main"><div className="anime-title-line"><a href={`https://bgm.tv/subject/${item.id}`} target="_blank" rel="noreferrer"><h2>{item.title}</h2></a></div>
      {item.originalTitle && <p className="anime-original">{item.originalTitle}</p>}
      <p className="anime-summary">“{item.summary || "那些陪伴成长的故事与角色。"}”</p>
      <dl className="anime-details">
        <div><dt>年份</dt><dd>{item.year || item.date?.slice(0, 4) || "未知"}</dd></div>
        <div><dt>制作</dt><dd>{item.production || "未知"}</dd></div>
      </dl>
      <div className="anime-tags">{item.tags.slice(0, 4).map((tag) => <span key={tag}>{tag}</span>)}</div>
    </div>
  </article>;
}

export default function AcgPage() {
  const [items, setItems] = useState<AnimeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("全部");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/bangumi/anime", { cache: "no-store" });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error || "加载失败");
      setItems(json.data.items);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "加载失败"); }
    finally { setLoading(false); }
  };
  useEffect(() => {
    let cancelled = false;
    fetch("/api/bangumi/anime", { cache: "no-store" })
      .then(async (response) => {
        const json = await response.json();
        if (!response.ok || !json.success) throw new Error(json.error || "加载失败");
        return json.data.items as AnimeItem[];
      })
      .then((nextItems) => { if (!cancelled) setItems(nextItems); })
      .catch((reason) => { if (!cancelled) setError(reason instanceof Error ? reason.message : "加载失败"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const visible = useMemo(() => filter === "全部" ? items : items.filter((item) => item.statusText === filter), [items, filter]);

  return <div id="top" className="site immersive-route acg-route"><SiteHeader active="acg" floating />
    <PageCoverBanner
      eyebrow="OTAKU TECH THE WORLD"
      title="动漫，是另一种旅行"
      description="那些陪伴我成长的故事与角色。"
      image="/assets/cover.svg"
      imagePosition="center top"
    />
    <main className="acg-shell immersive-content">
      <div className="acg-center">
        <section className="card acg-hero"><div><span>Otaku tech the world</span><h1>动漫，是另一种旅行</h1><p>那些陪伴我成长的故事与角色</p><i /></div><img src="/assets/cover.svg" alt="" aria-hidden="true" /></section>
        <section className="card anime-list-card" id="anime-list">
          <div className="anime-filters">{filters.map((label) => <button type="button" className={filter === label ? "active" : ""} onClick={() => setFilter(label)} key={label}>{label === "看过" ? "已看" : label}</button>)}</div>
          {loading ? <div className="anime-loading">正在从 Bangumi 读取追番数据…</div> : error ? <div className="anime-loading error">{error}<button type="button" onClick={() => void load()}>重新加载</button></div> : visible.length ? <div className="anime-rows">{visible.map((item) => <AnimeRow item={item} key={item.id} />)}</div> : <div className="anime-loading">这个分类暂时没有条目</div>}
        </section>
      </div>
      <aside className="acg-right"><CountCard items={items} /><CategoryCard items={items} /><TagCloud items={items} /></aside>
    </main>
    <SiteFooter /><a className="back-top" href="#top" aria-label="回到顶部">↑</a>
  </div>;
}
