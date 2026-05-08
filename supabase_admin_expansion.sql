-- ==========================================
-- PADANGPICKS ADMIN EXPANSION PATCH
-- Jalankan file ini penuh di Supabase SQL Editor.
-- Tidak perlu menjalankan setup.sql lama jika tabel coffee_shops dan rating sudah berjalan.
-- ==========================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

ALTER TABLE public.coffee_shops
ADD COLUMN IF NOT EXISTS item_category TEXT,
ADD COLUMN IF NOT EXISTS booking_url TEXT,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

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

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS '
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = ''admin''
  );
';

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
      "title": "Selamat datang di PadangPicks",
      "body": "PadangPicks adalah direktori kurasi untuk menemukan coffee shop, hotel, dan lifestyle spot pilihan di Kota Padang.",
      "buttonLabel": "Mulai Jelajah"
    }'::jsonb
)
ON CONFLICT (key) DO NOTHING;

ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lifestyle_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

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
