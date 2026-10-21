"use client";
import { siteConfig } from "../../site.config";

import { ProfileSocialLinks } from "./ProfileSocialLinks";

import { useEffect, type ReactNode } from "react";
import { Article, FolderSimple, Tag, X } from "@phosphor-icons/react";
import { localPosts } from "../data/posts";
import { PrimaryNav } from "./PrimaryNav";
import { OnThisDayCard } from "./OnThisDayCard";
import { MusicPlayerCard } from "./MusicPlayerCard";

export type SidebarCategory = { name: string; count: number; href: string };

const categoryOrder = ["旅行", "教程", "记录", "心得", "分享"];
const categories: SidebarCategory[] = categoryOrder
  .map((name) => ({
    name,
    count: localPosts.filter((post) => post.tags.includes(name)).length,
    href: "/#posts",
  }))
  .filter((category) => category.count > 0);

export function SiteProfileCard() {
  return (
    <section className="card profile-card">
      <div className="avatar"><img src={siteConfig.avatar} alt={`${siteConfig.author} 的头像`} /></div>
      <h2>{siteConfig.author}</h2>
      <span className="profile-divider" aria-hidden="true" />
      <p>{siteConfig.tagline}</p>
      <ProfileSocialLinks />
    </section>
  );
}

export function SiteCategoryCard({ categories: categoryItems = categories }: { categories?: SidebarCategory[] }) {
  return (
    <section className="card side-card">
      <h3>文章分类</h3>
      <ul className="category-list">
        {categoryItems.map(({ name, count, href }) => (
          <li key={name}><a href={href}><span>{name}</span><em>{count}</em></a></li>
        ))}
      </ul>
    </section>
  );
}

export function SiteLeftSidebar({ active, open = false, onClose, showCategories = true, categories: categoryItems = categories, selectedCategory, onCategorySelect, children }: { active?: string; open?: boolean; onClose?: () => void; showCategories?: boolean; categories?: SidebarCategory[]; selectedCategory?: string | null; onCategorySelect?: (name: string) => void; children?: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [open]);

  return (
    <aside className={open ? "left-sidebar open" : "left-sidebar"}>
      <div className="sidebar-sticky">
        {onClose && <div className="drawer-head"><button className="round-button" onClick={onClose} aria-label="关闭菜单"><X weight="regular" /></button></div>}
        <PrimaryNav active={active} className="drawer-nav" onNavigate={onClose} />
        <SiteProfileCard />
        {children}
        {showCategories && <section className="card side-card">
          <h3>文章分类</h3>
          <ul className="category-list">
            {categoryItems.map(({ name, count, href }) => (
              <li key={name}>
                <a
                  href={href}
                  className={selectedCategory === name ? "active" : undefined}
                  aria-pressed={onCategorySelect ? selectedCategory === name : undefined}
                  onClick={onCategorySelect ? (event) => {
                    event.preventDefault();
                    onCategorySelect(name);
                  } : undefined}
                ><span>{name}</span><em>{count}</em></a>
              </li>
            ))}
          </ul>
        </section>}
      </div>
    </aside>
  );
}

export function SiteStatsCard() {
  const statistics = [
    { icon: Article, label: "文章", value: String(localPosts.length) },
    { icon: FolderSimple, label: "分类", value: String(categories.length) },
    { icon: Tag, label: "标签", value: String(new Set(localPosts.flatMap(post => post.tags)).size) },
  ];

  return (
    <section className="card side-card site-stat-card">
      <h3>站点统计</h3>
      <dl>
        {statistics.map(({ icon: Icon, label, value }) => <div key={label}><dt><Icon size={21} weight="regular" aria-hidden="true" />{label}</dt><dd>{value}</dd></div>)}
      </dl>
    </section>
  );
}

export function SiteRightSidebar() {
  return (
    <aside className="right-sidebar">
      <div className="sidebar-sticky">
        <section className="card side-card whisper-card">
          <h3>心语</h3>
          <p>{siteConfig.tagline}</p>
        </section>
        <OnThisDayCard />
        <MusicPlayerCard />
      </div>
    </aside>
  );
}
