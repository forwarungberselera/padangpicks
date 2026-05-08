import { useCallback, useEffect, useState } from 'react';
import { AuthContext } from './auth-context';
import { supabase } from '../lib/supabase';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [favorites, setFavorites] = useState([]);
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

      // Fetch favs
      const { data: favsData } = await supabase
        .from('favorites')
        .select('coffee_shop_id')
        .eq('user_id', authUser.id);
        
      if (favsData) {
        setFavorites(favsData.map(f => f.coffee_shop_id));
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
      options: {
        data: { full_name: fullName }
      }
    });
    if (error) throw error;
  };

  const logout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  const toggleFavorite = async (shopId) => {
    if (!user || !supabase) return false;
    
    const isFav = favorites.includes(shopId);
    try {
      if (isFav) {
        // Remove
        await supabase.from('favorites').delete().eq('user_id', user.id).eq('coffee_shop_id', shopId);
        setFavorites(prev => prev.filter(id => id !== shopId));
      } else {
        // Add
        await supabase.from('favorites').insert({ user_id: user.id, coffee_shop_id: shopId });
        setFavorites(prev => [...prev, shopId]);
      }
      return !isFav;
    } catch (err) {
      console.error('Error toggling fav:', err);
      return isFav; // Return original state on error
    }
  };

  const isFavorite = (shopId) => favorites.includes(shopId);

  return (
    <AuthContext.Provider value={{
      user,
      isAdmin,
      favorites,
      loading,
      login,
      register,
      logout,
      toggleFavorite,
      isFavorite
    }}>
      {children}
    </AuthContext.Provider>
  );
};
