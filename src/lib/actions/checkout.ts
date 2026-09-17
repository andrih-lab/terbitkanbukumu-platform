"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSnapTransaction } from "@/lib/midtrans";

// Komisi platform 30% dari harga jual. Sisanya (70%, "royalti kotor")
// dipotong PPh Pasal 23: 15% kalau penulis punya NPWP valid, 30% kalau
// tidak (tarif tidak ber-NPWP 2x lebih tinggi, sesuai ketentuan pajak).
const PLATFORM_COMMISSION_RATE = 0.3;
const TAX_RATE_WITH_NPWP = 0.15;
const TAX_RATE_WITHOUT_NPWP = 0.3;

function calculateOrderFinancials(priceIdr: number, authorHasNpwp: boolean) {
  const commissionIdr = Math.round(priceIdr * PLATFORM_COMMISSION_RATE);
  const royaltyGrossIdr = priceIdr - commissionIdr;
  const taxRate = authorHasNpwp ? TAX_RATE_WITH_NPWP : TAX_RATE_WITHOUT_NPWP;
  const taxIdr = Math.round(royaltyGrossIdr * taxRate);
  const authorEarningIdr = royaltyGrossIdr - taxIdr;
  return { commissionIdr, taxIdr, authorEarningIdr };
}

const checkoutSchema = z.object({
  buyerName: z.string().min(3, "Nama minimal 3 karakter"),
  buyerEmail: z.string().email("Email tidak valid"),
});

export type CheckoutState = {
  error?: string;
};

export async function checkoutAction(
  _prevState: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const slug = formData.get("slug") as string;

  const parsed = checkoutSchema.safeParse({
    buyerName: formData.get("buyerName"),
    buyerEmail: formData.get("buyerEmail"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }
  const { buyerName, buyerEmail } = parsed.data;

  const project = await prisma.bookProject.findUnique({
    where: { slug },
    include: { author: true },
  });

  if (!project || !project.priceIdr) {
    return { error: "Buku tidak ditemukan atau belum dijual." };
  }

  const { commissionIdr, taxIdr, authorEarningIdr } = calculateOrderFinancials(
    project.priceIdr,
    Boolean(project.author.npwp),
  );

  const order = await prisma.order.create({
    data: {
      bookProjectId: project.id,
      buyerName,
      buyerEmail,
      priceIdr: project.priceIdr,
      commissionIdr,
      taxIdr,
      authorEarningIdr,
    },
  });

  let redirectUrl: string;
  try {
    const transaction = await createSnapTransaction({
      orderId: order.id,
      grossAmount: project.priceIdr,
      buyerName,
      buyerEmail,
      itemName: project.title,
    });
    redirectUrl = transaction.redirect_url;
  } catch (error) {
    console.error("Gagal membuat transaksi Midtrans:", error);
    return { error: "Gagal memulai pembayaran. Coba lagi sebentar lagi." };
  }

  redirect(redirectUrl);
}
