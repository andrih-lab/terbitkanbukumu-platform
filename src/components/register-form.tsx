"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type RegisterState } from "@/lib/actions/auth";

const initialState: RegisterState = {};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(
    registerAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700">
          Nama Lengkap
        </label>
        <input
          id="name"
          name="name"
          required
          minLength={3}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
          placeholder="Dr. Nama Anda"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
          placeholder="nama@kampus.ac.id"
        />
      </div>

      <div>
        <label htmlFor="institution" className="block text-sm font-medium text-slate-700">
          Institusi/Afiliasi (opsional)
        </label>
        <input
          id="institution"
          name="institution"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
          placeholder="Universitas / Lembaga Riset"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-700">
          Kata Sandi
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
          placeholder="Minimal 8 karakter"
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
        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {pending ? "Memproses..." : "Daftar"}
      </button>

      <p className="text-center text-sm text-slate-600">
        Sudah punya akun?{" "}
        <Link href="/masuk" className="font-medium text-indigo-700 hover:underline">
          Masuk
        </Link>
      </p>
    </form>
  );
}
