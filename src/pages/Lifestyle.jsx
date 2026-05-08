import DirectoryPage from '../components/DirectoryPage';

export default function Lifestyle() {
  return (
    <DirectoryPage
      table="lifestyle_places"
      eyebrow="Lifestyle Directory"
      title="Lifestyle Padang"
      description="Temukan spot wisata, kuliner, belanja, event, dan pengalaman lokal yang bisa dikurasi langsung dari dashboard admin."
      emptyText="Belum ada lifestyle item yang tersedia."
    />
  );
}
