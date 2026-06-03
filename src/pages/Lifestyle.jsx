import DirectoryPage from '../components/DirectoryPage';
import { usePageTitle } from '../hooks/usePageTitle';
import { useMetaDescription } from '../hooks/useMetaDescription';

export default function Lifestyle() {
  usePageTitle('Lifestyle Padang');
  useMetaDescription('Jelajahi spot wisata, kuliner, belanja, dan pengalaman lokal terbaik di Kota Padang. Rekomendasi terpercaya dari komunitas Harmonee.');
  return (
    <DirectoryPage
      table="lifestyle_places"
      title="Lifestyle Padang"
      description="Spot wisata, kuliner, belanja, dan pengalaman lokal di Padang."
      emptyText="Belum ada lifestyle spot yang tersedia."
    />
  );
}
