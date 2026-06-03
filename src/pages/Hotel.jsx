import DirectoryPage from '../components/DirectoryPage';
import { usePageTitle } from '../hooks/usePageTitle';

export default function Hotel() {
  usePageTitle('Hotel Padang');
  return (
    <DirectoryPage
      table="hotels"
      title="Hotel Padang"
      description="Kurasi hotel, penginapan, dan akomodasi pilihan di Padang."
      emptyText="Belum ada hotel yang tersedia."
    />
  );
}
