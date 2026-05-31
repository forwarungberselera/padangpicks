import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="text-7xl font-bold text-primary/20 mb-4">404</div>
        <h1 className="text-xl font-bold text-text-main mb-2">Halaman Tidak Ditemukan</h1>
        <p className="text-sm text-text-secondary mb-8">
          Maaf, halaman yang kamu cari tidak ada atau sudah dipindahkan.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="inline-flex items-center gap-2 h-10 px-5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors">
            <Home size={15} /> Ke Beranda
          </Link>
          <button onClick={() => window.history.back()} className="inline-flex items-center gap-2 h-10 px-5 text-sm font-semibold text-text-secondary bg-surface-alt rounded-lg hover:bg-border-light transition-colors">
            <ArrowLeft size={15} /> Kembali
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
