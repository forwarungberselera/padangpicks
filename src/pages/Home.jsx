import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import CoffeeCard from '../components/CoffeeCard';
import CoffeeModal from '../components/CoffeeModal';
import { coffeeShops as fallbackData } from '../lib/coffee-data.js';
import { normalizeCoffeeShops } from '../lib/coffee-shop-mapper.js';
import { ArrowUpDown, MapPin, Search, SlidersHorizontal } from 'lucide-react';

export default function Home() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [area, setArea] = useState('all');
  const [price, setPrice] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedShop, setSelectedShop] = useState(null);

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
        shop.location.toLowerCase().includes(q) ||
        shop.area.toLowerCase().includes(q) ||
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

  return (
    <main className="min-h-screen pb-16">
      {/* Hero Section */}
      <section className="bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-main leading-tight">
              Temukan spot ngopi<br />
              <span className="text-primary">terbaik di Padang</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-text-secondary leading-relaxed max-w-xl">
              Kurasi coffee shop, cafe, dan tempat nongkrong pilihan di Kota Padang dengan rating dari komunitas.
            </p>
          </div>
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
              <SlidersHorizontal size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <select value={price} onChange={e => setPrice(e.target.value)} className="h-10 pl-8 pr-8 text-sm border border-border rounded-lg bg-white focus:border-primary outline-none transition-all appearance-none">
                <option value="all">Semua Harga</option>
                <option value="budget">Budget (&lt; 25k)</option>
                <option value="mid">Menengah (25-50k)</option>
                <option value="premium">Premium (&gt; 50k)</option>
              </select>
            </label>
            <label className="relative">
              <ArrowUpDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="h-10 pl-8 pr-8 text-sm border border-border rounded-lg bg-white focus:border-primary outline-none transition-all appearance-none">
                <option value="newest">Terbaru</option>
                <option value="rating">Rating Tertinggi</option>
                <option value="price_asc">Harga Terendah</option>
                <option value="price_desc">Harga Tertinggi</option>
                <option value="reviews">Ulasan Terbanyak</option>
              </select>
            </label>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-text-secondary font-medium">
            {loading ? 'Memuat...' : `${filteredData.length} tempat ditemukan`}
          </p>
        </div>

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
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mt-12">
        <div className="rounded-2xl bg-accent p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="max-w-lg">
              <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                Punya coffee shop yang ingin tampil?
              </h3>
              <p className="mt-2 text-sm text-white/70 leading-relaxed">
                Kami membuka peluang listing untuk coffee shop, cafe, dan tempat hangout di Padang.
              </p>
            </div>
            <a
              href="mailto:hello@padangpicks.com"
              className="inline-flex items-center justify-center h-11 px-6 text-sm font-semibold text-accent bg-white rounded-lg hover:bg-white/90 transition-colors shrink-0"
            >
              Kirim Pengajuan
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 sm:px-6 mt-12 pt-6 border-t border-border">
        <p className="text-center text-xs text-muted pb-6">
          &copy; {new Date().getFullYear()} PadangPicks. Dibangun dengan cinta di Kota Padang.
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
