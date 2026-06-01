import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import CoffeeCard from '../components/CoffeeCard';
import CoffeeModal from '../components/CoffeeModal';
import { coffeeShops as fallbackData } from '../lib/coffee-data.js';
import { normalizeCoffeeShops } from '../lib/coffee-shop-mapper.js';
import { ArrowUpDown, MapPin, Search, SlidersHorizontal, X } from 'lucide-react';

export default function Home() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [area, setArea] = useState('all');
  const [price, setPrice] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedShop, setSelectedShop] = useState(null);
  const [filtersVisible, setFiltersVisible] = useState(false);

  const handleShopUpdated = (updatedShop) => {
    setData(prev => prev.map(shop => shop.id === updatedShop.id ? updatedShop : shop));
    setSelectedShop(updatedShop);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!supabase) { setData(fallbackData || []); setLoading(false); return; }
      try {
        const { data: shops, error } = await supabase.from('coffee_shops').select('*');
        if (error || !shops || shops.length === 0) { setData(fallbackData || []); }
        else { setData(normalizeCoffeeShops(shops)); }
      } catch { setData(fallbackData || []); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    let result = [...data];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(shop =>
        shop.name.toLowerCase().includes(q) ||
        shop.location?.toLowerCase().includes(q) ||
        shop.area?.toLowerCase().includes(q) ||
        shop.tags?.some(t => t.toLowerCase().includes(q))
      );
    }
    if (area !== 'all') result = result.filter(shop => shop.area === area);
    if (price !== 'all') result = result.filter(shop => shop.priceCategory === price);
    result.sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'reviews') return (b.reviewCount || 0) - (a.reviewCount || 0);
      if (sortBy === 'price_asc') return (a.priceMin || 0) - (b.priceMin || 0);
      if (sortBy === 'price_desc') return (b.priceMin || 0) - (a.priceMin || 0);
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });
    return result;
  }, [data, search, area, price, sortBy]);

  const areas = useMemo(() => [...new Set(data.map(shop => shop.area))].filter(Boolean), [data]);
  const activeFilters = [area !== 'all', price !== 'all', sortBy !== 'newest'].filter(Boolean).length;

  return (
    <main className="min-h-screen pb-20 md:pb-16">
      {/* Hero */}
      <section className="bg-gradient-to-b from-cream to-cream-light overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-14 lg:py-16">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-12">
            {/* Left content */}
            <div className="flex-1 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 border border-cream-dark text-xs font-semibold text-primary mb-4">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {data.length} tempat terkurasi
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-primary leading-[1.1]">
                Spot ngopi & hangout terbaik di Padang
              </h1>
              <p className="mt-4 text-sm sm:text-base text-text-secondary leading-relaxed">
                Kurasi coffee shop, cafe, dan tempat nongkrong pilihan dengan rating dari komunitas lokal.
              </p>

              {/* Quick area pills */}
              {areas.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {areas.slice(0, 5).map(a => (
                    <button
                      key={a}
                      onClick={() => { setArea(a); window.scrollTo({ top: 300, behavior: 'smooth' }); }}
                      className={`h-8 px-3.5 text-xs font-medium rounded-full border transition-all active:scale-95 ${
                        area === a
                          ? 'bg-primary text-cream border-primary'
                          : 'bg-white text-text-secondary border-border hover:border-primary hover:text-primary'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                  {areas.length > 5 && (
                    <span className="h-8 px-3 text-xs font-medium text-muted flex items-center">
                      +{areas.length - 5} lagi
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Right stats cards - desktop only */}
            <div className="hidden lg:grid grid-cols-2 gap-3 w-[280px] shrink-0">
              <StatCard emoji="☕" value={data.length} label="Coffee Shop" />
              <StatCard emoji="⭐" value={data.filter(s => s.rating >= 4).length} label="Rating 4+" />
              <StatCard emoji="💰" value={data.filter(s => s.priceCategory === 'budget').length} label="Budget" />
              <StatCard emoji="🌙" value={data.filter(s => s.closeHour >= 22 || s.closeHour <= 2).length} label="Late Night" />
            </div>

            {/* Mobile stats row */}
            <div className="lg:hidden flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
              <MiniStat emoji="☕" value={data.length} label="Tempat" />
              <MiniStat emoji="⭐" value={data.filter(s => s.rating >= 4).length} label="Rating 4+" />
              <MiniStat emoji="💰" value={data.filter(s => s.priceCategory === 'budget').length} label="Budget" />
              <MiniStat emoji="🌙" value={data.filter(s => s.closeHour >= 22 || s.closeHour <= 2).length} label="Late Night" />
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="sticky top-14 sm:top-16 z-40 bg-white/90 backdrop-blur-xl border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex gap-2">
            {/* Search input */}
            <label className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Cari coffee shop..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full h-11 pl-10 pr-4 text-sm border border-border rounded-xl bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
                  <X size={16} />
                </button>
              )}
            </label>
            {/* Filter toggle (mobile) */}
            <button
              onClick={() => setFiltersVisible(!filtersVisible)}
              className="sm:hidden h-11 w-11 flex items-center justify-center rounded-xl border border-border bg-white relative active:scale-95 transition-transform"
            >
              <SlidersHorizontal size={18} className="text-text-secondary" />
              {activeFilters > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 grid place-items-center rounded-full bg-primary text-cream text-[10px] font-bold">{activeFilters}</span>
              )}
            </button>
          </div>

          {/* Desktop filters always visible, mobile toggleable */}
          <div className={`${filtersVisible ? 'flex' : 'hidden'} sm:flex flex-wrap gap-2 mt-2 sm:mt-2`}>
            <select value={area} onChange={e => setArea(e.target.value)} className="h-10 px-3 pr-8 text-sm border border-border rounded-xl bg-white focus:border-primary outline-none transition-all appearance-none">
              <option value="all">Semua Area</option>
              {areas.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <select value={price} onChange={e => setPrice(e.target.value)} className="h-10 px-3 pr-8 text-sm border border-border rounded-xl bg-white focus:border-primary outline-none transition-all appearance-none">
              <option value="all">Semua Harga</option>
              <option value="budget">Budget (&lt; 25k)</option>
              <option value="mid">Menengah (25-50k)</option>
              <option value="premium">Premium (&gt; 50k)</option>
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="h-10 px-3 pr-8 text-sm border border-border rounded-xl bg-white focus:border-primary outline-none transition-all appearance-none">
              <option value="newest">Terbaru</option>
              <option value="rating">Rating Tertinggi</option>
              <option value="price_asc">Harga Terendah</option>
              <option value="price_desc">Harga Tertinggi</option>
            </select>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mt-5">
        <p className="text-sm text-muted font-medium mb-4">
          {loading ? 'Memuat...' : `${filteredData.length} tempat ditemukan`}
        </p>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-border overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-surface-alt" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-surface-alt rounded w-3/4" />
                  <div className="h-3 bg-surface-alt rounded w-1/2" />
                  <div className="h-3 bg-surface-alt rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredData.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredData.map(shop => (
              <CoffeeCard key={shop.id || shop.name} shop={shop} onClick={setSelectedShop} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted text-sm">Tidak ada coffee shop yang cocok dengan filter.</p>
            <button onClick={() => { setSearch(''); setArea('all'); setPrice('all'); }} className="mt-3 text-sm font-medium text-primary">
              Reset filter
            </button>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 sm:px-6 mt-12 pt-6 border-t border-border">
        <p className="text-center text-xs text-muted pb-6">
          &copy; {new Date().getFullYear()} Harmonee. Dibuat dengan cinta di Kota Padang.
        </p>
      </footer>

      <CoffeeModal
        shop={selectedShop}
        isOpen={!!selectedShop}
        onClose={() => setSelectedShop(null)}
        onShopUpdated={handleShopUpdated}
      />
    </main>
  );
}


function StatCard({ emoji, value, label }) {
  return (
    <div className="rounded-2xl bg-white border border-border p-4 text-center">
      <div className="text-2xl mb-1">{emoji}</div>
      <div className="text-2xl font-bold text-primary">{value}</div>
      <div className="text-xs text-muted font-medium mt-0.5">{label}</div>
    </div>
  );
}

function MiniStat({ emoji, value, label }) {
  return (
    <div className="shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white border border-border">
      <span className="text-lg">{emoji}</span>
      <div>
        <div className="text-base font-bold text-primary leading-none">{value}</div>
        <div className="text-[11px] text-muted font-medium mt-0.5">{label}</div>
      </div>
    </div>
  );
}
