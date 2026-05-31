import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="text-8xl font-black text-primary mb-2">404</div>
        <h1 className="text-2xl font-black text-[#58151c] mb-3">
          Halaman Tidak Ditemukan
        </h1>
        <p className="text-muted mb-8">
          Maaf, halaman yang kamu cari tidak ada atau sudah dipindahkan.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            to="/"
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-full hover:bg-accent-dark transition-colors text-sm"
          >
            <Home className="w-4 h-4" />
            Ke Beranda
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-text-main font-bold rounded-full hover:bg-gray-200 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
