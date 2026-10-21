"use client";

import { useEffect } from "react";

const SIDEBAR_SELECTOR = [
  ".page-shell > .left-sidebar > .sidebar-sticky",
  ".page-shell > .right-sidebar > .sidebar-sticky",
  ".page-shell > .friends-right-sidebar",
  ".acg-left",
  ".acg-right",
  ".page-shell > .article-toc-sidebar",
  ".about-details-sidebar",
].join(", ");

export default function SidebarStickyFollow() {
  useEffect(() => {
    const resizeObservers = new Map<HTMLElement, ResizeObserver>();

    const update = (element: HTMLElement) => {
      const rootStyle = getComputedStyle(document.documentElement);
      const headerHeight =
        Number.parseFloat(rootStyle.getPropertyValue("--site-header-height")) || 60;
      const gap =
        Number.parseFloat(rootStyle.getPropertyValue("--sidebar-sticky-gap")) || 16;
      const isHomeRightSidebar = element.matches(".page-shell > .right-sidebar > .sidebar-sticky");
      const top = isHomeRightSidebar
        ? headerHeight + gap
        : Math.min(headerHeight + gap, window.innerHeight - gap - element.offsetHeight);

      element.style.setProperty("--sidebar-follow-top", `${top}px`);
    };

    const connect = () => {
      document.querySelectorAll<HTMLElement>(SIDEBAR_SELECTOR).forEach((element) => {
        if (resizeObservers.has(element)) return;

        const observer = new ResizeObserver(() => update(element));
        observer.observe(element);
        resizeObservers.set(element, observer);
        update(element);
      });

      resizeObservers.forEach((observer, element) => {
        if (element.isConnected) return;
        observer.disconnect();
        resizeObservers.delete(element);
      });
    };

    const updateAll = () => {
      resizeObservers.forEach((_observer, element) => update(element));
    };

    const mutationObserver = new MutationObserver(connect);
    mutationObserver.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("resize", updateAll);
    connect();

    return () => {
      mutationObserver.disconnect();
      window.removeEventListener("resize", updateAll);
      resizeObservers.forEach((observer) => observer.disconnect());
    };
  }, []);

  return null;
}
