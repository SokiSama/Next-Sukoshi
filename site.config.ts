// 公开站点配置：不要在这里填写密码或 API Token。
export const siteConfig = {
  title: "demo",
  author: "Author",
  url: "https://example.com",
  description: "记录生活、创作与技术。",
  subtitle: "Write. Create. Remember.",
  tagline: "把值得记住的日常，写成自己的故事。",
  location: "地球上的某个角落",
  avatar: "/assets/avatar.png",
  defaultCover: "/assets/cover.svg",
  startYear: 2026,
  biography: [
    "这里填写你的个人介绍",
  ],
  // 留空的社交链接不会显示。示例：https://github.com/your-username
  social: { github: "", twitter: "", telegram: "", steam: "", email: "" },
  // 可选：填写自己的备案文本和查询链接，留空时隐藏。
  registration: { text: "", url: "" },
  // 可选：访客统计只在所列域名启用，默认关闭。不要填 localhost。
  traffic: { enabled: false, hostnames: [] as string[] },
};
