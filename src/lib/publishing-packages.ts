// Katalog paket penerbitan berbayar dengan ISBN. Bukan tabel DB — cuma 3
// pilihan tetap yang ditentukan PT. Mandala Riset Indonesia, sama gaya
// BOOK_CATEGORY_LABEL di lib/format.ts. Layout & cover naskah TIDAK
// ditagih ulang di sini karena sudah gratis sebagai fitur inti platform.
export type PublishingPackage = {
  id: string;
  name: string;
  priceIdr: number;
  description: string;
};

export const PUBLISHING_PACKAGES: PublishingPackage[] = [
  {
    id: "digital",
    name: "Digital (E-ISBN)",
    priceIdr: 250_000,
    description:
      "E-ISBN resmi dari Perpusnas RI, upload ke repositori nasional, sertifikat penerbitan. Tanpa cetak fisik.",
  },
  {
    id: "cetak_standar",
    name: "Cetak Standar",
    priceIdr: 1_000_000,
    description:
      "ISBN cetak resmi, 10 eksemplar untuk penulis, 4 eksemplar wajib serah-simpan (Perpusnas/Perpusda), 1x proofreading.",
  },
  {
    id: "cetak_profesional",
    name: "Cetak Profesional + Distribusi",
    priceIdr: 2_500_000,
    description:
      "Semua di Paket Cetak Standar, ditambah cetak awal 50 eksemplar, editing menyeluruh, distribusi ke marketplace, dan bantuan pendaftaran HKI.",
  },
];

export function findPublishingPackage(id: string): PublishingPackage | undefined {
  return PUBLISHING_PACKAGES.find((pkg) => pkg.id === id);
}
