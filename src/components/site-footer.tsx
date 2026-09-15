export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-slate-500">
        <p>
          TerbitkanBukumu adalah platform yang dikelola oleh{" "}
          <span className="font-medium text-slate-700">
            PT. Mandala Riset Indonesia
          </span>
          , penerbit resmi ber-ISBN.
        </p>
        <p className="mt-2">
          © {new Date().getFullYear()} TerbitkanBukumu. Seluruh hak cipta naskah tetap
          milik penulis.
        </p>
      </div>
    </footer>
  );
}
