import type { CollectionKind } from "../collection/data";

export function CollectionIcon({ kind }: { kind: CollectionKind }) {
  return <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {kind === "books" && <><path d="M5 19V5a2 2 0 0 1 2-2h12v18H7a2 2 0 0 1 0-4h12M8 3v14" /><path d="M11 7h5M11 10h5" /></>}
    {kind === "manga" && <><path d="M12 5c-3-2-6-2-10-1v15c4-1 7-1 10 1 3-2 6-2 10-1V4c-4-1-7-1-10 1v15" /><path d="M5 7h4v4H5zM5 14h4M15 7h4v4h-2l-2 2V7zM15 16h4" /></>}
    {kind === "anime" && <><rect x="2" y="3" width="20" height="15" rx="2" /><path d="M8 22h8M12 18v4M10 7l6 4-6 4V7z" /></>}
    {kind === "games" && <><path d="M7 6h10c2 0 3 2 4 5l1 6c.5 3-2 4-4 2l-3-3H9l-3 3c-2 2-4.5 1-4-2l1-6c1-3 2-5 4-5zM7 9v6M4 12h6" /><circle cx="16" cy="10" r=".8" fill="currentColor" stroke="none" /><circle cx="19" cy="13" r=".8" fill="currentColor" stroke="none" /></>}
  </svg>;
}
