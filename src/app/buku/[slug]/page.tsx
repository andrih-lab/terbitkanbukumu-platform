import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site-header";
import { CheckoutForm } from "@/components/checkout-form";
import { CoverPreview } from "@/components/cover-preview";
import { BOOK_CATEGORY_LABEL, formatIdr } from "@/lib/format";
import type { CoverConfig } from "@/lib/manuscript/render";

// Meta tag "citation_*" (skema Highwire Press) dibaca Google Scholar untuk
// mengindeks judul, penulis, dan tahun terbit — supaya karya penulis
// gampang ditemukan & dikutip di Google Scholar. Sengaja TIDAK menyertakan
// citation_pdf_url karena buku ini berbayar (bukan open-access); Scholar
// menganggap situs curang ("cloaking") kalau mengklaim PDF bisa diakses
// bebas padahal sebenarnya di balik pembayaran.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await prisma.bookProject.findUnique({
    where: { slug },
    include: { author: true },
  });

  if (!project || !project.priceIdr) return {};

  return {
    title: `${project.title} — TerbitkanBukumu`,
    description: project.synopsis ?? undefined,
    other: {
      citation_title: project.title,
      citation_author: project.author.name,
      citation_publication_date: project.createdAt.getFullYear().toString(),
      citation_publisher: "PT. Mandala Riset Indonesia",
      citation_language: "id",
    },
  };
}

export default async function PublicBookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const project = await prisma.bookProject.findUnique({
    where: { slug },
    include: { author: true, coverDesign: true },
  });

  if (!project || !project.priceIdr) {
    notFound();
  }

  const cover = project.coverDesign?.configJson as unknown as
    | CoverConfig
    | undefined;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-12 md:flex-row md:py-16">
        <div className="w-full shrink-0 md:w-64">
          {project.customCoverPath ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/api/covers/${project.id}`}
              alt={`Cover ${project.title}`}
              className="aspect-[3/4] w-full rounded-2xl object-cover"
            />
          ) : (
            <CoverPreview
              configJson={cover}
              title={project.title}
              authorName={project.author.name}
              className="rounded-2xl p-8"
            />
          )}
        </div>

        <div className="flex-1">
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
            {BOOK_CATEGORY_LABEL[project.category]}
          </span>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">
            {project.title}
          </h1>
          <p className="mt-1 text-slate-600">oleh {project.author.name}</p>
          {project.synopsis && (
            <p className="mt-4 whitespace-pre-line text-slate-700">
              {project.synopsis}
            </p>
          )}

          <div className="mt-8 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Harga</p>
            <p className="text-2xl font-bold text-slate-900">
              {formatIdr(project.priceIdr)}
            </p>
            <div className="mt-4">
              <CheckoutForm slug={project.slug!} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
