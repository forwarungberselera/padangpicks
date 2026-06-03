import { useCallback, useEffect, useMemo, useState } from 'react';
import { Clock3, ExternalLink, MapPin, Search, SlidersHorizontal, Star, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { normalizeCoffeeShops } from '../lib/coffee-shop-mapper';
import { useModalHistory } from '../hooks/useModalHistory';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import Pagination from './Pagination';

const PAGE_SIZE = 9;

export default function DirectoryPage({ table, title, description, emptyText }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [area, setArea] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [selectedItem, setSelectedItem] = useState(null);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    const fetchItems = async () => {
      if (!supabase) { setLoading(false); return; }
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .order('created_at', { ascending: false });
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
    const q = search.trim().toLowerCase();
    let result = [...items];
    if (q) {
      result = result.filter(item =>
        [item.name, item.area, item.location, item.itemCategory, ...(item.tags || [])]
          .filter(Boolean)
          .some(v => String(v).toLowerCase().includes(q))
      );
    }
    if (area !== 'all') result = result.filter(item => item.area === area);
    result.sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'price_asc') return (a.priceMin || 0) - (b.priceMin || 0);
      if (sortBy === 'featured') return Number(b.isFeatured || false) - Number(a.isFeatured || false);
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });
    return result;
  }, [items, search, area, sortBy]);

  const handleCloseModal = useCallback(() => setSelectedItem(null), []);

  // Reset ke halaman 1 setiap filter / search berubah
  useEffect(() => { setPage(1); }, [search, area, sortBy]);

  const totalPages = Math.ceil(filteredItems.length / PAGE_SIZE);
  const pagedItems = filteredItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <main className="min-h-screen pb-20 md:pb-16">
      {/* Hero */}
      <section className="bg-cream">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <h1 className="font-display text-3xl sm:text-4xl text-primary">{title}</h1>
          <p className="mt-2 text-sm sm:text-base text-text-secondary max-w-xl">{description}</p>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="sticky top-14 sm:top-16 z-40 bg-white/90 backdrop-blur-xl border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex gap-2">
            <label className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Cari..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full h-11 pl-10 pr-4 text-sm border border-border rounded-xl bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center text-muted"
                  aria-label="Hapus pencarian"
                >
                  <X size={16} />
                </button>
              )}
            </label>
            <button
              onClick={() => setFiltersVisible(!filtersVisible)}
              className="sm:hidden h-11 w-11 flex items-center justify-center rounded-xl border border-border bg-white active:scale-95 transition-transform"
              aria-label="Filter"
            >
              <SlidersHorizontal size={18} className="text-text-secondary" />
            </button>
          </div>
          <div className={`${filtersVisible ? 'flex' : 'hidden'} sm:flex flex-wrap gap-2 mt-2`}>
            <select
              value={area}
              onChange={e => setArea(e.target.value)}
              className="h-10 px-3 pr-8 text-sm border border-border rounded-xl bg-white outline-none appearance-none"
            >
              <option value="all">Semua Area</option>
              {areas.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="h-10 px-3 pr-8 text-sm border border-border rounded-xl bg-white outline-none appearance-none"
            >
              <option value="featured">Featured</option>
              <option value="rating">Rating Tertinggi</option>
              <option value="price_asc">Harga Terendah</option>
              <option value="newest">Terbaru</option>
            </select>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mt-5">
        <p className="text-sm text-muted font-medium mb-4">
          {loading ? 'Memuat...' : `${filteredItems.length} tempat`}
        </p>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
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
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pagedItems.map(item => (
                <button
                  key={item.id || item.name}
                  type="button"
                  onClick={() => setSelectedItem(item)}
                  className="group text-left bg-white rounded-2xl border border-border overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {item.photo
                      ? <img src={item.photo} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                      : <div className="w-full h-full bg-cream flex items-center justify-center text-sm text-muted">Tidak ada foto</div>
                    }
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                      {item.isFeatured && (
                        <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-cream/90 text-primary backdrop-blur-sm">Featured</span>
                      )}
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold bg-white/90 text-text-main backdrop-blur-sm">
                        <Star size={11} className="fill-amber-500 text-amber-500" />
                        {item.rating || 0}
                      </span>
                    </div>
                  </div>
                  <div className="p-3.5 sm:p-4 space-y-2">
                    <h3 className="font-semibold text-base text-text-main leading-tight line-clamp-1">{item.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                      <MapPin size={12} className="text-primary/60 shrink-0" />
                      <span className="line-clamp-1">{item.area} · {item.location}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-primary bg-cream px-2.5 py-1 rounded-lg">
                        Rp{((item.priceMin || 0) / 1000).toFixed(0)}k - {((item.priceMax || 0) / 1000).toFixed(0)}k
                      </span>
                      <span className="flex items-center gap-1 text-xs text-text-secondary">
                        <Clock3 size={11} />
                        {item.hours || '-'}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => {
                setPage(p);
                window.scrollTo({ top: 220, behavior: 'smooth' });
              }}
              totalItems={filteredItems.length}
              pageSize={PAGE_SIZE}
            />
          </>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-cream flex items-center justify-center mx-auto mb-4">
              <Search size={28} className="text-primary/50" />
            </div>
            <h3 className="font-display text-lg text-primary mb-1">
              {search ? 'Tidak Ditemukan' : 'Belum Ada Data'}
            </h3>
            <p className="text-sm text-muted max-w-xs mx-auto">
              {search ? `Tidak ada hasil untuk "${search}".` : emptyText}
            </p>
            {search && (
              <button
                onClick={() => { setSearch(''); setArea('all'); }}
                className="mt-4 h-10 px-5 text-sm font-semibold text-cream bg-primary rounded-xl active:scale-95 transition-transform"
              >
                Reset Filter
              </button>
            )}
          </div>
        )}
      </section>

      <DirectoryModal item={selectedItem} onClose={handleCloseModal} />
    </main>
  );
}

function DirectoryModal({ item, onClose }) {
  const isOpen = Boolean(item);

  const handleClose = useCallback(() => onClose(), [onClose]);
  useModalHistory(isOpen, handleClose);
  useBodyScrollLock(isOpen);

  if (!item) return null;

  const links = [
    { label: 'Google Maps', url: item.mapsUrl },
    { label: 'Instagram', url: item.instagram },
    { label: 'Booking', url: item.bookingUrl },
  ].filter(l => l.url);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm sm:p-4 modal-backdrop"
      onClick={handleClose}
    >
      <div
        className="bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl max-h-[92vh] sm:max-h-[88vh] overflow-y-auto overscroll-contain relative shadow-2xl modal-panel-bottom"
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="sm:hidden sticky top-0 z-10 pt-3 pb-1 bg-white">
          <div className="w-10 h-1 bg-border rounded-full mx-auto" />
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors"
          aria-label="Tutup"
        >
          <X size={18} />
        </button>

        {/* Image */}
        {item.photo
          ? <img src={item.photo} alt={item.name} className="w-full h-48 sm:h-64 object-cover" />
          : <div className="w-full h-40 bg-cream flex items-center justify-center text-muted text-sm">Tidak ada foto</div>
        }

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4 modal-content">
          <div>
            <h2 className="font-display text-2xl text-primary">{item.name}</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 text-sm text-amber-600 font-medium">
                <Star size={14} className="fill-amber-500 text-amber-500" />
                {item.rating || 0}
              </span>
              {item.area && (
                <span className="text-xs font-medium text-primary bg-cream px-2.5 py-0.5 rounded-lg">{item.area}</span>
              )}
              {item.itemCategory && (
                <span className="text-xs text-muted bg-surface-alt px-2.5 py-0.5 rounded-lg">{item.itemCategory}</span>
              )}
            </div>
          </div>

          <p className="text-sm text-text-secondary leading-relaxed">
            {item.description || 'Belum ada deskripsi.'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <InfoBlock label="Lokasi" value={`${item.location}, ${item.area}`} />
            <InfoBlock label="Jam" value={item.hours || '-'} />
            <InfoBlock
              label="Harga"
              value={`Rp${((item.priceMin || 0) / 1000).toFixed(0)}k - ${((item.priceMax || 0) / 1000).toFixed(0)}k`}
            />
          </div>

          {links.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-2 pb-2">
              {links.map(l => (
                <a
                  key={l.label}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 h-12 inline-flex items-center justify-center gap-2 text-sm font-semibold text-cream bg-primary rounded-xl active:scale-95 transition-transform"
                >
                  <ExternalLink size={14} />
                  {l.label}
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
      <div className="text-xs text-muted uppercase tracking-wide">{label}</div>
      <div className="text-sm font-medium text-text-main mt-0.5">{value}</div>
    </div>
  );
}
