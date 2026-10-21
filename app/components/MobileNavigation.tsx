"use client";
import { siteConfig } from "../../site.config";


import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Archive, Books, CaretRight, House, Info, LinkSimple, X } from "@phosphor-icons/react";
import { localPosts, postCategories, type PostCategory } from "../data/posts";
import { ProfileSocialLinks } from "./ProfileSocialLinks";
import { SiteStats, type SiteStat } from "./SiteStats";
import styles from "./HomePage.module.css";

const links = [
  { label: "首页", href: "/", icon: House },
  { label: "品鉴", href: "/collection", icon: Books },
  { label: "友链", href: "/friends", icon: LinkSimple },
  { label: "归档", href: "/archive", icon: Archive },
  { label: "关于", href: "/about", icon: Info },
];

export function MobileNavigation({ active, onClose, onCategory, category = "全部", siteStats }: {
  active: string;
  onClose: () => void;
  onCategory?: (category: PostCategory | "全部") => void;
  category?: PostCategory | "全部";
  siteStats?: SiteStat[];
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [expanded, setExpanded] = useState(false);
  const categories = ["全部", ...postCategories.filter(name => localPosts.some(post => post.category === name))] as const;

  useEffect(() => {
    const dialog = dialogRef.current!;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    const desktop = window.matchMedia("(min-width: 901px)");
    const closeOnDesktop = () => { if (desktop.matches) dialog.close(); };
    desktop.addEventListener("change", closeOnDesktop);
    return () => {
      document.body.style.overflow = previousOverflow;
      desktop.removeEventListener("change", closeOnDesktop);
    };
  }, []);

  return <dialog ref={dialogRef} id="mobile-navigation" className={`${styles.home} ${styles.mobileMenu}`} aria-label="网站菜单" onClose={onClose} onClick={event => {
    if (event.target !== event.currentTarget) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) event.currentTarget.close();
  }}>
    <section className={`${styles.mobileCard} ${styles.mobileProfile}`} aria-label="菜单个人资料">
      <button className={styles.mobileClose} type="button" aria-label="关闭菜单" onClick={() => dialogRef.current?.close()}><X size={24} /></button>
      <div className={styles.mobileIdentity}>
        <div className={styles.mobileAvatar}><Image src={siteConfig.avatar} width={80} height={80} alt={`${siteConfig.author} 的头像`} /></div>
        <div><h2>{siteConfig.author}</h2><p>{siteConfig.description}</p></div>
      </div>
      <ProfileSocialLinks />
    </section>
    {siteStats && <SiteStats stats={siteStats} mobile />}
    <section className={styles.mobileCard} aria-labelledby="mobile-nav-title">
      <h2 id="mobile-nav-title" className={styles.mobileHeading}>导航</h2>
      <nav className={styles.mobileNavGrid} aria-label="手机主导航">
        {links.map(({ label, href, icon: Icon }) => <Link key={href} href={href} aria-current={active === href ? "page" : undefined} onClick={() => dialogRef.current?.close()}><Icon size={21} aria-hidden="true" /><span>{label}</span><CaretRight size={14} aria-hidden="true" /></Link>)}
      </nav>
    </section>
    <section className={styles.mobileCard} aria-labelledby="mobile-category-title">
      <h2 id="mobile-category-title" className={styles.mobileHeading}>文章分类</h2>
      <div className={styles.mobileCategories} id="mobile-category-list">
        {categories.map((name, index) => {
          if (!expanded && index >= 3) return null;
          const count = name === "全部" ? localPosts.length : localPosts.filter(post => post.category === name).length;
          const content = <><span>{name}</span><span>{count}</span></>;
          return onCategory ? <button type="button" key={name} aria-pressed={category === name} onClick={() => { dialogRef.current?.close(); onCategory(name); }}>{content}</button> : <Link key={name} href={`/?category=${encodeURIComponent(name)}#home-feed`} onClick={() => dialogRef.current?.close()}>{content}</Link>;
        })}
      </div>
      {categories.length > 3 && <button type="button" className={styles.categoryToggle} aria-expanded={expanded} aria-controls="mobile-category-list" onClick={() => setExpanded(!expanded)}><span aria-hidden="true">···</span>{expanded ? "收起" : "更多"}</button>}
    </section>
  </dialog>;
}
