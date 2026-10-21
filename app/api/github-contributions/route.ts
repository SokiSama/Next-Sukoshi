import { NextResponse } from "next/server";

export const revalidate = 21_600;
export const dynamic = "force-dynamic";

const username = process.env.GITHUB_USERNAME || "";
const cacheHeaders = {
  "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=604800",
};

export async function GET() {
  if (!username) return NextResponse.json({ ok: false, configured: false, username: "", total: null, days: [], profileUrl: "" });
  try {
    const response = await fetch(`https://github.com/users/${username}/contributions`, {
      headers: {
        Accept: "text/html",
        "User-Agent": "JournalBlog/1.0 (https://example.com)",
      },
      next: { revalidate: 21_600 },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error(`GitHub returned ${response.status}`);

    const html = await response.text();
    const dayPattern = /<td\b(?=[^>]*\bclass="[^"]*\bContributionCalendar-day\b[^"]*")(?=[^>]*\bdata-date="(\d{4}-\d{2}-\d{2})")(?=[^>]*\bdata-level="([0-4])")[^>]*>/g;
    const days = Array.from(html.matchAll(dayPattern), (match) => ({
      date: match[1],
      level: Number(match[2]),
    })).sort((left, right) => left.date.localeCompare(right.date));
    if (!days.length) throw new Error("No contribution days found");

    const totalMatch = html.match(/([\d,]+)\s+contributions?\s+in\s+the\s+last\s+year/i);
    const total = totalMatch ? Number(totalMatch[1].replaceAll(",", "")) : null;

    return NextResponse.json({
      ok: true,
      username,
      total: Number.isFinite(total) ? total : null,
      days,
      profileUrl: `https://github.com/${username}`,
    }, { headers: cacheHeaders });
  } catch {
    return NextResponse.json(
      { ok: false, username, total: null, days: [], profileUrl: `https://github.com/${username}` },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  }
}
