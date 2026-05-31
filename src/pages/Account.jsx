import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Heart, Lock, Mail, Save, Star, User } from 'lucide-react';
import CoffeeModal from '../components/CoffeeModal';
import { useAuth } from '../contexts/auth-context';
import { supabase } from '../lib/supabase';
import { normalizeCoffeeShops } from '../lib/coffee-shop-mapper';

export default function Account() {
  const { user, loading: authLoading, favorites } = useAuth();
  if (authLoading) return <div className="p-12 text-center text-muted text-sm">Memuat...</div>;
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
  const [selectedShop, setSelectedShop] = useState(null);
  const [ratings, setRatings] = useState([]);

  const initials = useMemo(() => {
    const s = name || email || 'U';
    return s.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('');
  }, [name, email]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!supabase) return;
      if (favoriteIds.length > 0) {
        const { data } = await supabase.from('coffee_shops').select('*').in('id', favoriteIds);
        if (!cancelled) setFavoriteShops(normalizeCoffeeShops(data || []));
      } else if (!cancelled) setFavoriteShops([]);
      const { data: rows } = await supabase.from('coffee_shop_ratings').select('rating, coffee_shop_id').eq('user_id', user.id).order('updated_at', { ascending: false });
      if (!rows?.length) { if (!cancelled) setRatings([]); return; }
      const ids = rows.map(r => r.coffee_shop_id);
      const { data: shops } = await supabase.from('coffee_shops').select('id,name,area,photo').in('id', ids);
      const map = new Map(normalizeCoffeeShops(shops || []).map(s => [s.id, s]));
      if (!cancelled) setRatings(rows.map(r => ({ ...r, shop: map.get(r.coffee_shop_id) })));
    };
    load();
    return () => { cancelled = true; };
  }, [favoriteIds, user.id]);


  const handleSubmit = async (e) => {
    e.preventDefault(); if (!supabase) return;
    setSaving(true); setStatus('');
    const updates = { data: { full_name: name } };
    if (email && email !== user.email) updates.email = email;
    if (password) updates.password = password;
    const { error } = await supabase.auth.updateUser(updates);
    if (error) setStatus(error.message);
    else { setPassword(''); setStatus('Tersimpan!'); }
    setSaving(false);
  };

  const handleShopUpdated = (u) => {
    setFavoriteShops(s => s.map(shop => shop.id === u.id ? u : shop));
    setSelectedShop(u);
  };

  return (
    <>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-24 md:pb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-cream text-primary flex items-center justify-center text-base font-bold">{initials}</div>
          <div>
            <h1 className="font-display text-xl text-primary">Akun Saya</h1>
            <p className="text-xs text-muted">{user.email}</p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Profile Form */}
          <section className="bg-white rounded-2xl border border-border p-5">
            <h2 className="font-semibold text-base text-text-main mb-4">Edit Profil</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div><label className="text-sm font-medium text-text-main mb-1 flex items-center gap-1.5"><User size={14} />Nama</label><input value={name} onChange={e=>setName(e.target.value)} className="w-full h-12 px-4 text-sm border border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none" /></div>
              <div><label className="text-sm font-medium text-text-main mb-1 flex items-center gap-1.5"><Mail size={14} />Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full h-12 px-4 text-sm border border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none" /></div>
              <div><label className="text-sm font-medium text-text-main mb-1 flex items-center gap-1.5"><Lock size={14} />Password Baru</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Kosongkan jika tidak diganti" className="w-full h-12 px-4 text-sm border border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none" /></div>
              {status && <p className="text-sm font-medium text-primary">{status}</p>}
              <button disabled={saving} className="w-full h-12 flex items-center justify-center gap-2 text-sm font-semibold text-cream bg-primary rounded-xl active:scale-[0.98] transition-transform disabled:opacity-60"><Save size={15}/>{saving?'Menyimpan...':'Simpan'}</button>
            </form>
          </section>


          {/* Favorites */}
          <section className="bg-white rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-base text-text-main">Favorit</h2>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-cream px-2.5 py-1 rounded-full"><Heart size={12} />{favoriteShops.length}</span>
            </div>
            {favoriteShops.length === 0 ? <p className="text-sm text-muted">Belum ada favorit.</p> : (
              <div className="space-y-2">
                {favoriteShops.map(shop => (
                  <button key={shop.id} onClick={() => setSelectedShop(shop)} className="w-full flex items-center gap-3 p-3 rounded-xl bg-surface-alt hover:bg-cream/50 active:scale-[0.98] transition-all text-left">
                    {shop.photo && <img src={shop.photo} alt={shop.name} className="h-10 w-10 rounded-lg object-cover" />}
                    <div className="min-w-0 flex-1"><div className="font-medium text-sm text-text-main truncate">{shop.name}</div><div className="text-xs text-muted">{shop.area}</div></div>
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Ratings */}
          <section className="bg-white rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-base text-text-main">Rating Saya</h2>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full"><Star size={12} />{ratings.length}</span>
            </div>
            {ratings.length === 0 ? <p className="text-sm text-muted">Belum ada rating.</p> : (
              <div className="space-y-2">
                {ratings.map(row => (
                  <div key={row.coffee_shop_id} className="flex items-center justify-between p-3 rounded-xl bg-surface-alt">
                    <div><div className="font-medium text-sm text-text-main">{row.shop?.name || 'Coffee shop'}</div><div className="text-xs text-muted">{row.shop?.area || '-'}</div></div>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-600"><Star size={13} className="fill-amber-500 text-amber-500" />{row.rating}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <CoffeeModal shop={selectedShop} isOpen={Boolean(selectedShop)} onClose={() => setSelectedShop(null)} onShopUpdated={handleShopUpdated} />
    </>
  );
}
