import { useState, useCallback, useEffect, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { Building2, Coffee, Edit2, Eye, Image, Link as LinkIcon, MapPin, MessageSquare, Plus, RefreshCw, Save, Search, Settings, Shield, Sparkles, Star, Trash2, X } from 'lucide-react';
import { useAuth } from '../contexts/auth-context';
import { supabase } from '../lib/supabase';
import { normalizeCoffeeShops, serializeCoffeeShop } from '../lib/coffee-shop-mapper.js';
import { usePageTitle } from '../hooks/usePageTitle';
import { useMetaDescription } from '../hooks/useMetaDescription';
import { useModalHistory } from '../hooks/useModalHistory';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

// Reactive hook for window width
function useWindowWidth() {
  const [width, setWidth] = useState(() => window.innerWidth);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
}

const contentTypes = {
  coffee: { label: 'Coffee Shop', plural: 'Coffee Shops', table: 'coffee_shops', icon: Coffee, categoryOptions: ['Cafe', 'Coffee Shop', 'Bakery', 'Restaurant', 'Coworking'], emptyText: 'Belum ada coffee shop.' },
  hotel: { label: 'Hotel', plural: 'Hotels', table: 'hotels', icon: Building2, categoryOptions: ['Hotel', 'Resort', 'Homestay', 'Guest House', 'Villa'], emptyText: 'Belum ada hotel.' },
  lifestyle: { label: 'Lifestyle', plural: 'Lifestyle', table: 'lifestyle_places', icon: Sparkles, categoryOptions: ['Wisata', 'Kuliner', 'Belanja', 'Event', 'Wellness', 'Culture'], emptyText: 'Belum ada lifestyle.' },
};


const emptyFormData = { name: '', itemCategory: '', area: '', location: '', priceMin: '', priceMax: '', priceCategory: 'budget', openHour: '', closeHour: '', hours: '', tags: '', photo: '', description: '', mapsUrl: '', instagram: '', bookingUrl: '', secondaryUrl: '', secondaryLabel: '', rating: '', reviewCount: '', isFeatured: false };
const defaultIntroSettings = { enabled: true, title: 'Selamat datang di Harmonee', body: 'Harmonee adalah direktori kurasi untuk menemukan coffee shop, hotel, dan lifestyle spot pilihan di Kota Padang.', buttonLabel: 'Mulai Jelajah' };
const toNumber = (v, fb = 0) => { const n = Number(v); return Number.isFinite(n) ? n : fb; };

export default function Admin() {
  usePageTitle('Admin Panel');
  useMetaDescription('Panel admin Harmonee — kelola coffee shop, hotel, lifestyle, dan saran tempat dari komunitas.');
  const { user, isAdmin, loading: authLoading } = useAuth();
  const windowWidth = useWindowWidth();
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
  const [showSettings, setShowSettings] = useState(false);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [activeTab, setActiveTab] = useState('content'); // 'content' | 'suggestions'
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionCount, setSuggestionCount] = useState(0);

  const activeConfig = contentTypes[activeType];

  // Back button closes modal; body scroll locked while form is open
  const handleCloseModal = useCallback(() => { setIsModalOpen(false); }, []);
  useModalHistory(isModalOpen, handleCloseModal);
  useBodyScrollLock(isModalOpen);


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

  const loadSuggestions = useCallback(async () => {
    if (!supabase) return;
    setSuggestionsLoading(true);
    const { data, error } = await supabase
      .from('place_suggestions')
      .select('*')
      .order('created_at', { ascending: false });
    setSuggestions(error ? [] : (data || []));
    setSuggestionsLoading(false);
  }, []);

  const loadSuggestionCount = useCallback(async () => {
    if (!supabase) return;
    const { count } = await supabase
      .from('place_suggestions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending');
    setSuggestionCount(count || 0);
  }, []);

  const handleSuggestionStatus = async (id, status) => {
    if (!supabase) return;
    const { error } = await supabase
      .from('place_suggestions')
      .update({ status })
      .eq('id', id);
    if (!error) {
      setSuggestions(prev => prev.map(s => s.id === id ? { ...s, status } : s));
      loadSuggestionCount();
    }
  };

  const handleDeleteSuggestion = async (id) => {
    if (!supabase || !window.confirm('Hapus saran ini?')) return;
    const { error } = await supabase.from('place_suggestions').delete().eq('id', id);
    if (!error) {
      setSuggestions(prev => prev.filter(s => s.id !== id));
      loadSuggestionCount();
    }
  };

  useEffect(() => {
    if (authLoading || !isAdmin) return;
    loadData(activeType);
    loadIntroSettings();
    loadSuggestionCount();
  }, [authLoading, isAdmin, activeType, loadData, loadIntroSettings, loadSuggestionCount]);

  useEffect(() => {
    if (authLoading || !isAdmin || activeTab !== 'suggestions') return;
    loadSuggestions();
  }, [authLoading, isAdmin, activeTab, loadSuggestions]);

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
    e.preventDefault(); if (!supabase) return;
    setSaving(true); setStatus('');
    const payload = serializeCoffeeShop({ name: formData.name, itemCategory: formData.itemCategory, area: formData.area, location: formData.location, priceMin: toNumber(formData.priceMin), priceMax: toNumber(formData.priceMax), priceCategory: formData.priceCategory, openHour: toNumber(formData.openHour), closeHour: toNumber(formData.closeHour, 24), hours: formData.hours, tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [], photo: formData.photo, description: formData.description, mapsUrl: formData.mapsUrl, instagram: formData.instagram, bookingUrl: formData.bookingUrl, secondaryUrl: formData.secondaryUrl, secondaryLabel: formData.secondaryLabel, rating: toNumber(formData.rating), reviewCount: Math.max(0, Math.round(toNumber(formData.reviewCount))), isFeatured: formData.isFeatured });
    const request = editingId ? supabase.from(activeConfig.table).update(payload).eq('id', editingId) : supabase.from(activeConfig.table).insert([payload]);
    const { error } = await request;
    if (error) { setStatus(`Gagal: ${error.message}`); }
    else { handleCloseModal(); setEditingId(null); setFormData(emptyFormData); setStatus('Berhasil disimpan.'); loadData(activeType); }
    setSaving(false);
  };

  const handleDelete = async (id, name) => {
    if (!supabase || !window.confirm(`Hapus "${name}"?`)) return;
    const { error } = await supabase.from(activeConfig.table).delete().eq('id', id);
    setStatus(error ? `Gagal: ${error.message}` : 'Berhasil dihapus.');
    if (!error) loadData(activeType);
  };

  const handleIntroSubmit = async (e) => {
    e.preventDefault(); if (!supabase) return;
    setSavingIntro(true); setStatus('');
    const { error } = await supabase.from('app_settings').upsert({ key: 'intro_popup', value: introSettings, updated_at: new Date().toISOString() });
    setSavingIntro(false);
    setStatus(error ? `Gagal: ${error.message}` : 'Popup berhasil diperbarui.');
  };


  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-8 pb-24 md:pb-12">
      {/* Header with stats */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 text-primary mb-1">
              <Shield size={16} />
              <span className="text-xs font-semibold uppercase tracking-wide">Admin Panel</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl text-primary">Kelola Harmonee</h1>
          </div>
          <button onClick={() => setShowSettings(!showSettings)} className="h-10 w-10 flex items-center justify-center rounded-xl border border-border bg-white hover:bg-surface-alt active:scale-95 transition-all">
            <Settings size={18} className="text-text-secondary" />
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {Object.entries(contentTypes).map(([key, config]) => {
            const Icon = config.icon;
            const isActive = activeType === key && activeTab === 'content';
            return (
              <button key={key} onClick={() => { setActiveType(key); setActiveTab('content'); }}
                className={`flex flex-col items-center gap-1.5 p-3 sm:p-4 rounded-2xl border transition-all active:scale-95 ${isActive ? 'bg-primary text-cream border-primary shadow-md' : 'bg-white text-text-secondary border-border hover:border-primary/30'}`}>
                <Icon size={20} />
                <span className="text-xl sm:text-2xl font-bold leading-none">{counts[key] || 0}</span>
                <span className="text-[11px] font-medium opacity-80">{config.plural}</span>
              </button>
            );
          })}
        </div>

        {/* Tab: Content vs Suggestions */}
        <div className="flex bg-surface-alt p-1 rounded-xl mb-5">
          <button
            onClick={() => setActiveTab('content')}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === 'content' ? 'bg-white text-primary shadow-sm' : 'text-muted'}`}
          >
            Konten
          </button>
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'suggestions' ? 'bg-white text-primary shadow-sm' : 'text-muted'}`}
          >
            <MessageSquare size={14} />
            Saran Tempat
            {suggestionCount > 0 && (
              <span className="ml-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-cream text-[10px] font-bold grid place-items-center">
                {suggestionCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Settings panel (toggleable) */}
      {showSettings && (        <div className="mb-6 bg-white rounded-2xl border border-border p-5 animate-slideUp">
          <h3 className="font-semibold text-base text-text-main mb-4 flex items-center gap-2"><Sparkles size={16} className="text-primary" />Pengaturan Popup</h3>
          <form onSubmit={handleIntroSubmit} className="space-y-3">
            <label className="flex items-center gap-3 p-3 rounded-xl bg-surface-alt border border-border-light">
              <input type="checkbox" checked={introSettings.enabled} onChange={e => setIntroField('enabled', e.target.checked)} className="h-5 w-5 accent-primary rounded" />
              <span className="text-sm font-medium text-text-main">Aktifkan popup intro</span>
            </label>
            <Field label="Judul" value={introSettings.title} onChange={v => setIntroField('title', v)} />
            <Field label="Isi" as="textarea" value={introSettings.body} onChange={v => setIntroField('body', v)} />
            <Field label="Label Tombol" value={introSettings.buttonLabel} onChange={v => setIntroField('buttonLabel', v)} />
            <button type="submit" disabled={savingIntro} className="w-full h-12 text-sm font-semibold text-cream bg-primary rounded-xl active:scale-[0.98] transition-transform disabled:opacity-60">
              {savingIntro ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </button>
          </form>
        </div>
      )}


      {/* ===== CONTENT TAB ===== */}
      {activeTab === 'content' && (<>
      {/* Search + Actions bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <label className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={`Cari ${activeConfig.plural.toLowerCase()}...`}
            className="w-full h-12 pl-10 pr-4 text-sm border border-border rounded-xl bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all" />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"><X size={16} /></button>}
        </label>
        <div className="flex gap-2">
          <button onClick={() => loadData(activeType)} className="h-12 w-12 flex items-center justify-center rounded-xl border border-border bg-white active:scale-95 transition-transform" aria-label="Refresh">
            <RefreshCw size={18} className={`text-text-secondary ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')} className="hidden sm:flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-white active:scale-95 transition-transform" aria-label="Toggle view">
            <Eye size={18} className="text-text-secondary" />
          </button>
          <button onClick={() => handleOpenModal()} className="h-12 px-5 inline-flex items-center gap-2 text-sm font-semibold text-cream bg-primary rounded-xl active:scale-95 transition-transform shadow-sm">
            <Plus size={18} /> <span className="hidden sm:inline">Tambah</span> {activeConfig.label}
          </button>
        </div>
      </div>

      {status && <div className="mb-4 p-3.5 rounded-xl bg-cream border border-cream-dark text-sm font-medium text-primary animate-slideUp">{status}</div>}

      {/* Content: Card view (mobile default) or Table view */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-28 rounded-2xl bg-surface-alt animate-pulse" />)}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-border">
          <p className="text-muted text-sm">{search ? 'Tidak ditemukan.' : activeConfig.emptyText}</p>
          {!search && <button onClick={() => handleOpenModal()} className="mt-3 text-sm font-medium text-primary">+ Tambah {activeConfig.label}</button>}
        </div>
      ) : viewMode === 'cards' || windowWidth < 640 ? (
        /* Card view - great for mobile */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredItems.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-md transition-shadow">
              <div className="flex gap-3 p-3.5">
                {item.photo ? <img src={item.photo} alt="" className="h-16 w-16 rounded-xl object-cover shrink-0" /> : <div className="h-16 w-16 rounded-xl bg-cream flex items-center justify-center shrink-0"><Image size={20} className="text-primary/40" /></div>}
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-sm text-text-main truncate">{item.name}</h4>
                  <p className="text-xs text-muted truncate mt-0.5">{item.area} · {item.itemCategory || '-'}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="inline-flex items-center gap-0.5 text-xs font-medium text-amber-600"><Star size={11} className="fill-amber-500 text-amber-500" />{item.rating || 0}</span>
                    <span className="text-xs text-muted">Rp{((item.priceMin||0)/1000).toFixed(0)}k</span>
                    {item.isFeatured && <span className="text-[10px] font-semibold text-primary bg-cream px-1.5 py-0.5 rounded">Featured</span>}
                  </div>
                </div>
              </div>
              <div className="flex border-t border-border-light">
                <button onClick={() => handleOpenModal(item)} className="flex-1 flex items-center justify-center gap-1.5 h-11 text-xs font-medium text-blue-600 hover:bg-blue-50 active:bg-blue-100 transition-colors">
                  <Edit2 size={14} /> Edit
                </button>
                <div className="w-px bg-border-light" />
                <button onClick={() => handleDelete(item.id, item.name)} className="flex-1 flex items-center justify-center gap-1.5 h-11 text-xs font-medium text-red-500 hover:bg-red-50 active:bg-red-100 transition-colors">
                  <Trash2 size={14} /> Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (


        /* Table view - desktop */
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
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
                {filteredItems.map(item => (
                  <tr key={item.id} className="border-b border-border-light hover:bg-surface-alt/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {item.photo ? <img src={item.photo} alt="" className="h-10 w-10 rounded-lg object-cover" /> : <div className="h-10 w-10 rounded-lg bg-cream flex items-center justify-center"><Image size={14} className="text-primary/40" /></div>}
                        <div className="min-w-0">
                          <div className="font-medium text-text-main truncate max-w-[200px]">{item.name}</div>
                          <div className="text-xs text-muted truncate max-w-[200px]">{item.location || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{item.itemCategory || '-'}</td>
                    <td className="px-4 py-3 text-text-secondary">{item.area || '-'}</td>
                    <td className="px-4 py-3 font-medium">Rp{((item.priceMin||0)/1000).toFixed(0)}k - {((item.priceMax||0)/1000).toFixed(0)}k</td>
                    <td className="px-4 py-3"><span className="inline-flex items-center gap-1 text-amber-600 font-medium"><Star size={12} className="fill-amber-500 text-amber-500" />{item.rating || 0}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-1.5">
                        <button onClick={() => handleOpenModal(item)} className="h-9 w-9 flex items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"><Edit2 size={15} /></button>
                        <button onClick={() => handleDelete(item.id, item.name)} className="h-9 w-9 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Results count */}
      <p className="text-xs text-muted text-center mt-4">{filteredItems.length} dari {items.length} {activeConfig.plural.toLowerCase()}</p>
      </>)}

      {/* ===== SUGGESTIONS PANEL ===== */}
      {activeTab === 'suggestions' && (
        <div className="mt-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted font-medium">
              {suggestionsLoading ? 'Memuat...' : `${suggestions.length} saran masuk`}
            </p>
            <button
              onClick={loadSuggestions}
              className="h-9 w-9 flex items-center justify-center rounded-xl border border-border bg-white active:scale-95 transition-transform"
              aria-label="Refresh"
            >
              <RefreshCw size={16} className={`text-text-secondary ${suggestionsLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {suggestionsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 rounded-2xl bg-surface-alt animate-pulse" />
              ))}
            </div>
          ) : suggestions.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-border">
              <MessageSquare size={28} className="text-muted mx-auto mb-3 opacity-40" />
              <p className="text-sm text-muted">Belum ada saran tempat.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {suggestions.map(s => (
                <div key={s.id} className="bg-white rounded-2xl border border-border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h4 className="font-semibold text-sm text-text-main">{s.name}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          s.status === 'approved' ? 'bg-emerald-50 text-emerald-700' :
                          s.status === 'rejected' ? 'bg-red-50 text-red-600' :
                          'bg-amber-50 text-amber-700'
                        }`}>
                          {s.status === 'approved' ? 'Diterima' : s.status === 'rejected' ? 'Ditolak' : 'Pending'}
                        </span>
                      </div>
                      <p className="text-xs text-muted mb-1">
                        {s.category || '-'} · {s.area || '-'}
                      </p>
                      {s.reason && (
                        <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                          {s.reason}
                        </p>
                      )}
                      <p className="text-[10px] text-muted mt-1.5">
                        {new Date(s.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteSuggestion(s.id)}
                      className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                      aria-label="Hapus saran"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {s.status === 'pending' && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-border-light">
                      <button
                        onClick={() => handleSuggestionStatus(s.id, 'approved')}
                        className="flex-1 h-9 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-xl hover:bg-emerald-100 active:scale-95 transition-all"
                      >
                        Terima
                      </button>
                      <button
                        onClick={() => handleSuggestionStatus(s.id, 'rejected')}
                        className="flex-1 h-9 text-xs font-semibold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 active:scale-95 transition-all"
                      >
                        Tolak
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}


      {/* Form Modal - Full screen on mobile */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm sm:p-4 modal-backdrop" onClick={handleCloseModal}>
          <div className="bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto overscroll-contain relative shadow-2xl modal-panel-bottom" onClick={e => e.stopPropagation()}>
            {/* Mobile drag handle */}
            <div className="sm:hidden sticky top-0 z-10 pt-3 pb-2 bg-white rounded-t-2xl">
              <div className="w-10 h-1 bg-border rounded-full mx-auto" />
            </div>

            {/* Header */}
            <div className="sticky top-0 sm:top-0 z-10 bg-white border-b border-border-light px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg text-primary">{editingId ? 'Edit' : 'Tambah'} {activeConfig.label}</h3>
                <p className="text-xs text-muted mt-0.5">{editingId ? 'Perbarui data listing' : 'Isi form untuk menambahkan listing baru'}</p>
              </div>
              <button onClick={handleCloseModal} className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-alt text-muted hover:text-text-main transition-colors" aria-label="Tutup"><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              {/* Photo preview */}
              {formData.photo && (
                <div className="rounded-2xl overflow-hidden border border-border">
                  <img src={formData.photo} alt="Preview" className="w-full h-40 object-cover" onError={e => { e.target.style.display = 'none'; }} />
                </div>
              )}

              {/* Identity */}
              <FormSection title="Identitas" icon={MapPin}>
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                  <Field label="Nama Tempat" required value={formData.name} onChange={v => setField('name', v)} placeholder="Nama coffee shop / hotel" />
                  <SelectField label="Kategori" value={formData.itemCategory} onChange={v => setField('itemCategory', v)} options={activeConfig.categoryOptions} />
                  <Field label="Area" required value={formData.area} onChange={v => setField('area', v)} placeholder="Padang Barat" />
                  <Field label="Alamat Lengkap" required value={formData.location} onChange={v => setField('location', v)} placeholder="Jl. ..." />
                </div>
                <Field label="Deskripsi" as="textarea" value={formData.description} onChange={v => setField('description', v)} placeholder="Deskripsi singkat tempat ini..." />
              </FormSection>

              {/* Pricing & Hours */}
              <FormSection title="Harga & Jam" icon={Star}>
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
                  <Field label="Harga Min (Rp)" type="number" required value={formData.priceMin} onChange={v => setField('priceMin', v)} placeholder="15000" />
                  <Field label="Harga Max (Rp)" type="number" required value={formData.priceMax} onChange={v => setField('priceMax', v)} placeholder="50000" />
                  <SelectField label="Level Harga" value={formData.priceCategory} onChange={v => setField('priceCategory', v)} options={['budget', 'mid', 'premium']} />
                  <Field label="Jam Buka" type="number" step="0.5" required value={formData.openHour} onChange={v => setField('openHour', v)} placeholder="8" />
                  <Field label="Jam Tutup" type="number" step="0.5" required value={formData.closeHour} onChange={v => setField('closeHour', v)} placeholder="22" />
                  <Field label="Teks Jam" required value={formData.hours} onChange={v => setField('hours', v)} placeholder="08.00 - 22.00" />
                </div>
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
                  <Field label="Rating" type="number" step="0.1" min="0" max="5" value={formData.rating} onChange={v => setField('rating', v)} placeholder="4.5" />
                  <Field label="Jumlah Ulasan" type="number" min="0" value={formData.reviewCount} onChange={v => setField('reviewCount', v)} placeholder="0" />
                  <label className="flex items-center gap-3 h-12 mt-auto px-3 rounded-xl bg-surface-alt border border-border-light text-sm font-medium text-text-main cursor-pointer">
                    <input type="checkbox" checked={formData.isFeatured} onChange={e => setField('isFeatured', e.target.checked)} className="h-5 w-5 accent-primary rounded" />
                    Featured
                  </label>
                </div>
              </FormSection>


              {/* Media & Links */}
              <FormSection title="Media & Link" icon={LinkIcon}>
                <Field label="Tags (pisahkan koma)" value={formData.tags} onChange={v => setField('tags', v)} placeholder="Wi-Fi, Cozy, Outdoor, Live Music" />
                <Field label="URL Foto" type="url" value={formData.photo} onChange={v => setField('photo', v)} placeholder="https://..." />
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                  <Field label="Google Maps URL" type="url" value={formData.mapsUrl} onChange={v => setField('mapsUrl', v)} placeholder="https://maps.google.com/..." />
                  <Field label="Instagram URL" type="url" value={formData.instagram} onChange={v => setField('instagram', v)} placeholder="https://instagram.com/..." />
                  <Field label="Booking / Reservasi URL" type="url" value={formData.bookingUrl} onChange={v => setField('bookingUrl', v)} />
                  <Field label="URL Tambahan" type="url" value={formData.secondaryUrl} onChange={v => setField('secondaryUrl', v)} />
                </div>
                <Field label="Label URL Tambahan" value={formData.secondaryLabel} onChange={v => setField('secondaryLabel', v)} placeholder="Website, Menu, dll" />
              </FormSection>

              {/* Submit button - sticky on mobile */}
              <div className="sticky bottom-0 bg-white pt-3 pb-2 -mx-5 px-5 border-t border-border-light sm:static sm:border-0 sm:p-0">
                <button type="submit" disabled={saving} className="w-full h-14 text-base font-semibold text-cream bg-primary rounded-2xl active:scale-[0.97] transition-transform disabled:opacity-60 shadow-sm">
                  <span className="flex items-center justify-center gap-2"><Save size={18} />{saving ? 'Menyimpan...' : (editingId ? 'Update' : 'Simpan')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}


function FormSection({ title, icon: Icon, children }) {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-primary uppercase tracking-wide flex items-center gap-1.5">
        <Icon size={13} /> {title}
      </h4>
      <div className="space-y-3 p-4 rounded-2xl bg-surface-alt border border-border-light">
        {children}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, as, ...props }) {
  const cls = 'w-full h-12 px-4 text-sm border border-border rounded-xl bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all';
  return (
    <label className="block">
      <span className="block text-xs font-medium text-text-secondary mb-1.5">{label}</span>
      {as === 'textarea' ? (
        <textarea rows="3" value={value} onChange={e => onChange(e.target.value)} className={`${cls} h-auto py-3`} {...props} />
      ) : (
        <input value={value} onChange={e => onChange(e.target.value)} className={cls} {...props} />
      )}
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-text-secondary mb-1.5">{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)} className="w-full h-12 px-4 text-sm border border-border rounded-xl bg-white focus:border-primary outline-none transition-all">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}
