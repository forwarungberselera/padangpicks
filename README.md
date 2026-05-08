# PadangPicks

PadangPicks adalah aplikasi direktori coffee shop, cafe, dan spot nongkrong di Kota Padang. Aplikasi ini dibangun dengan React, Vite, Tailwind CSS, React Router, dan Supabase.

## Fitur

- Direktori coffee shop dengan pencarian, filter area, filter harga, dan sorting.
- Detail coffee shop dalam modal.
- Autentikasi login/register via Supabase.
- Favorit per user.
- Dashboard admin untuk tambah, edit, dan hapus coffee shop.
- Halaman Hotel dan Lifestyle sebagai placeholder ekspansi.

## Setup Lokal

1. Install dependency:

```bash
npm install
```

2. Buat file `.env` dari contoh:

```bash
cp .env.example .env
```

3. Isi kredensial Supabase:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Jalankan development server:

```bash
npm run dev
```

## Supabase

Jalankan [setup.sql](C:/Users/62813/Desktop/PadangPicks/setup.sql) di SQL Editor Supabase untuk membuat tabel dan RLS policy.

Schema database memakai `snake_case`. Frontend menormalisasi data ke `camelCase` melalui [coffee-shop-mapper.js](C:/Users/62813/Desktop/PadangPicks/src/lib/coffee-shop-mapper.js).

Untuk membuat admin:

1. Buat user di Supabase Authentication.
2. Copy UUID user.
3. Jalankan:

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('ID_USER_DI_SINI', 'admin');
```

## Script

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

Jika `.env` belum diisi, aplikasi tetap bisa menampilkan fallback data lokal, tetapi login, favorit, dan admin tidak aktif.
