import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  issueIsbnAction,
  markPublishingInProgressAction,
  rejectPublishingAction,
} from "@/lib/actions/admin";
import { PUBLISHING_STATUS_LABEL, formatDate, formatIdr } from "@/lib/format";

export default async function AdminPenerbitanPage() {
  await requireAdmin();

  const [actionable, history] = await Promise.all([
    prisma.publishingRequest.findMany({
      where: { status: { in: ["DIBAYAR", "DALAM_PROSES"] } },
      include: { bookProject: { include: { author: true } } },
      orderBy: { requestedAt: "asc" },
    }),
    prisma.publishingRequest.findMany({
      where: { status: { in: ["ISBN_TERBIT", "DITOLAK"] } },
      include: { bookProject: { include: { author: true } } },
      orderBy: { requestedAt: "desc" },
      take: 50,
    }),
  ]);

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Admin — Penerbitan ISBN
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Pengajuan yang sudah dibayar, menunggu diproses secara manual ke
          Perpusnas.
        </p>
      </div>

      <section className="space-y-4">
        {actionable.length === 0 && (
          <p className="rounded-xl bg-white p-6 text-sm text-slate-500 shadow-sm ring-1 ring-slate-200">
            Tidak ada pengajuan yang perlu diproses saat ini.
          </p>
        )}

        {actionable.map((req) => (
          <div
            key={req.id}
            className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">
                  {req.bookProject.title}
                </p>
                <p className="text-sm text-slate-600">
                  {req.bookProject.author.name} ({req.bookProject.author.email})
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {req.packageName} — {formatIdr(req.priceIdr)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Diajukan {formatDate(req.requestedAt)}
                </p>
              </div>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                {PUBLISHING_STATUS_LABEL[req.status]}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
              {req.status === "DIBAYAR" && (
                <form action={markPublishingInProgressAction}>
                  <input type="hidden" name="publishingRequestId" value={req.id} />
                  <button
                    type="submit"
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    Tandai Sedang Diproses
                  </button>
                </form>
              )}

              {req.status === "DALAM_PROSES" && (
                <form
                  action={issueIsbnAction}
                  className="flex flex-wrap items-center gap-2"
                >
                  <input type="hidden" name="publishingRequestId" value={req.id} />
                  <input
                    type="text"
                    name="isbnNumber"
                    required
                    placeholder="978-xxx-xxx-xx-x"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    Tandai ISBN Terbit
                  </button>
                </form>
              )}

              <form action={rejectPublishingAction}>
                <input type="hidden" name="publishingRequestId" value={req.id} />
                <button
                  type="submit"
                  className="text-sm text-red-600 hover:underline"
                >
                  Tolak
                </button>
              </form>
            </div>
          </div>
        ))}
      </section>

      {history.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-slate-900">Riwayat</h2>
          <ul className="mt-3 divide-y divide-slate-100 rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
            {history.map((req) => (
              <li key={req.id} className="flex items-center justify-between gap-3 px-6 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {req.bookProject.title}
                  </p>
                  <p className="text-xs text-slate-500">
                    {req.bookProject.author.name} · {req.packageName}
                    {req.isbnNumber && ` · ISBN ${req.isbnNumber}`}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  {PUBLISHING_STATUS_LABEL[req.status]}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
