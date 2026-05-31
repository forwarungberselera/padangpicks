import { useState } from 'react';
import { Clock3, Heart, MapPin, Star } from 'lucide-react';
import { useAuth } from '../contexts/auth-context';
import AuthModal from './AuthModal';

export default function CoffeeCard({ shop, onClick }) {
  const { isFavorite, toggleFavorite, user } = useAuth();
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const isFav = isFavorite(shop.id);

  const handleFav = (e) => {
    e.stopPropagation();
    if (!user) {
      setNoticeOpen(true);
      return;
    }
    if (!shop.id) {
      setNoticeOpen(true);
      return;
    }
    toggleFavorite(shop.id);
  };

  const getStatus = () => {
    const d = new Date();
    const currentHour = d.getHours() + d.getMinutes() / 60;
    if (shop.openHour < shop.closeHour) {
      return currentHour >= shop.openHour && currentHour < shop.closeHour;
    }
    return currentHour >= shop.openHour || currentHour < shop.closeHour;
  };

  const isOpen = getStatus();

  return (
    <>
      <div
        className="group bg-white rounded-2xl border border-border overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-border/60 hover:-translate-y-0.5"
        onClick={() => onClick(shop)}
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {shop.photo ? (
            <img src={shop.photo} alt={shop.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
          ) : (
            <div className="w-full h-full bg-surface-alt flex items-center justify-center text-sm font-medium text-muted">
              No image
            </div>
          )}
          
          {/* Favorite button */}
          <button
            onClick={handleFav}
            className={`absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-full shadow-sm transition-all ${
              isFav ? 'bg-primary text-white' : 'bg-white/90 text-text-secondary hover:text-primary backdrop-blur-sm'
            }`}
            aria-label="Toggle favorit"
          >
            <Heart size={16} className={isFav ? 'fill-current' : ''} />
          </button>

          {/* Status badge */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold backdrop-blur-sm ${
              isOpen ? 'bg-emerald-50/90 text-emerald-700' : 'bg-red-50/90 text-red-600'
            }`}>
              {isOpen ? 'Buka' : 'Tutup'}
            </span>
            {shop.isFeatured && (
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-amber-50/90 text-amber-700 backdrop-blur-sm">
                Featured
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-2.5">
          <div>
            <h3 className="font-semibold text-base text-text-main leading-tight line-clamp-1">{shop.name}</h3>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-text-secondary">
              <MapPin size={12} className="shrink-0" />
              <span className="line-clamp-1">{shop.area} · {shop.location}</span>
            </div>
          </div>

          {/* Meta info */}
          <div className="flex items-center gap-3 text-xs text-text-secondary">
            <span className="flex items-center gap-1">
              <Star size={12} className="text-amber-500 fill-amber-500" />
              <span className="font-semibold text-text-main">{shop.rating || 0}</span>
              <span>({shop.reviewCount || 0})</span>
            </span>
            <span className="flex items-center gap-1">
              <Clock3 size={12} />
              {shop.hours}
            </span>
          </div>

          {/* Price & Tags */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-primary bg-primary/5 px-2.5 py-1 rounded-md">
              Rp{((shop.priceMin || 0) / 1000).toFixed(0)}k - {((shop.priceMax || 0) / 1000).toFixed(0)}k
            </span>
            {shop.tags?.slice(0, 2).map((tag, i) => (
              <span key={i} className="text-xs text-muted bg-surface-alt px-2 py-1 rounded-md">
                {tag}
              </span>
            ))}
            {shop.tags?.length > 2 && (
              <span className="text-xs text-muted">+{shop.tags.length - 2}</span>
            )}
          </div>
        </div>
      </div>

      {/* Login notice modal */}
      {noticeOpen && (
        <div className="fixed inset-0 z-[360] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 modal-backdrop" onClick={() => setNoticeOpen(false)}>
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl modal-panel" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 modal-icon">
                <Heart size={22} className="text-primary" />
              </div>
              <h3 className="font-bold text-lg text-text-main">Masuk untuk favorit</h3>
              <p className="mt-2 text-sm text-text-secondary">
                Simpan {shop.name} ke daftar favoritmu setelah masuk.
              </p>
              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => { setNoticeOpen(false); setAuthOpen(true); }}
                  className="flex-1 h-10 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors"
                >
                  Masuk
                </button>
                <button
                  onClick={() => setNoticeOpen(false)}
                  className="flex-1 h-10 text-sm font-semibold text-text-secondary bg-surface-alt rounded-lg hover:bg-border-light transition-colors"
                >
                  Nanti
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
