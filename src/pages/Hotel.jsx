import DirectoryPage from '../components/DirectoryPage';
import { usePageTitle } from '../hooks/usePageTitle';
import { useMetaDescription } from '../hooks/useMetaDescription';

export default function Hotel() {
  usePageTitle('Hotel Padang');
  useMetaDescription('Temukan hotel, penginapan, dan akomodasi terbaik di Kota Padang. Pilihan terkurasi dengan info lengkap harga, lokasi, dan fasilitas.');
  return (
    <DirectoryPage
      table="hotels"
      title="Hotel Padang"
      description="Kurasi hotel, penginapan, dan akomodasi pilihan di Padang."
      emptyText="Belum ada hotel yang tersedia."
    />
  );
}
