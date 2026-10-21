"use client";
import { useEffect, useRef, useState } from "react";
import { MusicNotes, Play, Pause } from "@phosphor-icons/react";
type Track = { id: string; title: string; artist: string; artwork: string; url: string | null };
export function MusicPlayerCard({ variant = "sidebar" }: { variant?: "sidebar" | "home" }) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [message, setMessage] = useState("正在读取歌单…");
  const audio = useRef<HTMLAudioElement>(null);
  const current = tracks[index];
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/music-playlist", { signal: controller.signal }).then(response => response.json()).then(payload => {
      if (controller.signal.aborted) return;
      setTracks(payload.tracks ?? []); setPlaylistUrl(payload.playlistUrl ?? "");
      setMessage(payload.configured === false ? "尚未配置歌单" : payload.ok ? "" : "歌单暂时无法读取");
    }).catch(() => { if (!controller.signal.aborted) setMessage("歌单暂时无法读取"); });
    return () => controller.abort();
  }, []);
  async function play(track: Track, trackIndex: number) {
    if (!audio.current) return;
    if (trackIndex === index && playing) { audio.current.pause(); setPlaying(false); return; }
    setIndex(trackIndex); setPlaying(false); audio.current.pause();
    try {
      const params = new URLSearchParams({ title: track.title, artist: track.artist });
      const response = await fetch(`/api/music-preview?${params}`);
      const result = await response.json();
      const url = result.previewUrl ?? result.preview;
      if (!url) { setMessage("这首歌暂无试听"); return; }
      audio.current.src = url; await audio.current.play(); setPlaying(true); setMessage("");
    } catch { setMessage("试听暂时无法播放"); }
  }
  return <section className={`card side-card ${variant === "home" ? "home-music-card" : "music-card"}`}>
    <h3><MusicNotes size={20} aria-hidden="true" /> 音乐</h3>
    {message && <p role="status">{message}</p>}
    {current && <p>{current.title} · {current.artist}</p>}
    <ol>{tracks.map((track, trackIndex) => <li key={track.id}><button type="button" onClick={() => void play(track, trackIndex)} aria-label={`试听 ${track.title}`}>
      {trackIndex === index && playing ? <Pause size={16} /> : <Play size={16} />} {track.title} · {track.artist}
    </button></li>)}</ol>
    {playlistUrl && <a href={playlistUrl} target="_blank" rel="noreferrer">在 Apple Music 打开歌单</a>}
    <audio ref={audio} onEnded={() => setPlaying(false)} onPause={() => setPlaying(false)} />
  </section>;
}
