"use client";

import { useEffect, useState } from "react";

type YearStats = {
  dayOfYear: number;
  progress: number;
};

function calculateYearStats(date: Date): YearStats {
  const year = date.getFullYear();
  const start = Date.UTC(year, 0, 1);
  const today = Date.UTC(year, date.getMonth(), date.getDate());
  const nextYear = Date.UTC(year + 1, 0, 1);
  const dayOfYear = Math.floor((today - start) / 86_400_000) + 1;
  const daysInYear = Math.round((nextYear - start) / 86_400_000);

  return {
    dayOfYear,
    progress: Math.round((dayOfYear / daysInYear) * 100),
  };
}

export function YearProgressStats() {
  const [stats, setStats] = useState<YearStats | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setStats(calculateYearStats(new Date())));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <section className="archive-year-progress card" aria-label="今年时间进度">
      <div>
        <strong>{stats?.dayOfYear ?? "—"}</strong>
        <span>今年第几天</span>
      </div>
      <div>
        <strong>{stats ? `${stats.progress}%` : "—"}</strong>
        <span>今年进度</span>
      </div>
    </section>
  );
}
