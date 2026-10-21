"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";

const envId = process.env.NEXT_PUBLIC_TWIKOO_ENV_ID || "";

type Twikoo = {
  init: (options: {
    envId: string;
    el: HTMLElement;
    path: string;
    lang: string;
    onCommentLoaded?: () => void;
  }) => Promise<void>;
};

type TwikooCommentsProps = {
  path: string;
  className?: string;
};

export function TwikooComments({ path, className = "" }: TwikooCommentsProps) {
  const commentsRef = useRef<HTMLDivElement>(null);
  const initializing = useRef(false);
  const initialized = useRef(false);
  const observerRef = useRef<MutationObserver | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");

  const initComments = useCallback(async (force = false) => {
    const host = commentsRef.current;
    const twikoo = (window as typeof window & { twikoo?: Twikoo }).twikoo;
    if (!host || !twikoo?.init || initializing.current || (initialized.current && !force)) return;

    initializing.current = true;
    setStatus("loading");
    initialized.current = false;
    const element = document.createElement("div");
    host.replaceChildren(element);


    try {
      await twikoo.init({
        envId,
        el: element,
        path,
        lang: "zh-CN",
        onCommentLoaded: () => {
          setStatus("ready");
        },
      });
      initialized.current = true;
      setStatus("ready");
    } catch {
      setStatus("error");
    } finally {
      initializing.current = false;
    }
  }, [path]);

  useEffect(() => {
    observerRef.current?.disconnect();
    initialized.current = false;
    commentsRef.current?.replaceChildren();
    const timer = window.setTimeout(() => {
      setStatus("idle");
      void initComments();
    }, 0);
    return () => {
      window.clearTimeout(timer);
      observerRef.current?.disconnect();
    };
  }, [initComments]);

  if (!envId) return null;

  return (
    <section id="comments" data-reveal className={`comments-section ${className}`.trim()}>
      <div className="section-title"><span /><h2>评论区</h2></div>
      <Script
        id="twikoo-script"
        src="https://cdn.jsdelivr.net/npm/twikoo@2.0.15/dist/twikoo.all.min.js"
        strategy="afterInteractive"
        onLoad={() => { void initComments(); }}
        onError={() => setStatus("error")}
      />
      {status === "loading" && <p className="comment-status">正在加载评论…</p>}
      {status === "error" && (
        <div className="comment-error">
          评论区加载失败。
          <button type="button" onClick={() => void initComments(true)}>重新加载</button>
        </div>
      )}
      <div className="twikoo-host card" ref={commentsRef} />
    </section>
  );
}
