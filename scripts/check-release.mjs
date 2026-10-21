import { readdir, readFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ignored = new Set([".git", ".next", "node_modules", ".vercel"]);
const failures = [];
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const filename = path.join(dir, entry.name);
    const relative = path.relative(root, filename);
    if (entry.isDirectory()) { await walk(filename); continue; }
    if ((entry.name.startsWith(".env") && entry.name !== ".env.example") || /\.(?:log|bundle|zip)$/.test(entry.name)) {
      failures.push(`Unexpected private or generated file: ${relative}`);
    }
    if (!/\.(?:ts|tsx|css|md)$/.test(entry.name)) continue;
    if (entry.name.endsWith(".md") && !relative.startsWith(`public${path.sep}`)) continue;
    const source = await readFile(filename, "utf8");
    // Check literal local image references, excluding remote URLs and dynamic paths.
    for (const [url] of source.matchAll(/(?<![\w:/])\/(?:assets\/)?[\w./-]+\.(?:svg|png|jpe?g|webp|avif)/g)) {
      try { await access(path.join(root, "public", url)); }
      catch { failures.push(`Missing static image ${url} referenced in ${relative}`); }
    }
  }
}
await walk(root);
const catalogue = await readFile(path.join(root, "app/data/posts.ts"), "utf8");
for (const [, source] of catalogue.matchAll(/source:\s*"([^"]+)"/g)) {
  try { await access(path.join(root, "public", source)); }
  catch { failures.push(`Missing article body: ${source}`); }
}
for (const required of ["README.md", "LICENSE", ".env.example", "site.config.ts", "package-lock.json"]) {
  try { await access(path.join(root, required)); }
  catch { failures.push(`Missing required file: ${required}`); }
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log("Release checks passed: configuration, content files, assets, and private-file exclusions.");
}
