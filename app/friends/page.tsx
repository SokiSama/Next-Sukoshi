"use client";
import { siteConfig } from "../../site.config";


import { SiteFooter } from "../components/SiteFooter";


import { useState } from "react";
import Image from "next/image";
import { ArrowUp, CaretDown, Check } from "@phosphor-icons/react";
import { JournalHeader } from "../components/JournalHeader";
import { TwikooComments } from "../components/TwikooComments";
import { FriendList } from "./FriendList";
import friends from "../../data/friends.json";
import homeStyles from "../components/HomePage.module.css";
import styles from "./FriendsPage.module.css";

const siteInfo = {
  name: siteConfig.title,
  description: siteConfig.description,
  link: siteConfig.url,
  avatar: new URL(siteConfig.avatar, siteConfig.url).href,
};

export default function FriendsPage() {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  const copyFriendLink = async () => {
    const friendLinkText = JSON.stringify(siteInfo, null, 2);
    setCopyError(false);
    try {
      await navigator.clipboard.writeText(friendLinkText);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = friendLinkText;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand("copy");
      textarea.remove();
      if (!copied) { setCopyError(true); return; }
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className={`${homeStyles.home} ${styles.page}`} id="top">
      <JournalHeader active="friends" />
      <main className={styles.main}>
        <header data-reveal className={styles.intro}>
          <span>FRIENDS</span>
          <h1>友链</h1>
        </header>
        <FriendList friends={friends} />
        <section id="apply-links" className={styles.apply}>
          <details className={styles.applyPanel} open>
            <summary>
              <strong>友链交换</strong>
              <CaretDown className={styles.caret} aria-hidden="true" />
            </summary>
            <div className={styles.applyBody}>
              <div className={styles.applyGrid}>
              <section className={styles.siteInfo} aria-labelledby="my-site-title">
                <header className={styles.siteInfoHeader}>
                  <Image className={styles.siteAvatar} src={siteConfig.avatar} width={48} height={48} alt={`${siteConfig.author} 的头像`} />
                  <div className={styles.siteIdentity}>
                    <h3 id="my-site-title">{siteInfo.name}</h3>
                  </div>
                  <button type="button" className={styles.copyButton} onClick={copyFriendLink}>
                    {copied && <Check aria-hidden="true" />}{copied ? "已复制" : "复制 JSON"}
                  </button>
                </header>
                <dl className={styles.siteLinks}>
                  <div><dt>网站名称：</dt><dd>{siteInfo.name}</dd></div>
                  <div><dt>LOGO地址：</dt><dd><a href={siteInfo.avatar} target="_blank" rel="noreferrer">{siteInfo.avatar}</a></dd></div>
                  <div><dt>网站地址：</dt><dd><a href={siteInfo.link} target="_blank" rel="noreferrer">{siteInfo.link}</a></dd></div>
                  <div><dt>网站描述：</dt><dd>{siteInfo.description}</dd></div>
                </dl>
                <span className={styles.copyStatus} role="status">{copyError ? "复制失败，请手动复制上方信息" : copied ? "友链信息已复制" : ""}</span>
              </section>
              <aside className={styles.requirements} aria-labelledby="friend-link-requirements">
                <h3 id="friend-link-requirements">友链要求：</h3>
                <ul>
                  <li>欢迎分享你的个人博客。</li>
                  <li>请附上网站名称、地址、头像和简介。</li>
                  <li>交换要求可按自己的偏好修改。</li>
                  
                </ul>
              </aside>
              </div>
            </div>
          </details>
        </section>
        <TwikooComments path="/friends" className={styles.comments} />
      </main>
      <SiteFooter />
      <a className={styles.backTop} href="#top" aria-label="回到顶部"><ArrowUp size={20} /></a>
    </div>
  );
}
