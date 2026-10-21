# 配置说明

## 公开配置

`site.config.ts` 会被服务端和浏览器同时使用。这里只放公开信息。

- `title` / `author`：用于导航、个人介绍和页脚。
- `url`：用于页面元数据、文章 canonical、RSS 和友链交换信息。使用 HTTPS 正式域名，不带尾部斜杠。
- `description` / `subtitle` / `tagline`：站点介绍、首页副标题和个人签名。
- `avatar`：`public/` 下对应的 URL，例如 `/assets/avatar.png`。
- `defaultCover`：没有配置文章封面时的默认图片。
- `biography`：关于页面的介绍段落。
- `social`：按需填写链接，邮件只填邮箱地址，留空的项目自动隐藏。
- `registration`：可选备案信息，文本与 URL 都填写后显示。
- `traffic`：默认关闭，启用后只在 `hostnames` 中的域名统计。

## 友链

修改 `data/friends.json`，例如：

```json
[
  {
    "title": "示例友人",
    "avatar": "/assets/avatar.svg",
    "description": "友人的一句话简介",
    "url": "https://example.org",
    "tags": ["生活", "技术"]
  }
]
```

可添加公开的 `rss` 字段供朋友圈组件读取。服务端只读取此文件中的地址，不接受访客任意传入抓取 URL。请只加入你信任的公开站点地址。

## 收藏

`app/collection/data.ts` 导出 `collection` 数组。`kind` 支持 `books`、`manga`、`anime`、`games`。本地书籍、漫画和游戏使用这个数组，追番标签页从自己配置的 Bangumi 账号读取。没有作品页面时将 `url` 留空，不显示外链按钮。

## 图片和字体

静态资源放在 `public/` 下，代码中省略 `public` 前缀。例如 `public/assets/photo.webp` 对应 `/assets/photo.webp`。

三篇示例文章使用用户指定插图的 WebP 优化版本，默认头像为用户指定的 `avatar.png`；中性占位头像 `avatar.svg` 和 SVG 封面也保留可用。若自行启用远程图片，请按 Next.js 图片组件的需要配置 `next.config.ts` 的远程图片规则；收藏中的远程封面使用不优化的图片请求。

中文使用随项目提供的思源黑体可变字体，英文和数字保留系统字体。`app/fonts.css` 通过 `unicode-range` 限定字体覆盖范围，避免改变英文字形。字体使用 SIL Open Font License 1.1，许可与来源保存在 `public/fonts/source-han-sans/`。英文在不同操作系统上可能略有差异。

## 可选服务

环境变量的完整列表在 `.env.example`。Token 只保存在本地环境文件或部署平台环境变量中。Twikoo 服务地址是公开信息，服务端的密码和管理凭据不要写入站点配置。

Bangumi 接口只读取部署环境配置的账号，不接受访客传入账号；未配置时返回空列表。Steam 需同时配置账号 ID 与 API Key。Apple Music 只接受 `https://music.apple.com/` 下的公开歌单地址，不跟随重定向。

未配置集成时也能构建和启动。第三方 API 的权限、配额和可用性由对应服务决定。

思源黑体按中文字形拆分为本地 WOFF2 子集，浏览器按需加载，英文与数字字体保持不变。已有子集覆盖上游对应的中文范围，新增文章无需重新处理字体；来源与可选重建方法见字体目录中的 `SOURCES.md`。
