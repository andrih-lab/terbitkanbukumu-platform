import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAuthor } from "@/lib/session";
import {
  BOOK_CATEGORY_LABEL,
  PROJECT_STATUS_LABEL,
  formatDate,
} from "@/lib/format";

export default async function BukuSayaPage() {
  const author = await requireAuthor();

  const projects = await prisma.bookProject.findMany({
    where: { authorId: author.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { references: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Buku Saya</h1>
        <Link
          href="/dashboard/buku/baru"
          className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          + Buku Baru
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-slate-600">Anda belum memiliki proyek buku.</p>
          <Link
            href="/dashboard/buku/baru"
            className="mt-4 inline-block font-medium text-indigo-700 hover:underline"
          >
            Buat proyek buku pertama Anda →
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/buku/${project.id}`}
              className="block rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 hover:ring-indigo-300"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-semibold text-slate-900">{project.title}</h2>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                  {PROJECT_STATUS_LABEL[project.status]}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                {BOOK_CATEGORY_LABEL[project.category]} · Dibuat{" "}
                {formatDate(project.createdAt)} · {project._count.references}{" "}
                referensi diunggah
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
