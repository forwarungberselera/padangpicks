import { useState, useCallback, useEffect, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { Building2, Coffee, Edit2, Image, Link as LinkIcon, MapPin, Plus, Save, Search, Shield, Sparkles, Star, Trash2, X } from 'lucide-react';
import { useAuth } from '../contexts/auth-context';
import { supabase } from '../lib/supabase';
import { normalizeCoffeeShops, serializeCoffeeShop } from '../lib/coffee-shop-mapper.js';

const contentTypes = {
  coffee: { label: 'Coffee Shop', plural: 'Coffee Shops', table: 'coffee_shops', icon: Coffee, categoryOptions: ['Cafe', 'Coffee Shop', 'Bakery', 'Restaurant', 'Coworking'], emptyText: 'Belum ada coffee shop.' },
  hotel: { label: 'Hotel', plural: 'Hotels', table: 'hotels', icon: Building2, categoryOptions: ['Hotel', 'Resort', 'Homestay', 'Guest House', 'Villa'], emptyText: 'Belum ada hotel.' },
  lifestyle: { label: 'Lifestyle', plural: 'Lifestyle', table: 'lifestyle_places', icon: Sparkles, categoryOptions: ['Wisata', 'Kuliner', 'Belanja', 'Event', 'Wellness', 'Culture'], emptyText: 'Belum ada lifestyle item.' },
};

const emptyFormData = { name: '', itemCategory: '', area: '', location: '', priceMin: '', priceMax: '', priceCategory: 'budget', openHour: '', closeHour: '', hours: '', tags: '', photo: '', description: '', mapsUrl: '', instagram: '', bookingUrl: '', secondaryUrl: '', secondaryLabel: '', rating: '', reviewCount: '', isFeatured: false };

const defaultIntroSettings = { enabled: true, title: 'Selamat datang di PadangPicks', body: 'PadangPicks adalah direktori kurasi untuk menemukan coffee shop, hotel, dan lifestyle spot pilihan di Kota Padang.', buttonLabel: 'Mulai Jelajah' };

const toNumber = (v, fb = 0) => { const n = Number(v); return Number.isFinite(n) ? n : fb; };

export default function Admin() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [activeType, setActiveType] = useState('coffee');
  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({ coffee: 0, hotel: 0, lifestyle: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyFormData);
  const [introSettings, setIntroSettings] = useState(defaultIntroSettings);
  const [savingIntro, setSavingIntro] = useState(false);

  const activeConfig = contentTypes[activeType];
  const ActiveIcon = activeConfig.icon;

  const loadCounts = useCallback(async () => {
    if (!supabase) return;
    const entries = await Promise.all(Object.entries(contentTypes).map(async ([key, config]) => {
      const { count } = await supabase.from(config.table).select('id', { count: 'exact', head: true });
      return [key, count || 0];
    }));
    setCounts(Object.fromEntries(entries));
  }, []);

  const loadData = useCallback(async (type = activeType) => {
    if (!supabase) { setLoading(false); return; }
    setLoading(true); setStatus('');
    const config = contentTypes[type];
    const { data, error } = await supabase.from(config.table).select('*').order('created_at', { ascending: false });
    setItems(error ? [] : normalizeCoffeeShops(data || []));
    if (error) setStatus(`Gagal memuat: ${error.message}`);
    setLoading(false);
    loadCounts();
  }, [activeType, loadCounts]);

  const loadIntroSettings = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase.from('app_settings').select('value').eq('key', 'intro_popup').maybeSingle();
    if (data?.value) setIntroSettings({ ...defaultIntroSettings, ...data.value });
  }, []);

  useEffect(() => {
    if (authLoading || !isAdmin) return;
    loadData(activeType);
    loadIntroSettings();
  }, [authLoading, isAdmin, activeType, loadData, loadIntroSettings]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(item => [item.name, item.area, item.location, item.itemCategory, ...(item.tags || [])].filter(Boolean).some(v => String(v).toLowerCase().includes(q)));
  }, [items, search]);

  if (authLoading) return <div className="p-12 text-center text-muted text-sm">Memeriksa akses...</div>;
  if (!user || !isAdmin) return <Navigate to="/" replace />;

  const setField = (f, v) => setFormData(c => ({ ...c, [f]: v }));
  const setIntroField = (f, v) => setIntroSettings(c => ({ ...c, [f]: v }));

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setFormData({ ...emptyFormData, ...item, tags: Array.isArray(item.tags) ? item.tags.join(', ') : '', priceMin: item.priceMin ?? '', priceMax: item.priceMax ?? '', openHour: item.openHour ?? '', closeHour: item.closeHour ?? '', rating: item.rating ?? '', reviewCount: item.reviewCount ?? '', isFeatured: Boolean(item.isFeatured) });
    } else {
      setEditingId(null);
      setFormData({ ...emptyFormData, itemCategory: activeConfig.categoryOptions[0] });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!supabase) return;
    setSaving(true); setStatus('');
    const payload = serializeCoffeeShop({ name: formData.name, itemCategory: formData.itemCategory, area: formData.area, location: formData.location, priceMin: toNumber(formData.priceMin), priceMax: toNumber(formData.priceMax), priceCategory: formData.priceCategory, openHour: toNumber(formData.openHour), closeHour: toNumber(formData.closeHour, 24), hours: formData.hours, tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [], photo: formData.photo, description: formData.description, mapsUrl: formData.mapsUrl, instagram: formData.instagram, bookingUrl: formData.bookingUrl, secondaryUrl: formData.secondaryUrl, secondaryLabel: formData.secondaryLabel, rating: toNumber(formData.rating), reviewCount: Math.max(0, Math.round(toNumber(formData.reviewCount))), isFeatured: formData.isFeatured });
    const request = editingId ? supabase.from(activeConfig.table).update(payload).eq('id', editingId) : supabase.from(activeConfig.table).insert([payload]);
    const { error } = await request;
    if (error) { setStatus(`Gagal: ${error.message}`); }
    else { setIsModalOpen(false); setEditingId(null); setFormData(emptyFormData); setStatus('Berhasil disimpan.'); loadData(activeType); }
    setSaving(false);
  };

  const handleDelete = async (id, name) => {
    if (!supabase || !window.confirm(`Hapus "${name}"?`)) return;
    const { error } = await supabase.from(activeConfig.table).delete().eq('id', id);
    setStatus(error ? `Gagal: ${error.message}` : 'Berhasil dihapus.');
    if (!error) loadData(activeType);
  };

  const handleIntroSubmit = async (e) => {
    e.preventDefault();
    if (!supabase) return;
    setSavingIntro(true); setStatus('');
    const { error } = await supabase.from('app_settings').upsert({ key: 'intro_popup', value: introSettings, updated_at: new Date().toISOString() });
    setSavingIntro(false);
    setStatus(error ? `Gagal: ${error.message}` : 'Popup berhasil diperbarui.');
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-primary mb-1">
            <Shield size={16} />
            <span className="text-xs font-semibold uppercase tracking-wide">Admin Panel</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-main">Kelola PadangPicks</h1>
        </div>
        <button onClick={() => handleOpenModal()} className="h-10 px-5 inline-flex items-center gap-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors">
          <Plus size={16} /> Tambah {activeConfig.label}
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 p-1 bg-surface-alt rounded-lg w-fit mb-6">
        {Object.entries(contentTypes).map(([key, config]) => {
          const Icon = config.icon;
          return (
            <button key={key} onClick={() => setActiveType(key)} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${activeType === key ? 'bg-white text-text-main shadow-sm' : 'text-muted hover:text-text-secondary'}`}>
              <Icon size={15} /> {config.plural} <span className="text-xs text-muted ml-1">({counts[key] || 0})</span>
            </button>
          );
        })}
      </div>

      {status && <div className="mb-4 p-3 rounded-lg bg-surface-alt border border-border text-sm font-medium text-text-main">{status}</div>}

      <div className="grid lg:grid-cols-[1fr_280px] gap-6">
        {/* Table */}
        <section className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="font-semibold text-text-main">{activeConfig.plural}</h2>
            <label className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari..." className="h-9 pl-8 pr-3 text-sm border border-border rounded-lg bg-white focus:border-primary outline-none transition-all w-full sm:w-60" />
            </label>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-alt border-b border-border text-xs font-medium text-muted uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3">Listing</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Area</th>
                  <th className="px-4 py-3">Harga</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="px-4 py-8 text-center text-muted">Memuat...</td></tr>
                ) : filteredItems.length === 0 ? (
                  <tr><td colSpan="6" className="px-4 py-8 text-center text-muted">{activeConfig.emptyText}</td></tr>
                ) : filteredItems.map(item => (
                  <tr key={item.id} className="border-b border-border-light hover:bg-surface-alt/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {item.photo ? <img src={item.photo} alt="" className="h-10 w-10 rounded-lg object-cover" /> : <div className="h-10 w-10 rounded-lg bg-surface-alt flex items-center justify-center"><Image size={14} className="text-muted" /></div>}
                        <div className="min-w-0">
                          <div className="font-medium text-text-main truncate max-w-[180px]">{item.name}</div>
                          <div className="text-xs text-muted truncate max-w-[180px]">{item.location || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{item.itemCategory || '-'}</td>
                    <td className="px-4 py-3 text-text-secondary">{item.area || '-'}</td>
                    <td className="px-4 py-3 font-medium">Rp{((item.priceMin || 0) / 1000).toFixed(0)}k</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
                        <Star size={12} className="fill-amber-500 text-amber-500" /> {item.rating || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-1.5">
                        <button onClick={() => handleOpenModal(item)} className="h-8 w-8 flex items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 transition-colors" aria-label="Edit">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(item.id, item.name)} className="h-8 w-8 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition-colors" aria-label="Hapus">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Sidebar */}
        <aside className="space-y-4">
          {/* Intro Popup Settings */}
          <form onSubmit={handleIntroSubmit} className="bg-white rounded-2xl border border-border p-5">
            <h3 className="font-semibold text-sm text-text-main mb-3 flex items-center gap-2">
              <Sparkles size={14} className="text-primary" /> Popup Awal
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-2.5 text-sm">
                <input type="checkbox" checked={introSettings.enabled} onChange={e => setIntroField('enabled', e.target.checked)} className="h-4 w-4 accent-primary rounded" />
                <span className="font-medium text-text-main">Aktifkan popup</span>
              </label>
              <Field label="Judul" value={introSettings.title} onChange={v => setIntroField('title', v)} />
              <Field label="Isi" as="textarea" value={introSettings.body} onChange={v => setIntroField('body', v)} />
              <Field label="Label Tombol" value={introSettings.buttonLabel} onChange={v => setIntroField('buttonLabel', v)} />
              <button type="submit" disabled={savingIntro} className="w-full h-9 text-sm font-semibold text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-60">
                <span className="flex items-center justify-center gap-1.5"><Save size={13} /> {savingIntro ? 'Menyimpan...' : 'Simpan'}</span>
              </button>
            </div>
          </form>
        </aside>
      </div>

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm sm:p-4 modal-backdrop">
          <div className="relative w-full max-w-3xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto bg-white rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 shadow-2xl modal-panel-bottom">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:bg-surface-alt transition-colors"><X size={18} /></button>

            <div className="mb-5 pr-10">
              <h3 className="text-xl font-bold text-text-main">{editingId ? 'Edit' : 'Tambah'} {activeConfig.label}</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 modal-content">
              {/* Identity */}
              <fieldset className="space-y-3 p-4 rounded-xl bg-surface-alt border border-border-light">
                <legend className="text-xs font-semibold text-muted uppercase tracking-wide flex items-center gap-1.5 px-1"><MapPin size={12} /> Identitas</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Nama Tempat" required value={formData.name} onChange={v => setField('name', v)} />
                  <SelectField label="Kategori" value={formData.itemCategory} onChange={v => setField('itemCategory', v)} options={activeConfig.categoryOptions} />
                  <Field label="Area" required value={formData.area} onChange={v => setField('area', v)} placeholder="Padang Barat" />
                  <Field label="Alamat" required value={formData.location} onChange={v => setField('location', v)} />
                </div>
                <Field label="Deskripsi" as="textarea" value={formData.description} onChange={v => setField('description', v)} />
              </fieldset>

              {/* Pricing & Hours */}
              <fieldset className="space-y-3 p-4 rounded-xl bg-surface-alt border border-border-light">
                <legend className="text-xs font-semibold text-muted uppercase tracking-wide flex items-center gap-1.5 px-1"><Star size={12} /> Harga & Jam</legend>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Field label="Harga Min" type="number" required value={formData.priceMin} onChange={v => setField('priceMin', v)} />
                  <Field label="Harga Max" type="number" required value={formData.priceMax} onChange={v => setField('priceMax', v)} />
                  <SelectField label="Level" value={formData.priceCategory} onChange={v => setField('priceCategory', v)} options={['budget', 'mid', 'premium']} />
                  <Field label="Jam Buka" type="number" step="0.5" required value={formData.openHour} onChange={v => setField('openHour', v)} />
                  <Field label="Jam Tutup" type="number" step="0.5" required value={formData.closeHour} onChange={v => setField('closeHour', v)} />
                  <Field label="Teks Jam" required value={formData.hours} onChange={v => setField('hours', v)} placeholder="08.00 - 22.00" />
                  <Field label="Rating" type="number" step="0.1" min="0" max="5" value={formData.rating} onChange={v => setField('rating', v)} />
                  <Field label="Ulasan" type="number" min="0" value={formData.reviewCount} onChange={v => setField('reviewCount', v)} />
                  <label className="flex items-center gap-2.5 h-10 mt-auto text-sm font-medium text-text-main">
                    <input type="checkbox" checked={formData.isFeatured} onChange={e => setField('isFeatured', e.target.checked)} className="h-4 w-4 accent-primary rounded" />
                    Featured
                  </label>
                </div>
              </fieldset>

              {/* Media & Links */}
              <fieldset className="space-y-3 p-4 rounded-xl bg-surface-alt border border-border-light">
                <legend className="text-xs font-semibold text-muted uppercase tracking-wide flex items-center gap-1.5 px-1"><LinkIcon size={12} /> Media & Link</legend>
                <Field label="Tags (koma)" value={formData.tags} onChange={v => setField('tags', v)} placeholder="Wi-Fi, Cozy, Outdoor" />
                <Field label="URL Foto" type="url" value={formData.photo} onChange={v => setField('photo', v)} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Google Maps" type="url" value={formData.mapsUrl} onChange={v => setField('mapsUrl', v)} />
                  <Field label="Instagram" type="url" value={formData.instagram} onChange={v => setField('instagram', v)} />
                  <Field label="Booking URL" type="url" value={formData.bookingUrl} onChange={v => setField('bookingUrl', v)} />
                  <Field label="URL Tambahan" type="url" value={formData.secondaryUrl} onChange={v => setField('secondaryUrl', v)} />
                  <Field label="Label URL Tambahan" value={formData.secondaryLabel} onChange={v => setField('secondaryLabel', v)} />
                </div>
              </fieldset>

              <button type="submit" disabled={saving} className="w-full h-11 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-60">
                <span className="flex items-center justify-center gap-2"><Save size={15} /> {saving ? 'Menyimpan...' : 'Simpan'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function Field({ label, value, onChange, as, ...props }) {
  const cls = 'w-full h-10 px-3 text-sm border border-border rounded-lg bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all';
  return (
    <label className="block">
      <span className="block text-xs font-medium text-text-secondary mb-1">{label}</span>
      {as === 'textarea' ? (
        <textarea rows="3" value={value} onChange={e => onChange(e.target.value)} className={`${cls} h-auto py-2`} {...props} />
      ) : (
        <input value={value} onChange={e => onChange(e.target.value)} className={cls} {...props} />
      )}
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-text-secondary mb-1">{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)} className="w-full h-10 px-3 text-sm border border-border rounded-lg bg-white focus:border-primary outline-none transition-all">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}
