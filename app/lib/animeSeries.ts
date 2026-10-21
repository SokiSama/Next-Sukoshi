type AnimeSeason = {
  title: string;
  originalTitle?: string;
  date?: string;
};

const namedSeasons: Record<string, string> = {
  "请问您今天要来点兔子吗bloom": "请问您今天要来点兔子吗",
  "ご注文はうさぎですかbloom": "ご注文はうさぎですか",
};

function seriesKey(title: string) {
  const base = title.normalize("NFKC")
    .replace(/\s*(?:第\s*[零〇一二三四五六七八九十百两\d]+\s*[季期部]|\d+\s*期|season\s*\d+|\d+(?:st|nd|rd|th)?\s*season|s\d+)\s*$/iu, "")
    .replace(/[\p{P}\p{Z}\s]/gu, "")
    .toLocaleLowerCase();
  return namedSeasons[base] ?? base;
}

function seasonNumber(title: string) {
  const match = title.normalize("NFKC").match(/第\s*([一二三四五六七八九十两\d]+)\s*[季期部]|(?:season|s)\s*(\d+)|(\d+)(?:st|nd|rd|th)?\s*(?:season|期)/iu);
  const value = match?.[1] ?? match?.[2] ?? match?.[3];
  if (!value) return 1;
  if (/^\d+$/.test(value)) return Number(value);
  const digits: Record<string, number> = { 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 };
  if (value.includes("十")) {
    const [tens, ones] = value.split("十");
    return (digits[tens] ?? 1) * 10 + (digits[ones] ?? 0);
  }
  return digits[value] ?? 1;
}

// Only exact series names match; shared franchise prefixes do not merge spin-offs.
// Keep each series at its first collection position, then order its seasons.
export function orderAnimeBySeries<T extends AnimeSeason>(items: readonly T[]): T[] {
  const groups: { keys: Set<string>; entries: { item: T; index: number }[] }[] = [];
  items.forEach((item, index) => {
    const keys = [item.title, item.originalTitle].filter((title): title is string => Boolean(title?.trim())).map(seriesKey).filter(Boolean);
    const matching = groups.filter(group => keys.some(key => group.keys.has(key)));
    const group = matching[0] ?? { keys: new Set<string>(), entries: [] };
    if (!matching.length) groups.push(group);
    for (const other of matching.slice(1)) {
      other.keys.forEach(key => group.keys.add(key));
      group.entries.push(...other.entries);
      groups.splice(groups.indexOf(other), 1);
    }
    keys.forEach(key => group.keys.add(key));
    group.entries.push({ item, index });
  });

  return groups.flatMap(group => group.entries.sort((a, b) => {
    if (a.item.date && b.item.date && a.item.date !== b.item.date) return a.item.date.localeCompare(b.item.date);
    return seasonNumber(a.item.title) - seasonNumber(b.item.title) || a.index - b.index;
  }).map(({ item }) => item));
}
