-- ==========================================
-- SUPABASE SCHEMA SETUP UNTUK PADANGPICKS
-- ==========================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Buat tabel coffee_shops
CREATE TABLE IF NOT EXISTS public.coffee_shops (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    rating NUMERIC(2, 1) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    price_min INTEGER DEFAULT 0,
    price_max INTEGER DEFAULT 0,
    price_category TEXT,
    location TEXT,
    area TEXT,
    hours TEXT,
    open_hour NUMERIC(4, 1) DEFAULT 0,
    close_hour NUMERIC(4, 1) DEFAULT 24,
    tags JSONB DEFAULT '[]'::jsonb,
    photo TEXT,
    description TEXT,
    maps_url TEXT,
    instagram TEXT,
    item_category TEXT,
    booking_url TEXT,
    secondary_url TEXT,
    secondary_label TEXT,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.coffee_shops
ADD COLUMN IF NOT EXISTS rating NUMERIC(2, 1) DEFAULT 0,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS price_min INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS price_max INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS price_category TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS area TEXT,
ADD COLUMN IF NOT EXISTS hours TEXT,
ADD COLUMN IF NOT EXISTS open_hour NUMERIC(4, 1) DEFAULT 0,
ADD COLUMN IF NOT EXISTS close_hour NUMERIC(4, 1) DEFAULT 24,
ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS photo TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS maps_url TEXT,
ADD COLUMN IF NOT EXISTS instagram TEXT,
ADD COLUMN IF NOT EXISTS item_category TEXT,
ADD COLUMN IF NOT EXISTS booking_url TEXT,
ADD COLUMN IF NOT EXISTS secondary_url TEXT,
ADD COLUMN IF NOT EXISTS secondary_label TEXT,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- 1b. Buat tabel hotels
CREATE TABLE IF NOT EXISTS public.hotels (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    rating NUMERIC(2, 1) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    price_min INTEGER DEFAULT 0,
    price_max INTEGER DEFAULT 0,
    price_category TEXT,
    item_category TEXT,
    location TEXT,
    area TEXT,
    hours TEXT,
    open_hour NUMERIC(4, 1) DEFAULT 0,
    close_hour NUMERIC(4, 1) DEFAULT 24,
    tags JSONB DEFAULT '[]'::jsonb,
    photo TEXT,
    description TEXT,
    maps_url TEXT,
    instagram TEXT,
    booking_url TEXT,
    secondary_url TEXT,
    secondary_label TEXT,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1c. Buat tabel lifestyle_places
CREATE TABLE IF NOT EXISTS public.lifestyle_places (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    rating NUMERIC(2, 1) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    price_min INTEGER DEFAULT 0,
    price_max INTEGER DEFAULT 0,
    price_category TEXT,
    item_category TEXT,
    location TEXT,
    area TEXT,
    hours TEXT,
    open_hour NUMERIC(4, 1) DEFAULT 0,
    close_hour NUMERIC(4, 1) DEFAULT 24,
    tags JSONB DEFAULT '[]'::jsonb,
    photo TEXT,
    description TEXT,
    maps_url TEXT,
    instagram TEXT,
    booking_url TEXT,
    secondary_url TEXT,
    secondary_label TEXT,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Buat tabel user_roles (Untuk menyimpan status Admin)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'user', -- 'admin' atau 'user'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 3. Buat tabel favorites
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    coffee_shop_id UUID REFERENCES public.coffee_shops(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, coffee_shop_id)
);

-- 4. Buat tabel coffee_shop_ratings
CREATE TABLE IF NOT EXISTS public.coffee_shop_ratings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    coffee_shop_id UUID REFERENCES public.coffee_shops(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, coffee_shop_id)
);

CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO public.app_settings (key, value)
VALUES (
    'intro_popup',
    '{
      "enabled": true,
      "title": "Selamat datang di Harmonee",
      "body": "Harmonee adalah direktori kurasi untuk menemukan coffee shop, hotel, dan lifestyle spot pilihan di Kota Padang.",
      "buttonLabel": "Mulai Jelajah"
    }'::jsonb
)
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION public.refresh_coffee_shop_rating(target_shop_id UUID)
RETURNS VOID AS '
BEGIN
  UPDATE public.coffee_shops
  SET
    rating = COALESCE((
      SELECT ROUND(AVG(rating)::numeric, 1)
      FROM public.coffee_shop_ratings
      WHERE coffee_shop_id = target_shop_id
    ), 0),
    review_count = (
      SELECT COUNT(*)
      FROM public.coffee_shop_ratings
      WHERE coffee_shop_id = target_shop_id
    )
  WHERE id = target_shop_id;
END;
' LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.set_rating_updated_at()
RETURNS TRIGGER AS '
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
' LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.handle_rating_change()
RETURNS TRIGGER AS '
BEGIN
  IF TG_OP = ''DELETE'' THEN
    PERFORM public.refresh_coffee_shop_rating(OLD.coffee_shop_id);
    RETURN OLD;
  END IF;

  PERFORM public.refresh_coffee_shop_rating(NEW.coffee_shop_id);
  RETURN NEW;
END;
' LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS set_rating_updated_at ON public.coffee_shop_ratings;
CREATE TRIGGER set_rating_updated_at
BEFORE UPDATE ON public.coffee_shop_ratings
FOR EACH ROW
EXECUTE FUNCTION public.set_rating_updated_at();

DROP TRIGGER IF EXISTS refresh_rating_after_insert ON public.coffee_shop_ratings;
CREATE TRIGGER refresh_rating_after_insert
AFTER INSERT ON public.coffee_shop_ratings
FOR EACH ROW
EXECUTE FUNCTION public.handle_rating_change();

DROP TRIGGER IF EXISTS refresh_rating_after_update ON public.coffee_shop_ratings;
CREATE TRIGGER refresh_rating_after_update
AFTER UPDATE ON public.coffee_shop_ratings
FOR EACH ROW
EXECUTE FUNCTION public.handle_rating_change();

DROP TRIGGER IF EXISTS refresh_rating_after_delete ON public.coffee_shop_ratings;
CREATE TRIGGER refresh_rating_after_delete
AFTER DELETE ON public.coffee_shop_ratings
FOR EACH ROW
EXECUTE FUNCTION public.handle_rating_change();

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Aktifkan RLS di semua tabel
ALTER TABLE public.coffee_shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lifestyle_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coffee_shop_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Policy untuk coffee_shops:
-- 1. Semua orang (termasuk anonim) bisa melihat (SELECT)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.coffee_shops;
CREATE POLICY "Public profiles are viewable by everyone." 
ON public.coffee_shops FOR SELECT USING (true);

-- 2. Hanya Admin yang bisa INSERT/UPDATE/DELETE
-- (Kita buat fungsi cek admin terlebih dahulu)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS '
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = ''admin''
  );
';

DROP POLICY IF EXISTS "Admins can insert coffee shops." ON public.coffee_shops;
CREATE POLICY "Admins can insert coffee shops." 
ON public.coffee_shops FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update coffee shops." ON public.coffee_shops;
CREATE POLICY "Admins can update coffee shops." 
ON public.coffee_shops FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete coffee shops." ON public.coffee_shops;
CREATE POLICY "Admins can delete coffee shops." 
ON public.coffee_shops FOR DELETE USING (public.is_admin());

-- Policy untuk hotels:
DROP POLICY IF EXISTS "Public hotels are viewable by everyone." ON public.hotels;
CREATE POLICY "Public hotels are viewable by everyone."
ON public.hotels FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert hotels." ON public.hotels;
CREATE POLICY "Admins can insert hotels."
ON public.hotels FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update hotels." ON public.hotels;
CREATE POLICY "Admins can update hotels."
ON public.hotels FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete hotels." ON public.hotels;
CREATE POLICY "Admins can delete hotels."
ON public.hotels FOR DELETE USING (public.is_admin());

-- Policy untuk lifestyle_places:
DROP POLICY IF EXISTS "Public lifestyle places are viewable by everyone." ON public.lifestyle_places;
CREATE POLICY "Public lifestyle places are viewable by everyone."
ON public.lifestyle_places FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert lifestyle places." ON public.lifestyle_places;
CREATE POLICY "Admins can insert lifestyle places."
ON public.lifestyle_places FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update lifestyle places." ON public.lifestyle_places;
CREATE POLICY "Admins can update lifestyle places."
ON public.lifestyle_places FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete lifestyle places." ON public.lifestyle_places;
CREATE POLICY "Admins can delete lifestyle places."
ON public.lifestyle_places FOR DELETE USING (public.is_admin());

DROP POLICY IF EXISTS "Public settings are viewable by everyone." ON public.app_settings;
CREATE POLICY "Public settings are viewable by everyone."
ON public.app_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert settings." ON public.app_settings;
CREATE POLICY "Admins can insert settings."
ON public.app_settings FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update settings." ON public.app_settings;
CREATE POLICY "Admins can update settings."
ON public.app_settings FOR UPDATE USING (public.is_admin());

-- Policy untuk user_roles:
-- 1. Pengguna bisa melihat rolenya sendiri
DROP POLICY IF EXISTS "Users can view their own role." ON public.user_roles;
CREATE POLICY "Users can view their own role." 
ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Policy untuk favorites:
-- 1. Pengguna hanya bisa melihat favoritnya sendiri
DROP POLICY IF EXISTS "Users can view own favorites." ON public.favorites;
CREATE POLICY "Users can view own favorites." 
ON public.favorites FOR SELECT USING (auth.uid() = user_id);
-- 2. Pengguna bisa menambah favorit
DROP POLICY IF EXISTS "Users can insert own favorites." ON public.favorites;
CREATE POLICY "Users can insert own favorites." 
ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
-- 3. Pengguna bisa menghapus favorit
DROP POLICY IF EXISTS "Users can delete own favorites." ON public.favorites;
CREATE POLICY "Users can delete own favorites." 
ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- Policy untuk coffee_shop_ratings:
-- 1. Pengguna hanya bisa melihat rating miliknya sendiri
DROP POLICY IF EXISTS "Users can view own ratings." ON public.coffee_shop_ratings;
CREATE POLICY "Users can view own ratings."
ON public.coffee_shop_ratings FOR SELECT USING (auth.uid() = user_id);

-- 2. Pengguna bisa menambah rating miliknya sendiri
DROP POLICY IF EXISTS "Users can insert own ratings." ON public.coffee_shop_ratings;
CREATE POLICY "Users can insert own ratings."
ON public.coffee_shop_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. Pengguna bisa mengubah rating miliknya sendiri
DROP POLICY IF EXISTS "Users can update own ratings." ON public.coffee_shop_ratings;
CREATE POLICY "Users can update own ratings."
ON public.coffee_shop_ratings FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4. Pengguna bisa menghapus rating miliknya sendiri
DROP POLICY IF EXISTS "Users can delete own ratings." ON public.coffee_shop_ratings;
CREATE POLICY "Users can delete own ratings."
ON public.coffee_shop_ratings FOR DELETE USING (auth.uid() = user_id);


-- ==========================================
-- SEED DATA AWAL (Opsional)
-- Menambahkan satu admin awal (Pastikan kamu sudah daftar dengan email ini di Supabase Auth)
-- ==========================================
-- Cara membuat admin:
-- 1. Buka menu Authentication > Users di Supabase, buat user baru: admin@padangpicks.com
-- 2. Copy UUID/User ID dari user tersebut, dan jalankan perintah ini (ganti ID_USER_DI_SINI):
-- INSERT INTO public.user_roles (user_id, role) VALUES ('ID_USER_DI_SINI', 'admin');

-- ==========================================
-- 5. Tabel place_suggestions
-- Untuk menyimpan saran tempat dari komunitas (SuggestPlaceModal)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.place_suggestions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'Coffee Shop',
    area TEXT,
    reason TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS untuk place_suggestions
ALTER TABLE public.place_suggestions ENABLE ROW LEVEL SECURITY;

-- Siapapun bisa mengirim saran (INSERT)
DROP POLICY IF EXISTS "Anyone can insert suggestions." ON public.place_suggestions;
CREATE POLICY "Anyone can insert suggestions."
ON public.place_suggestions FOR INSERT WITH CHECK (true);

-- Hanya admin yang bisa melihat dan mengelola saran
DROP POLICY IF EXISTS "Admins can view suggestions." ON public.place_suggestions;
CREATE POLICY "Admins can view suggestions."
ON public.place_suggestions FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update suggestions." ON public.place_suggestions;
CREATE POLICY "Admins can update suggestions."
ON public.place_suggestions FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete suggestions." ON public.place_suggestions;
CREATE POLICY "Admins can delete suggestions."
ON public.place_suggestions FOR DELETE USING (public.is_admin());
