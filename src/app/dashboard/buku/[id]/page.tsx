import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuthor } from "@/lib/session";
import { ReferenceUploadForm } from "@/components/reference-upload-form";
import { ManuscriptUploadForm } from "@/components/manuscript-upload-form";
import { GeneratePdfButton } from "@/components/generate-pdf-button";
import {
  chooseCoverAction,
  chooseTemplateAction,
  deleteReferenceAction,
  setPriceAction,
} from "@/lib/actions/book-projects";
import { generateBookPdfAction } from "@/lib/actions/manuscript";
import { getManuscriptSuggestions } from "@/lib/manuscript/suggestions";
import {
  BOOK_CATEGORY_LABEL,
  PROJECT_STATUS_LABEL,
  formatDate,
} from "@/lib/format";

export default async function BukuDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const author = await requireAuthor();
  const { id } = await params;

  const project = await prisma.bookProject.findUnique({
    where: { id },
    include: {
      references: { orderBy: { uploadedAt: "desc" } },
      template: true,
      coverDesign: true,
      manuscriptDraft: true,
    },
  });

  if (!project || project.authorId !== author.id) {
    notFound();
  }

  const [templates, covers] = await Promise.all([
    prisma.template.findMany({ where: { isActive: true } }),
    prisma.coverDesign.findMany({ where: { isActive: true } }),
  ]);

  const manuscriptDraft = project.manuscriptDraft;
  const suggestions = manuscriptDraft?.content
    ? getManuscriptSuggestions(manuscriptDraft.content, project.category)
    : [];
  const canGeneratePdf = Boolean(
    manuscriptDraft?.content && project.templateId && project.coverDesignId,
  );

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">{project.title}</h1>
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
            {PROJECT_STATUS_LABEL[project.status]}
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          {BOOK_CATEGORY_LABEL[project.category]} · Dibuat{" "}
          {formatDate(project.createdAt)}
        </p>
        <p className="mt-4 whitespace-pre-line text-slate-700">{project.topic}</p>
      </div>

      {/* Referensi */}
      <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-lg font-semibold text-slate-900">
          Referensi Artikel Ilmiah
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Unggah artikel ilmiah (PDF) yang menjadi dasar penulisan naskah.
        </p>

        <div className="mt-4">
          <ReferenceUploadForm bookProjectId={project.id} />
        </div>

        {project.references.length > 0 && (
          <ul className="mt-6 divide-y divide-slate-100 border-t border-slate-100">
            {project.references.map((reference) => (
              <li
                key={reference.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <a
                    href={`/api/references/${reference.id}/download`}
                    target="_blank"
                    className="truncate font-medium text-indigo-700 hover:underline"
                  >
                    {reference.fileName}
                  </a>
                  {reference.citation && (
                    <p className="truncate text-xs text-slate-500">
                      {reference.citation}
                    </p>
                  )}
                </div>
                <form action={deleteReferenceAction}>
                  <input type="hidden" name="referenceId" value={reference.id} />
                  <button
                    type="submit"
                    className="shrink-0 text-sm text-red-600 hover:underline"
                  >
                    Hapus
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Naskah: upload, saran perbaikan, generate PDF buku */}
      <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-lg font-semibold text-slate-900">Naskah</h2>
        <p className="mt-1 text-sm text-slate-600">
          Unggah naskah lengkap Anda (.docx atau .md). Sistem akan memberi
          saran perbaikan otomatis, lalu menata-letak dan membuat sampulnya
          sesuai Template dan Desain Cover yang Anda pilih di bawah.
        </p>

        <div className="mt-4">
          <ManuscriptUploadForm bookProjectId={project.id} />
        </div>

        {manuscriptDraft?.sourceFileName && (
          <p className="mt-4 text-sm text-slate-600">
            Berkas terunggah:{" "}
            <span className="font-medium text-slate-800">
              {manuscriptDraft.sourceFileName}
            </span>
          </p>
        )}

        {suggestions.length > 0 && (
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-800">
              Saran Perbaikan Naskah
            </p>
            <ul className="mt-2 space-y-1.5">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className={`text-sm ${
                    suggestion.severity === "warning"
                      ? "text-amber-700"
                      : "text-slate-600"
                  }`}
                >
                  {suggestion.severity === "warning" ? "⚠ " : "· "}
                  {suggestion.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        {manuscriptDraft?.content && (
          <div className="mt-6 border-t border-slate-100 pt-6">
            {!canGeneratePdf ? (
              <p className="text-sm text-slate-500">
                Pilih Template dan Desain Cover di bawah untuk bisa membuat PDF
                buku.
              </p>
            ) : (
              <form action={generateBookPdfAction}>
                <input type="hidden" name="bookProjectId" value={project.id} />
                <GeneratePdfButton />
              </form>
            )}

            {manuscriptDraft.status === "GAGAL" && manuscriptDraft.errorMessage && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                Gagal membuat PDF: {manuscriptDraft.errorMessage}
              </p>
            )}

            {manuscriptDraft.pdfPath && (
              <p className="mt-3 text-sm">
                <a
                  href={`/api/manuscripts/${project.id}/download`}
                  target="_blank"
                  className="font-medium text-indigo-700 hover:underline"
                >
                  Unduh PDF Buku
                </a>
              </p>
            )}
          </div>
        )}
      </section>

      {/* Template layout */}
      <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-lg font-semibold text-slate-900">Template Layout Naskah</h2>
        <p className="mt-1 text-sm text-slate-600">
          Terpilih:{" "}
          <span className="font-medium text-slate-800">
            {project.template?.name ?? "Belum dipilih"}
          </span>
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {templates.map((template) => (
            <form key={template.id} action={chooseTemplateAction}>
              <input type="hidden" name="bookProjectId" value={project.id} />
              <input type="hidden" name="templateId" value={template.id} />
              <button
                type="submit"
                className={`w-full rounded-lg border p-4 text-left transition ${
                  project.templateId === template.id
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-slate-200 hover:border-indigo-300"
                }`}
              >
                <p className="font-medium text-slate-900">{template.name}</p>
                <p className="mt-1 text-xs text-slate-600">{template.description}</p>
              </button>
            </form>
          ))}
        </div>
      </section>

      {/* Desain cover */}
      <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-lg font-semibold text-slate-900">Desain Cover</h2>
        <p className="mt-1 text-sm text-slate-600">
          Terpilih:{" "}
          <span className="font-medium text-slate-800">
            {project.coverDesign?.name ?? "Belum dipilih"}
          </span>
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {covers.map((cover) => (
            <form key={cover.id} action={chooseCoverAction}>
              <input type="hidden" name="bookProjectId" value={project.id} />
              <input type="hidden" name="coverDesignId" value={cover.id} />
              <button
                type="submit"
                className={`w-full rounded-lg border p-4 text-left transition ${
                  project.coverDesignId === cover.id
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-slate-200 hover:border-indigo-300"
                }`}
              >
                <p className="font-medium text-slate-900">{cover.name}</p>
                <p className="mt-1 text-xs text-slate-600">{cover.description}</p>
              </button>
            </form>
          ))}
        </div>
      </section>

      {/* Harga jual */}
      <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-lg font-semibold text-slate-900">Harga Jual Buku</h2>
        <p className="mt-1 text-sm text-slate-600">
          Tentukan harga jual buku Anda sendiri (Rupiah). Penjualan daring akan
          aktif setelah fitur marketplace tersedia — lihat ROADMAP.md.
        </p>
        <form action={setPriceAction} className="mt-4 flex flex-wrap items-center gap-3">
          <input type="hidden" name="bookProjectId" value={project.id} />
          <span className="text-slate-600">Rp</span>
          <input
            type="number"
            name="priceIdr"
            min={0}
            step={1000}
            defaultValue={project.priceIdr ?? undefined}
            className="w-40 rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
            placeholder="150000"
          />
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Simpan Harga
          </button>
        </form>
      </section>

      {/* Penerbitan ISBN — roadmap */}
      <section className="rounded-xl border border-dashed border-slate-300 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Penerbitan Berbayar dengan ISBN
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Segera hadir — ajukan penerbitan resmi ber-ISBN dari PT. Mandala Riset
          Indonesia langsung dari halaman ini. Lihat ROADMAP.md.
        </p>
      </section>
    </div>
  );
}
