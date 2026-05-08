import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Heart, Lock, Mail, Save, Star, UserRoundCog } from 'lucide-react';
import CoffeeModal from '../components/CoffeeModal';
import { useAuth } from '../contexts/auth-context';
import { supabase } from '../lib/supabase';
import { normalizeCoffeeShops } from '../lib/coffee-shop-mapper';

export default function Account() {
  const { user, loading: authLoading, favorites } = useAuth();

  if (authLoading) return <div className="p-12 text-center text-muted font-bold">Memuat akun...</div>;
  if (!user) return <Navigate to="/" replace />;

  return <AccountContent user={user} favoriteIds={favorites} />;
}

function AccountContent({ user, favoriteIds }) {
  const [name, setName] = useState(user.user_metadata?.full_name || '');
  const [email, setEmail] = useState(user.email || '');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [favoriteShops, setFavoriteShops] = useState([]);
  const [favoritesExpanded, setFavoritesExpanded] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);
  const [ratings, setRatings] = useState([]);
  const visibleFavoriteShops = favoritesExpanded ? favoriteShops : favoriteShops.slice(0, 3);

  const initials = useMemo(() => {
    const source = name || email || 'User';
    return source.trim().split(/\s+/).slice(0, 2).map(word => word[0]?.toUpperCase()).join('');
  }, [name, email]);

  useEffect(() => {
    let cancelled = false;

    const loadAccountData = async () => {
      if (!supabase) return;

      if (favoriteIds.length > 0) {
        const { data } = await supabase
          .from('coffee_shops')
          .select('*')
          .in('id', favoriteIds);

        if (!cancelled) setFavoriteShops(normalizeCoffeeShops(data || []));
      } else if (!cancelled) {
        setFavoriteShops([]);
      }

      const { data: ratingRows } = await supabase
        .from('coffee_shop_ratings')
        .select('rating, updated_at, coffee_shop_id')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (!ratingRows?.length) {
        if (!cancelled) setRatings([]);
        return;
      }

      const shopIds = ratingRows.map(row => row.coffee_shop_id);
      const { data: shops } = await supabase
        .from('coffee_shops')
        .select('id,name,area,photo')
        .in('id', shopIds);

      const shopMap = new Map(normalizeCoffeeShops(shops || []).map(shop => [shop.id, shop]));
      const mergedRatings = ratingRows.map(row => ({
        ...row,
        shop: shopMap.get(row.coffee_shop_id),
      }));

      if (!cancelled) setRatings(mergedRatings);
    };

    loadAccountData();

    return () => {
      cancelled = true;
    };
  }, [favoriteIds, user.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!supabase) return;

    setSaving(true);
    setStatus('');

    const updates = {
      data: { full_name: name },
    };

    if (email && email !== user.email) updates.email = email;
    if (password) updates.password = password;

    const { error } = await supabase.auth.updateUser(updates);

    if (error) {
      setStatus(error.message);
    } else {
      setPassword('');
      setStatus(email !== user.email ? 'Profil tersimpan. Cek email untuk konfirmasi perubahan email.' : 'Profil tersimpan.');
    }

    setSaving(false);
  };

  const handleShopUpdated = (updatedShop) => {
    setFavoriteShops(currentShops => currentShops.map(shop => (
      shop.id === updatedShop.id ? updatedShop : shop
    )));
    setSelectedShop(updatedShop);
  };

  return (
    <>
      <main className="w-[min(1120px,calc(100%-1rem))] sm:w-[min(1120px,calc(100%-1.5rem))] mx-auto py-6 sm:py-8">
        <section className="rounded-[28px] bg-white border border-primary/10 shadow-[0_18px_44px_rgba(52,19,20,0.08)] overflow-hidden">
        <div className="bg-[linear-gradient(135deg,#431417,#ff1818_58%,#2cb5a7)] p-5 sm:p-7 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-3xl bg-white text-primary text-xl font-black shadow-lg">
              {initials}
            </div>
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-xs font-black uppercase tracking-wide">
                <UserRoundCog size={14} />
                Akun Saya
              </div>
              <h2 className="font-display text-3xl sm:text-4xl leading-none mt-2 text-white">Kelola profil dan aktivitasmu</h2>
              <p className="text-white/78 font-bold mt-1">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_0.9fr] gap-5 p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="rounded-3xl border border-primary/10 bg-[#fff9f7] p-4 sm:p-5 flex flex-col gap-4">
            <div>
              <h3 className="font-display text-2xl text-[#431417] leading-none">Kostumisasi Akun</h3>
              <p className="text-sm font-bold text-muted mt-1">Ubah nama, email, atau password akunmu.</p>
            </div>

            <label className="block">
              <span className="flex items-center gap-2 text-sm font-black text-[#58151c] mb-1">
                <UserRoundCog size={16} /> Nama
              </span>
              <input value={name} onChange={e => setName(e.target.value)} className="w-full min-h-[48px] rounded-2xl border border-primary/15 bg-white px-3 font-bold outline-none focus:border-[#2cb5a7] focus:ring-4 focus:ring-[#2cb5a7]/12" />
            </label>

            <label className="block">
              <span className="flex items-center gap-2 text-sm font-black text-[#58151c] mb-1">
                <Mail size={16} /> Email
              </span>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full min-h-[48px] rounded-2xl border border-primary/15 bg-white px-3 font-bold outline-none focus:border-[#2cb5a7] focus:ring-4 focus:ring-[#2cb5a7]/12" />
            </label>

            <label className="block">
              <span className="flex items-center gap-2 text-sm font-black text-[#58151c] mb-1">
                <Lock size={16} /> Password Baru
              </span>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Kosongkan jika tidak diganti" className="w-full min-h-[48px] rounded-2xl border border-primary/15 bg-white px-3 font-bold outline-none focus:border-[#2cb5a7] focus:ring-4 focus:ring-[#2cb5a7]/12" />
            </label>

            {status && <p className="text-sm font-bold text-[#8c232b]">{status}</p>}

            <button disabled={saving} className="inline-flex items-center justify-center gap-2 min-h-[50px] rounded-2xl bg-primary text-white font-black hover:bg-accent-dark transition-colors disabled:opacity-70">
              <Save size={17} />
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </form>

          <div className="grid gap-5">
            <section className="rounded-3xl border border-primary/10 bg-white p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3 mb-3">
                <h3 className="font-display text-2xl leading-none text-[#431417]">Favorit</h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#fff0ed] px-3 py-1 text-xs font-black text-accent-dark">
                  <Heart size={14} /> {favoriteShops.length}
                </span>
              </div>
              <div className="grid gap-2">
                {favoriteShops.length === 0 ? (
                  <p className="text-sm font-bold text-muted">Belum ada favorit.</p>
                ) : visibleFavoriteShops.map(shop => (
                  <button
                    key={shop.id}
                    type="button"
                    onClick={() => setSelectedShop(shop)}
                    className="flex w-full items-center gap-3 rounded-2xl bg-[#fff9f7] p-3 text-left transition-all hover:-translate-y-0.5 hover:bg-[#fff0ed] hover:shadow-[0_12px_24px_rgba(255,24,24,0.10)] focus:outline-none focus:ring-4 focus:ring-primary/15"
                  >
                    {shop.photo && <img src={shop.photo} alt={shop.name} className="h-12 w-12 rounded-xl object-cover" />}
                    <div className="min-w-0 flex-1">
                      <div className="font-black text-[#431417] leading-tight">{shop.name}</div>
                      <div className="text-xs font-bold text-muted">{shop.area}</div>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-accent-dark shadow-sm">
                      Detail
                    </span>
                  </button>
                ))}
              </div>
              {favoriteShops.length > 3 && (
                <button
                  type="button"
                  onClick={() => setFavoritesExpanded(isExpanded => !isExpanded)}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/12 bg-white px-4 py-3 text-sm font-black text-accent-dark transition-colors hover:bg-[#fff8f6]"
                >
                  {favoritesExpanded ? (
                    <>
                      <ChevronUp size={16} />
                      Tampilkan lebih sedikit
                    </>
                  ) : (
                    <>
                      <ChevronDown size={16} />
                      Lihat semua favorit ({favoriteShops.length})
                    </>
                  )}
                </button>
              )}
            </section>

            <section className="rounded-3xl border border-primary/10 bg-white p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3 mb-3">
                <h3 className="font-display text-2xl leading-none text-[#431417]">Rating Saya</h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#f7f2ff] px-3 py-1 text-xs font-black text-[#5b3f91]">
                  <Star size={14} /> {ratings.length}
                </span>
              </div>
              <div className="grid gap-2">
                {ratings.length === 0 ? (
                  <p className="text-sm font-bold text-muted">Belum ada rating.</p>
                ) : ratings.map(row => (
                  <div key={row.coffee_shop_id} className="flex items-center justify-between gap-3 rounded-2xl bg-[#fff9f7] p-3">
                    <div>
                      <div className="font-black text-[#431417] leading-tight">{row.shop?.name || 'Coffee shop'}</div>
                      <div className="text-xs font-bold text-muted">{row.shop?.area || '-'}</div>
                    </div>
                    <div className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-sm font-black text-[#431417]">
                      <Star size={14} className="fill-[#f5a623] text-[#f5a623]" />
                      {row.rating}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
        </section>
      </main>

      <CoffeeModal
        shop={selectedShop}
        isOpen={Boolean(selectedShop)}
        onClose={() => setSelectedShop(null)}
        onShopUpdated={handleShopUpdated}
      />
    </>
  );
}
