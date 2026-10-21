"use client";

import { GameController, Timer } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

type RecentGame = {
  appid: number;
  name: string;
  cover: string;
  playtime2Weeks: number | null;
  playtimeForever: number;
};

type SteamResponse = {
  ok: boolean;
  game?: RecentGame | null;
  message?: string;
};

const hours = (minutes: number) => {
  const value = minutes / 60;
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
};

export function RecentGameCard() {
  const [game, setGame] = useState<RecentGame | null>(null);
  const [message, setMessage] = useState("正在读取最近的冒险…");

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/steam/recent", { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json() as SteamResponse;
        if (!response.ok || !data.ok || !data.game) {
          setMessage(data.message ?? "最近没有游玩记录 🎮");
          return;
        }
        setGame(data.game);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setMessage("最近没有游玩记录 🎮");
      });

    return () => controller.abort();
  }, []);

  return (
    <section className="card side-card recent-game-card" aria-live="polite">
      <h3>最近游玩</h3>
      {!game ? (
        <div className="recent-game-empty"><GameController aria-hidden="true" weight="duotone" /><p>{message}</p></div>
      ) : (
        <a href={`https://store.steampowered.com/app/${game.appid}`} target="_blank" rel="noreferrer" aria-label={`在 Steam 查看 ${game.name}`}>
          <div className="recent-game-cover"><img src={game.cover} alt={`${game.name} 游戏封面`} loading="lazy" /></div>
          <span className="recent-game-badge"><GameController aria-hidden="true" weight="fill" />最近游玩</span>
          <strong>{game.name}</strong>
          <div className="recent-game-time">
            {game.playtime2Weeks !== null && <span><Timer aria-hidden="true" />最近两周 {hours(game.playtime2Weeks)} 小时</span>}
            <span><Timer aria-hidden="true" />累计 {hours(game.playtimeForever)} 小时</span>
          </div>
        </a>
      )}
    </section>
  );
}
