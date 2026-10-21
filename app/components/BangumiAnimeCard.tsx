import { BangumiAnimeInteractive } from "./BangumiAnimeInteractive";
import { getBangumiAnime } from "../lib/bangumiAnime";

function randomSample<T>(items: T[], count: number) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
  }
  return shuffled.slice(0, count);
}

export async function BangumiAnimeCard() {
  const data = await getBangumiAnime().catch(() => null);
  if (!data) {
    return <section className="card home-anime-card"><div className="home-anime-placeholder is-error">追番数据稍后再来看看吧</div></section>;
  }
  return <BangumiAnimeInteractive data={{ ...data, items: randomSample(data.items, 6) }} />;
}
