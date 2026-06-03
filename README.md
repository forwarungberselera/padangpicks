# Harmonee

Direktori kurasi coffee shop, hotel, dan lifestyle spot di Kota Padang — dibangun dengan React, Vite, Tailwind CSS v4, React Router v7, dan Supabase.

---

## Fitur

- **Coffee Shop** — direktori lengkap dengan pencarian, filter area/harga, sorting (terbaru, open now, rating, harga), recently viewed, dan deep link sharing
- **Hotel & Lifestyle** — halaman direktori terpisah dengan filter dan modal detail
- **Rating & Favorit** — user bisa memberi rating bintang dan menyimpan favorit; rating diagregasi otomatis via Supabase trigger
- **Autentikasi** — login, register, lupa password via Supabase Auth
- **Admin Panel** — CRUD untuk coffee shop, hotel, dan lifestyle; manajemen saran tempat dari komunitas; konfigurasi popup intro
- **Suggest Tempat** — form saran komunitas yang tersimpan ke database dan bisa dikelola di admin
- **Pagination** — 9 item per halaman di semua direktori
- **Mobile-first** — bottom nav, modal slide-up, back button browser menutup modal, scroll lock saat modal terbuka
- **PWA-ready** — manifest, theme color, apple touch icon
- **SPA routing di Cloudflare Pages** — via `dist/404.html` (dibuat otomatis saat build)

---

## Setup Lokal

### 1. Install dependencies

```bash
npm install
```

### 2. Buat file `.env`

```bash
cp .env.example .env
```

Isi dengan kredensial Supabase kamu (lihat `.env.example` untuk penjelasan lengkap):

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

> Tanpa `.env`, app tetap berjalan dengan data fallback lokal (`src/lib/coffee-data.js`), tapi login, favorit, rating, dan admin tidak aktif.

### 3. Setup database Supabase

Jalankan `setup.sql` di SQL Editor Supabase:

```
Project → SQL Editor → New Query → paste isi setup.sql → Run
```

File ini membuat semua tabel, RLS policies, triggers rating, dan data awal.

### 4. Jalankan dev server

```bash
npm run dev
```

---

## Scripts

| Command | Keterangan |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Build production + buat `dist/404.html` untuk Cloudflare Pages |
| `npm run preview` | Preview build lokal |
| `npm run lint` | ESLint |

---

## Struktur Database

| Tabel | Keterangan |
|---|---|
| `coffee_shops` | Data coffee shop |
| `hotels` | Data hotel |
| `lifestyle_places` | Data lifestyle spot |
| `user_roles` | Role user (`admin` / `user`) |
| `favorites` | Favorit user — support multi-kategori via `item_id` + `item_type` |
| `coffee_shop_ratings` | Rating bintang per user per coffee shop |
| `app_settings` | Konfigurasi dynamic (popup intro) |
| `place_suggestions` | Saran tempat dari komunitas |

Schema DB memakai `snake_case`. Frontend menormalisasi ke `camelCase` via `src/lib/coffee-shop-mapper.js`.

### Membuat admin

1. Daftarkan user di Supabase → Authentication → Users
2. Salin UUID user tersebut
3. Jalankan di SQL Editor:

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('UUID-USER-KAMU', 'admin');
```

---

## File SQL Tambahan

| File | Kapan dijalankan |
|---|---|
| `setup.sql` | Setup awal — jalankan sekali saat pertama kali deploy |
| `supabase_admin_expansion.sql` | Patch untuk database yang sudah ada sebelum tabel hotels/lifestyle ditambahkan |
| `supabase_favorites_expansion.sql` | Patch untuk mengaktifkan favorit multi-kategori (hotel & lifestyle) |

---

## Deployment (Cloudflare Pages)

1. Connect repo ke Cloudflare Pages
2. Build command: `npm run build`
3. Output directory: `dist`
4. Tambahkan environment variables: `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`

SPA routing ditangani otomatis lewat `dist/404.html` yang dibuat oleh script `scripts/copy-404.js` saat build — tidak memerlukan `_redirects`.

---

## Edge Function (Opsional)

Untuk fitur "Hapus Akun" yang benar-benar menghapus user dari sistem autentikasi, deploy Edge Function di `supabase/functions/delete-user/index.ts`:

```bash
supabase functions deploy delete-user
```

Tanpa Edge Function, hapus akun tetap berfungsi (data relasi dihapus + sign out) tapi entri di sistem autentikasi tidak terhapus.
