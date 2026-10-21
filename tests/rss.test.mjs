import assert from "node:assert/strict";
import test from "node:test";
import { buildRssFeed } from "../app/lib/rss.ts";
import { siteConfig } from "../site.config.ts";

test("RSS preserves special characters safely and uses absolute stable article URLs", () => {
  const xml = buildRssFeed([{
    slug: "中文文章", title: '游戏 & <开发> "记录"', description: "a < b & c > d",
    date: "2026-10-10", source: "/posts/example.md", type: "tech", tags: ["A&B"],
  }]);
  assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
  assert.ok(xml.includes("游戏 &amp; &lt;开发&gt; &quot;记录&quot;"));
  assert.ok(xml.includes("a &lt; b &amp; c &gt; d"));
  assert.ok(xml.includes(`<guid isPermaLink="true">${siteConfig.url.replace(/\/$/, "")}/posts/${encodeURIComponent("中文文章")}</guid>`));
  assert.ok(xml.includes("<category>A&amp;B</category>"));
  assert.ok(xml.includes("Fri, 09 Oct 2026 16:00:00 GMT"));
});

test("RSS lists newer articles first without mutating the article catalogue", () => {
  const posts = ["2025-01-01", "2026-10-10"].map((date, index) => ({
    slug: `post-${index}`, title: `post-${index}`, date, description: "简介",
    source: "/posts/example.md", type: "tech", category: "开发", tags: ["开发"],
  }));
  const xml = buildRssFeed(posts);
  assert.ok(xml.indexOf("<title>post-1</title>") < xml.indexOf("<title>post-0</title>"));
  assert.equal(posts[0].date, "2025-01-01");
  assert.equal((xml.match(/<category>开发<\/category>/g) || []).length, 2);
  assert.equal((xml.match(/<item>/g) || []).length, 2);
});

test("An empty catalogue still produces a valid channel", () => {
  const xml = buildRssFeed([]);
  assert.ok(xml.includes("<channel>"));
  assert.ok(xml.includes("</rss>"));
  assert.ok(!xml.includes("Invalid Date"));
  assert.ok(!xml.includes("<item>"));
});
