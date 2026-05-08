import { useState, useCallback, useEffect, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Building2,
  Coffee,
  Edit2,
  Image,
  LayoutDashboard,
  Link as LinkIcon,
  MapPin,
  Palette,
  Plus,
  Save,
  Shield,
  Sparkles,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/auth-context';
import { supabase } from '../lib/supabase';
import { normalizeCoffeeShops, serializeCoffeeShop } from '../lib/coffee-shop-mapper.js';

const contentTypes = {
  coffee: {
    label: 'Coffee Shop',
    plural: 'Coffee Shops',
    table: 'coffee_shops',
    icon: Coffee,
    accent: '#ff1818',
    categoryLabel: 'Tipe Tempat',
    categoryOptions: ['Cafe', 'Coffee Shop', 'Bakery', 'Restaurant', 'Coworking'],
    emptyText: 'Belum ada coffee shop.',
  },
  hotel: {
    label: 'Hotel',
    plural: 'Hotels',
    table: 'hotels',
    icon: Building2,
    accent: '#0e8f85',
    categoryLabel: 'Tipe Hotel',
    categoryOptions: ['Hotel', 'Resort', 'Homestay', 'Guest House', 'Villa'],
    emptyText: 'Belum ada hotel.',
  },
  lifestyle: {
    label: 'Lifestyle',
    plural: 'Lifestyle',
    table: 'lifestyle_places',
    icon: Sparkles,
    accent: '#5b3f91',
    categoryLabel: 'Kategori Lifestyle',
    categoryOptions: ['Wisata', 'Kuliner', 'Belanja', 'Event', 'Wellness', 'Culture'],
    emptyText: 'Belum ada lifestyle item.',
  },
};

const emptyFormData = {
  name: '',
  itemCategory: '',
  area: '',
  location: '',
  priceMin: '',
  priceMax: '',
  priceCategory: 'budget',
  openHour: '',
  closeHour: '',
  hours: '',
  tags: '',
  photo: '',
  description: '',
  mapsUrl: '',
  instagram: '',
  bookingUrl: '',
  secondaryUrl: '',
  secondaryLabel: '',
  rating: '',
  reviewCount: '',
  isFeatured: false,
};

const defaultIntroSettings = {
  enabled: true,
  title: 'Selamat datang di PadangPicks',
  body: 'PadangPicks adalah direktori kurasi untuk menemukan coffee shop, hotel, dan lifestyle spot pilihan di Kota Padang.',
  buttonLabel: 'Mulai Jelajah',
};

const toNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

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

    const entries = await Promise.all(
      Object.entries(contentTypes).map(async ([key, config]) => {
        const { count } = await supabase
          .from(config.table)
          .select('id', { count: 'exact', head: true });
        return [key, count || 0];
      }),
    );

    setCounts(Object.fromEntries(entries));
  }, []);

  const loadData = useCallback(async (type = activeType) => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setStatus('');

    const config = contentTypes[type];
    const { data, error } = await supabase
      .from(config.table)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setItems([]);
      setStatus(`${config.plural} belum bisa dimuat: ${error.message}`);
    } else {
      setItems(normalizeCoffeeShops(data || []));
    }

    setLoading(false);
    loadCounts();
  }, [activeType, loadCounts]);

  const loadIntroSettings = useCallback(async () => {
    if (!supabase) return;

    const { data } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'intro_popup')
      .maybeSingle();

    if (data?.value) {
      setIntroSettings({ ...defaultIntroSettings, ...data.value });
    }
  }, []);

  useEffect(() => {
    if (authLoading || !isAdmin) return;
    Promise.resolve().then(() => {
      loadData(activeType);
      loadIntroSettings();
    });
  }, [authLoading, isAdmin, activeType, loadData, loadIntroSettings]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;

    return items.filter(item => [
      item.name,
      item.area,
      item.location,
      item.itemCategory,
      ...(item.tags || []),
    ].filter(Boolean).some(value => String(value).toLowerCase().includes(query)));
  }, [items, search]);

  if (authLoading) return <div className="p-12 text-center text-muted font-bold">Memeriksa akses admin...</div>;
  if (!user || !isAdmin) return <Navigate to="/" replace />;

  const setField = (field, value) => setFormData(current => ({ ...current, [field]: value }));
  const setIntroField = (field, value) => setIntroSettings(current => ({ ...current, [field]: value }));

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        ...emptyFormData,
        ...item,
        tags: Array.isArray(item.tags) ? item.tags.join(', ') : '',
        priceMin: item.priceMin ?? '',
        priceMax: item.priceMax ?? '',
        openHour: item.openHour ?? '',
        closeHour: item.closeHour ?? '',
        rating: item.rating ?? '',
        reviewCount: item.reviewCount ?? '',
        isFeatured: Boolean(item.isFeatured),
      });
    } else {
      setEditingId(null);
      setFormData({
        ...emptyFormData,
        itemCategory: activeConfig.categoryOptions[0],
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!supabase) return;

    setSaving(true);
    setStatus('');

    const payload = serializeCoffeeShop({
      name: formData.name,
      itemCategory: formData.itemCategory,
      area: formData.area,
      location: formData.location,
      priceMin: toNumber(formData.priceMin),
      priceMax: toNumber(formData.priceMax),
      priceCategory: formData.priceCategory,
      openHour: toNumber(formData.openHour),
      closeHour: toNumber(formData.closeHour, 24),
      hours: formData.hours,
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      photo: formData.photo,
      description: formData.description,
      mapsUrl: formData.mapsUrl,
      instagram: formData.instagram,
      bookingUrl: formData.bookingUrl,
      secondaryUrl: formData.secondaryUrl,
      secondaryLabel: formData.secondaryLabel,
      rating: toNumber(formData.rating),
      reviewCount: Math.max(0, Math.round(toNumber(formData.reviewCount))),
      isFeatured: formData.isFeatured,
    });

    const request = editingId
      ? supabase.from(activeConfig.table).update(payload).eq('id', editingId)
      : supabase.from(activeConfig.table).insert([payload]);

    const { error } = await request;

    if (error) {
      setStatus(`Gagal menyimpan ${activeConfig.label}: ${error.message}`);
    } else {
      setIsModalOpen(false);
      setEditingId(null);
      setFormData(emptyFormData);
      setStatus(`${activeConfig.label} berhasil disimpan.`);
      loadData(activeType);
    }

    setSaving(false);
  };

  const handleDelete = async (id, name) => {
    if (!supabase || !window.confirm(`Yakin ingin menghapus "${name}"?`)) return;

    const { error } = await supabase.from(activeConfig.table).delete().eq('id', id);
    if (error) {
      setStatus(`Gagal menghapus ${activeConfig.label}: ${error.message}`);
    } else {
      setStatus(`${activeConfig.label} berhasil dihapus.`);
      loadData(activeType);
    }
  };

  const handleIntroSubmit = async (e) => {
    e.preventDefault();
    if (!supabase) return;

    setSavingIntro(true);
    setStatus('');

    const { error } = await supabase
      .from('app_settings')
      .upsert({
        key: 'intro_popup',
        value: introSettings,
        updated_at: new Date().toISOString(),
      });

    setSavingIntro(false);
    setStatus(error ? `Gagal menyimpan popup awal: ${error.message}` : 'Popup awal berhasil diperbarui.');
  };

  return (
    <main className="w-[min(1240px,calc(100%-1rem))] sm:w-[min(1240px,calc(100%-1.5rem))] mx-auto py-5 sm:py-8">
      <section className="overflow-hidden rounded-[30px] border border-primary/10 bg-white shadow-[0_20px_54px_rgba(52,19,20,0.08)]">
        <div className="bg-[linear-gradient(135deg,#431417,#ff1818_55%,#2cb5a7)] p-5 sm:p-7 text-white">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-xs font-black uppercase tracking-wide">
                <Shield size={14} />
                Admin Customization
              </div>
              <h2 className="mt-3 font-display text-[clamp(2rem,5vw,3.6rem)] leading-none text-white">
                Kontrol penuh PadangPicks
              </h2>
              <p className="mt-2 max-w-2xl text-sm sm:text-base font-bold text-white/82">
                Kelola listing Coffee Shop, Hotel, dan Lifestyle dari satu dashboard dengan field konten, link, harga, rating, dan status unggulan.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 rounded-3xl bg-white/12 p-2 backdrop-blur-md">
              {Object.entries(contentTypes).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveType(key)}
                    className={`rounded-2xl px-3 py-3 text-left transition-all ${
                      activeType === key ? 'bg-white text-[#431417] shadow-lg' : 'text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon size={18} />
                    <div className="mt-2 text-xs font-black uppercase tracking-wide">{config.plural}</div>
                    <div className="text-lg font-black leading-none">{counts[key] || 0}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-[280px_1fr]">
          <aside className="grid gap-4 content-start">
            <div className="rounded-3xl border border-primary/10 bg-[#fff9f7] p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-white">
                  <ActiveIcon size={22} />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-wide text-muted">Sedang dikelola</div>
                  <div className="font-display text-2xl leading-none text-[#431417]">{activeConfig.plural}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleOpenModal()}
                className="mt-4 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-black text-white transition-colors hover:bg-accent-dark"
              >
                <Plus size={17} />
                Tambah {activeConfig.label}
              </button>
            </div>

            <div className="rounded-3xl border border-primary/10 bg-white p-4">
              <div className="flex items-center gap-2 text-sm font-black text-[#431417]">
                <Palette size={17} className="text-primary" />
                Kostumisasi tersedia
              </div>
              <div className="mt-3 grid gap-2 text-xs font-bold text-muted">
                <span>Nama, kategori, area, alamat</span>
                <span>Harga, jam buka, tags</span>
                <span>Foto, deskripsi, Maps, Instagram</span>
                <span>Booking/link tambahan, rating, featured</span>
              </div>
            </div>

            <form onSubmit={handleIntroSubmit} className="rounded-3xl border border-primary/10 bg-white p-4">
              <div className="flex items-center gap-2 text-sm font-black text-[#431417]">
                <Sparkles size={17} className="text-primary" />
                Popup Awal
              </div>
              <div className="mt-3 grid gap-3">
                <label className="flex items-center gap-3 rounded-2xl border border-primary/10 bg-[#fff9f7] px-3 py-3 text-sm font-black text-[#431417]">
                  <input
                    type="checkbox"
                    checked={introSettings.enabled}
                    onChange={e => setIntroField('enabled', e.target.checked)}
                    className="h-4 w-4 accent-primary"
                  />
                  Aktifkan popup
                </label>
                <Field label="Judul Popup" value={introSettings.title} onChange={value => setIntroField('title', value)} />
                <Field label="Isi Popup" as="textarea" value={introSettings.body} onChange={value => setIntroField('body', value)} />
                <Field label="Label Tombol" value={introSettings.buttonLabel} onChange={value => setIntroField('buttonLabel', value)} />
                <button
                  type="submit"
                  disabled={savingIntro}
                  className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-2xl bg-[#431417] px-4 text-sm font-black text-white transition-colors hover:bg-primary disabled:opacity-70"
                >
                  <Save size={16} />
                  {savingIntro ? 'Menyimpan...' : 'Simpan Popup'}
                </button>
              </div>
            </form>
          </aside>

          <section className="min-w-0">
            <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#fff0ed] px-3 py-1 text-xs font-black text-accent-dark">
                  <LayoutDashboard size={14} />
                  {filteredItems.length} dari {items.length} data
                </div>
                <h3 className="mt-2 font-display text-3xl leading-none text-[#431417]">{activeConfig.plural}</h3>
              </div>
              <input
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={`Cari ${activeConfig.plural.toLowerCase()}...`}
                className="min-h-[48px] w-full rounded-2xl border border-primary/12 bg-white px-4 text-sm font-bold outline-none transition-all focus:border-[#2cb5a7] focus:ring-4 focus:ring-[#2cb5a7]/12 md:max-w-[320px]"
              />
            </div>

            {status && (
              <div className="mb-4 rounded-2xl border border-primary/10 bg-[#fff9f7] px-4 py-3 text-sm font-bold text-[#8c232b]">
                {status}
              </div>
            )}

            <div className="overflow-hidden rounded-3xl border border-primary/10 bg-white">
              <div className="overflow-x-auto">
                <table className="w-[900px] lg:w-full text-left text-sm text-text-main">
                  <thead className="border-b border-primary/10 bg-[#fff8f6] text-xs font-black uppercase tracking-wide text-[#6d3035]">
                    <tr>
                      <th className="p-4">Listing</th>
                      <th className="p-4">Kategori</th>
                      <th className="p-4">Area</th>
                      <th className="p-4">Harga</th>
                      <th className="p-4">Rating</th>
                      <th className="p-4">Featured</th>
                      <th className="p-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="7" className="p-8 text-center text-muted font-bold">Memuat data...</td></tr>
                    ) : filteredItems.length === 0 ? (
                      <tr><td colSpan="7" className="p-8 text-center text-muted font-bold">{activeConfig.emptyText}</td></tr>
                    ) : (
                      filteredItems.map(item => (
                        <tr key={item.id} className="border-b border-primary/5 transition-colors hover:bg-[#fffdfc]">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {item.photo ? (
                                <img src={item.photo} alt={item.name} className="h-12 w-12 rounded-2xl object-cover" />
                              ) : (
                                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#fff0ed] text-primary">
                                  <Image size={18} />
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="truncate font-black text-[#431417]">{item.name}</div>
                                <div className="truncate text-xs font-bold text-muted">{item.location || '-'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 font-bold">{item.itemCategory || '-'}</td>
                          <td className="p-4">{item.area || '-'}</td>
                          <td className="p-4 font-bold">
                            Rp{((item.priceMin || 0) / 1000).toFixed(0)}k - Rp{((item.priceMax || 0) / 1000).toFixed(0)}k
                          </td>
                          <td className="p-4 text-[#f5a623] font-black">{item.rating || 0}</td>
                          <td className="p-4">
                            <span className={`rounded-full px-3 py-1 text-xs font-black ${item.isFeatured ? 'bg-[#e9fbf8] text-[#0e605b]' : 'bg-[#f6f1ef] text-muted'}`}>
                              {item.isFeatured ? 'Ya' : 'Tidak'}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex justify-center gap-2">
                              <button onClick={() => handleOpenModal(item)} className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100" aria-label={`Edit ${item.name}`}>
                                <Edit2 size={16} />
                              </button>
                              <button onClick={() => handleDelete(item.id, item.name)} className="grid h-10 w-10 place-items-center rounded-xl bg-red-50 text-red-600 transition-colors hover:bg-red-100" aria-label={`Hapus ${item.name}`}>
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4 modal-backdrop">
          <div className="relative max-h-[92vh] w-full max-w-[820px] overflow-y-auto rounded-t-3xl bg-white p-4 shadow-2xl sm:max-h-[90vh] sm:rounded-[28px] sm:p-6 modal-panel-bottom">
            <button onClick={() => setIsModalOpen(false)} className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-2xl text-muted transition-colors hover:bg-gray-100">
              <X size={20} />
            </button>

            <div className="mb-5 pr-12">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#fff0ed] px-3 py-1 text-xs font-black uppercase tracking-wide text-accent-dark">
                <ActiveIcon size={14} />
                {editingId ? 'Edit Listing' : 'Tambah Listing'}
              </div>
              <h3 className="mt-2 font-display text-3xl leading-none text-[#431417]">
                {editingId ? `Edit ${activeConfig.label}` : `Tambah ${activeConfig.label}`}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-5 modal-content">
              <section className="grid gap-3 rounded-3xl border border-primary/10 bg-[#fff9f7] p-4">
                <div className="flex items-center gap-2 text-sm font-black text-[#431417]">
                  <MapPin size={17} className="text-primary" />
                  Identitas Listing
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Nama Tempat" required value={formData.name} onChange={value => setField('name', value)} />
                  <SelectField label={activeConfig.categoryLabel} value={formData.itemCategory} onChange={value => setField('itemCategory', value)} options={activeConfig.categoryOptions} />
                  <Field label="Area" required value={formData.area} onChange={value => setField('area', value)} placeholder="Contoh: Padang Barat" />
                  <Field label="Alamat Lengkap" required value={formData.location} onChange={value => setField('location', value)} />
                </div>
                <Field label="Deskripsi" as="textarea" value={formData.description} onChange={value => setField('description', value)} placeholder="Tulis deskripsi singkat yang akan tampil di halaman listing." />
              </section>

              <section className="grid gap-3 rounded-3xl border border-primary/10 bg-white p-4">
                <div className="flex items-center gap-2 text-sm font-black text-[#431417]">
                  <Star size={17} className="text-[#f5a623]" />
                  Harga, Jam, dan Rating
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Field label="Harga Min" type="number" required value={formData.priceMin} onChange={value => setField('priceMin', value)} />
                  <Field label="Harga Max" type="number" required value={formData.priceMax} onChange={value => setField('priceMax', value)} />
                  <SelectField label="Level Harga" value={formData.priceCategory} onChange={value => setField('priceCategory', value)} options={['budget', 'mid', 'premium']} />
                  <Field label="Jam Buka (0-24)" type="number" step="0.5" required value={formData.openHour} onChange={value => setField('openHour', value)} />
                  <Field label="Jam Tutup (0-24)" type="number" step="0.5" required value={formData.closeHour} onChange={value => setField('closeHour', value)} />
                  <Field label="Teks Jam" required value={formData.hours} onChange={value => setField('hours', value)} placeholder="08.00 - 22.00" />
                  <Field label="Rating Manual" type="number" step="0.1" min="0" max="5" value={formData.rating} onChange={value => setField('rating', value)} />
                  <Field label="Jumlah Ulasan" type="number" min="0" value={formData.reviewCount} onChange={value => setField('reviewCount', value)} />
                  <label className="flex min-h-[48px] items-center gap-3 rounded-2xl border border-primary/12 bg-[#fff9f7] px-3 text-sm font-black text-[#431417]">
                    <input type="checkbox" checked={formData.isFeatured} onChange={e => setField('isFeatured', e.target.checked)} className="h-4 w-4 accent-primary" />
                    Jadikan Featured
                  </label>
                </div>
              </section>

              <section className="grid gap-3 rounded-3xl border border-primary/10 bg-white p-4">
                <div className="flex items-center gap-2 text-sm font-black text-[#431417]">
                  <LinkIcon size={17} className="text-[#0e8f85]" />
                  Media dan Link
                </div>
                <Field label="Tags (pisahkan koma)" value={formData.tags} onChange={value => setField('tags', value)} placeholder="Wi-Fi, Cozy, Outdoor" />
                <Field label="URL Foto" type="url" value={formData.photo} onChange={value => setField('photo', value)} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="URL Google Maps" type="url" value={formData.mapsUrl} onChange={value => setField('mapsUrl', value)} />
                  <Field label="URL Instagram" type="url" value={formData.instagram} onChange={value => setField('instagram', value)} />
                  <Field label="URL Booking / Reservasi" type="url" value={formData.bookingUrl} onChange={value => setField('bookingUrl', value)} />
                  <Field label="URL Tambahan" type="url" value={formData.secondaryUrl} onChange={value => setField('secondaryUrl', value)} />
                  <Field label="Label URL Tambahan" value={formData.secondaryLabel} onChange={value => setField('secondaryLabel', value)} placeholder="Website, Artikel, Menu" />
                </div>
              </section>

              {activeType === 'coffee' && (
                <p className="rounded-2xl bg-[#fff8f6] p-3 text-xs font-bold text-muted">
                  Catatan: rating coffee shop bisa dihitung ulang otomatis saat user memberi rating dari popup detail.
                </p>
              )}

              <button type="submit" disabled={saving} className="inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-black text-white transition-colors hover:bg-accent-dark disabled:opacity-70">
                <Save size={17} />
                {saving ? 'Menyimpan...' : 'Simpan Data'}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function Field({ label, value, onChange, as, ...props }) {
  const className = 'w-full min-h-[48px] rounded-2xl border border-primary/12 bg-white px-3 text-sm font-bold outline-none transition-all focus:border-[#2cb5a7] focus:ring-4 focus:ring-[#2cb5a7]/12';

  return (
    <label className="block">
      <span className="mb-1 block text-sm font-black text-[#58151c]">{label}</span>
      {as === 'textarea' ? (
        <textarea rows="4" value={value} onChange={e => onChange(e.target.value)} className={`${className} py-3`} {...props} />
      ) : (
        <input value={value} onChange={e => onChange(e.target.value)} className={className} {...props} />
      )}
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-black text-[#58151c]">{label}</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full min-h-[48px] rounded-2xl border border-primary/12 bg-white px-3 text-sm font-bold outline-none transition-all focus:border-[#2cb5a7] focus:ring-4 focus:ring-[#2cb5a7]/12"
      >
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
