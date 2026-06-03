-- ============================================================
-- PATCH: Buat tabel place_suggestions + RLS
-- Jalankan file ini di Supabase SQL Editor jika form "Suggest Tempat"
-- menampilkan error saat mengirim saran.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Buat tabel (aman dijalankan ulang)
CREATE TABLE IF NOT EXISTS public.place_suggestions (
    id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name        TEXT NOT NULL,
    category    TEXT DEFAULT 'Coffee Shop',
    area        TEXT,
    reason      TEXT,
    status      TEXT DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Aktifkan RLS
ALTER TABLE public.place_suggestions ENABLE ROW LEVEL SECURITY;

-- Siapapun (termasuk anonymous) bisa INSERT saran
DROP POLICY IF EXISTS "Anyone can insert suggestions." ON public.place_suggestions;
CREATE POLICY "Anyone can insert suggestions."
    ON public.place_suggestions
    FOR INSERT
    WITH CHECK (true);

-- Hanya admin yang bisa SELECT, UPDATE, DELETE
DROP POLICY IF EXISTS "Admins can view suggestions."   ON public.place_suggestions;
DROP POLICY IF EXISTS "Admins can update suggestions." ON public.place_suggestions;
DROP POLICY IF EXISTS "Admins can delete suggestions." ON public.place_suggestions;

CREATE POLICY "Admins can view suggestions."
    ON public.place_suggestions FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update suggestions."
    ON public.place_suggestions FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete suggestions."
    ON public.place_suggestions FOR DELETE USING (public.is_admin());
