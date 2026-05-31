import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Heart, Lock, Mail, Save, Star, User } from 'lucide-react';
import CoffeeModal from '../components/CoffeeModal';
import { useAuth } from '../contexts/auth-context';
import { supabase } from '../lib/supabase';
import { normalizeCoffeeShops } from '../lib/coffee-shop-mapper';

export default function Account() {
  const { user, loading: authLoading, favorites } = useAuth();
  if (authLoading) return <div className="p-12 text-center text-muted text-sm">Memuat akun...</div>;
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
  const visibleFavoriteShops = favoritesExpanded ? favoriteShops : favoriteShops.slice(0, 4);

  const initials = useMemo(() => {
    const source = name || email || 'U';
    return source.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('');
  }, [name, email]);

  useEffect(() => {
    let cancelled = false;
    const loadAccountData = async () => {
      if (!supabase) return;
      if (favoriteIds.length > 0) {
        const { data } = await supabase.from('coffee_shops').select('*').in('id', favoriteIds);
        if (!cancelled) setFavoriteShops(normalizeCoffeeShops(data || []));
      } else if (!cancelled) { setFavoriteShops([]); }

      const { data: ratingRows } = await supabase.from('coffee_shop_ratings').select('rating, updated_at, coffee_shop_id').eq('user_id', user.id).order('updated_at', { ascending: false });
      if (!ratingRows?.length) { if (!cancelled) setRatings([]); return; }
      const shopIds = ratingRows.map(r => r.coffee_shop_id);
      const { data: shops } = await supabase.from('coffee_shops').select('id,name,area,photo').in('id', shopIds);
      const shopMap = new Map(normalizeCoffeeShops(shops || []).map(s => [s.id, s]));
      if (!cancelled) setRatings(ratingRows.map(r => ({ ...r, shop: shopMap.get(r.coffee_shop_id) })));
    };
    loadAccountData();
    return () => { cancelled = true; };
  }, [favoriteIds, user.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!supabase) return;
    setSaving(true); setStatus('');
    const updates = { data: { full_name: name } };
    if (email && email !== user.email) updates.email = email;
    if (password) updates.password = password;
    const { error } = await supabase.auth.updateUser(updates);
    if (error) { setStatus(error.message); }
    else { setPassword(''); setStatus(email !== user.email ? 'Profil tersimpan. Cek email untuk konfirmasi.' : 'Profil tersimpan.'); }
    setSaving(false);
  };

  const handleShopUpdated = (updatedShop) => {
    setFavoriteShops(s => s.map(shop => shop.id === updatedShop.id ? updatedShop : shop));
    setSelectedShop(updatedShop);
  };

  return (
    <>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-bold">
            {initials}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-main">Akun Saya</h1>
            <p className="text-sm text-text-secondary">{user.email}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
          {/* Profile Form */}
          <section className="bg-white rounded-2xl border border-border p-5 sm:p-6">
            <h2 className="font-semibold text-lg text-text-main mb-4">Edit Profil</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-text-main mb-1.5">
                  <User size={14} /> Nama
                </label>
                <input value={name} onChange={e => setName(e.target.value)} className="w-full h-10 px-3 text-sm border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all" />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-text-main mb-1.5">
                  <Mail size={14} /> Email
                </label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full h-10 px-3 text-sm border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all" />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-text-main mb-1.5">
                  <Lock size={14} /> Password Baru
                </label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Kosongkan jika tidak diganti" className="w-full h-10 px-3 text-sm border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all" />
              </div>
              {status && <p className="text-sm font-medium text-primary">{status}</p>}
              <button disabled={saving} className="w-full h-10 flex items-center justify-center gap-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-60">
                <Save size={15} />
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </form>
          </section>

          {/* Right column */}
          <div className="space-y-6">
            {/* Favorites */}
            <section className="bg-white rounded-2xl border border-border p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg text-text-main">Favorit</h2>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary/5 px-2.5 py-1 rounded-full">
                  <Heart size={12} /> {favoriteShops.length}
                </span>
              </div>
              {favoriteShops.length === 0 ? (
                <p className="text-sm text-muted">Belum ada favorit.</p>
              ) : (
                <div className="space-y-2">
                  {visibleFavoriteShops.map(shop => (
                    <button
                      key={shop.id}
                      onClick={() => setSelectedShop(shop)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-surface-alt hover:bg-border-light transition-colors text-left"
                    >
                      {shop.photo && <img src={shop.photo} alt={shop.name} className="h-10 w-10 rounded-lg object-cover" />}
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm text-text-main truncate">{shop.name}</div>
                        <div className="text-xs text-muted">{shop.area}</div>
                      </div>
                    </button>
                  ))}
                  {favoriteShops.length > 4 && (
                    <button onClick={() => setFavoritesExpanded(v => !v)} className="w-full flex items-center justify-center gap-1.5 h-9 text-xs font-semibold text-primary hover:bg-primary/5 rounded-lg transition-colors">
                      {favoritesExpanded ? <><ChevronUp size={14} /> Sembunyikan</> : <><ChevronDown size={14} /> Lihat semua ({favoriteShops.length})</>}
                    </button>
                  )}
                </div>
              )}
            </section>

            {/* Ratings */}
            <section className="bg-white rounded-2xl border border-border p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg text-text-main">Rating Saya</h2>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                  <Star size={12} /> {ratings.length}
                </span>
              </div>
              {ratings.length === 0 ? (
                <p className="text-sm text-muted">Belum ada rating.</p>
              ) : (
                <div className="space-y-2">
                  {ratings.map(row => (
                    <div key={row.coffee_shop_id} className="flex items-center justify-between p-3 rounded-xl bg-surface-alt">
                      <div>
                        <div className="font-medium text-sm text-text-main">{row.shop?.name || 'Coffee shop'}</div>
                        <div className="text-xs text-muted">{row.shop?.area || '-'}</div>
                      </div>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-600">
                        <Star size={13} className="fill-amber-500 text-amber-500" /> {row.rating}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <CoffeeModal shop={selectedShop} isOpen={Boolean(selectedShop)} onClose={() => setSelectedShop(null)} onShopUpdated={handleShopUpdated} />
    </>
  );
}
