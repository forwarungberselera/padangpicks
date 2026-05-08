import { useEffect, useMemo, useState } from 'react';
import { ArrowUpDown, Clock3, ExternalLink, MapPin, Search, Star, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { normalizeCoffeeShops } from '../lib/coffee-shop-mapper';

export default function DirectoryPage({ table, eyebrow, title, description, emptyText }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [area, setArea] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchItems = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }

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

    return () => {
      cancelled = true;
    };
  }, [table]);

  const areas = useMemo(() => [...new Set(items.map(item => item.area))].filter(Boolean), [items]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    let result = [...items];

    if (query) {
      result = result.filter(item => [
        item.name,
        item.area,
        item.location,
        item.itemCategory,
        ...(item.tags || []),
      ].filter(Boolean).some(value => String(value).toLowerCase().includes(query)));
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
    <main className="pb-12">
      <section className="w-[min(1200px,calc(100%-1rem))] sm:w-[min(1200px,calc(100%-1.5rem))] mx-auto pt-6 sm:pt-9">
        <div className="rounded-[30px] bg-[linear-gradient(135deg,#431417,#ff1818_58%,#2cb5a7)] p-5 sm:p-8 text-white shadow-[0_20px_44px_rgba(255,24,24,0.16)]">
          <div className="text-xs font-black uppercase tracking-[0.2em] text-white/74">{eyebrow}</div>
          <h1 className="mt-2 font-display text-[clamp(2.25rem,6vw,4.2rem)] leading-none text-white">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm sm:text-base font-bold leading-relaxed text-white/84">{description}</p>
        </div>
      </section>

      <section className="w-[min(1180px,calc(100%-1rem))] sm:w-[min(1180px,calc(100%-1.5rem))] mx-auto mt-4 grid gap-2 rounded-[24px] border border-white/70 bg-white/92 p-2 sm:grid-cols-[1.4fr_0.9fr_0.9fr] sm:p-3 shadow-[0_20px_44px_rgba(52,19,20,0.12)] backdrop-blur-xl">
        <label className="relative block">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0e8f85]" />
          <input
            type="text"
            placeholder="Cari nama, lokasi, atau tag"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full min-h-[50px] rounded-2xl border border-primary/10 bg-white pl-10 pr-3 text-sm font-bold outline-none transition-all focus:border-[#2cb5a7] focus:ring-4 focus:ring-[#2cb5a7]/12"
          />
        </label>
        <label className="relative block">
          <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0e8f85]" />
          <select value={area} onChange={e => setArea(e.target.value)} className="w-full min-h-[50px] rounded-2xl border border-primary/10 bg-white pl-10 pr-3 text-sm font-bold outline-none transition-all focus:border-[#2cb5a7] focus:ring-4 focus:ring-[#2cb5a7]/12">
            <option value="all">Semua Area</option>
            {areas.map(itemArea => <option key={itemArea} value={itemArea}>{itemArea}</option>)}
          </select>
        </label>
        <label className="relative block">
          <ArrowUpDown size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0e8f85]" />
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="w-full min-h-[50px] rounded-2xl border border-primary/10 bg-white pl-10 pr-3 text-sm font-bold outline-none transition-all focus:border-[#2cb5a7] focus:ring-4 focus:ring-[#2cb5a7]/12">
            <option value="featured">Featured dulu</option>
            <option value="rating">Rating tertinggi</option>
            <option value="price_asc">Harga terendah</option>
            <option value="price_desc">Harga tertinggi</option>
            <option value="newest">Terbaru</option>
          </select>
        </label>
      </section>

      {loading ? (
        <div className="p-12 text-center text-muted font-bold">Memuat data...</div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 min-[390px]:grid-cols-[repeat(auto-fill,minmax(290px,1fr))] gap-4 sm:gap-5 p-3 sm:p-4 max-w-[1220px] mx-auto">
          {filteredItems.map(item => (
            <button key={item.id || item.name} type="button" onClick={() => setSelectedItem(item)} className="group flex w-full cursor-pointer flex-col overflow-hidden rounded-[22px] border border-primary/10 bg-white text-left shadow-[0_12px_30px_rgba(52,19,20,0.07)] transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/20 hover:shadow-[0_22px_46px_rgba(52,19,20,0.13)]">
              <div className="relative overflow-hidden">
                {item.photo ? (
                  <img src={item.photo} alt={item.name} className="h-[205px] w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                ) : (
                  <div className="flex h-[205px] w-full items-center justify-center bg-gradient-to-br from-[#ffd8d3] to-[#c6f4ef] text-sm font-black text-[#8c232b]">No image</div>
                )}
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/48 to-transparent" />
                <div className="absolute left-3 bottom-3 flex flex-wrap items-center gap-2">
                  {item.isFeatured && <span className="rounded-full bg-primary px-3 py-1.5 text-xs font-black text-white">Featured</span>}
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/92 px-3 py-1.5 text-xs font-black text-[#58151c] shadow-sm">
                    <Star size={13} className="fill-[#f5a623] text-[#f5a623]" />
                    {item.rating || 0}
                  </span>
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-4">
                <div>
                  <h3 className="font-display text-[1.35rem] font-bold leading-tight text-[#431417]">{item.name}</h3>
                  <div className="mt-1 flex items-start gap-1.5 text-[0.82rem] font-bold text-[#8b4a4e]">
                    <MapPin size={15} className="mt-0.5 shrink-0 text-[#0e8f85]" />
                    <span className="leading-snug">{item.area} - {item.location}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-[#fff0ed] px-3 py-1.5 font-black text-accent-dark">
                    Rp{((item.priceMin || 0) / 1000).toFixed(0)}k - {((item.priceMax || 0) / 1000).toFixed(0)}k
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#e9fbf8] px-3 py-1.5 font-black text-[#0e605b]">
                    <Clock3 size={13} />
                    {item.hours || '-'}
                  </span>
                  {item.itemCategory && <span className="rounded-full bg-[#f7f2ff] px-3 py-1.5 font-black text-[#5b3f91]">{item.itemCategory}</span>}
                </div>
                <div className="mt-auto flex flex-wrap gap-1.5">
                  {item.tags?.slice(0, 3).map(tag => (
                    <span key={tag} className="rounded-full bg-[#f7f7f4] px-2.5 py-1 text-[0.72rem] font-bold text-[#6b4b4e]">{tag}</span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="p-16 text-center text-sm font-bold text-gray-400">
          {emptyText}
        </div>
      )}

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
    { label: item.secondaryLabel || 'Link Tambahan', url: item.secondaryUrl },
  ].filter(link => link.url);

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-[#201113]/72 backdrop-blur-sm sm:items-center sm:p-4 modal-backdrop" onClick={onClose}>
      <div className="relative max-h-[92vh] w-full max-w-[680px] overflow-y-auto rounded-t-[24px] bg-white shadow-[0_28px_80px_rgba(0,0,0,0.32)] sm:max-h-[88vh] sm:rounded-[28px] modal-panel-bottom" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-2xl bg-black/42 text-white transition-colors hover:bg-black/60">
          <X size={18} />
        </button>
        {item.photo ? (
          <img src={item.photo} alt={item.name} className="h-[230px] w-full object-cover sm:h-[280px]" />
        ) : (
          <div className="flex h-[220px] w-full items-center justify-center bg-gradient-to-br from-[#ffd9d4] to-[#c6f4ef] text-sm font-black text-[#8c232b]">No image</div>
        )}
        <div className="grid gap-4 p-4 sm:p-6 modal-content">
          <div>
            <h2 className="font-display text-[clamp(1.8rem,4vw,2.45rem)] font-bold leading-none text-[#431417]">{item.name}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-black text-[#431417] shadow-sm ring-1 ring-primary/10">
                <Star size={14} className="fill-[#f5a623] text-[#f5a623]" />
                {item.rating || 0} ({item.reviewCount || 0})
              </span>
              {item.itemCategory && <span className="rounded-full bg-[#f7f2ff] px-3 py-1.5 text-xs font-black text-[#5b3f91]">{item.itemCategory}</span>}
              {item.area && <span className="rounded-full bg-[#dff8f2] px-3 py-1.5 text-xs font-black text-[#0e605b]">{item.area}</span>}
            </div>
          </div>
          <p className="rounded-2xl border border-primary/8 bg-[#fff8f6] p-4 text-sm font-bold leading-relaxed text-[#6f4749]">
            {item.description || 'Belum ada deskripsi untuk tempat ini.'}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoBlock label="Lokasi" value={`${item.location || '-'}${item.area ? `, ${item.area}` : ''}`} />
            <InfoBlock label="Jam" value={item.hours || '-'} />
            <InfoBlock label="Harga" value={`Rp${((item.priceMin || 0) / 1000).toFixed(0)}k - Rp${((item.priceMax || 0) / 1000).toFixed(0)}k`} />
            <InfoBlock label="Tags" value={item.tags?.join(', ') || '-'} />
          </div>
          {links.length > 0 && (
            <div className="grid gap-2 sm:grid-cols-2">
              {links.map(link => (
                <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-black text-white transition-colors hover:bg-accent-dark">
                  <ExternalLink size={16} />
                  {link.label}
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
    <div className="rounded-2xl border border-primary/8 bg-[#fff8f6] p-4">
      <div className="mb-1 text-xs font-black uppercase tracking-wide text-[#0e8f85]">{label}</div>
      <div className="text-sm font-bold text-[#341314]">{value}</div>
    </div>
  );
}
