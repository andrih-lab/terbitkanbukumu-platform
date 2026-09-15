import path from "node:path";
import { PrismaClient } from "@/generated/prisma/client";

// Prisma generator "prisma-client" resolves relative sqlite `file:` URLs
// using `__dirname` baked into the generated client. Under Turbopack/webpack
// bundling, that `__dirname` points at the bundled chunk instead of
// `src/generated/prisma`, so the relative path breaks at runtime (works fine
// with `prisma migrate`/`tsx`, fails under `next dev`/`next build`). We
// resolve the same convention (relative to `prisma/`) explicitly against
// `process.cwd()`, which Next.js always sets to the project root.
function resolveDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL belum diset.");
  if (url.startsWith("file:") && !url.startsWith("file:/")) {
    const relativePath = url.slice("file:".length);
    return `file:${path.resolve(process.cwd(), "prisma", relativePath)}`;
  }
  return url;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ datasourceUrl: resolveDatabaseUrl() });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
