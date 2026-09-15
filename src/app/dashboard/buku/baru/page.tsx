import { CreateProjectForm } from "@/components/create-project-form";

export default function BukuBaruPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900">Proyek Buku Baru</h1>
      <p className="mt-1 text-slate-600">
        Langkah pertama: tentukan judul, kategori, dan topik buku Anda.
      </p>
      <div className="mt-8 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <CreateProjectForm />
      </div>
    </div>
  );
}
