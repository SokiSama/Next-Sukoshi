const namedEntities: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  ndash: "–", mdash: "—", hellip: "…", lsquo: "‘", rsquo: "’",
  ldquo: "“", rdquo: "”", copy: "©", reg: "®", bull: "•",
};

function decodeEntities(value: string) {
  return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, name: string) => {
    if (!name.startsWith("#")) return namedEntities[name.toLowerCase()] ?? entity;
    const hex = name[1].toLowerCase() === "x";
    const codePoint = Number.parseInt(name.slice(hex ? 2 : 1), hex ? 16 : 10);
    return codePoint > 0 && codePoint <= 0x10ffff && !(codePoint >= 0xd800 && codePoint <= 0xdfff)
      ? String.fromCodePoint(codePoint)
      : "";
  });
}

/** Read feed text only; never render markup supplied by a friend site. */
export function extractFriendArticleSummary(entry: string): string {
  for (const tag of ["description", "summary", "content:encoded", "content"]) {
    const match = entry.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"));
    if (!match?.[1]) continue;

    const decoded = decodeEntities(decodeEntities(match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")));
    const text = decoded
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "")
      .replace(/<\/?(?:p|div|section|article|h[1-6]|ul|ol|li|blockquote|pre|br|hr|td|tr)\b[^>]*>/gi, " ")
      .replace(/<\/?[a-z][^>]*>/gi, "")
      .replace(/[\s\u200b\ufeff]+/g, " ")
      .trim();

    if (text) {
      const characters = Array.from(text);
      return characters.length > 600 ? `${characters.slice(0, 600).join("")}…` : text;
    }
  }
  return "";
}
