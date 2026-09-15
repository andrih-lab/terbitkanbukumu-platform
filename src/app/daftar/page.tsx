import { SiteHeader } from "@/components/site-header";
import { RegisterForm } from "@/components/register-form";

export default function DaftarPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center bg-slate-50 px-6 py-16">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-2xl font-bold text-slate-900">
            Daftar sebagai Penulis
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Gratis untuk mulai mengembangkan naskah buku Anda.
          </p>
          <div className="mt-6">
            <RegisterForm />
          </div>
        </div>
      </main>
    </>
  );
}
