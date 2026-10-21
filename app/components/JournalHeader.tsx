"use client";
import { siteConfig } from "../../site.config";


import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { List, X } from "@phosphor-icons/react";
import { MobileNavigation } from "./MobileNavigation";
import { ThemeModeControl } from "./ThemeModeControl";
import homeStyles from "./HomePage.module.css";

export function JournalHeader({ active = "posts" }: { active?: "posts" | "archive" | "friends" | "collection" | "about" }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navigation = [
    { label: "首页", href: "/" }, { label: "品鉴", href: "/collection" },
    { label: "友链", href: "/friends" }, { label: "归档", href: "/archive" }, { label: "关于", href: "/about" },
  ];
  return (
    <header className={homeStyles.header}>
      <div className={homeStyles.headerInner}>
        <Link className={homeStyles.brand} href="/"><Image src={siteConfig.avatar} width={36} height={36} alt="" /><span>{siteConfig.title}</span></Link>
        <nav className={homeStyles.navigation} id="journal-navigation" aria-label="主导航">
          {navigation.map(({ label, href }) => <Link href={href} key={href} aria-current={href === `/${active}` ? "location" : undefined} onClick={() => setMenuOpen(false)}>{label}</Link>)}
        </nav>
        <div className={homeStyles.headerActions}>
          <ThemeModeControl />
          <button className={`${homeStyles.iconButton} ${homeStyles.menuButton}`} onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "关闭菜单" : "打开菜单"} aria-expanded={menuOpen} aria-controls="mobile-navigation">{menuOpen ? <X size={23} /> : <List size={23} />}</button>
        </div>
      </div>
      {menuOpen && <MobileNavigation active={`/${active}`} onClose={() => setMenuOpen(false)} />}
    </header>
  );
}
