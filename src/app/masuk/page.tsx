import { SiteHeader } from "@/components/site-header";
import { LoginForm } from "@/components/login-form";

export default async function MasukPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; terdaftar?: string }>;
}) {
  const params = await searchParams;

  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center bg-slate-50 px-6 py-16">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-2xl font-bold text-slate-900">Masuk</h1>
          <p className="mt-1 text-sm text-slate-600">
            Masuk ke dashboard penulis Anda.
          </p>
          <div className="mt-6">
            <LoginForm
              callbackUrl={params.callbackUrl ?? "/dashboard"}
              justRegistered={params.terdaftar === "1"}
            />
          </div>
        </div>
      </main>
    </>
  );
}
