export function formatIdr(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export const BOOK_CATEGORY_LABEL: Record<string, string> = {
  MONOGRAF: "Buku Monograf",
  REFERENSI: "Buku Referensi",
  TEKNOLOGI_TEPAT_GUNA: "Buku Teknologi Tepat Guna",
  HANDBOOK: "Handbook",
};

export const PROJECT_STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draf",
  NASKAH_DALAM_PROSES: "Naskah Dalam Proses",
  NASKAH_SELESAI: "Naskah Selesai",
  DITERBITKAN: "Diterbitkan",
  DIJUAL: "Dijual",
};
