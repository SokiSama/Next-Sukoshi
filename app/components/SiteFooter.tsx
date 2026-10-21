"use client";
import Link from "next/link";
import { Rss, ShieldCheck } from "@phosphor-icons/react";
import { siteConfig } from "../../site.config";
import styles from "./SiteFooter.module.css";
export function SiteFooter() {
  return <footer className={styles.footer}><div className={styles.inner}>
    <div className={styles.identity}>
      <p>© {siteConfig.startYear} - {new Date().getFullYear()} By <Link href="/">{siteConfig.author}</Link></p>
      {siteConfig.registration.text && siteConfig.registration.url && <a className={styles.registration} href={siteConfig.registration.url} target="_blank" rel="noreferrer"><ShieldCheck size={20} aria-hidden="true" />{siteConfig.registration.text}</a>}
    </div>
    <div className={styles.actions}><a className={styles.subscribe} href="/api/rss" title="RSS 订阅"><Rss size={21} weight="bold" aria-hidden="true" />订阅</a></div>
  </div></footer>;
}
