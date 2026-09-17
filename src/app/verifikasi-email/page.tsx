import crypto from "node:crypto";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { prisma } from "@/lib/prisma";

async function verifyToken(token: string | undefined) {
  if (!token) return "missing" as const;

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const record = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash },
  });

  if (!record) return "invalid" as const;

  if (record.expiresAt < new Date()) {
    await prisma.emailVerificationToken.delete({ where: { id: record.id } });
    return "expired" as const;
  }

  await prisma.author.update({
    where: { id: record.authorId },
    data: { emailVerifiedAt: new Date() },
  });
  await prisma.emailVerificationToken.deleteMany({
    where: { authorId: record.authorId },
  });

  return "ok" as const;
}

export default async function VerifikasiEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const status = await verifyToken(token);

  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center bg-slate-50 px-6 py-16">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
          {status === "ok" ? (
            <>
              <h1 className="text-2xl font-bold text-slate-900">
                Email Terverifikasi
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Email Anda berhasil diverifikasi. Silakan masuk ke dashboard
                Anda.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-slate-900">
                Tautan Tidak Valid
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                {status === "expired"
                  ? "Tautan verifikasi ini sudah kedaluwarsa."
                  : "Tautan verifikasi tidak ditemukan atau sudah pernah dipakai."}{" "}
                Masuk ke akun Anda dan klik &quot;Kirim ulang email
                verifikasi&quot; di dashboard.
              </p>
            </>
          )}
          <Link
            href="/masuk"
            className="mt-6 inline-block rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white hover:bg-indigo-700"
          >
            Ke Halaman Masuk
          </Link>
        </div>
      </main>
    </>
  );
}
