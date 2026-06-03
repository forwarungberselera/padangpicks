import { useCallback, useEffect, useState } from 'react';
import { AuthContext } from './auth-context';
import { supabase } from '../lib/supabase';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [favorites, setFavorites] = useState([]); // [{ id, type }]
  const [loading, setLoading] = useState(Boolean(supabase));

  const handleUser = useCallback(async (authUser) => {
    if (!authUser) {
      setUser(null);
      setIsAdmin(false);
      setFavorites([]);
      setLoading(false);
      return;
    }

    try {
      setUser(authUser);

      // Fetch role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authUser.id)
        .maybeSingle();

      setIsAdmin(roleData?.role === 'admin');

      // Fetch favorites — support both old schema (coffee_shop_id only)
      // and new schema (item_id + item_type from supabase_favorites_expansion.sql)
      const { data: favsData } = await supabase
        .from('favorites')
        .select('coffee_shop_id, item_id, item_type')
        .eq('user_id', authUser.id);

      if (favsData) {
        const normalized = favsData.map(f => ({
          id: f.item_id || f.coffee_shop_id,
          type: f.item_type || 'coffee_shop',
        })).filter(f => f.id);
        setFavorites(normalized);
      }
    } catch (err) {
      console.error('Error fetching user metadata:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      return undefined;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      handleUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [handleUser]);

  const login = async (email, password) => {
    if (!supabase) throw new Error('Supabase belum dikonfigurasi.');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const register = async (email, password, fullName) => {
    if (!supabase) throw new Error('Supabase belum dikonfigurasi.');
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;
  };

  const logout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  /**
   * Toggle favorite untuk semua jenis konten.
   * @param {string} itemId  - UUID item
   * @param {string} itemType - 'coffee_shop' | 'hotel' | 'lifestyle'
   */
  const toggleFavorite = async (itemId, itemType = 'coffee_shop') => {
    if (!user || !supabase) return false;

    const isFav = favorites.some(f => f.id === itemId && f.type === itemType);

    try {
      if (isFav) {
        // Hapus — coba kolom baru (item_id) dulu, fallback ke lama (coffee_shop_id)
        const deleteQuery = supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id);

        // Jika schema sudah di-expand pakai item_id+item_type
        const { error } = await deleteQuery
          .eq('item_id', itemId)
          .eq('item_type', itemType);

        if (error) {
          // Fallback ke schema lama (hanya coffee_shop_id)
          await supabase
            .from('favorites')
            .delete()
            .eq('user_id', user.id)
            .eq('coffee_shop_id', itemId);
        }

        setFavorites(prev => prev.filter(f => !(f.id === itemId && f.type === itemType)));
      } else {
        // Tambah — insert dengan kedua kolom agar kompatibel dengan schema lama & baru
        const insertData = {
          user_id: user.id,
          item_id: itemId,
          item_type: itemType,
        };
        // Backward compat: coffee_shop_id untuk schema lama
        if (itemType === 'coffee_shop') {
          insertData.coffee_shop_id = itemId;
        }

        const { error } = await supabase.from('favorites').insert(insertData);
        if (error) throw error;

        setFavorites(prev => [...prev, { id: itemId, type: itemType }]);
      }
      return !isFav;
    } catch (err) {
      console.error('Error toggling favorite:', err);
      return isFav;
    }
  };

  /**
   * Cek apakah item sudah difavoritkan.
   * @param {string} itemId
   * @param {string} itemType
   */
  const isFavorite = (itemId, itemType = 'coffee_shop') =>
    favorites.some(f => f.id === itemId && f.type === itemType);

  // Backward-compat: expose array of IDs (coffee_shop only) for Account page
  const favoriteIds = favorites
    .filter(f => f.type === 'coffee_shop')
    .map(f => f.id);

  return (
    <AuthContext.Provider value={{
      user,
      isAdmin,
      favorites,
      favoriteIds,
      loading,
      login,
      register,
      logout,
      toggleFavorite,
      isFavorite,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
