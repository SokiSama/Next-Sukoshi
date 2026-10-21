import { HomePageClient } from './components/HomePageClient';
import { getHomeData } from './lib/home-data';

export const revalidate = 3600;

export default async function Home() {
  return <HomePageClient {...await getHomeData()} />;
}
