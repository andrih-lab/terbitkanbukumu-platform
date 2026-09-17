"use server";

import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/lib/auth";
import { requireAuthor } from "@/lib/session";
import { sendVerificationEmail } from "@/lib/email";

const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 jam

function createVerificationToken() {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS);
  return { token, tokenHash, expiresAt };
}

async function issueAndSendVerificationEmail(
  authorId: string,
  email: string,
  name: string,
) {
  const { token, tokenHash, expiresAt } = createVerificationToken();
  await prisma.emailVerificationToken.create({
    data: { authorId, tokenHash, expiresAt },
  });

  const verifyUrl = `${process.env.APP_URL}/verifikasi-email?token=${token}`;
  try {
    await sendVerificationEmail(email, name, verifyUrl);
  } catch (error) {
    // Kegagalan kirim email tidak boleh menggagalkan registrasi/permintaan
    // kirim ulang — penulis masih bisa pakai "Kirim ulang email verifikasi".
    console.error("Gagal mengirim email verifikasi:", error);
  }
}

const registerSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Email tidak valid"),
  institution: z.string().optional(),
  password: z.string().min(8, "Kata sandi minimal 8 karakter"),
});

export type RegisterState = {
  error?: string;
};

export async function registerAction(
  _prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    institution: formData.get("institution") || undefined,
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const { name, email, institution, password } = parsed.data;

  const existing = await prisma.author.findUnique({ where: { email } });
  if (existing) {
    return { error: "Email sudah terdaftar. Silakan masuk." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const author = await prisma.author.create({
    data: { name, email, institution, passwordHash },
  });

  await issueAndSendVerificationEmail(author.id, author.email, author.name);

  redirect("/masuk?terdaftar=1");
}

export async function resendVerificationEmailAction() {
  const author = await requireAuthor();
  if (author.emailVerifiedAt) return;

  await prisma.emailVerificationToken.deleteMany({
    where: { authorId: author.id },
  });
  await issueAndSendVerificationEmail(author.id, author.email, author.name);

  revalidatePath("/dashboard");
}

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = formData.get("email");
  const password = formData.get("password");
  const callbackUrl = (formData.get("callbackUrl") as string) || "/dashboard";

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl,
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Email atau kata sandi salah." };
    }
    throw error;
  }
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
