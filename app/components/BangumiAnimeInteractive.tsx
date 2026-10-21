import type { BangumiAnimeData } from "../lib/bangumiAnime";

export function BangumiAnimeInteractive({ data }: { data: BangumiAnimeData }) {
  const items = data.items;
  const collectionUrl = `https://bgm.tv/anime/list/${encodeURIComponent(data.user)}`;

  return (
    <section className="card home-anime-card" aria-labelledby="home-anime-title">
      <header className="home-anime-heading">
        <div>
          <span>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6.4 3.3a1 1 0 0 1 1.4.1L12 7.6l4.2-4.2a1 1 0 1 1 1.4 1.4L14.4 8H18a4 4 0 0 1 4 4v5a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4v-5a4 4 0 0 1 4-4h3.6L6.3 4.7a1 1 0 0 1 .1-1.4ZM6 10a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2H6Z"/></svg>
            ANIME
          </span>
          <h2 id="home-anime-title">最近追番</h2>
          <p>来自 Bangumi · 共 {data.total} 部</p>
        </div>
        <a href={collectionUrl} target="_blank" rel="noreferrer">
          查看全部
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 17 17 7M8 7h9v9"/></svg>
        </a>
      </header>

      <div className="home-anime-selector">
        {items.map((item, index) => (
          <input
            className="home-anime-choice"
            type="radio"
            name="home-anime-featured"
            id={`home-anime-${item.id}`}
            data-slot={index + 1}
            defaultChecked={index === 0}
            key={item.id}
          />
        ))}

        <div className="home-anime-layout">
          <div className="home-anime-featured-stage">
            {items.map((item, index) => (
              <a className="home-anime-featured" data-slot={index + 1} href={item.url} target="_blank" rel="noreferrer" key={item.id}>
                <img src={item.cover} alt={item.title} referrerPolicy="no-referrer" />
                <span className="home-anime-featured-shade" aria-hidden="true" />
                <div className="home-anime-featured-copy">
                  <small>{item.badge || item.progress || "Bangumi"}</small>
                  <strong>{item.title}</strong>
                  <p>{item.subtitle || item.renewal || item.progress}</p>
                </div>
                <b className="home-anime-play" aria-hidden="true">
                  <svg viewBox="0 0 24 24"><path fill="currentColor" d="M8 5.8v12.4a1 1 0 0 0 1.55.83l9.3-6.2a1 1 0 0 0 0-1.66l-9.3-6.2A1 1 0 0 0 8 5.8Z"/></svg>
                </b>
              </a>
            ))}
          </div>

          <div className="home-anime-list">
            {items.map((item, index) => (
              <label htmlFor={`home-anime-${item.id}`} data-slot={index + 1} key={item.id}>
                <img src={item.cover} alt="" referrerPolicy="no-referrer" loading="lazy" />
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.progress || item.renewal || item.subtitle || "番剧"}</small>
                </span>
                {item.score > 0 && <em>★ {item.score.toFixed(1)}</em>}
              </label>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
