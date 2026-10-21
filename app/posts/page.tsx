import type { Metadata } from 'next';
import { HomePageClient } from '../components/HomePageClient';
import { getHomeData } from '../lib/home-data';

export const metadata: Metadata = { title: '文章索引' };
export const revalidate = 3600;

export default async function PostsPage() {
  return <HomePageClient {...await getHomeData()} showHero={false} />;
}
