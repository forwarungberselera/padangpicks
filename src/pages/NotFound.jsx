import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="text-6xl font-display text-primary/20 mb-4">404</div>
        <h1 className="font-display text-xl text-primary mb-2">Halaman Tidak Ditemukan</h1>
        <p className="text-sm text-text-secondary mb-8">Halaman yang kamu cari tidak ada atau sudah dipindahkan.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="inline-flex items-center gap-2 h-11 px-5 text-sm font-semibold text-cream bg-primary rounded-xl active:scale-95 transition-transform"><Home size={15} />Beranda</Link>
          <button onClick={() => window.history.back()} className="inline-flex items-center gap-2 h-11 px-5 text-sm font-semibold text-text-secondary bg-surface-alt rounded-xl active:scale-95 transition-transform"><ArrowLeft size={15} />Kembali</button>
        </div>
      </div>
    </div>
  );
}
