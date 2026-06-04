import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="max-w-6xl mx-auto px-4 sm:px-6 mt-12 pt-8 pb-24 md:pb-8 border-t border-border">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <img src="/harmonee-logo.png" alt="Harmonee" className="h-7 w-7 rounded-lg object-cover" />
          <div>
            <span className="font-display text-base text-primary block">Harmonee</span>
            <span className="text-[11px] text-muted">Direktori tempat terbaik di Padang</span>
          </div>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted" aria-label="Footer navigation">
          <Link to="/tentang" className="hover:text-primary transition-colors">Tentang Kami</Link>
          <Link to="/privacy" className="hover:text-primary transition-colors">Kebijakan Privasi</Link>
          <Link to="/terms" className="hover:text-primary transition-colors">Syarat & Ketentuan</Link>
          <a href="mailto:hello@harmonee.web.id" className="hover:text-primary transition-colors">Kontak</a>
          <a href="https://www.instagram.com/harmonee.id_/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Instagram</a>
        </nav>
      </div>
      <p className="mt-4 text-[11px] text-muted">
        &copy; {new Date().getFullYear()} Harmonee &mdash; Direktori coffee shop, hotel, dan lifestyle spot terkurasi di Kota Padang, Sumatera Barat. Dibuat oleh komunitas lokal.
      </p>
    </footer>
  );
}
