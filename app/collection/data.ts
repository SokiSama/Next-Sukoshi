export type CollectionKind = "books" | "manga" | "anime" | "games";
export type GamePlatform = "PS3" | "PS4" | "PS5" | "PSPC" | "Steam";
export type CollectionEntry = {
  id: string;
  kind: CollectionKind;
  title: string;
  cover: string;
  category: string;
  status: string;
  progress: string;
  url: string;
  summary: string;
  originalTitle?: string;
  summaryUnavailable?: boolean;
  platforms?: GamePlatform[];
  edition?: string;
  steamAppId?: number;
  review?: string;
  banner?: string;
  playtimeHours?: number | string;
  screenshots?: { src: string; alt: string }[];
};

export type AnimeResponseItem = {
  id: number;
  title: string;
  originalTitle: string;
  date?: string;
  cover: string;
  statusText: string;
  watchedEpisodes: number;
  totalEpisodes: number;
  summary: string;
  summaryUnavailable?: boolean;
  tags: string[];
};

const genres = ["音乐", "偶像", "日常", "奇幻", "科幻", "校园", "悬疑", "恋爱", "搞笑", "治愈", "战斗"];

export function toCollectionEntry(item: AnimeResponseItem): CollectionEntry {
  return {
    id: String(item.id), kind: "anime", title: item.title, originalTitle: item.originalTitle,
    cover: item.cover, category: genres.find(genre => item.tags.includes(genre)) || "其他",
    status: item.statusText === "看过" ? "看过" : "未看", progress: "",
    url: `https://bgm.tv/subject/${item.id}`, summary: item.summary, summaryUnavailable: item.summaryUnavailable,
  };
}


// 以下为虚构演示条目，可全部删除。追番数据仅在配置自己的 Bangumi 账号后读取。
export const collection: CollectionEntry[] = [
  { id: "sample-book", kind: "books", title: "一本示例书", cover: "/assets/book.svg", category: "随笔", status: "在读", progress: "示例作者", url: "", summary: "这是虚构的示例书籍，用于展示书架与详情弹窗。" },
  { id: "sample-manga", kind: "manga", title: "一段示例故事", cover: "/assets/book-alt.svg", category: "日常", status: "已收录", progress: "示例画家", url: "", summary: "这是虚构的示例漫画，可以换成你自己的收藏。" },
  { id: "sample-game", kind: "games", title: "一场示例冒险", cover: "/assets/game.svg", category: "冒险", status: "游玩中", progress: "", url: "", summary: "这是虚构的示例游戏。", platforms: ["Steam"], playtimeHours: 0 },
];
