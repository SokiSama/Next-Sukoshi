"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import styles from "./HomePage.module.css";

export function HeroActions() {
  const actionsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const actions = actionsRef.current;
    if (!actions) return;

    const replay = () => {
      const links = actions.querySelectorAll("a");
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      links.forEach((link, index) => {
        link.getAnimations().forEach(animation => animation.cancel());
        link.animate([
          { opacity: 0, translate: "0 24px" },
          { opacity: 1, translate: "0 0" },
        ], {
          duration: 620,
          delay: 120 + index * 100,
          easing: "cubic-bezier(.22, 1, .36, 1)",
          fill: "backwards",
        });
      });
    };

    const replayOnReturn = () => {
      if (window.location.pathname === "/") replay();
    };

    // Effects also restart when Next restores a cached homepage.
    replay();
    window.addEventListener("pageshow", replayOnReturn);
    window.addEventListener("popstate", replayOnReturn);
    return () => {
      window.removeEventListener("pageshow", replayOnReturn);
      window.removeEventListener("popstate", replayOnReturn);
      actions.querySelectorAll("a").forEach(link => {
        link.getAnimations().forEach(animation => animation.cancel());
      });
    };
  }, []);

  return <nav className={styles.heroActions} ref={actionsRef} aria-label="首页快捷入口">
    <Link className={styles.heroAbout} href="/about">关于我</Link>
  </nav>;
}
