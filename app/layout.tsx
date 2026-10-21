import type { Metadata } from "next";
import { siteConfig } from "../site.config";
import SidebarStickyFollow from "./components/SidebarStickyFollow";
import { SiteMotion } from "./components/SiteMotion";
import { TrafficProvider } from "./components/TrafficProvider";
import "./base.css";
import "./motion.css";
import "./theme.css";
import "./fonts.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: siteConfig.title,
  description: siteConfig.description,
  alternates: { types: { "application/rss+xml": `${siteConfig.url}/api/rss` } },
  icons: { icon: "/site-icon.png", apple: "/site-icon.png" },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN" data-scroll-behavior="smooth" suppressHydrationWarning><head>
    <script dangerouslySetInnerHTML={{ __html: `(function(){try{var m=localStorage.getItem('journal-theme-mode')||'system';var d=m==='dark'||(m==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=d?'dark':'light'}catch(e){}})();` }} />
  </head><body><SidebarStickyFollow /><SiteMotion /><TrafficProvider>{children}</TrafficProvider></body></html>;
}
