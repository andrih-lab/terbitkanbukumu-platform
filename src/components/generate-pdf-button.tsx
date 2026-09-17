"use client";

import { useFormStatus } from "react-dom";

export function GeneratePdfButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
    >
      {pending ? "Memproses..." : "Buat PDF Buku"}
    </button>
  );
}
