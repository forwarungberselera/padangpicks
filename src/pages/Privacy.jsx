import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Privacy() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-24 md:pb-12">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary mb-6 transition-colors">
        <ArrowLeft size={16} /> Kembali
      </Link>

      <h1 className="font-display text-3xl text-primary mb-2">Kebijakan Privasi</h1>
      <p className="text-sm text-muted mb-8">Terakhir diperbarui: 1 Juni 2025</p>

      <div className="prose-sm space-y-6 text-text-secondary leading-relaxed">
        <section>
          <h2 className="font-display text-lg text-primary mb-2">1. Informasi yang Kami Kumpulkan</h2>
          <p>Saat menggunakan Harmonee, kami mengumpulkan informasi berikut:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Informasi akun:</strong> Nama, alamat email, dan password terenkripsi saat mendaftar.</li>
            <li><strong>Data penggunaan:</strong> Favorit, rating, dan preferensi yang kamu simpan.</li>
            <li><strong>Data teknis:</strong> Jenis perangkat, browser, dan alamat IP untuk keamanan.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg text-primary mb-2">2. Penggunaan Informasi</h2>
          <p>Informasi yang dikumpulkan digunakan untuk:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Menyediakan dan meningkatkan layanan Harmonee.</li>
            <li>Menyimpan favorit dan rating kamu.</li>
            <li>Mengirim notifikasi penting terkait akun.</li>
            <li>Melindungi keamanan platform.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg text-primary mb-2">3. Penyimpanan Data</h2>
          <p>Data disimpan secara aman menggunakan Supabase dengan enkripsi. Password tidak pernah disimpan dalam bentuk teks biasa. Kami menerapkan Row Level Security untuk memastikan setiap pengguna hanya bisa mengakses datanya sendiri.</p>
        </section>

        <section>
          <h2 className="font-display text-lg text-primary mb-2">4. Berbagi Data</h2>
          <p>Kami <strong>tidak menjual</strong> data pribadi kamu ke pihak ketiga. Data hanya dibagikan jika:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Diperlukan oleh hukum yang berlaku.</li>
            <li>Untuk melindungi hak dan keamanan pengguna.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg text-primary mb-2">5. Hak Pengguna</h2>
          <p>Kamu berhak untuk:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Mengakses dan mengubah data profilmu kapan saja.</li>
            <li>Menghapus akun dan semua data terkait.</li>
            <li>Menarik persetujuan penggunaan data.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg text-primary mb-2">6. Cookie</h2>
          <p>Harmonee menggunakan local storage untuk menyimpan sesi login dan preferensi tampilan. Kami tidak menggunakan cookie pelacakan pihak ketiga.</p>
        </section>

        <section>
          <h2 className="font-display text-lg text-primary mb-2">7. Kontak</h2>
          <p>Jika ada pertanyaan tentang kebijakan privasi ini, hubungi kami di <a href="mailto:hello@harmonee.id" className="text-primary hover:underline">hello@harmonee.id</a>.</p>
        </section>
      </div>
    </main>
  );
}
