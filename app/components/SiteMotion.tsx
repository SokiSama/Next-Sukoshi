"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Content stays visible without JavaScript. Only offscreen items wait for reveal.
export function SiteMotion() {
  const pathname = usePathname();
  const transitionGeneration = useRef(0);

  useLayoutEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const registered = new Set<HTMLElement>();
    const mains = new Set<HTMLElement>();
    const variant = ++transitionGeneration.current % 2 ? "a" : "b";
    let observer: MutationObserver | undefined;

    const clear = () => {
      observer?.disconnect();
      for (const element of registered) {
        delete element.dataset.pageEnter;
        element.style.removeProperty("--page-enter-delay");
      }
      for (const main of mains) delete main.dataset.pageTransition;
      registered.clear();
      mains.clear();
    };
    const register = () => {
      const main = document.querySelector<HTMLElement>("main");
      if (!main) return;
      main.dataset.pageTransition = variant;
      mains.add(main);
      const article = main.querySelector<HTMLElement>("#article-content");
      const targets = article
        ? [main.querySelector<HTMLElement>(":scope > header"), article, main.querySelector<HTMLElement>("aside")]
        : Array.from(main.children).filter((element): element is HTMLElement => element instanceof HTMLElement && !["SCRIPT", "STYLE", "LINK"].includes(element.tagName));
      for (const element of targets) {
        if (!element || registered.has(element)) continue;
        const phase = element.tagName === "HEADER" ? "header" : element.tagName === "ASIDE" ? "sidebar" : "content";
        element.dataset.pageEnter = phase;
        element.style.setProperty("--page-enter-delay", phase === "header" ? "50ms" : phase === "sidebar" ? "150ms" : "100ms");
        registered.add(element);
      }
    };
    const start = () => {
      clear();
      if (preference.matches) return;
      register();
      // Streaming routes may mount their main content after the pathname changes.
      observer = new MutationObserver(register);
      observer.observe(document.body, { childList: true, subtree: true });
    };
    start();
    preference.addEventListener("change", start);
    return () => { clear(); preference.removeEventListener("change", start); };
  }, [pathname]);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const registered = new Set<HTMLElement>();
    let intersection: IntersectionObserver | undefined;
    let mutation: MutationObserver | undefined;
    let frame = 0;

    const clear = () => {
      intersection?.disconnect();
      mutation?.disconnect();
      cancelAnimationFrame(frame);
      for (const element of registered) {
        delete element.dataset.motionState;
        delete element.dataset.motionPreset;
        element.style.removeProperty("--reveal-delay");
      }
      registered.clear();
    };

    const start = () => {
      clear();
      if (preference.matches) return;
      intersection = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const element = entry.target as HTMLElement;
          element.dataset.motionState = "visible";
          intersection?.unobserve(element);
        }
      }, { rootMargin: "0px 0px -24px 0px", threshold: 0 });

      const register = () => {
        for (const element of document.querySelectorAll<HTMLElement>("main [data-reveal], main [data-reveal-group] > *")) {
          const position = element.parentElement?.hasAttribute("data-reveal-group")
            ? Array.from(element.parentElement.children).indexOf(element) : 0;
          const delay = `${Math.min(position, 3) * 50}ms`;
          if (registered.has(element)) {
            if (element.style.getPropertyValue("--reveal-delay") !== delay) element.style.setProperty("--reveal-delay", delay);
            continue;
          }
          const bounds = element.getBoundingClientRect();
          if (!bounds.width || !bounds.height) continue;
          registered.add(element);
          element.style.setProperty("--reveal-delay", delay);
          element.dataset.motionPreset = "navigation";
          if (bounds.top < window.innerHeight - 24 && bounds.bottom > 0) {
            element.dataset.motionState = "ready";
          } else {
            element.dataset.motionState = "pending";
            intersection?.observe(element);
          }
        }
      };

      register();
      mutation = new MutationObserver(() => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(register);
      });
      mutation.observe(document.body, { childList: true, subtree: true });
    };

    start();
    preference.addEventListener("change", start);
    return () => { clear(); preference.removeEventListener("change", start); };
  }, [pathname]);

  return null;
}
