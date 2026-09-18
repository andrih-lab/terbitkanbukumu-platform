"use client";

import { useActionState, useRef } from "react";
import {
  uploadCustomCoverAction,
  type UploadCustomCoverState,
} from "@/lib/actions/cover";

const initialState: UploadCustomCoverState = {};

export function CustomCoverUploadForm({
  bookProjectId,
}: {
  bookProjectId: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(async (
    prevState: UploadCustomCoverState,
    formData: FormData,
  ) => {
    const result = await uploadCustomCoverAction(prevState, formData);
    if (!result.error) {
      formRef.current?.reset();
    }
    return result;
  }, initialState);

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-center gap-3">
      <input type="hidden" name="bookProjectId" value={bookProjectId} />
      <input
        name="file"
        type="file"
        accept="image/jpeg,image/png"
        required
        className="text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {pending ? "Mengunggah..." : "Unggah Cover Sendiri"}
      </button>
      {state.error && (
        <p className="w-full rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
    </form>
  );
}
