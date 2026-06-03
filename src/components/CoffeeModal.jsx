import { useCallback, useEffect, useState } from 'react';
import { X, MapPin, Clock, Star, Navigation, Camera, Share2, Copy, Check } from 'lucide-react';
import { useAuth } from '../contexts/auth-context';
import { supabase } from '../lib/supabase';
import { normalizeCoffeeShop } from '../lib/coffee-shop-mapper';
import { useModalHistory } from '../hooks/useModalHistory';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

export default function CoffeeModal({ shop, isOpen, onClose, onShopUpdated }) {
  const { user } = useAuth();
  const [userRating, setUserRating] = useState(0);
  const [ratingStatus, setRatingStatus] = useState('');
  const [ratingLoading, setRatingLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Stable close callback for hooks
  const handleClose = useCallback(() => onClose(), [onClose]);

  // Back button closes modal, body scroll locked while open
  useModalHistory(isOpen, handleClose);
  useBodyScrollLock(isOpen);

  useEffect(() => {
    setUserRating(0); setRatingStatus('');
    if (!isOpen || !shop?.id || !user || !supabase) return;
    supabase.from('coffee_shop_ratings').select('rating')
      .eq('user_id', user.id).eq('coffee_shop_id', shop.id)
      .maybeSingle().then(({ data }) => { if (data?.rating) setUserRating(data.rating); });
  }, [isOpen, shop?.id, user]);

  if (!isOpen || !shop) return null;

  const handleRate = async (rating) => {
    if (!user) { setRatingStatus('Masuk dulu untuk memberi rating.'); return; }
    if (!supabase || !shop.id) { setRatingStatus('Rating tidak tersedia.'); return; }
    setRatingLoading(true); setRatingStatus('');
    const { error } = await supabase.from('coffee_shop_ratings')
      .upsert({ user_id: user.id, coffee_shop_id: shop.id, rating }, { onConflict: 'user_id,coffee_shop_id' });
    if (error) { setRatingStatus(error.message); setRatingLoading(false); return; }
    setUserRating(rating); setRatingStatus('Tersimpan!');
    const { data: u } = await supabase.from('coffee_shops').select('*').eq('id', shop.id).single();
    if (u) onShopUpdated?.(normalizeCoffeeShop(u));
    setRatingLoading(false);
  };

  const hasLinks = shop.mapsUrl || shop.instagram;
  const shareUrl = `${window.location.origin}/?shop=${encodeURIComponent(shop.name)}`;
  const shareText = `Cek ${shop.name} di Harmonee! ${shop.area ? `(${shop.area})` : ''}`;

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: shop.name, text: shareText, url: shareUrl }); } catch {}
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const handleWhatsAppShare = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`, '_blank');
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm sm:p-4 modal-backdrop"
      onClick={handleClose}
    >
      <div
        className="bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl max-h-[92vh] sm:max-h-[88vh] overflow-y-auto overscroll-contain relative shadow-2xl modal-panel-bottom"
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle — mobile only */}
        <div className="sm:hidden sticky top-0 z-10 pt-3 pb-1 bg-white rounded-t-2xl">
          <div className="w-10 h-1 bg-border rounded-full mx-auto" />
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
          aria-label="Tutup"
        >
          <X size={18} />
        </button>

        {/* Image */}
        {shop.photo ? (
          <img
            src={shop.photo}
            alt={shop.name}
            className="w-full h-52 sm:h-72 object-cover"
            onError={e => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-44 sm:h-56 bg-cream flex items-center justify-center text-muted text-sm">
            Tidak ada foto
          </div>
        )}

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5 modal-content">
          {/* Title & Badges */}
          <div>
            <h2 className="font-display text-2xl sm:text-3xl text-primary leading-tight">{shop.name}</h2>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-sm font-medium text-amber-600">
                <Star size={14} className="fill-amber-500 text-amber-500" />
                {shop.rating || 0} ({shop.reviewCount || 0} ulasan)
              </span>
              {shop.area && (
                <span className="text-xs font-medium text-primary bg-cream px-2.5 py-1 rounded-lg">{shop.area}</span>
              )}
            </div>
            {shop.tags?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {shop.tags.map((tag, i) => (
                  <span key={i} className="text-xs text-muted bg-surface-alt px-2.5 py-1 rounded-lg">{tag}</span>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-text-secondary leading-relaxed">
            {shop.description || 'Belum ada deskripsi.'}
          </p>

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <InfoItem icon={MapPin} label="Lokasi" value={`${shop.location}${shop.area ? `, ${shop.area}` : ''}`} />
            <InfoItem icon={Clock} label="Jam Buka" value={shop.hours || '-'} />
            <InfoItem icon={Star} label="Harga" value={`Rp${((shop.priceMin||0)/1000).toFixed(0)}k - Rp${((shop.priceMax||0)/1000).toFixed(0)}k`} />
          </div>

          {/* Rating Section */}
          <div className="p-4 rounded-2xl bg-cream/50 border border-cream-dark">
            <div className="text-xs font-semibold text-primary uppercase tracking-wide mb-3">Beri Rating</div>
            <div className="flex items-center gap-2.5 flex-wrap">
              {[1, 2, 3, 4, 5].map(r => (
                <button
                  key={r}
                  onClick={() => handleRate(r)}
                  disabled={ratingLoading}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
                    r <= userRating
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-white border border-border text-muted hover:border-amber-300 hover:text-amber-500'
                  } disabled:opacity-50`}
                  aria-label={`Beri ${r} bintang`}
                >
                  <Star size={18} className={r <= userRating ? 'fill-current' : ''} />
                </button>
              ))}
              {ratingLoading && <span className="text-xs text-muted ml-1">Menyimpan...</span>}
            </div>
            {ratingStatus && <p className="mt-2.5 text-xs font-medium text-primary">{ratingStatus}</p>}
          </div>

          {/* Share buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleWhatsAppShare}
              className="flex-1 h-12 inline-flex items-center justify-center gap-2 text-sm font-semibold text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-100 active:scale-95 transition-transform"
            >
              <Share2 size={16} /> WhatsApp
            </button>
            <button
              onClick={handleCopyLink}
              className="flex-1 h-12 inline-flex items-center justify-center gap-2 text-sm font-semibold text-text-secondary bg-surface-alt rounded-xl border border-border active:scale-95 transition-transform"
            >
              {copied
                ? <><Check size={16} className="text-emerald-500" /> Tersalin!</>
                : <><Copy size={16} /> Salin Link</>
              }
            </button>
            {navigator.share && (
              <button
                onClick={handleShare}
                className="h-12 w-12 flex items-center justify-center rounded-xl border border-border bg-surface-alt active:scale-95 transition-transform"
                aria-label="Share"
              >
                <Share2 size={18} className="text-text-secondary" />
              </button>
            )}
          </div>

          {/* Action Buttons */}
          {hasLinks && (
            <div className="space-y-3 pt-1 pb-2">
              {shop.mapsUrl && (
                <a
                  href={shop.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-14 inline-flex items-center justify-center gap-3 text-base font-semibold text-cream bg-primary rounded-2xl active:scale-[0.97] transition-transform shadow-sm"
                >
                  <Navigation size={20} />
                  Buka di Google Maps
                </a>
              )}
              {shop.instagram && (
                <a
                  href={shop.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-14 inline-flex items-center justify-center gap-3 text-base font-semibold text-primary bg-cream rounded-2xl border-2 border-cream-dark active:scale-[0.97] transition-transform"
                >
                  <Camera size={20} />
                  Lihat Instagram
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-alt border border-border-light">
      <Icon size={16} className="text-primary/60 mt-0.5 shrink-0" />
      <div>
        <div className="text-[11px] font-medium text-muted uppercase tracking-wide">{label}</div>
        <div className="text-sm font-medium text-text-main mt-0.5">{value}</div>
      </div>
    </div>
  );
}
