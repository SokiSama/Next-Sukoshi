import { SiteFooter } from "../components/SiteFooter";
import "../route-styles.css";
import Link from "next/link";
import { JournalHeader } from "../components/JournalHeader";
import { localPosts } from "../data/posts";
import homeStyles from "../components/HomePage.module.css";
import styles from "./ArchivePage.module.css";

export default function ArchivePage() {
  const posts = [...localPosts].sort((a, b) => b.date.localeCompare(a.date));
  const years = Array.from(posts.reduce((groups, post) => {
    const year = post.date.slice(0, 4);
    groups.set(year, [...(groups.get(year) ?? []), post]);
    return groups;
  }, new Map<string, typeof posts>()));

  return (
    <>
      <div className={`${homeStyles.home} ${styles.page}`} id="top">
        <JournalHeader active="archive" />
        <main className={styles.main}>
          <header data-reveal className={styles.intro}>
            <span className={styles.eyebrow}>TIMELINE</span>
            <h1>文章归档</h1>
            <p>共 {posts.length} 篇文章</p>
          </header>
          <div className={styles.years} data-reveal-group>
            {years.map(([year, yearPosts]) => (
              <section className={styles.year} key={year} aria-labelledby={`archive-${year}`}>
                <header className={styles.yearHeading}>
                  <h2 id={`archive-${year}`}>{year}</h2>
                  <span>{yearPosts.length} 篇</span>
                </header>
                <ol className={styles.list}>
                  {yearPosts.map(post => (
                    <li key={post.slug}>
                      <Link href={`/posts/${post.slug}`}>
                        <span>{post.title}</span>
                        <time dateTime={post.date}>{new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${post.date}T00:00:00Z`))}</time>
                      </Link>
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </div>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
