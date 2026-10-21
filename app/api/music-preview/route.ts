import { NextRequest, NextResponse } from "next/server";

export const revalidate = 86_400;

type ItunesTrack = {
  artistName?: string;
  previewUrl?: string;
  trackName?: string;
  trackViewUrl?: string;
};

type ItunesResponse = {
  results?: ItunesTrack[];
};

const cacheHeaders = {
  "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
};

function normalize(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase()
    .replace(/\([^)]*\)|（[^）]*）/g, "")
    .replace(/[\s\p{P}\p{S}]+/gu, "");
}

function matchScore(track: ItunesTrack, title: string, artist: string) {
  const wantedTitle = normalize(title);
  const wantedArtist = normalize(artist);
  const foundTitle = normalize(track.trackName ?? "");
  const foundArtist = normalize(track.artistName ?? "");
  let score = 0;

  if (foundTitle === wantedTitle) score += 8;
  else if (foundTitle.includes(wantedTitle) || wantedTitle.includes(foundTitle)) score += 4;
  if (foundArtist === wantedArtist) score += 5;
  else if (foundArtist.includes(wantedArtist) || wantedArtist.includes(foundArtist)) score += 2;
  if (track.previewUrl) score += 1;

  return score;
}

export async function GET(request: NextRequest) {
  const title = request.nextUrl.searchParams.get("title")?.trim() ?? "";
  const artist = request.nextUrl.searchParams.get("artist")?.trim() ?? "";
  if (!title || !artist) {
    return NextResponse.json({ ok: false, previewUrl: null }, { status: 400 });
  }

  try {
    const params = new URLSearchParams({
      term: `${title} ${artist}`,
      country: "JP",
      media: "music",
      entity: "song",
      limit: "25",
      lang: "ja_jp",
    });
    const response = await fetch(`https://itunes.apple.com/search?${params.toString()}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 86_400 },
    });
    if (!response.ok) throw new Error(`iTunes Search API returned ${response.status}`);

    const payload = await response.json() as ItunesResponse;
    const best = (payload.results ?? [])
      .filter((track) => track.previewUrl)
      .sort((left, right) => matchScore(right, title, artist) - matchScore(left, title, artist))[0];

    if (!best?.previewUrl || matchScore(best, title, artist) < 5) {
      return NextResponse.json(
        { ok: false, previewUrl: null },
        { status: 200, headers: cacheHeaders },
      );
    }

    return NextResponse.json({
      ok: true,
      previewUrl: best.previewUrl,
      trackUrl: best.trackViewUrl ?? null,
    }, { headers: cacheHeaders });
  } catch {
    return NextResponse.json(
      { ok: false, previewUrl: null },
      { status: 200, headers: cacheHeaders },
    );
  }
}
