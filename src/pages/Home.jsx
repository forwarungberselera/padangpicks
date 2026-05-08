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
  
  // Filters
  const [search, setSearch] = useState('');
  const [area, setArea] = useState('all');
  const [price, setPrice] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Modal
  const [selectedShop, setSelectedShop] = useState(null);

  const handleShopUpdated = (updatedShop) => {
    setData(prev => prev.map(shop => shop.id === updatedShop.id ? updatedShop : shop));
    setSelectedShop(updatedShop);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!supabase) {
        setData(fallbackData || []);
        setLoading(false);
        return;
      }

      try {
        const { data: shops, error } = await supabase.from('coffee_shops').select('*');
        if (error || !shops || shops.length === 0) {
          // If fallbackData is available use it, else empty
          setData(fallbackData || []);
        } else {
          setData(normalizeCoffeeShops(shops));
        }
      } catch (err) {
        console.error('Fetch error', err);
        setData(fallbackData || []);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    let result = [...data];

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(shop => 
        shop.name.toLowerCase().includes(q) || 
        shop.location.toLowerCase().includes(q) ||
        shop.area.toLowerCase().includes(q) ||
        shop.tags?.some(t => t.toLowerCase().includes(q))
      );
    }

    // Area
    if (area !== 'all') {
      result = result.filter(shop => shop.area === area);
    }

    // Price
    if (price !== 'all') {
      result = result.filter(shop => shop.priceCategory === price);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'reviews') return (b.reviewCount || 0) - (a.reviewCount || 0);
      if (sortBy === 'price_asc') return (a.priceMin || 0) - (b.priceMin || 0);
      if (sortBy === 'price_desc') return (b.priceMin || 0) - (a.priceMin || 0);
      // newest
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

    return result;
  }, [data, search, area, price, sortBy]);

  // Extract unique areas
  const areas = useMemo(() => [...new Set(data.map(shop => shop.area))].filter(Boolean), [data]);
  const activeFilterCount = [search, area !== 'all', price !== 'all', sortBy !== 'newest'].filter(Boolean).length;

  return (
    <main className="pb-12">
      <section className="w-[min(1200px,calc(100%-1rem))] sm:w-[min(1200px,calc(100%-1.5rem))] mx-auto pt-6 sm:pt-9">
        <div className="rounded-[30px] bg-[linear-gradient(135deg,#431417,#ff1818_58%,#2cb5a7)] p-5 sm:p-8 text-white shadow-[0_20px_44px_rgba(255,24,24,0.16)]">
          <div className="text-xs font-black uppercase tracking-[0.2em] text-white/74">Coffee Directory</div>
          <h1 className="mt-2 font-display text-[clamp(2.25rem,6vw,4.2rem)] leading-none text-white">Coffee Shop Padang</h1>
          <p className="mt-3 max-w-2xl text-sm sm:text-base font-bold leading-relaxed text-white/84">
            Jelajahi coffee shop, cafe, dan tempat nongkrong pilihan di Padang dengan filter area, harga, rating, dan urutan yang mudah dipakai.
          </p>
        </div>
      </section>

      <div className="w-[min(1180px,calc(100%-1rem))] sm:w-[min(1180px,calc(100%-1.5rem))] mx-auto mt-4 sticky top-2 sm:top-3 z-50">
        <button
          type="button"
          onClick={() => setFiltersOpen(open => !open)}
          className="sm:hidden w-full min-h-[50px] inline-flex items-center justify-center gap-2 rounded-[18px] border border-white/70 bg-white/94 px-4 text-sm font-black text-[#431417] shadow-[0_16px_34px_rgba(52,19,20,0.14)] backdrop-blur-xl"
          aria-expanded={filtersOpen}
        >
          <SlidersHorizontal size={18} className="text-[#0e8f85]" />
          Filter
          {activeFilterCount > 0 && (
            <span className="grid h-6 min-w-6 place-items-center rounded-full bg-primary px-2 text-xs text-white">
              {activeFilterCount}
            </span>
          )}
        </button>

        <div className={`${filtersOpen ? 'grid' : 'hidden'} sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.9fr_0.9fr_0.9fr] gap-2 sm:gap-3 rounded-[20px] sm:rounded-[24px] border border-white/70 bg-white/92 p-2 sm:p-3 mt-2 sm:mt-0 shadow-[0_20px_44px_rgba(52,19,20,0.12)] backdrop-blur-xl`}>
          <label className="relative block sm:col-span-2 lg:col-span-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0e8f85]">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Cari nama, lokasi, atau tag"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full min-h-[46px] sm:min-h-[52px] pl-10 pr-3 border border-primary/10 rounded-2xl text-sm font-bold bg-white focus:border-[#2cb5a7] focus:ring-4 focus:ring-[#2cb5a7]/12 outline-none transition-all placeholder:text-[#9a7c67]"
            />
          </label>

          <label className="relative block">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0e8f85]">
              <MapPin size={18} />
            </span>
            <select
              value={area}
              onChange={e => setArea(e.target.value)}
              className="w-full min-h-[46px] sm:min-h-[52px] pl-10 pr-3 border border-primary/10 rounded-2xl text-sm font-bold bg-white focus:border-[#2cb5a7] focus:ring-4 focus:ring-[#2cb5a7]/12 outline-none transition-all"
            >
              <option value="all">Semua Area</option>
              {areas.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </label>

          <label className="relative block">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0e8f85]">
              <SlidersHorizontal size={18} />
            </span>
            <select
              value={price}
              onChange={e => setPrice(e.target.value)}
              className="w-full min-h-[46px] sm:min-h-[52px] pl-10 pr-3 border border-primary/10 rounded-2xl text-sm font-bold bg-white focus:border-[#2cb5a7] focus:ring-4 focus:ring-[#2cb5a7]/12 outline-none transition-all"
            >
              <option value="all">Semua Harga</option>
              <option value="budget">Budget (&lt; 25k)</option>
              <option value="mid">Menengah (25k - 50k)</option>
              <option value="premium">Premium (&gt; 50k)</option>
            </select>
          </label>

          <label className="relative block sm:col-span-2 lg:col-span-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0e8f85]">
              <ArrowUpDown size={18} />
            </span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="w-full min-h-[46px] sm:min-h-[52px] pl-10 pr-3 border border-primary/10 rounded-2xl text-sm font-bold bg-white focus:border-[#2cb5a7] focus:ring-4 focus:ring-[#2cb5a7]/12 outline-none transition-all"
            >
              <option value="newest">Terbaru Ditambahkan</option>
              <option value="rating">Rating Tertinggi</option>
              <option value="price_asc">Harga Terendah</option>
              <option value="price_desc">Harga Tertinggi</option>
              <option value="reviews">Ulasan Terbanyak</option>
            </select>
          </label>
        </div>
      </div>

      <section className="w-[min(1200px,calc(100%-1rem))] sm:w-[min(1200px,calc(100%-1.5rem))] mx-auto mt-5 sm:mt-6">
        <div className="inline-flex w-full justify-center md:w-fit items-center rounded-2xl border border-primary/10 bg-white px-4 py-3 text-sm font-black text-[#431417] shadow-sm">
          {filteredData.length} tempat
        </div>
      </section>

      {loading ? (
        <div className="text-center p-12 text-muted font-bold">Memuat data...</div>
      ) : filteredData.length > 0 ? (
        <div className="grid grid-cols-1 min-[390px]:grid-cols-[repeat(auto-fill,minmax(290px,1fr))] gap-4 sm:gap-5 p-3 sm:p-4 max-w-[1220px] mx-auto">
          {filteredData.map(shop => (
            <CoffeeCard key={shop.id || shop.name} shop={shop} onClick={setSelectedShop} />
          ))}
        </div>
      ) : (
        <div className="text-center p-16 text-gray-400 text-sm font-bold">
          Tidak ada coffee shop yang cocok.
        </div>
      )}

      {/* CTA */}
      <section className="w-[min(1200px,calc(100%-1rem))] sm:w-[min(1200px,calc(100%-1.5rem))] mx-auto mt-6 p-5 sm:p-6 md:p-8 rounded-[24px] sm:rounded-[30px] bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_28%),linear-gradient(135deg,#b00000_0%,#ff1818_52%,#ff3300_100%)] text-[#fff8f7] shadow-[0_20px_42px_rgba(255,24,24,0.18)] border border-white/10 relative overflow-hidden">
        <div className="absolute inset-x-[-8%] bottom-[-64px] h-[140px] bg-gradient-to-b from-white/10 to-transparent rounded-full pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-stretch justify-between gap-6">
          <div className="flex-1 max-w-[44rem]">
            <div className="inline-flex py-1.5 px-3 rounded-full mb-3 bg-white/10 border border-white/20 text-xs font-extrabold tracking-widest uppercase">
              Listing Partnership
            </div>
            <h3 className="font-display text-[clamp(1.7rem,3vw,2.35rem)] leading-tight mb-2 max-w-[18ch]">
              Punya coffee shop yang ingin tampil di PadangPicks?
            </h3>
            <p className="text-[0.95rem] leading-relaxed text-white/90 font-bold max-w-[56ch]">
              Kami membuka peluang listing untuk coffee shop, cafe, dan tempat hangout yang relevan dengan kurasi PadangPicks.
            </p>
          </div>
          <div className="flex flex-col items-stretch justify-center gap-3 w-full md:min-w-[280px] md:w-auto p-4 rounded-[22px] bg-white/10 border border-white/10 backdrop-blur-md">
            <a href="mailto:hello@padangpicks.com" className="inline-flex items-center justify-center min-h-[54px] px-5 rounded-2xl font-black text-[0.92rem] text-primary bg-white shadow-[0_14px_28px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(0,0,0,0.16)] transition-all">
              Kirim Email Pengajuan
            </a>
            <p className="text-xs text-white/80 font-bold leading-relaxed text-center">
              Tim kami akan mereview tempatmu dalam 1-2 hari kerja.
            </p>
          </div>
        </div>
      </section>

      <footer className="text-center p-8 text-xs text-[#9d6b6f] mt-4 font-bold">
        &copy; {new Date().getFullYear()} PadangPicks. Dibangun dengan cinta dan kopi di Kota Padang.
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
