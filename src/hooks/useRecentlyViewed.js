import { useState, useCallback } from 'react';

const STORAGE_KEY = 'harmonee_recently_viewed';
const MAX_ITEMS = 8;

function getStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useRecentlyViewed() {
  const [items, setItems] = useState(getStored);

  const addItem = useCallback((shop) => {
    if (!shop || !shop.name) return;
    const entry = {
      id: shop.id || shop.name,
      name: shop.name,
      area: shop.area || '',
      photo: shop.photo || '',
      rating: shop.rating || 0,
      viewedAt: Date.now(),
    };
    setItems(prev => {
      const filtered = prev.filter(i => i.id !== entry.id);
      const updated = [entry, ...filtered].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setItems([]);
  }, []);

  return { recentlyViewed: items, addItem, clearAll };
}

export default useRecentlyViewed;
