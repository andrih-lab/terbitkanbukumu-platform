"use client";

import { useActionState, useRef } from "react";
import {
  uploadReferenceAction,
  type UploadReferenceState,
} from "@/lib/actions/book-projects";

const initialState: UploadReferenceState = {};

export function ReferenceUploadForm({ bookProjectId }: { bookProjectId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(async (
    prevState: UploadReferenceState,
    formData: FormData,
  ) => {
    const result = await uploadReferenceAction(prevState, formData);
    if (!result.error) {
      formRef.current?.reset();
    }
    return result;
  }, initialState);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <input type="hidden" name="bookProjectId" value={bookProjectId} />

      <div>
        <label htmlFor="file" className="block text-sm font-medium text-slate-700">
          Berkas PDF Referensi
        </label>
        <input
          id="file"
          name="file"
          type="file"
          accept="application/pdf"
          required
          className="mt-1 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
        />
      </div>

      <div>
        <label htmlFor="citation" className="block text-sm font-medium text-slate-700">
          Sitasi (opsional)
        </label>
        <input
          id="citation"
          name="citation"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          placeholder="Penulis, A. (Tahun). Judul artikel. Nama Jurnal."
        />
      </div>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {pending ? "Mengunggah..." : "Unggah Referensi"}
      </button>
    </form>
  );
}
