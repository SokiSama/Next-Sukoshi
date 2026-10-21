"use client";

import { useEffect, useState } from "react";

type FriendArticle = {
  title: string;
  summary?: string;
  url: string;
  publishedAt: string;
  siteName: string;
  siteUrl: string;
  avatar: string;
};

type FriendCircleState =
  | { status: "loading"; articles: FriendArticle[] }
  | { status: "ready"; articles: FriendArticle[] }
  | { status: "error"; articles: FriendArticle[] };

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  month: "2-digit",
  day: "2-digit",
});

function formatPublishedAt(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : dateFormatter.format(date);
}

export function FriendCircleCard() {
  const [state, setState] = useState<FriendCircleState>({ status: "loading", articles: [] });

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/friends/feed", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Friend circle feed unavailable");
        return response.json() as Promise<{ articles?: FriendArticle[] }>;
      })
      .then((payload) => {
        setState({ status: "ready", articles: payload.articles ?? [] });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setState({ status: "error", articles: [] });
      });

    return () => controller.abort();
  }, []);

  return (
    <section className="card friend-circle-card" aria-labelledby="friend-circle-title">
      <header className="friend-circle-heading">
        <h2 id="friend-circle-title">朋友圈 <span aria-hidden="true">✦</span></h2>
        <p>大家最近都更新了什么</p>
      </header>

      {state.status === "loading" && (
        <div className="friend-circle-loading" aria-label="正在读取朋友圈动态">
          <i /><i /><i /><i />
        </div>
      )}

      {state.status !== "loading" && state.articles.length === 0 && (
        <p className="friend-circle-empty">
          {state.status === "error" ? "朋友圈暂时无法读取" : "朋友们最近还没有发布新动态"}
        </p>
      )}

      {state.articles.length > 0 && (
        <div className="friend-circle-list">
          {state.articles.slice(0, 6).map((article) => (
            <article className="friend-circle-item" key={`${article.siteUrl}-${article.url}`}>
              <a
                className="friend-circle-avatar"
                href={article.siteUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={`访问 ${article.siteName}`}
              >
                <img
                  src={article.avatar}
                  alt={`${article.siteName} 的头像`}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </a>
              <div className="friend-circle-content">
                <a className="friend-circle-title" href={article.url} target="_blank" rel="noreferrer">
                  {article.title}
                </a>
                <div className="friend-circle-meta">
                  <a href={article.siteUrl} target="_blank" rel="noreferrer">
                    {article.siteName}
                  </a>
                  <time dateTime={article.publishedAt}>
                    {formatPublishedAt(article.publishedAt)}
                  </time>
                </div>
                {article.summary && <p className="friend-circle-summary">{article.summary}</p>}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
