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
        className="w-full bg-white border border-primary/10 rounded-[22px] overflow-hidden shadow-[0_12px_30px_rgba(52,19,20,0.07)] flex flex-col relative isolate transition-all duration-300 cursor-pointer hover:-translate-y-1.5 hover:shadow-[0_22px_46px_rgba(52,19,20,0.13)] hover:border-primary/20 group animate-in fade-in slide-in-from-bottom-4"
        onClick={() => onClick(shop)}
      >
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#fff7f4] to-transparent pointer-events-none -z-10" />

        <button
          onClick={handleFav}
          className={`absolute top-3 right-3 z-10 w-10 h-10 flex items-center justify-center rounded-2xl shadow-[0_12px_24px_rgba(0,0,0,0.14)] transition-all hover:scale-105 ${isFav ? 'bg-primary text-white' : 'bg-white/92 text-[#8b4a4e] backdrop-blur-md'}`}
          aria-label="Toggle favorit"
        >
          <Heart size={18} className={isFav ? 'fill-current' : ''} />
        </button>

        <div className="relative overflow-hidden">
          {shop.photo ? (
            <img src={shop.photo} alt={shop.name} className="w-full h-[185px] sm:h-[205px] object-cover block transition-transform duration-700 group-hover:scale-105" loading="lazy" />
          ) : (
            <div className="w-full h-[185px] sm:h-[205px] bg-gradient-to-br from-[#ffd8d3] to-[#c6f4ef] flex items-center justify-center text-sm font-black text-[#8c232b] transition-transform duration-500 group-hover:scale-105">
              No image
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/48 to-transparent" />
          <div className="absolute left-3 bottom-3 flex items-center gap-2">
            <span className={`text-xs px-3 py-1.5 rounded-full font-black shadow-sm ${isOpen ? 'bg-[#dff8f2] text-[#0e605b]' : 'bg-[#ffe4e4] text-red-700'}`}>
              {isOpen ? 'Buka' : 'Tutup'}
            </span>
            <span className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-black bg-white/92 text-[#58151c] shadow-sm">
              <Star size={13} className="fill-[#f5a623] text-[#f5a623]" />
              {shop.rating || 0}
            </span>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 flex-1 flex flex-col gap-3 z-10">
          <div>
            <h3 className="font-display text-[1.25rem] sm:text-[1.35rem] font-bold leading-tight text-[#431417]">{shop.name}</h3>
            <div className="mt-1 flex items-start gap-1.5 text-[0.82rem] font-bold text-[#8b4a4e]">
              <MapPin size={15} className="mt-0.5 shrink-0 text-[#0e8f85]" />
              <span className="leading-snug">{shop.area} - {shop.location}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="bg-[#fff0ed] px-3 py-1.5 rounded-full text-accent-dark font-black">
              Rp{((shop.priceMin || 0) / 1000).toFixed(0)}k - {((shop.priceMax || 0) / 1000).toFixed(0)}k
            </span>
            <span className="inline-flex items-center gap-1 bg-[#e9fbf8] px-3 py-1.5 rounded-full text-[#0e605b] font-black">
              <Clock3 size={13} />
              {shop.hours}
            </span>
            <span className="bg-[#f7f2ff] px-3 py-1.5 rounded-full text-[#5b3f91] font-black">
              {shop.reviewCount || 0} ulasan
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
            {shop.tags?.slice(0, 3).map((tag, i) => (
              <span key={i} className="text-[0.72rem] px-2.5 py-1 rounded-full bg-[#f7f7f4] text-[#6b4b4e] font-bold">
                {tag}
              </span>
            ))}
            {shop.tags?.length > 3 && (
              <span className="text-[0.72rem] px-2.5 py-1 rounded-full bg-[#f7f7f4] text-[#6b4b4e] font-bold">
                +{shop.tags.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>

      {noticeOpen && (
        <div className="fixed inset-0 z-[360] flex items-end justify-center bg-[#201113]/72 p-0 backdrop-blur-sm sm:items-center sm:p-4 modal-backdrop" onClick={() => setNoticeOpen(false)}>
          <div className="w-full max-w-[430px] rounded-t-[28px] border border-white/20 bg-white p-5 shadow-[0_28px_80px_rgba(0,0,0,0.32)] sm:rounded-[28px] sm:p-6 modal-panel-bottom" onClick={e => e.stopPropagation()}>
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-3xl bg-[#fff0ed] text-primary modal-icon">
              <Heart size={26} />
            </div>
            <div className="modal-content">
              <h3 className="mt-4 text-center font-display text-3xl leading-none text-[#431417]">
                Masuk dulu untuk favorit
              </h3>
              <p className="mx-auto mt-3 max-w-[20rem] text-center text-sm font-bold leading-relaxed text-muted">
                Simpan {shop.name} ke daftar favoritmu setelah masuk atau membuat akun PadangPicks.
              </p>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    setNoticeOpen(false);
                    setAuthOpen(true);
                  }}
                  className="inline-flex min-h-[50px] items-center justify-center rounded-2xl bg-primary px-4 text-sm font-black text-white transition-colors hover:bg-accent-dark"
                >
                  Masuk Sekarang
                </button>
                <button
                  type="button"
                  onClick={() => setNoticeOpen(false)}
                  className="inline-flex min-h-[50px] items-center justify-center rounded-2xl border border-primary/12 bg-white px-4 text-sm font-black text-accent-dark transition-colors hover:bg-[#fff8f6]"
                >
                  Nanti Dulu
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
