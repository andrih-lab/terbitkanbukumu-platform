import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Mengembalikan Author yang sedang login, atau redirect ke /masuk bila belum login. */
export async function requireAuthor() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/masuk");
  }

  const author = await prisma.author.findUnique({
    where: { id: session.user.id },
  });

  if (!author) {
    redirect("/masuk");
  }

  return author;
}
