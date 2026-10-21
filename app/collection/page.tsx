import { siteConfig } from "../../site.config";
import type { Metadata } from "next";
import CollectionPageClient, { type CollectionTab } from "./CollectionPageClient";

export const metadata: Metadata = { title: `品鉴 · ${siteConfig.title}` };

export default async function CollectionPage({ searchParams }: { searchParams: Promise<{ tab?: string | string[] }> }) {
  const { tab } = await searchParams;
  const tabs: CollectionTab[] = ["books", "manga", "anime", "games"];
  const initialKind = tabs.find(value => value === tab) ?? "books";
  return <CollectionPageClient key={initialKind} initialKind={initialKind} />;
}
