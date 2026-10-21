export const postCategories = ["随笔", "技术", "开发记录", "游戏", "旅行"] as const;
export type PostCategory = (typeof postCategories)[number];
export type LocalPost = {
  slug: string; title: string; date: string; description: string; cover?: string;
  source: string; type: "travel" | "tech"; category: PostCategory; tags: string[];
};
export const localPosts: LocalPost[] = [
  {
    slug: "hello-world", title: "你好，世界", date: "2026-01-03",
    description: "这是博客模板的第一篇示例文章。", cover: "/assets/cover-hello-world.webp",
    source: "/posts/hello-world.md", type: "tech", category: "随笔", tags: ["开始", "示例"],
  },
  {
    slug: "writing-guide", title: "用 Markdown 写一篇文章", date: "2026-01-02",
    description: "标题、列表、代码与表格的排版示例。", cover: "/assets/cover-writing-guide.webp",
    source: "/posts/writing-guide.md", type: "tech", category: "技术", tags: ["Markdown", "写作"],
  },
  {
    slug: "a-small-walk", title: "一次散步的记录", date: "2026-01-01",
    description: "用一小段文字记录日常。", cover: "/assets/cover-small-walk.webp",
    source: "/posts/a-small-walk.md", type: "travel", category: "旅行", tags: ["生活"],
  },
];
export const localPostMap: Record<string, LocalPost> = Object.fromEntries(localPosts.map(post => [post.slug, post]));
