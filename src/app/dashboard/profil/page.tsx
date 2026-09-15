import { requireAuthor } from "@/lib/session";
import { ProfileForm } from "@/components/profile-form";

export default async function ProfilPage() {
  const author = await requireAuthor();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900">Profil</h1>
      <p className="mt-1 text-slate-600">
        Kelola data diri dan data pencairan dana Anda.
      </p>
      <div className="mt-8 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <ProfileForm author={author} />
      </div>
    </div>
  );
}
