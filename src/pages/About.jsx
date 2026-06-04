import { Link } from 'react-router-dom';
import { ArrowLeft, Coffee, Heart, MapPin, Star, Users } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';
import { useMetaDescription } from '../hooks/useMetaDescription';

export default function About() {
  usePageTitle('Tentang Kami');
  useMetaDescription(
    'Harmonee adalah direktori kurasi coffee shop, hotel, dan lifestyle spot terbaik di Kota Padang, Sumatera Barat. Dibuat oleh komunitas lokal untuk komunitas lokal.'
  );

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-24 md:pb-12">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Kembali
      </Link>

      {/* Hero */}
      <div className="flex items-center gap-4 mb-8">
        <img
          src="/harmonee-logo.png"
          alt="Logo Harmonee"
          className="h-16 w-16 rounded-2xl object-cover shadow-sm"
        />
        <div>
          <h1 className="font-display text-3xl text-primary">Tentang Harmonee</h1>
          <p className="text-sm text-muted mt-1">Direktori lokal untuk warga Padang</p>
        </div>
      </div>

      <div className="prose-sm space-y-8 text-text-secondary leading-relaxed">

        {/* Apa itu Harmonee */}
        <section className="bg-cream rounded-2xl p-5 sm:p-6">
          <h2 className="font-display text-xl text-primary mb-3">Apa itu Harmonee?</h2>
          <p>
            Harmonee adalah platform direktori digital yang mengkurasi coffee shop, hotel, dan
            tempat lifestyle terbaik di Kota Padang, Sumatera Barat. Kami hadir untuk membantu
            warga lokal dan wisatawan menemukan spot ngopi, penginapan, dan pengalaman seru di
            Padang dengan mudah.
          </p>
          <p className="mt-3">
            Semua tempat yang terdaftar di Harmonee telah melalui kurasi berdasarkan rating komunitas,
            kualitas layanan, dan pengalaman nyata pengunjung. Bukan iklan — murni rekomendasi jujur.
          </p>
        </section>

        {/* Fitur */}
        <section>
          <h2 className="font-display text-xl text-primary mb-4">Apa yang Bisa Kamu Lakukan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: Coffee,  title: 'Temukan Coffee Shop', desc: 'Filter berdasarkan area, harga, dan jam buka. Cari yang open 24 jam, budget-friendly, atau punya rating tertinggi.' },
              { icon: MapPin,  title: 'Hotel & Lifestyle',   desc: 'Direktori hotel dan penginapan serta spot wisata, kuliner, dan belanja pilihan di Padang.' },
              { icon: Star,    title: 'Beri Rating',         desc: 'Bantu komunitas dengan memberikan rating jujur untuk tempat yang sudah kamu kunjungi.' },
              { icon: Heart,   title: 'Simpan Favorit',      desc: 'Buat akun gratis untuk menyimpan tempat favorit dan mengaksesnya kapan saja.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-3 p-4 bg-white rounded-xl border border-border">
                <div className="w-9 h-9 rounded-xl bg-cream flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-text-main mb-1">{title}</div>
                  <div className="text-xs text-muted leading-relaxed">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Komunitas */}
        <section>
          <h2 className="font-display text-xl text-primary mb-3">Dibuat oleh Komunitas Lokal</h2>
          <div className="flex gap-3 p-4 bg-white rounded-xl border border-border">
            <div className="w-9 h-9 rounded-xl bg-cream flex items-center justify-center shrink-0">
              <Users size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-sm text-text-secondary leading-relaxed">
                Harmonee dibangun dan dikelola oleh tim yang berbasis di Kota Padang. Kami percaya
                bahwa rekomendasi terbaik datang dari orang yang benar-benar tinggal dan mengunjungi
                tempat tersebut secara langsung — bukan dari algoritma mesin yang tidak mengenal
                keunikan kota kami.
              </p>
            </div>
          </div>
        </section>

        {/* Saran Tempat */}
        <section>
          <h2 className="font-display text-xl text-primary mb-3">Ingin Menambahkan Tempat?</h2>
          <p>
            Kamu tahu tempat keren di Padang yang belum ada di daftar kami? Gunakan fitur{' '}
            <strong>Suggest Tempat</strong> di halaman utama untuk merekomendasikan ke tim kami.
            Kami akan review dan tambahkan jika memenuhi kriteria kurasi.
          </p>
        </section>

        {/* Kontak */}
        <section className="bg-white rounded-xl border border-border p-5">
          <h2 className="font-display text-xl text-primary mb-3">Hubungi Kami</h2>
          <p className="text-sm mb-3">
            Punya pertanyaan, saran, atau ingin bekerja sama? Jangan ragu untuk menghubungi kami:
          </p>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium text-text-main">Email: </span>
              <a href="mailto:hello@harmonee.web.id" className="text-primary hover:underline">
                hello@harmonee.web.id
              </a>
            </div>
            <div>
              <span className="font-medium text-text-main">Instagram: </span>
              <a
                href="https://www.instagram.com/harmonee.id_/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                @harmonee.id_
              </a>
            </div>
            <div>
              <span className="font-medium text-text-main">Lokasi: </span>
              <span className="text-text-secondary">Kota Padang, Sumatera Barat, Indonesia</span>
            </div>
          </div>
        </section>

        {/* Links */}
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            to="/privacy"
            className="text-sm text-primary hover:underline"
          >
            Kebijakan Privasi
          </Link>
          <span className="text-muted">·</span>
          <Link
            to="/terms"
            className="text-sm text-primary hover:underline"
          >
            Syarat & Ketentuan
          </Link>
        </div>
      </div>
    </main>
  );
}
