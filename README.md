# TerbitkanBukumu Platform

Platform bagi dosen dan peneliti untuk mengembangkan, menerbitkan, dan menjual
buku monograf, buku referensi, buku teknologi tepat guna, dan handbook —
untuk domain **www.terbitkanbukumu.com**, dikelola oleh PT. Mandala Riset
Indonesia.

Status proyek ini adalah **MVP alur inti**: registrasi/login penulis, proyek
buku, unggah referensi PDF, pemilihan template & cover, dan dashboard
penulis. Fitur lain (generator naskah AI, marketplace pembayaran,
penerbitan ISBN, penarikan dana) sudah dirancang skemanya di database tetapi
implementasinya bertahap — lihat [ROADMAP.md](./ROADMAP.md).

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript + Tailwind CSS v4
- [Prisma](https://prisma.io) ORM — PostgreSQL
- [NextAuth v5](https://authjs.dev) (Credentials provider, sesi JWT)
- Penyimpanan berkas referensi PDF: [Vercel Blob](https://vercel.com/docs/storage/vercel-blob)
  di produksi, disk lokal (`storage/`) saat pengembangan — lihat
  `src/lib/storage.ts` (dipilih otomatis lewat env `BLOB_READ_WRITE_TOKEN`)

## Menjalankan secara lokal

Butuh PostgreSQL berjalan lokal (atau pakai database cloud dev, mis. cabang
Neon terpisah dari yang dipakai Vercel).

```bash
npm install
cp .env.example .env
# isi DATABASE_URL ke Postgres lokal/cloud Anda
# generate AUTH_SECRET: openssl rand -base64 32, isikan ke .env
# BLOB_READ_WRITE_TOKEN boleh dikosongkan — otomatis pakai disk lokal (storage/)

npx prisma migrate dev   # membuat skema + menjalankan seed
npm run dev
```

Buka http://localhost:3000.

### Skrip

- `npm run dev` — server pengembangan
- `npm run build` — menjalankan `prisma migrate deploy`, `prisma db seed`,
  lalu `next build` (urutan yang sama dipakai Vercel saat deploy)
- `npm run start` — jalankan hasil build produksi
- `npm run lint` — ESLint
- `npm run db:seed` — isi ulang katalog Template & CoverDesign

## Struktur

- `src/app/(marketing)` (`page.tsx`, `/daftar`, `/masuk`) — halaman publik
- `src/app/dashboard/**` — area penulis (dilindungi `middleware.ts`)
- `src/lib/actions/**` — Server Actions (mutasi data)
- `src/lib/auth.config.ts` vs `src/lib/auth.ts` — konfigurasi NextAuth
  dipecah agar `middleware.ts` (Edge Runtime) tidak memuat Prisma/bcrypt;
  lihat komentar di masing-masing berkas
- `prisma/schema.prisma` — skema data lengkap (termasuk model untuk fase
  mendatang: `Order`, `WithdrawalRequest`, `PublishingRequest`,
  `ManuscriptDraft`)

## Deploy ke Vercel

Aplikasi ini butuh Node.js runtime (Server Actions, API routes, middleware) —
**bukan** situs statis, jadi tidak bisa dipakai di hosting statis seperti
Netlify tanpa penyesuaian.

1. **Impor repo ini di Vercel** — [vercel.com/new](https://vercel.com/new),
   pilih repo `andrih-lab/terbitkanbukumu-platform`. Framework preset
   "Next.js" terdeteksi otomatis.
2. **Tambahkan Postgres** — di project Vercel: tab **Storage** → **Create
   Database** → **Postgres** (didukung Neon). Vercel otomatis mengisi env
   `DATABASE_URL` ke project.
3. **Tambahkan Blob store** — tab **Storage** → **Create Database** →
   **Blob**. Vercel otomatis mengisi env `BLOB_READ_WRITE_TOKEN` — tanpa ini,
   unggah referensi PDF akan gagal di produksi (filesystem Vercel Functions
   tidak persisten).
4. **Set `AUTH_SECRET`** — tab **Settings** → **Environment Variables**,
   tambahkan `AUTH_SECRET` dengan nilai dari `openssl rand -base64 32`.
   (Jangan pakai nilai yang sama dengan `.env` lokal.)
5. **Deploy** — klik Deploy, atau push ke `main` jika sudah terhubung.
   Build otomatis menjalankan `prisma migrate deploy` (membuat skema di
   Postgres) dan `prisma db seed` (mengisi katalog Template/CoverDesign)
   sebelum `next build` — lihat script `build` di `package.json`.

Setelah live, domain kustom `www.terbitkanbukumu.com` bisa dihubungkan lewat
tab **Settings → Domains**.
