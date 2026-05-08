import { useEffect, useState } from 'react';
import { X, MapPin, Clock, DollarSign, Info, Star, ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/auth-context';
import { supabase } from '../lib/supabase';
import { normalizeCoffeeShop } from '../lib/coffee-shop-mapper';

export default function CoffeeModal({ shop, isOpen, onClose, onShopUpdated }) {
  const { user } = useAuth();
  const [userRating, setUserRating] = useState(0);
  const [ratingStatus, setRatingStatus] = useState('');
  const [ratingLoading, setRatingLoading] = useState(false);

  useEffect(() => {
    const fetchUserRating = async () => {
      setUserRating(0);
      setRatingStatus('');

      if (!isOpen || !shop?.id || !user || !supabase) return;

      const { data, error } = await supabase
        .from('coffee_shop_ratings')
        .select('rating')
        .eq('user_id', user.id)
        .eq('coffee_shop_id', shop.id)
        .maybeSingle();

      if (!error && data?.rating) {
        setUserRating(data.rating);
      }
    };

    fetchUserRating();
  }, [isOpen, shop?.id, user]);

  if (!isOpen || !shop) return null;

  const handleRate = async (rating) => {
    if (!user) {
      setRatingStatus('Masuk dulu untuk memberi rating.');
      return;
    }

    if (!supabase || !shop.id) {
      setRatingStatus('Rating hanya tersedia untuk data dari Supabase.');
      return;
    }

    setRatingLoading(true);
    setRatingStatus('');

    const { error } = await supabase
      .from('coffee_shop_ratings')
      .upsert(
        {
          user_id: user.id,
          coffee_shop_id: shop.id,
          rating,
        },
        { onConflict: 'user_id,coffee_shop_id' },
      );

    if (error) {
      setRatingStatus(error.message);
      setRatingLoading(false);
      return;
    }

    setUserRating(rating);
    setRatingStatus('Rating tersimpan.');

    const { data: updatedShop } = await supabase
      .from('coffee_shops')
      .select('*')
      .eq('id', shop.id)
      .single();

    if (updatedShop) {
      onShopUpdated?.(normalizeCoffeeShop(updatedShop));
    }

    setRatingLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-[#201113]/72 z-[200] flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm transition-opacity modal-backdrop" onClick={onClose}>
      <div 
        className="bg-white rounded-t-[24px] sm:rounded-[28px] w-full max-w-[680px] max-h-[92vh] sm:max-h-[88vh] overflow-y-auto relative modal-panel-bottom shadow-[0_28px_80px_rgba(0,0,0,0.32)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-1 sm:hidden" />
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 bg-black/42 text-white w-10 h-10 rounded-2xl flex items-center justify-center z-10 hover:bg-black/60 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="relative">
          {shop.photo ? (
            <img src={shop.photo} alt={shop.name} className="w-full h-[210px] sm:h-[260px] object-cover" />
          ) : (
            <div className="w-full h-[190px] sm:h-[220px] bg-gradient-to-br from-[#ffd9d4] to-[#c6f4ef] flex items-center justify-center text-sm font-black text-[#8c232b]">
              No image
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/62 to-transparent" />
          <div className="absolute left-4 sm:left-5 bottom-4 sm:bottom-5 flex flex-wrap items-center gap-2 pr-16">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-black text-[#431417] shadow-sm">
              <Star size={14} className="fill-[#f5a623] text-[#f5a623]" />
              {shop.rating || 0} ({shop.reviewCount || 0})
            </span>
            <span className="rounded-full bg-[#dff8f2] px-3 py-1.5 text-xs font-black text-[#0e605b] shadow-sm">
              {shop.area}
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-5 md:p-6 flex flex-col gap-4 modal-content">
          <div>
            <h2 className="font-display text-[clamp(1.8rem,4vw,2.45rem)] leading-none font-bold text-[#431417]">{shop.name}</h2>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {shop.tags?.map((tag, i) => (
                <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-[#f7f7f4] text-[#6b4b4e] font-bold">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-[#fff8f6] text-[#6f4749] text-sm leading-relaxed p-4 rounded-2xl border border-primary/8">
            {shop.description || 'Belum ada deskripsi untuk tempat ini.'}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 mt-1">
            <div className="bg-[#fff8f6] rounded-2xl p-3.5 sm:p-4 flex items-start gap-3 border border-primary/8">
              <MapPin size={19} className="text-[#0e8f85] mt-0.5 shrink-0" />
              <div>
                <div className="text-xs text-[#0e8f85] mb-0.5 font-black uppercase tracking-wide">Lokasi</div>
                <div className="font-bold text-sm text-[#341314]">{shop.location}</div>
                <div className="text-xs text-[#a35f63] mt-0.5">{shop.area}</div>
              </div>
            </div>
            
            <div className="bg-[#fff8f6] rounded-2xl p-3.5 sm:p-4 flex items-start gap-3 border border-primary/8">
              <Clock size={19} className="text-[#0e8f85] mt-0.5 shrink-0" />
              <div>
                <div className="text-xs text-[#0e8f85] mb-0.5 font-black uppercase tracking-wide">Jam Operasional</div>
                <div className="font-bold text-sm text-[#341314]">{shop.hours}</div>
              </div>
            </div>

            <div className="bg-[#fff8f6] rounded-2xl p-3.5 sm:p-4 flex items-start gap-3 border border-primary/8">
              <DollarSign size={19} className="text-[#0e8f85] mt-0.5 shrink-0" />
              <div>
                <div className="text-xs text-[#0e8f85] mb-0.5 font-black uppercase tracking-wide">Estimasi Harga</div>
                <div className="font-bold text-sm text-[#341314]">
                  Rp{((shop.priceMin || 0)/1000).toFixed(0)}k - {((shop.priceMax || 0)/1000).toFixed(0)}k
                </div>
              </div>
            </div>

            <div className="bg-[#fff8f6] rounded-2xl p-3.5 sm:p-4 flex items-start gap-3 border border-primary/8">
              <Info size={19} className="text-[#0e8f85] mt-0.5 shrink-0" />
              <div>
                <div className="text-xs text-[#0e8f85] mb-0.5 font-black uppercase tracking-wide">Rating</div>
                <div className="font-bold text-sm text-[#341314] flex items-center gap-1">
                  {shop.rating || 0} dari {shop.reviewCount || 0} ulasan
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#f5fffd] rounded-2xl p-3.5 sm:p-4 border border-[#2cb5a7]/18">
            <div className="text-xs text-[#0e8f85] mb-3 font-black uppercase tracking-wide">Rating kamu</div>
            <div className="flex items-center gap-2 flex-wrap">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => handleRate(rating)}
                  disabled={ratingLoading}
                  className={`w-10 h-10 min-w-10 rounded-2xl flex items-center justify-center border transition-all ${
                    rating <= userRating
                      ? 'bg-[#f5a623] border-[#f5a623] text-white shadow-sm'
                      : 'bg-white border-[#2cb5a7]/20 text-[#0e8f85] hover:border-[#f5a623]'
                  } disabled:opacity-60`}
                  aria-label={`Beri rating ${rating}`}
                >
                  <Star size={17} className={rating <= userRating ? 'fill-current' : ''} />
                </button>
              ))}
              {ratingLoading && <span className="text-xs font-bold text-muted">Menyimpan...</span>}
            </div>
            {ratingStatus && (
              <p className="mt-2 text-xs font-bold text-[#8c232b]">{ratingStatus}</p>
            )}
          </div>

          <div className="flex gap-3 mt-2 flex-col sm:flex-row">
            {shop.mapsUrl && (
              <a 
                href={shop.mapsUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 bg-primary text-white font-black text-sm text-center py-3.5 rounded-2xl shadow-[0_14px_26px_rgba(143,15,26,0.22)] hover:bg-accent-dark transition-colors"
              >
                <ExternalLink size={16} />
                Buka di Google Maps
              </a>
            )}
            <button 
              onClick={onClose}
              className="flex-1 bg-white border border-primary/16 text-[#7d0614] font-black text-sm text-center py-3.5 rounded-2xl hover:bg-[#fff8f6] transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
