import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';
import { useMetaDescription } from '../hooks/useMetaDescription';

export default function Terms() {
  usePageTitle('Syarat & Ketentuan');
  useMetaDescription('Syarat dan ketentuan penggunaan layanan direktori Harmonee — hak, kewajiban, dan batasan pengguna.');
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-24 md:pb-12">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary mb-6 transition-colors">
        <ArrowLeft size={16} /> Kembali
      </Link>

      <h1 className="font-display text-3xl text-primary mb-2">Syarat & Ketentuan</h1>
      <p className="text-sm text-muted mb-8">Terakhir diperbarui: 1 Juni 2025</p>

      <div className="prose-sm space-y-6 text-text-secondary leading-relaxed">
        <section>
          <h2 className="font-display text-lg text-primary mb-2">1. Penerimaan Ketentuan</h2>
          <p>Dengan mengakses dan menggunakan Harmonee, kamu menyetujui untuk terikat dengan syarat dan ketentuan ini. Jika tidak setuju, harap tidak menggunakan layanan ini.</p>
        </section>

        <section>
          <h2 className="font-display text-lg text-primary mb-2">2. Deskripsi Layanan</h2>
          <p>Harmonee adalah platform direktori kurasi yang menyediakan informasi tentang coffee shop, hotel, dan tempat lifestyle di Kota Padang. Informasi yang ditampilkan bersifat informatif dan dapat berubah sewaktu-waktu.</p>
        </section>

        <section>
          <h2 className="font-display text-lg text-primary mb-2">3. Akun Pengguna</h2>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Kamu bertanggung jawab atas keamanan akun dan passwordmu.</li>
            <li>Informasi yang diberikan saat registrasi harus akurat.</li>
            <li>Satu orang hanya boleh memiliki satu akun.</li>
            <li>Kami berhak menonaktifkan akun yang melanggar ketentuan.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg text-primary mb-2">4. Konten & Rating</h2>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Rating dan favorit yang kamu berikan bersifat publik (tanpa menampilkan identitas).</li>
            <li>Dilarang memberikan rating palsu atau spam.</li>
            <li>Kami berhak menghapus konten yang tidak sesuai.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg text-primary mb-2">5. Informasi Listing</h2>
          <p>Informasi seperti jam buka, harga, dan lokasi bersifat indikatif. Harmonee tidak bertanggung jawab atas ketidakakuratan informasi. Selalu konfirmasi langsung ke tempat terkait sebelum berkunjung.</p>
        </section>

        <section>
          <h2 className="font-display text-lg text-primary mb-2">6. Larangan</h2>
          <p>Pengguna dilarang untuk:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Menggunakan platform untuk tujuan ilegal.</li>
            <li>Melakukan scraping atau mengakses data secara tidak sah.</li>
            <li>Mengganggu atau merusak layanan.</li>
            <li>Menyamar sebagai orang lain.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg text-primary mb-2">7. Batasan Tanggung Jawab</h2>
          <p>Harmonee disediakan "sebagaimana adanya". Kami tidak memberikan jaminan bahwa layanan akan selalu tersedia tanpa gangguan. Kami tidak bertanggung jawab atas kerugian yang timbul dari penggunaan informasi di platform ini.</p>
        </section>

        <section>
          <h2 className="font-display text-lg text-primary mb-2">8. Perubahan Ketentuan</h2>
          <p>Kami dapat mengubah syarat dan ketentuan ini kapan saja. Perubahan akan berlaku segera setelah dipublikasikan. Penggunaan lanjutan setelah perubahan berarti kamu menyetujui ketentuan baru.</p>
        </section>

        <section>
          <h2 className="font-display text-lg text-primary mb-2">9. Kontak</h2>
          <p>Pertanyaan terkait syarat dan ketentuan dapat dikirim ke <a href="mailto:hello@harmonee.web.id" className="text-primary hover:underline">hello@harmonee.web.id</a>.</p>
        </section>
      </div>
    </main>
  );
}
