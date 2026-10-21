import "../route-styles.css";
import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUp, MapPin } from "@phosphor-icons/react/dist/ssr";
import { siteConfig } from "../../site.config";
import { JournalHeader } from "../components/JournalHeader";
import { SiteFooter } from "../components/SiteFooter";
import { ProfileSocialLinks } from "../components/ProfileSocialLinks";
import { GitHubContributionsCard } from "../components/GitHubContributionsCard";
import homeStyles from "../components/HomePage.module.css";
import styles from "./AboutPage.module.css";
import { techStack } from "./data";

export const metadata: Metadata = { title: `关于 · ${siteConfig.title}`, description: siteConfig.description };
export default function AboutPage() {
  return <div className={`${homeStyles.home} ${styles.page}`} id="top">
    <JournalHeader active="about" />
    <main className={styles.main}><article className={styles.content}>
      <header data-reveal className={styles.intro}>
        <Image className={styles.profileAvatar} src={siteConfig.avatar} width={144} height={144} alt={`${siteConfig.author} 的头像`} priority />
        <div className={styles.profileInfo}><h1>关于我</h1>
          <p className={styles.location}><MapPin size={16} aria-hidden="true" /><span>{siteConfig.location}</span></p>
          <ProfileSocialLinks />
        </div>
      </header>
      <section data-reveal className={`${styles.section} ${styles.biography}`} aria-label="个人介绍">
        {siteConfig.biography.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
      </section>
      <section data-reveal className={styles.section} id="tech-stack" aria-labelledby="tech-stack-title"><h2 id="tech-stack-title">技术栈</h2><p>支撑这个网站的技术与服务。</p>
        <div className={styles.toolGroup}>
          <div className={styles.tools}>{techStack.map(technology => <a className={styles.tool} key={technology.name} href={technology.url} target="_blank" rel="noreferrer">
            <span className={styles.toolIcon}><Image src={`/icons/tech/${technology.icon}`} width={32} height={32} alt="" unoptimized /></span>
            <span className={styles.toolText}><strong>{technology.name}</strong><small>{technology.description}</small></span>
          </a>)}</div>
        </div>
      </section>
      <section data-reveal className={`${styles.section} ${styles.activity}`}><h2>活动</h2><GitHubContributionsCard embedded /></section>
    </article></main>
    <SiteFooter /><a className={styles.backTop} href="#top" aria-label="回到顶部"><ArrowUp size={20} /></a>
  </div>;
}
