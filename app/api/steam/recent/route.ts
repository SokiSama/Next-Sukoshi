import { NextResponse } from "next/server";

export const revalidate = 600;

const STEAM_ID = process.env.STEAM_ID || "";
const STEAM_ENDPOINT = "https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/";

type SteamGame = {
  appid: number;
  name: string;
  playtime_2weeks?: number;
  playtime_forever?: number;
  rtime_last_played?: number;
};

const cacheHeaders = {
  "Cache-Control": "public, s-maxage=600, stale-while-revalidate=60",
};

export async function GET() {
  const apiKey = process.env.STEAM_API_KEY;

  if (!apiKey || !STEAM_ID) {
    return NextResponse.json(
      { ok: false, reason: "unavailable", message: "Steam 数据暂不可用" },
      { status: 503, headers: cacheHeaders },
    );
  }

  const endpoint = new URL(STEAM_ENDPOINT);
  endpoint.searchParams.set("key", apiKey);
  endpoint.searchParams.set("steamid", STEAM_ID);
  endpoint.searchParams.set("include_appinfo", "true");
  endpoint.searchParams.set("include_played_free_games", "true");

  try {
    const response = await fetch(endpoint, {
      headers: { Accept: "application/json" },
      next: { revalidate: 600 },
      signal: AbortSignal.timeout(10_000),
    });

    if (response.status === 401 || response.status === 403) {
      return NextResponse.json(
        { ok: false, reason: "private", message: "Steam 数据不可见" },
        { status: 200, headers: cacheHeaders },
      );
    }

    if (!response.ok) throw new Error(`Steam API returned ${response.status}`);

    const payload = await response.json() as { response?: { games?: SteamGame[] } };
    if (!payload.response) {
      return NextResponse.json(
        { ok: false, reason: "private", message: "Steam 数据不可见" },
        { status: 200, headers: cacheHeaders },
      );
    }

    const game = payload.response.games
      ?.slice()
      .sort((left, right) => (right.rtime_last_played ?? 0) - (left.rtime_last_played ?? 0))[0];
    if (!game) {
      return NextResponse.json(
        { ok: true, reason: "empty", game: null, message: "最近没有游玩记录 🎮" },
        { headers: cacheHeaders },
      );
    }

    return NextResponse.json(
      {
        ok: true,
        game: {
          appid: game.appid,
          name: game.name,
          cover: `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/assets/cover.svg`,
          playtime2Weeks: game.playtime_2weeks ?? null,
          playtimeForever: game.playtime_forever ?? 0,
        },
      },
      { headers: cacheHeaders },
    );
  } catch {
    return NextResponse.json(
      { ok: false, reason: "unavailable", message: "Steam 数据暂不可用" },
      { status: 502, headers: cacheHeaders },
    );
  }
}
