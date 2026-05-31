import DirectoryPage from '../components/DirectoryPage';

export default function Hotel() {
  return (
    <DirectoryPage
      table="hotels"
      title="Hotel Padang"
      description="Kurasi hotel, penginapan, dan akomodasi pilihan di Padang."
      emptyText="Belum ada hotel yang tersedia."
    />
  );
}
