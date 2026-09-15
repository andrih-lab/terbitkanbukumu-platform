"use client";

import { useActionState } from "react";
import {
  createBookProjectAction,
  type CreateProjectState,
} from "@/lib/actions/book-projects";
import { BOOK_CATEGORY_LABEL } from "@/lib/format";

const initialState: CreateProjectState = {};

export function CreateProjectForm() {
  const [state, formAction, pending] = useActionState(
    createBookProjectAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-700">
          Judul Buku
        </label>
        <input
          id="title"
          name="title"
          required
          minLength={5}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
          placeholder="Mis. Konservasi Ekosistem Mangrove Pesisir Sumatra"
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-slate-700">
          Kategori Buku
        </label>
        <select
          id="category"
          name="category"
          required
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
        >
          {Object.entries(BOOK_CATEGORY_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="topic" className="block text-sm font-medium text-slate-700">
          Topik Buku
        </label>
        <textarea
          id="topic"
          name="topic"
          required
          minLength={10}
          rows={4}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
          placeholder="Uraikan topik dan ruang lingkup buku yang ingin Anda kembangkan. Ini menjadi dasar bagi generator naskah."
        />
      </div>

      <div>
        <label htmlFor="synopsis" className="block text-sm font-medium text-slate-700">
          Sinopsis Singkat (opsional)
        </label>
        <textarea
          id="synopsis"
          name="synopsis"
          rows={3}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
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
        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 sm:w-auto"
      >
        {pending ? "Menyimpan..." : "Buat Proyek Buku"}
      </button>
    </form>
  );
}
