import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Heart, Lock, Mail, Save, Star, Trash2, User, AlertTriangle } from 'lucide-react';
import CoffeeModal from '../components/CoffeeModal';
import { useAuth } from '../contexts/auth-context';
import { supabase } from '../lib/supabase';
import { normalizeCoffeeShops } from '../lib/coffee-shop-mapper';
import { useToast } from '../components/Toast';
import { usePageTitle } from '../hooks/usePageTitle';
import { useMetaDescription } from '../hooks/useMetaDescription';

export default function Account() {
  usePageTitle('Akun Saya');
  useMetaDescription('Kelola profil, favorit, dan rating coffee shop kamu di Harmonee.');
  const { user, loading: authLoading, favoriteIds = [] } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-muted text-sm">Memuat akun...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <AccountContent user={user} favoriteIds={favoriteIds || []} />;
}


function AccountContent({ user, favoriteIds }) {
  const toast = useToast();
  const [name, setName] = useState(user.user_metadata?.full_name || '');
  const [email, setEmail] = useState(user.email || '');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [favoriteShops, setFavoriteShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [deleting, setDeleting] = useState(false);

  const initials = useMemo(() => {
    const s = name || email || 'U';
    return s.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('');
  }, [name, email]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!supabase) return;
      if (favoriteIds && favoriteIds.length > 0) {
        const { data } = await supabase.from('coffee_shops').select('*').in('id', favoriteIds);
        if (!cancelled) setFavoriteShops(normalizeCoffeeShops(data || []));
      } else {
        if (!cancelled) setFavoriteShops([]);
      }
      const { data: rows } = await supabase.from('coffee_shop_ratings').select('rating, coffee_shop_id').eq('user_id', user.id).order('updated_at', { ascending: false });
      if (!rows || rows.length === 0) { if (!cancelled) setRatings([]); return; }
      const ids = rows.map(r => r.coffee_shop_id);
      const { data: shops } = await supabase.from('coffee_shops').select('id,name,area,photo').in('id', ids);
      const shopMap = new Map((normalizeCoffeeShops(shops || [])).map(s => [s.id, s]));
      if (!cancelled) setRatings(rows.map(r => ({ ...r, shop: shopMap.get(r.coffee_shop_id) })));
    };
    load();
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
    if (error) {
      setStatus(error.message);
      toast.error(error.message);
    } else {
      setPassword('');
      setStatus('Profil tersimpan!');
      toast.success('Profil berhasil disimpan!');
    }
    setSaving(false);
  };

  const handleShopUpdated = (u) => {
    setFavoriteShops(prev => prev.map(shop => shop.id === u.id ? u : shop));
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
          <section className="bg-white rounded-2xl border border-border p-5">
            <h2 className="font-semibold text-base text-text-main mb-4">Edit Profil</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div><label className="text-sm font-medium text-text-main mb-1.5 flex items-center gap-1.5"><User size={14} />Nama</label><input value={name} onChange={e=>setName(e.target.value)} className="w-full h-12 px-4 text-sm border border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none" /></div>
              <div><label className="text-sm font-medium text-text-main mb-1.5 flex items-center gap-1.5"><Mail size={14} />Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full h-12 px-4 text-sm border border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none" /></div>
              <div><label className="text-sm font-medium text-text-main mb-1.5 flex items-center gap-1.5"><Lock size={14} />Password Baru</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Kosongkan jika tidak diganti" className="w-full h-12 px-4 text-sm border border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none" /></div>
              {status && <p className="text-sm font-medium text-primary">{status}</p>}
              <button disabled={saving} className="w-full h-12 flex items-center justify-center gap-2 text-sm font-semibold text-cream bg-primary rounded-xl active:scale-[0.98] transition-transform disabled:opacity-60"><Save size={15}/>{saving?'Menyimpan...':'Simpan'}</button>
            </form>
          </section>
          <section className="bg-white rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between mb-3"><h2 className="font-semibold text-base text-text-main">Favorit</h2><span className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-cream px-2.5 py-1 rounded-full"><Heart size={12}/>{favoriteShops.length}</span></div>
            {favoriteShops.length === 0 ? <p className="text-sm text-muted">Belum ada favorit.</p> : (
              <div className="space-y-2">{favoriteShops.map(shop => (
                <button key={shop.id} onClick={() => setSelectedShop(shop)} className="w-full flex items-center gap-3 p-3 rounded-xl bg-surface-alt hover:bg-cream/50 active:scale-[0.98] transition-all text-left">
                  {shop.photo && <img src={shop.photo} alt={shop.name} className="h-10 w-10 rounded-lg object-cover" />}
                  <div className="min-w-0 flex-1"><div className="font-medium text-sm text-text-main truncate">{shop.name}</div><div className="text-xs text-muted">{shop.area}</div></div>
                </button>
              ))}</div>
            )}
          </section>
          <section className="bg-white rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between mb-3"><h2 className="font-semibold text-base text-text-main">Rating Saya</h2><span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full"><Star size={12}/>{ratings.length}</span></div>
            {ratings.length === 0 ? <p className="text-sm text-muted">Belum ada rating.</p> : (
              <div className="space-y-2">{ratings.map(row => (
                <div key={row.coffee_shop_id} className="flex items-center justify-between p-3 rounded-xl bg-surface-alt">
                  <div><div className="font-medium text-sm text-text-main">{row.shop?.name || 'Coffee shop'}</div><div className="text-xs text-muted">{row.shop?.area || '-'}</div></div>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-600"><Star size={13} className="fill-amber-500 text-amber-500"/>{row.rating}</span>
                </div>
              ))}</div>
            )}
          </section>

          {/* Delete Account */}
          <section className="bg-white rounded-2xl border border-red-100 p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} className="text-red-500" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-base text-text-main">Hapus Akun</h2>
                <p className="text-xs text-muted mt-1 leading-relaxed">Semua data termasuk favorit dan rating akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.</p>
                <button
                  disabled={deleting}
                  onClick={async () => {
                    if (!window.confirm('Yakin ingin menghapus akun? Semua data akan hilang permanen.')) return;
                    if (!window.confirm('Ini TIDAK bisa dibatalkan. Lanjutkan hapus akun?')) return;
                    if (!supabase) return;
                    setDeleting(true);
                    try {
                      // 1. Hapus data relasi milik user
                      await supabase.from('favorites').delete().eq('user_id', user.id);
                      await supabase.from('coffee_shop_ratings').delete().eq('user_id', user.id);
                      await supabase.from('user_roles').delete().eq('user_id', user.id);

                      // 2. Coba hapus akun Auth via Edge Function
                      const { error: fnError } = await supabase.functions.invoke('delete-user', {
                        body: { user_id: user.id },
                      });

                      if (fnError) {
                        // Edge function belum ada — fallback: sign out saja dan beri tahu user
                        console.warn('delete-user function not available, signing out instead:', fnError.message);
                        toast.info('Data berhasil dihapus. Akun auth memerlukan penghapusan manual oleh admin.');
                        await supabase.auth.signOut();
                      } else {
                        toast.success('Akun berhasil dihapus.');
                      }
                    } catch (err) {
                      toast.error('Gagal menghapus akun: ' + err.message);
                    } finally {
                      setDeleting(false);
                      window.location.href = '/';
                    }
                  }}
                  className="mt-3 h-10 px-4 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 active:scale-95 transition-all disabled:opacity-60"
                >
                  <span className="flex items-center gap-1.5">
                    <Trash2 size={13} />
                    {deleting ? 'Menghapus...' : 'Hapus Akun Saya'}
                  </span>
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
      <CoffeeModal shop={selectedShop} isOpen={Boolean(selectedShop)} onClose={() => setSelectedShop(null)} onShopUpdated={handleShopUpdated} />
    </>
  );
}
