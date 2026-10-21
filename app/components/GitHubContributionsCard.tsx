"use client";
import { siteConfig } from "../../site.config";


import { GithubLogo } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";

type ContributionDay = {
  date: string;
  level: number;
};

type ContributionsResponse = {
  ok: boolean;
  username: string;
  total: number | null;
  cached?: boolean;
  fetchedAt?: string;
  days: ContributionDay[];
  profileUrl: string;
};

const monthFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  timeZone: "UTC",
});

const CONTRIBUTION_DAY_COUNT = 53 * 7;

function createPlaceholderDays() {
  return Array.from({ length: CONTRIBUTION_DAY_COUNT }, (_, index) => ({
    date: `placeholder-${index}`,
    level: 0,
  }));
}

function getRecentContributionDays(days: ContributionDay[]) {
  const recentDays = days.slice(-CONTRIBUTION_DAY_COUNT);
  const missingDayCount = CONTRIBUTION_DAY_COUNT - recentDays.length;

  if (missingDayCount <= 0) return recentDays;

  return [
    ...recentDays,
    ...Array.from({ length: missingDayCount }, (_, index) => ({
      date: `placeholder-${index}`,
      level: 0,
    })),
  ];
}

export function GitHubContributionsCard({ embedded = false }: { embedded?: boolean }) {
  const [payload, setPayload] = useState<ContributionsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/github-contributions", { signal: controller.signal })
      .then(async (response) => response.json() as Promise<ContributionsResponse>)
      .then(setPayload)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setPayload(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  const days = payload?.ok ? payload.days : [];
  const renderedDays = days.length ? getRecentContributionDays(days) : createPlaceholderDays();
  const weeks = useMemo(
    () => Array.from({ length: Math.ceil(renderedDays.length / 7) }, (_, index) => (
      renderedDays.slice(index * 7, index * 7 + 7)
    )),
    [renderedDays],
  );
  const monthLabels = useMemo(() => {
    const labels = weeks.map((week, index) => {
      const firstDate = week.find((day) => !day.date.startsWith("placeholder"));
      if (!firstDate) return null;

      const date = new Date(`${firstDate.date}T00:00:00Z`);
      const previousDate = weeks[index - 1]?.find((day) => !day.date.startsWith("placeholder"));
      const previousMonth = previousDate
        ? new Date(`${previousDate.date}T00:00:00Z`).getUTCMonth()
        : -1;

      return date.getUTCMonth() !== previousMonth ? monthFormatter.format(date) : null;
    });

    return labels.map((label, index) => {
      if (!label) return "";
      if (index === 0) return label;
      const nextLabelIndex = labels.findIndex((nextLabel, nextIndex) => nextIndex > index && nextLabel);
      return nextLabelIndex !== -1 && nextLabelIndex - index < 3 ? "" : label;
    });
  }, [weeks]);

  return (
    <section className="home-github-card" aria-labelledby={embedded ? undefined : "home-github-title"} aria-label={embedded ? "GitHub 贡献活动" : undefined}>
      {!embedded && <header>
        <div>
          <span>GITHUB ACTIVITY</span>
          <h2 id="home-github-title">代码留下的足迹</h2>
        </div>
        <a href={payload?.profileUrl || siteConfig.social.github || "https://github.com"} target="_blank" rel="noreferrer">
          <GithubLogo weight="fill" aria-hidden="true" />
          <span>@{payload?.username || siteConfig.author}</span>
        </a>
      </header>}

      {!loading && !payload?.ok && <p role="status">尚无 GitHub 活动数据。</p>}
      <div className="github-contribution-scroll">
        <div className="github-contribution-chart">
          <div className="github-contribution-months" aria-hidden="true">
            {monthLabels.map((label, index) => <span key={index}>{label}</span>)}
          </div>

          <div className="github-contribution-body">
            <div className="github-contribution-weekdays" aria-hidden="true">
              <span>Mon</span><span>Wed</span><span>Fri</span>
            </div>
            <div
              className={loading ? "github-contribution-grid is-loading" : "github-contribution-grid"}
              aria-label={payload?.total === null || payload?.total === undefined
                ? "GitHub 最近一年的贡献日历"
                : `GitHub 最近一年共有 ${payload.total} 次贡献`}
            >
              {renderedDays.map((day) => (
                <i
                  key={day.date}
                  data-level={day.level}
                  title={day.date.startsWith("placeholder") ? undefined : `${day.date} · Level ${day.level}`}
                  aria-hidden="true"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <footer>
        <p>
          {loading
            ? "正在读取 GitHub 活动…"
            : payload?.ok
              ? `${payload.total ?? "—"} contributions in the last year${payload.cached && payload.fetchedAt ? ` · 最近同步 ${payload.fetchedAt.slice(0, 10)}` : ""}`
              : "GitHub 活动暂时无法读取"}
        </p>
        <div className="github-contribution-legend" aria-label="贡献强度图例">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((level) => <i key={level} data-level={level} aria-hidden="true" />)}
          <span>More</span>
        </div>
      </footer>
    </section>
  );
}
