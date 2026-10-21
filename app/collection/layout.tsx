import { siteConfig } from "../../site.config";
import "../route-styles.css";
import type { Metadata } from "next";

export const metadata: Metadata = { title: `品鉴 · ${siteConfig.title}`, description: "书籍、漫画、追番与游戏，记录那些值得收藏的作品。" };

export default function CollectionLayout({ children }: { children: React.ReactNode }) {
  return <>
    {children}
  </>;
}
