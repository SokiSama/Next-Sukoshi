import assert from "node:assert/strict";
import test from "node:test";
import { orderAnimeBySeries } from "../app/lib/animeSeries.ts";

test("places collected seasons together chronologically without changing entries", () => {
  const season1 = { id: 386809, title: "【我推的孩子】", date: "2023-04-12", status: "看过" };
  const season2 = { id: 443428, title: "【我推的孩子】 第二季", date: "2024-07-03", status: "看过" };
  const season3 = { id: 517057, title: "【我推的孩子】 第三季", date: "2026-01-14", status: "未看" };
  const other = { id: 328609, title: "孤独摇滚！", date: "2022-10-08" };
  const input = [season3, other, season1, season2];
  assert.deepEqual(orderAnimeBySeries(input), [season1, season2, season3, other]);
  assert.deepEqual(input, [season3, other, season1, season2]);
});

test("recognizes BLOOM and punctuation-based Japanese season names", () => {
  const input = [
    { id: 260770, title: "请问您今天要来点兔子吗？BLOOM", date: "2020-10-10" },
    { id: 3774, title: "轻音少女 第二季", originalTitle: "けいおん！！", date: "2010-04-06" },
    { id: 88287, title: "请问您今天要来点兔子吗？", date: "2014-04-10" },
    { id: 1424, title: "轻音少女", originalTitle: "けいおん！", date: "2009-04-02" },
  ];
  assert.deepEqual(orderAnimeBySeries(input).map(item => item.id), [88287, 260770, 1424, 3774]);
});

test("keeps spin-offs, different series, and meaningful title numbers separate", () => {
  const input = [
    { title: "BanG Dream! 第三季" }, { title: "BanG Dream! It's MyGO!!!!!" },
    { title: "BanG Dream! 第二季" }, { title: "BanG Dream! Ave Mujica" }, { title: "BanG Dream!" },
    { title: "女神异闻录4" }, { title: "女神异闻录5" },
    { title: "Love Live! 虹咲学园校园偶像同好会 第二季" }, { title: "Love Live! Superstar!!" },
    { title: "Love Live! 虹咲学园校园偶像同好会" },
  ];
  assert.deepEqual(orderAnimeBySeries(input).map(item => item.title), [
    "BanG Dream!", "BanG Dream! 第二季", "BanG Dream! 第三季",
    "BanG Dream! It's MyGO!!!!!", "BanG Dream! Ave Mujica", "女神异闻录4", "女神异闻录5",
    "Love Live! 虹咲学园校园偶像同好会", "Love Live! 虹咲学园校园偶像同好会 第二季", "Love Live! Superstar!!",
  ]);
});

test("handles empty input and missing dates using numeric season order", () => {
  assert.deepEqual(orderAnimeBySeries([]), []);
  const items = [{ title: "Example 10th Season" }, { title: "Example 2nd Season" }, { title: "Example" }];
  assert.deepEqual(orderAnimeBySeries(items).map(item => item.title), ["Example", "Example 2nd Season", "Example 10th Season"]);
});
