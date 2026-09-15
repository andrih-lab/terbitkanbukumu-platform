"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuthor } from "@/lib/session";

const profileSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  institution: z.string().optional(),
  phone: z.string().optional(),
  bankName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankAccountName: z.string().optional(),
  npwp: z.string().optional(),
});

export type UpdateProfileState = {
  error?: string;
  success?: boolean;
};

export async function updateProfileAction(
  _prevState: UpdateProfileState,
  formData: FormData,
): Promise<UpdateProfileState> {
  const author = await requireAuthor();

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    institution: formData.get("institution") || undefined,
    phone: formData.get("phone") || undefined,
    bankName: formData.get("bankName") || undefined,
    bankAccountNumber: formData.get("bankAccountNumber") || undefined,
    bankAccountName: formData.get("bankAccountName") || undefined,
    npwp: formData.get("npwp") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  await prisma.author.update({
    where: { id: author.id },
    data: parsed.data,
  });

  revalidatePath("/dashboard/profil");
  revalidatePath("/dashboard/tarik-dana");
  return { success: true };
}
