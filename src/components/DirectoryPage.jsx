import { useEffect, useMemo, useState } from 'react';
import { ArrowUpDown, Clock3, ExternalLink, MapPin, Search, Star, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { normalizeCoffeeShops } from '../lib/coffee-shop-mapper';

export default function DirectoryPage({ table, title, description, emptyText }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [area, setArea] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchItems = async () => {
      if (!supabase) { setLoading(false); return; }
      const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false });
      if (!cancelled) {
        setItems(error ? [] : normalizeCoffeeShops(data || []));
        setLoading(false);
      }
    };
    fetchItems();
    return () => { cancelled = true; };
  }, [table]);

  const areas = useMemo(() => [...new Set(items.map(item => item.area))].filter(Boolean), [items]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    let result = [...items];
    if (query) {
      result = result.filter(item => [item.name, item.area, item.location, item.itemCategory, ...(item.tags || [])].filter(Boolean).some(v => String(v).toLowerCase().includes(query)));
    }
    if (area !== 'all') result = result.filter(item => item.area === area);
    result.sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'price_asc') return (a.priceMin || 0) - (b.priceMin || 0);
      if (sortBy === 'price_desc') return (b.priceMin || 0) - (a.priceMin || 0);
      if (sortBy === 'featured') return Number(b.isFeatured || false) - Number(a.isFeatured || false);
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });
    return result;
  }, [items, search, area, sortBy]);

  return (
    <main className="min-h-screen pb-16">
      {/* Header */}
      <section className="bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-text-main">{title}</h1>
          <p className="mt-2 text-base text-text-secondary max-w-xl">{description}</p>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-16 z-40 bg-white/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <label className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Cari nama, lokasi, atau tag..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-3 text-sm border border-border rounded-lg bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
              />
            </label>
            <label className="relative">
              <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <select value={area} onChange={e => setArea(e.target.value)} className="h-10 pl-8 pr-8 text-sm border border-border rounded-lg bg-white focus:border-primary outline-none transition-all appearance-none">
                <option value="all">Semua Area</option>
                {areas.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </label>
            <label className="relative">
              <ArrowUpDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="h-10 pl-8 pr-8 text-sm border border-border rounded-lg bg-white focus:border-primary outline-none transition-all appearance-none">
                <option value="featured">Featured</option>
                <option value="rating">Rating Tertinggi</option>
                <option value="price_asc">Harga Terendah</option>
                <option value="price_desc">Harga Tertinggi</option>
                <option value="newest">Terbaru</option>
              </select>
            </label>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mt-6">
        <p className="text-sm text-text-secondary font-medium mb-4">
          {loading ? 'Memuat...' : `${filteredItems.length} tempat ditemukan`}
        </p>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-border overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-surface-alt" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-surface-alt rounded w-3/4" />
                  <div className="h-3 bg-surface-alt rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map(item => (
              <button
                key={item.id || item.name}
                type="button"
                onClick={() => setSelectedItem(item)}
                className="group text-left bg-white rounded-2xl border border-border overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  {item.photo ? (
                    <img src={item.photo} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  ) : (
                    <div className="w-full h-full bg-surface-alt flex items-center justify-center text-sm text-muted">No image</div>
                  )}
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                    {item.isFeatured && <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-amber-50/90 text-amber-700 backdrop-blur-sm">Featured</span>}
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold bg-white/90 text-text-main backdrop-blur-sm">
                      <Star size={11} className="fill-amber-500 text-amber-500" /> {item.rating || 0}
                    </span>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold text-base text-text-main leading-tight line-clamp-1">{item.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <MapPin size={12} /> <span className="line-clamp-1">{item.area} · {item.location}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-primary bg-primary/5 px-2 py-0.5 rounded">
                      Rp{((item.priceMin || 0) / 1000).toFixed(0)}k - {((item.priceMax || 0) / 1000).toFixed(0)}k
                    </span>
                    <span className="flex items-center gap-1 text-xs text-text-secondary">
                      <Clock3 size={11} /> {item.hours || '-'}
                    </span>
                    {item.itemCategory && <span className="text-xs text-muted bg-surface-alt px-2 py-0.5 rounded">{item.itemCategory}</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted text-sm">{emptyText}</p>
          </div>
        )}
      </section>

      <DirectoryModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </main>
  );
}

function DirectoryModal({ item, onClose }) {
  if (!item) return null;

  const links = [
    { label: 'Google Maps', url: item.mapsUrl },
    { label: 'Instagram', url: item.instagram },
    { label: 'Booking', url: item.bookingUrl },
    { label: item.secondaryLabel || 'Link', url: item.secondaryUrl },
  ].filter(link => link.url);

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm sm:p-4 modal-backdrop" onClick={onClose}>
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-2xl max-h-[92vh] sm:max-h-[88vh] overflow-y-auto relative shadow-2xl modal-panel-bottom" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors">
          <X size={16} />
        </button>
        {item.photo ? (
          <img src={item.photo} alt={item.name} className="w-full h-52 sm:h-64 object-cover" />
        ) : (
          <div className="w-full h-44 bg-surface-alt flex items-center justify-center text-muted">No image</div>
        )}
        <div className="p-5 sm:p-6 space-y-4 modal-content">
          <div>
            <h2 className="text-2xl font-bold text-text-main">{item.name}</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 text-sm text-amber-600 font-medium">
                <Star size={14} className="fill-amber-500 text-amber-500" /> {item.rating || 0} ({item.reviewCount || 0})
              </span>
              {item.area && <span className="text-xs font-medium text-accent-light bg-accent/5 px-2 py-0.5 rounded">{item.area}</span>}
              {item.itemCategory && <span className="text-xs text-muted bg-surface-alt px-2 py-0.5 rounded">{item.itemCategory}</span>}
            </div>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">{item.description || 'Belum ada deskripsi.'}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InfoBlock label="Lokasi" value={`${item.location || '-'}${item.area ? `, ${item.area}` : ''}`} />
            <InfoBlock label="Jam" value={item.hours || '-'} />
            <InfoBlock label="Harga" value={`Rp${((item.priceMin || 0) / 1000).toFixed(0)}k - Rp${((item.priceMax || 0) / 1000).toFixed(0)}k`} />
            <InfoBlock label="Tags" value={item.tags?.join(', ') || '-'} />
          </div>
          {links.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {links.map(link => (
                <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 h-10 px-4 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors">
                  <ExternalLink size={14} /> {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ label, value }) {
  return (
    <div className="p-3 rounded-xl bg-surface-alt border border-border-light">
      <div className="text-xs font-medium text-muted uppercase tracking-wide">{label}</div>
      <div className="text-sm font-medium text-text-main mt-0.5">{value}</div>
    </div>
  );
}
