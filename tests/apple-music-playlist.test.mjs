import assert from "node:assert/strict";
import test from "node:test";
import { parseAppleMusicPlaylist, pickPlaylistTrack } from "../app/lib/appleMusicPlaylist.ts";

const sourceTrack = {
  title: "KiLLKiSS", artistName: "Ave Mujica", duration: 208773,
  contentDescriptor: { identifiers: { storeAdamID: "1783599226" }, url: "https://music.apple.com/jp/album/killkiss/1783599221?i=1783599226" },
  artwork: { dictionary: { url: "https://is1-ssl.mzstatic.com/cover/{w}x{h}bb.{f}" } },
  tertiaryLinks: [{ title: "KiLLKiSS - Single" }],
};
const page = items => `<script type="application/json" id="serialized-server-data">${JSON.stringify({ data: [{ data: { sections: [{ id: "recommendations", items: [] }, { id: "track-list - playlist", items }] } }] })}</script>`;

test("reads actual song metadata, album, duration and full-size cover from the playlist section", () => {
  assert.deepEqual(parseAppleMusicPlaylist(page([sourceTrack])), [{
    id: "1783599226", title: "KiLLKiSS", artist: "Ave Mujica", duration: 209,
    url: sourceTrack.contentDescriptor.url, artwork: "https://is1-ssl.mzstatic.com/cover/600x600bb.jpg", album: "KiLLKiSS - Single",
  }]);
});

test("skips incomplete tracks and uses subtitle artists when artistName is absent", () => {
  const track = { ...sourceTrack, artistName: undefined, subtitleLinks: [{ title: "Artist" }], tertiaryLinks: undefined, duration: undefined };
  const tracks = parseAppleMusicPlaylist(page([{ title: "Incomplete" }, track]));
  assert.equal(tracks.length, 1);
  assert.equal(tracks[0].artist, "Artist");
  assert.equal(tracks[0].album, null);
  assert.equal(tracks[0].duration, null);
  assert.deepEqual(parseAppleMusicPlaylist("<h1>Unavailable</h1>"), []);
});

test("random selection keeps playlist positions and avoids repeating the previous song", () => {
  const tracks = ["a", "b", "c"].map(id => ({ id }));
  assert.deepEqual(pickPlaylistTrack(tracks, "a", () => 0), { track: tracks[1], index: 1 });
  assert.deepEqual(pickPlaylistTrack(tracks, "b", () => 0.99), { track: tracks[2], index: 2 });
  assert.deepEqual(pickPlaylistTrack([tracks[0]], "a"), { track: tracks[0], index: 0 });
  assert.equal(pickPlaylistTrack([], null), null);
});
