import assert from "node:assert/strict";
import test from "node:test";
import { extractFriendArticleSummary } from "../app/lib/friend-feed-summary.ts";

test("RSS descriptions preserve text and separate paragraphs", () => {
  assert.equal(extractFriendArticleSummary("<description><![CDATA[<p>第一段 &amp; 示例</p><p>第二段<br>下一行</p>]]></description>"), "第一段 & 示例 第二段 下一行");
});

test("Atom summaries decode escaped markup and numeric entities", () => {
  assert.equal(extractFriendArticleSummary('<summary type="html">&lt;p&gt;预览&nbsp;&#x1f31f;&lt;/p&gt;</summary>'), "预览 🌟");
});

test("Full content supplies an excerpt when the description has no text", () => {
  assert.equal(extractFriendArticleSummary("<description><img src='cover.jpg'></description><content:encoded><![CDATA[<p>文章正文</p>]]></content:encoded>"), "文章正文");
});

test("Script, style and comments are excluded from the preview", () => {
  assert.equal(extractFriendArticleSummary("<content><script>bad()</script><style>p{color:red}</style><!-- hidden --><p>可阅读文字</p></content>"), "可阅读文字");
});

test("Missing excerpt stays empty and invalid code points do not break a feed", () => {
  assert.equal(extractFriendArticleSummary("<title>只有标题</title>"), "");
  assert.equal(extractFriendArticleSummary("<summary>正常&#99999999;文字</summary>"), "正常文字");
});

test("Large excerpts are bounded without splitting emoji", () => {
  const summary = extractFriendArticleSummary(`<summary>${"🌟".repeat(601)}</summary>`);
  assert.equal(summary, `${"🌟".repeat(600)}…`);
});
