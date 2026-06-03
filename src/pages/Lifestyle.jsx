import DirectoryPage from '../components/DirectoryPage';
import { usePageTitle } from '../hooks/usePageTitle';

export default function Lifestyle() {
  usePageTitle('Lifestyle Padang');
  return (
    <DirectoryPage
      table="lifestyle_places"
      title="Lifestyle Padang"
      description="Spot wisata, kuliner, belanja, dan pengalaman lokal di Padang."
      emptyText="Belum ada lifestyle spot yang tersedia."
    />
  );
}
