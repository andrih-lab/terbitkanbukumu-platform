import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const steps = [
  {
    title: "1. Tentukan Topik & Unggah Referensi",
    description:
      "Masukkan topik buku Anda dan unggah artikel ilmiah (PDF) yang menjadi dasar penulisan.",
  },
  {
    title: "2. Susun Naskah",
    description:
      "Pilih template layout naskah dan desain cover, lalu susun naskah buku Anda dari topik dan referensi yang sudah diunggah.",
  },
  {
    title: "3. Terbitkan & Jual",
    description:
      "Tentukan harga jual sendiri dan jual buku secara daring di platform, atau ajukan penerbitan berbayar dengan ISBN resmi.",
  },
  {
    title: "4. Pantau & Tarik Dana",
    description:
      "Lihat laporan penjualan di dashboard, lalu tarik hasil penjualan ke rekening Anda sendiri.",
  },
];

const categories = [
  {
    name: "Buku Monograf",
    description: "Kajian mendalam satu topik riset spesifik hasil penelitian Anda.",
  },
  {
    name: "Buku Referensi",
    description: "Rujukan akademik komprehensif untuk bidang keilmuan tertentu.",
  },
  {
    name: "Teknologi Tepat Guna",
    description: "Panduan penerapan teknologi sederhana untuk masyarakat.",
  },
  {
    name: "Handbook",
    description: "Panduan praktis dan ringkas untuk pembaca profesional.",
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-indigo-50 to-white">
          <div className="mx-auto max-w-6xl px-6 py-20 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo-700">
              Untuk Dosen & Peneliti
            </p>
            <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Kembangkan Naskah Riset Anda Menjadi Buku yang Diterbitkan dan Dijual
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
              Buku monograf, buku referensi, buku teknologi tepat guna, dan
              handbook — dari topik dan referensi ilmiah Anda, hingga terbit
              ber-ISBN dan terjual daring.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link
                href="/daftar"
                className="rounded-full bg-indigo-600 px-6 py-3 text-base font-semibold text-white hover:bg-indigo-700"
              >
                Mulai Buku Pertama Anda
              </Link>
              <Link
                href="#cara-kerja"
                className="rounded-full border border-slate-300 px-6 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50"
              >
                Lihat Cara Kerja
              </Link>
            </div>
          </div>
        </section>

        <section id="cara-kerja" className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-center text-3xl font-bold text-slate-900">
            Cara Kerja
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div key={step.title} className="rounded-xl border border-slate-200 p-6">
                <h3 className="font-semibold text-indigo-700">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-50">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <h2 className="text-center text-3xl font-bold text-slate-900">
              Jenis Buku yang Bisa Anda Kembangkan
            </h2>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((category) => (
                <div key={category.name} className="rounded-xl bg-white p-6 shadow-sm">
                  <h3 className="font-semibold text-slate-900">{category.name}</h3>
                  <p className="mt-2 text-sm text-slate-600">{category.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">
                Jual Mandiri atau Terbit Resmi Ber-ISBN
              </h2>
              <p className="mt-4 text-slate-600">
                Tentukan sendiri harga jual buku Anda dan jual langsung secara
                daring di platform ini. Ingin naskah Anda diterbitkan resmi
                dengan ISBN? Ajukan layanan penerbitan berbayar dari{" "}
                <span className="font-medium text-slate-800">
                  PT. Mandala Riset Indonesia
                </span>
                .
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-900">
                Dashboard Penulis & Pencairan Dana
              </h2>
              <p className="mt-4 text-slate-600">
                Pantau jumlah buku terjual dan pendapatan Anda dari satu
                dashboard, lalu tarik hasil penjualan ke rekening Anda sendiri
                (setelah dipotong pajak dan komisi pengelola platform).
              </p>
            </div>
          </div>
        </section>

        <section className="bg-indigo-700">
          <div className="mx-auto max-w-4xl px-6 py-16 text-center">
            <h2 className="text-3xl font-bold text-white">
              Siap mengembangkan naskah Anda menjadi buku?
            </h2>
            <Link
              href="/daftar"
              className="mt-8 inline-block rounded-full bg-white px-6 py-3 text-base font-semibold text-indigo-700 hover:bg-indigo-50"
            >
              Daftar sebagai Penulis
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
