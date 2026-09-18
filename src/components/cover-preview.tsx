import type { CoverConfig } from "@/lib/manuscript/render";

// Pratinjau visual satu desain cover, dipakai baik di picker dashboard
// maupun halaman publik buku (/buku/[slug]) — supaya konsisten dan tidak
// duplikat. Warna & tipografi persis mengikuti CoverDesign.configJson yang
// sama dipakai src/lib/manuscript/render.ts untuk render PDF asli.
export function CoverPreview({
  configJson,
  title,
  authorName,
  className = "",
}: {
  configJson: CoverConfig | null | undefined;
  title: string;
  authorName: string;
  className?: string;
}) {
  return (
    <div
      className={`flex aspect-[3/4] w-full flex-col items-center justify-center gap-3 rounded-xl p-4 text-center ${className}`}
      style={{ backgroundColor: configJson?.backgroundColor ?? "#0f172a" }}
    >
      <div
        className="h-1 w-10 rounded-full"
        style={{ backgroundColor: configJson?.accentColor ?? "#f59e0b" }}
      />
      <p
        className="line-clamp-4 text-sm font-bold leading-tight"
        style={{
          color: configJson?.titleColor ?? "#ffffff",
          fontSize: configJson?.titleFontSize
            ? `${Math.min(configJson.titleFontSize * 0.5, 16)}px`
            : "14px",
        }}
      >
        {title}
      </p>
      <p
        className="text-xs"
        style={{ color: configJson?.authorColor ?? "#cbd5e1" }}
      >
        {authorName}
      </p>
    </div>
  );
}
