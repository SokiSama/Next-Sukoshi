"use client";
import { siteConfig } from "../../site.config";


import { useEffect, useState } from "react";
import Link from "next/link";
import { List, RssSimple } from "@phosphor-icons/react";
import { PrimaryNav } from "./PrimaryNav";

export function SiteHeader({ active, onOpenMenu, floating = false }: { active?: string; onOpenMenu?: () => void; floating?: boolean }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const updateScrollState = () => setScrolled(window.scrollY > 12);
    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  return (
    <>
      <header
        className={`site-header topbar${scrolled ? " scrolled" : ""}${onOpenMenu ? " has-mobile-menu" : ""}${floating ? " home-floating" : ""}`}
      ><div className="header-inner topbar-inner">
        {onOpenMenu && <button className="round-button menu-button" onClick={onOpenMenu} aria-label="打开菜单"><List weight="regular" /></button>}
        <Link className="site-brand brand" href="/">
          <span className="brand-text">{siteConfig.title}</span>
        </Link>
        <PrimaryNav active={active} className="main-nav primary-nav" />
        <div className="header-actions top-actions">
          <a className="header-action rss-action" href="/api/rss" target="_blank" rel="noreferrer" aria-label="RSS 订阅" title="RSS 订阅"><RssSimple weight="bold" /></a>
        </div>
      </div></header>
    </>
  );
}
