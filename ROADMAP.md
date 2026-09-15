# Roadmap TerbitkanBukumu Platform

Dokumen ini merinci fase pengembangan setelah MVP alur inti (Fase 0, sudah
selesai). Skema data untuk seluruh fase di bawah sudah ada di
`prisma/schema.prisma` agar arsitektur konsisten sejak awal, meski belum
semua diimplementasikan.

## Fase 0 — MVP Alur Inti (Selesai)

- Registrasi & login penulis (NextAuth Credentials + Prisma)
- Buat proyek buku (judul, kategori, topik, sinopsis)
- Unggah referensi artikel ilmiah (PDF), unduh/hapus referensi
- Pilih template layout naskah & desain cover (katalog statis, tersimpan di
  proyek buku)
- Tentukan harga jual buku (disimpan, belum terhubung ke checkout nyata)
- Dashboard penulis: ringkasan, daftar buku, halaman penjualan (siap
  menampilkan data nyata begitu ada), profil + data bank/NPWP

## Fase 1 — Generator Naskah dari Topik & Referensi (AI)

- Ekstraksi teks dari PDF referensi yang diunggah (mis. `pdf-parse` atau
  layanan OCR untuk PDF hasil pindai)
- Panggilan ke model bahasa (Claude) dengan topik + kutipan/ringkasan
  referensi sebagai konteks untuk menyusun kerangka bab dan draf naskah awal
  → mengisi `ManuscriptDraft.content`
- Antrean job asinkron (naskah bisa perlu waktu beberapa menit) — perlu
  worker/queue (mis. Inngest, BullMQ + Redis, atau Vercel Queue), karena
  Server Action biasa tidak cocok untuk proses lama
- UI status progres (`ManuscriptStatus`: DIPROSES → SELESAI/GAGAL) dan
  editor untuk penulis menyunting hasil draf sebelum lanjut ke tata letak

## Fase 2 — Produksi Naskah ke PDF Buku

- Rendering `ManuscriptDraft.content` + `Template` terpilih menjadi PDF
  buku sesungguhnya (mis. via LaTeX/Typst, atau HTML→PDF dengan Puppeteer)
- Penerapan `CoverDesign` terpilih ke halaman sampul (mis. template SVG/HTML
  yang diisi judul, nama penulis, dsb.)
- Simpan hasil akhir sebagai `ManuscriptDraft.pdfPath`, tampilkan pratinjau
  & unduhan bagi penulis

## Fase 3 — Marketplace & Pembayaran

- Halaman publik per buku (`/buku/[slug]`) menampilkan sinopsis, cover, dan
  tombol beli — memakai `BookProject.priceIdr` yang sudah disimpan di MVP
- Integrasi payment gateway Indonesia (Xendit atau Midtrans) untuk checkout
  pembeli: kartu, VA bank, e-wallet, QRIS
- Saat pembayaran lunas → buat `Order` (status `LUNAS`), hitung
  `commissionIdr`/`taxIdr`/`authorEarningIdr` sesuai kebijakan komisi &
  pajak yang berlaku, kirim tautan unduh PDF ke pembeli
- Webhook penyedia pembayaran untuk konfirmasi status transaksi otomatis

## Fase 4 — Penerbitan Berbayar dengan ISBN (PT. Mandala Riset Indonesia)

- Halaman pengajuan `PublishingRequest`: pilih paket (mis. ISBN saja vs.
  ISBN + cetak fisik), harga, dan pembayaran (pakai gateway yang sama
  dengan Fase 3)
- Alur kerja internal admin (dashboard terpisah untuk staf penerbit) untuk
  memverifikasi naskah, mengajukan ISBN resmi (proses manual ke Perpusnas,
  ISBN tidak bisa diotomatisasi penuh), lalu mengisi `isbnNumber` dan
  menandai `ISBN_TERBIT`
- Sertakan nomor ISBN & metadata penerbit pada PDF final (Fase 2)

## Fase 5 — Penarikan Dana Penulis (Withdrawal & Pajak)

- Form pengajuan `WithdrawalRequest` di halaman **Tarik Dana** (UI sudah
  ada, tinggal disambungkan) — memerlukan profil bank/NPWP lengkap (sudah
  divalidasi di MVP)
- Integrasi disbursement (Xendit Disbursement / Midtrans Payout) untuk
  transfer otomatis ke rekening penulis
- Perhitungan potongan pajak (PPh pasal 23/26 sesuai status penulis —
  **perlu konsultasi dengan konsultan pajak PT. Mandala Riset Indonesia
  untuk menentukan tarif & mekanisme pemotongan yang sah**) dan komisi
  pengelola platform, dicatat rinci per `WithdrawalRequest`
- Bukti potong pajak otomatis (mis. PDF) untuk keperluan pelaporan penulis

## Infrastruktur Produksi (di luar fitur, perlu sebelum go-live)

- ~~**Database**: migrasi dari SQLite dev ke PostgreSQL terkelola~~ —
  **selesai**: `prisma/schema.prisma` memakai `provider = "postgresql"`,
  migrasi awal digenerate di `prisma/migrations/`, dan `npm run build`
  menjalankan `prisma migrate deploy && prisma db seed` otomatis (dipakai
  Vercel saat build)
- ~~**Storage berkas**: ganti dari disk lokal ke object storage~~ —
  **selesai**: `src/lib/storage.ts` otomatis memakai Vercel Blob saat env
  `BLOB_READ_WRITE_TOKEN` tersedia (produksi), fallback ke disk lokal saat
  pengembangan
- **Email**: verifikasi email pendaftaran & notifikasi transaksi (mis.
  Resend/SES) — saat ini registrasi tidak memverifikasi email
- ~~**Deploy**: Vercel~~ — **selesai**, lihat "Deploy ke Vercel" di
  README.md untuk langkah setup Postgres/Blob/env vars di dashboard
- **Kepatuhan**: kebijakan privasi, syarat & ketentuan penjualan naskah,
  dan ketentuan hak cipta/lisensi konten yang dijual — perlu ditinjau tim
  legal PT. Mandala Riset Indonesia sebelum fitur pembayaran (Fase 3) aktif
