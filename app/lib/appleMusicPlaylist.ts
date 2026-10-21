export const APPLE_MUSIC_PLAYLIST_URL = process.env.APPLE_MUSIC_PLAYLIST_URL || "";

export type PlaylistTrack = {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  url: string | null;
  album: string | null;
  duration: number | null;
};

type AppleTrack = {
  artistName?: string;
  artwork?: { dictionary?: { url?: string } };
  contentDescriptor?: { identifiers?: { storeAdamID?: string }; url?: string };
  subtitleLinks?: Array<{ title?: string }>;
  tertiaryLinks?: Array<{ title?: string }>;
  duration?: number;
  title?: string;
};

export function parseAppleMusicPlaylist(html: string): PlaylistTrack[] {
  const match = html.match(/<script[^>]+id=["']serialized-server-data["'][^>]*>([\s\S]*?)<\/script>/i);
  if (!match?.[1]) return [];
  const payload = JSON.parse(match[1]) as { data?: Array<{ data?: { sections?: Array<{ id?: string; items?: AppleTrack[] }> } }> };
  const tracks = payload.data?.[0]?.data?.sections?.find(section => section.id?.startsWith("track-list -"))?.items ?? [];
  return tracks.flatMap(track => {
    const id = track.contentDescriptor?.identifiers?.storeAdamID?.trim() ?? "";
    const title = track.title?.trim() ?? "";
    const artist = (track.artistName ?? track.subtitleLinks?.[0]?.title)?.trim() ?? "";
    const artwork = track.artwork?.dictionary?.url?.replace("{w}", "600").replace("{h}", "600").replace("{f}", "jpg") ?? "";
    if (!id || !title || !artist || !artwork) return [];
    return [{
      id, title, artist, artwork,
      url: track.contentDescriptor?.url ?? null,
      album: track.tertiaryLinks?.[0]?.title?.trim() || null,
      duration: typeof track.duration === "number" && track.duration > 0 ? Math.round(track.duration / 1000) : null,
    }];
  });
}

export function pickPlaylistTrack(tracks: PlaylistTrack[], previousId: string | null, random = Math.random) {
  const candidates = tracks.map((track, index) => ({ track, index })).filter(({ track }) => tracks.length === 1 || track.id !== previousId);
  return candidates.length ? candidates[Math.floor(random() * candidates.length)] : null;
}
