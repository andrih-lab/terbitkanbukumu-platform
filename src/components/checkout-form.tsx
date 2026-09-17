"use client";

import { useActionState } from "react";
import { checkoutAction, type CheckoutState } from "@/lib/actions/checkout";

const initialState: CheckoutState = {};

export function CheckoutForm({ slug }: { slug: string }) {
  const [state, formAction, pending] = useActionState(
    checkoutAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="slug" value={slug} />

      <div>
        <label htmlFor="buyerName" className="block text-sm font-medium text-slate-700">
          Nama Lengkap
        </label>
        <input
          id="buyerName"
          name="buyerName"
          required
          minLength={3}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
          placeholder="Nama Anda"
        />
      </div>

      <div>
        <label htmlFor="buyerEmail" className="block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          id="buyerEmail"
          name="buyerEmail"
          type="email"
          required
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
          placeholder="email@anda.com"
        />
        <p className="mt-1 text-xs text-slate-500">
          Tautan unduh buku akan tersedia di halaman konfirmasi setelah
          pembayaran berhasil.
        </p>
      </div>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {pending ? "Memproses..." : "Beli Sekarang"}
      </button>
    </form>
  );
}
