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
- [Prisma](https://prisma.io) ORM — SQLite untuk pengembangan lokal
  (lihat ROADMAP.md untuk migrasi ke PostgreSQL di produksi)
- [NextAuth v5](https://authjs.dev) (Credentials provider, sesi JWT)
- Penyimpanan berkas referensi PDF: disk lokal (`storage/`) — lihat
  `src/lib/storage.ts` untuk adapter yang akan diganti ke object storage
  (mis. Supabase Storage / S3) saat produksi

## Menjalankan secara lokal

```bash
npm install
cp .env.example .env
# generate AUTH_SECRET: openssl rand -base64 32, isikan ke .env

npx prisma migrate dev   # membuat prisma/dev.db + menjalankan seed
npm run dev
```

Buka http://localhost:3000.

### Catatan Prisma + SQLite + Turbopack

`DATABASE_URL="file:./dev.db"` di `.env` mengikuti konvensi Prisma: path
relatif terhadap folder `prisma/`. Generator client Prisma yang dipakai di
sini (`prisma-client`) membakukan resolusi path relatif itu lewat
`__dirname`, yang **rusak saat dibundel Turbopack/webpack** (dev server
maupun build Next.js) karena `__dirname` hasil bundling menunjuk ke lokasi
chunk hasil build, bukan `src/generated/prisma`. `src/lib/prisma.ts`
menangani ini secara eksplisit dengan me-resolve `DATABASE_URL` relatif ke
`process.cwd()/prisma/` sebelum membuat `PrismaClient`. Skrip yang berjalan
lewat `tsx`/Prisma CLI langsung (mis. `prisma/seed.ts`) tidak terpengaruh
bug ini dan tidak perlu adaptor serupa.

### Skrip

- `npm run dev` — server pengembangan
- `npm run build` / `npm run start` — build & jalankan produksi
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

## Deploy

Aplikasi ini butuh Node.js runtime (Server Actions, API routes, middleware) —
**bukan** situs statis. Direkomendasikan deploy ke Vercel atau platform
Node.js lain yang mendukung Next.js App Router sepenuhnya. Untuk produksi,
ganti `DATABASE_URL` ke PostgreSQL terkelola (mis. Supabase/Neon) — lihat
ROADMAP.md.
