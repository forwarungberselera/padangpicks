import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Hook to manage favorites for any item type (coffee_shop, hotel, lifestyle)
 * @param {string} userId - Current user ID
 * @param {string} itemType - Type of item ('coffee_shop', 'hotel', 'lifestyle')
 */
export function useFavorites(userId, itemType = 'coffee_shop') {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch user favorites
  const fetchFavorites = useCallback(async () => {
    if (!userId || !supabase) return;
    
    setLoading(true);
    try {
      // Support both old schema (coffee_shop_id) and new schema (item_id + item_type)
      let query;
      if (itemType === 'coffee_shop') {
        // Backward compatible: check both coffee_shop_id and item_id
        query = supabase
          .from('favorites')
          .select('*')
          .eq('user_id', userId)
          .or(`item_type.eq.coffee_shop,item_type.is.null`);
      } else {
        query = supabase
          .from('favorites')
          .select('*')
          .eq('user_id', userId)
          .eq('item_type', itemType);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Normalize: extract item IDs
      const ids = (data || []).map(f => f.item_id || f.coffee_shop_id);
      setFavorites(ids.filter(Boolean));
    } catch (err) {
      console.error('Error fetching favorites:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, itemType]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  // Toggle favorite
  const toggleFavorite = useCallback(async (itemId) => {
    if (!userId || !supabase) return false;

    const isFav = favorites.includes(itemId);
    
    try {
      if (isFav) {
        // Remove
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', userId)
          .eq(itemType === 'coffee_shop' ? 'coffee_shop_id' : 'item_id', itemId);
        
        if (error) throw error;
        setFavorites(prev => prev.filter(id => id !== itemId));
      } else {
        // Add
        const insertData = {
          user_id: userId,
          item_type: itemType,
        };
        
        // Backward compatible for coffee_shop
        if (itemType === 'coffee_shop') {
          insertData.coffee_shop_id = itemId;
        }
        insertData.item_id = itemId;

        const { error } = await supabase
          .from('favorites')
          .insert(insertData);
        
        if (error) throw error;
        setFavorites(prev => [...prev, itemId]);
      }
      return true;
    } catch (err) {
      console.error('Error toggling favorite:', err);
      return false;
    }
  }, [userId, itemType, favorites]);

  const isFavorite = useCallback((itemId) => {
    return favorites.includes(itemId);
  }, [favorites]);

  return { favorites, loading, toggleFavorite, isFavorite, refetch: fetchFavorites };
}

export default useFavorites;
