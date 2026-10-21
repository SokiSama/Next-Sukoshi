"use client";

import { useTrafficCounts } from "./TrafficProvider";
import styles from "./HomePage.module.css";

export type SiteStat = { label: string; value: number | null; unit?: string };

export function SiteStats({ stats, mobile = false }: { stats: SiteStat[]; mobile?: boolean }) {
  const traffic = useTrafficCounts();
  const items = [...stats,
    { label: "网站访问量", value: traffic?.views ?? null, unit: "次" },
    { label: "网站访客数", value: traffic?.visitors ?? null, unit: "人" },
  ];
  return <section className={mobile ? `${styles.mobileCard} ${styles.mobileStats}` : styles.siteStats} aria-label="站点统计">
    <dl>{items.map(({ label, value, unit }, index) => <div key={label} data-stat={index < 3 ? "summary" : "detail"}
      title={label === "运行天数" ? "按首篇文章的发布日期起算" : index >= stats.length ? "同一浏览器连续访问期间，刷新和站内跳转不重复计数；连续 30 分钟未访问后重新计次。统计暂不可用时显示 —。" : undefined}>
      <dt>{label}</dt>
      <dd>{value === null ? "—" : value.toLocaleString("en-US")}{unit && <span>{unit}</span>}</dd>
    </div>)}</dl>
  </section>;
}
