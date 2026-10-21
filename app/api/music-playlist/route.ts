import { NextResponse } from "next/server";
import { APPLE_MUSIC_PLAYLIST_URL as playlistUrl, parseAppleMusicPlaylist } from "../../lib/appleMusicPlaylist";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const headers = { "Cache-Control": "no-store, no-cache, must-revalidate" };

export async function GET() {
  if (!playlistUrl) return NextResponse.json({ ok: true, configured: false, playlistUrl: "", tracks: [] }, { headers });
  try {
    const target = new URL(playlistUrl);
    if (target.protocol !== "https:" || target.hostname !== "music.apple.com" || target.username || target.password || target.port) throw new Error("Invalid playlist URL");
  } catch {
    return NextResponse.json({ ok: false, tracks: [] }, { status: 400, headers });
  }
  try {
    const response = await fetch(playlistUrl, {
      redirect: "error",
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "ja-JP,ja;q=0.9,en;q=0.8",
        "User-Agent": "Mozilla/5.0 (compatible; JournalBlog-Playlist/1.0)",
      },
    });
    if (!response.ok) throw new Error(`Apple Music returned ${response.status}`);
    const tracks = parseAppleMusicPlaylist(await response.text());
    if (!tracks.length) throw new Error("Apple Music playlist was empty");
    return NextResponse.json({ ok: true, playlistUrl, tracks }, { headers });
  } catch (error) {
    console.error("[music-playlist] Unable to refresh Apple Music playlist", error);
    return NextResponse.json({ ok: false, playlistUrl, tracks: [] }, { status: 502, headers });
  }
}
