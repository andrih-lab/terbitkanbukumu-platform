import type { TemplateConfig } from "@/lib/manuscript/render";

// Pratinjau visual satu Template layout — rasio halaman & margin sungguhan
// dari configJson, isi dummy pakai fontFamily template yang sama. Sengaja
// TIDAK menampilkan tata letak kolom (mis. "2 kolom") karena render.ts
// belum mengimplementasikan itu — cuma variasi tipografi/margin/ukuran
// halaman, jadi pratinjau ini jujur sesuai hasil PDF yang sebenarnya.
export function TemplatePreview({
  configJson,
  className = "",
}: {
  configJson: TemplateConfig | null | undefined;
  className?: string;
}) {
  const ratio = configJson
    ? configJson.pageWidthMm / configJson.pageHeightMm
    : 148 / 210;
  const marginPct = configJson
    ? (configJson.marginTopMm / configJson.pageHeightMm) * 100
    : 10;

  return (
    <div
      className={`flex w-full items-center justify-center rounded-xl bg-slate-100 p-3 ${className}`}
    >
      <div
        className="flex w-full flex-col bg-white shadow-sm"
        style={{
          aspectRatio: `${ratio}`,
          padding: `${marginPct}%`,
          fontFamily: configJson?.fontFamily ?? "Georgia, serif",
        }}
      >
        <div className="mb-1.5 h-1.5 w-2/3 rounded-sm bg-slate-700" />
        <div className="space-y-1">
          <div className="h-1 w-full rounded-sm bg-slate-300" />
          <div className="h-1 w-full rounded-sm bg-slate-300" />
          <div className="h-1 w-4/5 rounded-sm bg-slate-300" />
          <div className="h-1 w-full rounded-sm bg-slate-300" />
          <div className="h-1 w-3/5 rounded-sm bg-slate-300" />
        </div>
      </div>
    </div>
  );
}
