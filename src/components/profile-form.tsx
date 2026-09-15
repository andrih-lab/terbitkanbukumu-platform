"use client";

import { useActionState } from "react";
import {
  updateProfileAction,
  type UpdateProfileState,
} from "@/lib/actions/profile";
import type { Author } from "@/generated/prisma/client";

const initialState: UpdateProfileState = {};

export function ProfileForm({ author }: { author: Author }) {
  const [state, formAction, pending] = useActionState(
    updateProfileAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700">
            Nama Lengkap
          </label>
          <input
            id="name"
            name="name"
            required
            minLength={3}
            defaultValue={author.name}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Email</label>
          <input
            disabled
            value={author.email}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500"
          />
        </div>
        <div>
          <label
            htmlFor="institution"
            className="block text-sm font-medium text-slate-700"
          >
            Institusi/Afiliasi
          </label>
          <input
            id="institution"
            name="institution"
            defaultValue={author.institution ?? ""}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
            Nomor Telepon
          </label>
          <input
            id="phone"
            name="phone"
            defaultValue={author.phone ?? ""}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="border-t border-slate-100 pt-6">
        <h3 className="font-semibold text-slate-900">Data Pencairan Dana</h3>
        <p className="mt-1 text-sm text-slate-600">
          Diperlukan sebelum Anda dapat menarik hasil penjualan buku ke
          rekening pribadi.
        </p>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="bankName"
              className="block text-sm font-medium text-slate-700"
            >
              Nama Bank
            </label>
            <input
              id="bankName"
              name="bankName"
              defaultValue={author.bankName ?? ""}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
              placeholder="Mis. BCA, BNI, Mandiri"
            />
          </div>
          <div>
            <label
              htmlFor="bankAccountNumber"
              className="block text-sm font-medium text-slate-700"
            >
              Nomor Rekening
            </label>
            <input
              id="bankAccountNumber"
              name="bankAccountNumber"
              defaultValue={author.bankAccountNumber ?? ""}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="bankAccountName"
              className="block text-sm font-medium text-slate-700"
            >
              Nama Pemilik Rekening
            </label>
            <input
              id="bankAccountName"
              name="bankAccountName"
              defaultValue={author.bankAccountName ?? ""}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="npwp" className="block text-sm font-medium text-slate-700">
              NPWP (untuk keperluan pajak)
            </label>
            <input
              id="npwp"
              name="npwp"
              defaultValue={author.npwp ?? ""}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Profil berhasil disimpan.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {pending ? "Menyimpan..." : "Simpan Profil"}
      </button>
    </form>
  );
}
