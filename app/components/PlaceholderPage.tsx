import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { SiteLeftSidebar, SiteRightSidebar } from "./SiteSidebars";

export function PlaceholderPage({ title, active }: { title: string; active: string }) {
  return (
    <div className="site">
      <SiteHeader active={active} />
      <main className="page-shell">
        <SiteLeftSidebar active={active} />
        <div className="content"><section className="card placeholder-card">
          <h1>{title}</h1><p>123</p>
        </section></div>
        <SiteRightSidebar />
      </main>
      <SiteFooter />
    </div>
  );
}
