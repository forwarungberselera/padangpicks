import DirectoryPage from '../components/DirectoryPage';

export default function Hotel() {
  return (
    <DirectoryPage
      table="hotels"
      eyebrow="Hotel Directory"
      title="Hotel Padang"
      description="Kurasi hotel, penginapan, dan akomodasi pilihan di Padang dengan filter area, harga, dan listing unggulan."
      emptyText="Belum ada hotel yang tersedia."
    />
  );
}
