export type DeviceIconKind = "phone" | "android" | "tablet" | "earbuds" | "watch" | "laptop" | "console" | "handheld" | "switch" | "cpu" | "gpu";

export function DeviceIcon({ kind }: { kind: DeviceIconKind }) {
  return <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {kind === "phone" && <><rect x="6.5" y="2" width="11" height="20" rx="2" /><path d="M10.5 4h3" /><circle cx="12" cy="19.5" r=".7" fill="currentColor" stroke="none" /></>}
    {kind === "android" && <><rect x="5.5" y="2" width="13" height="20" rx="1.5" /><circle cx="12" cy="4.5" r=".65" fill="currentColor" stroke="none" /></>}
    {kind === "tablet" && <><rect x="3.5" y="2" width="17" height="20" rx="2" /><circle cx="12" cy="19.5" r=".7" fill="currentColor" stroke="none" /></>}
    {kind === "earbuds" && <><rect x="2" y="5" width="20" height="15" rx="5" /><path d="M2 11h20M8.5 10.5h7" /><circle cx="12" cy="14.5" r=".65" fill="currentColor" stroke="none" /></>}
    {kind === "watch" && <><rect x="6" y="6" width="12" height="12" rx="3" /><path d="M9 6V2h6v4M9 18v4h6v-4M18 10h1v4" /></>}
    {kind === "laptop" && <><path d="M3 17V4h18v13M1 18h22v2H1zM10 20h4" /></>}
    {kind === "console" && <><path d="M7 2c2 5 2 15 0 20h10c-2-5-2-15 0-20zM11 3v18M6 22h12M14 14h1M14 17h1" /></>}
    {kind === "handheld" && <><rect x="6" y="6" width="12" height="11" rx="1.5" /><path d="M6 7 4 5 2 7 1 17l2 2 3-3M18 7l2-2 2 2 1 10-2 2-3-3M3 9v4M1 11h4" /><circle cx="20.5" cy="10" r=".6" fill="currentColor" stroke="none" /><circle cx="20.5" cy="13" r=".6" fill="currentColor" stroke="none" /></>}
    {kind === "switch" && <><rect x="1" y="5" width="22" height="14" rx="4" /><path d="M6 5v14M18 5v14M9 8h6v8H9zM3.5 13v3M2 14.5h3" /><circle cx="3.5" cy="9" r=".7" fill="currentColor" stroke="none" /><circle cx="20.5" cy="14.5" r=".7" fill="currentColor" stroke="none" /><path d="M20 9h1M20 11h1" /></>}
    {kind === "cpu" && <><rect x="5" y="5" width="14" height="14" rx="2" /><rect x="9" y="9" width="6" height="6" rx=".5" /><path d="M8 2v3M12 2v3M16 2v3M8 19v3M12 19v3M16 19v3M2 8h3M2 12h3M2 16h3M19 8h3M19 12h3M19 16h3" /></>}
    {kind === "gpu" && <><path d="M2 6h19v13H2zM21 5h2v16M5 19v2h6v-2M14 19v2h4v-2" /><circle cx="7" cy="12" r="3" /><circle cx="16" cy="12" r="3" /><path d="m5 10 4 4M5 14l4-4M14 10l4 4M14 14l4-4" /></>}
  </svg>;
}
