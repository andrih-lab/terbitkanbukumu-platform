import type { NextAuthConfig } from "next-auth";

// Konfigurasi yang aman dijalankan di Edge Runtime (middleware): tidak ada
// provider (Credentials butuh Prisma/bcrypt, tidak Edge-compatible). Provider
// didaftarkan terpisah di lib/auth.ts untuk dipakai di API route & Server
// Action (Node runtime).
export const authConfig = {
  // Diperlukan untuk hosting mandiri (non-Vercel), yang tidak otomatis
  // dipercaya oleh NextAuth. Lihat https://errors.authjs.dev#untrustedhost
  trustHost: true,
  pages: { signIn: "/masuk" },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user) session.user.id = token.id as string;
      return session;
    },
  },
} satisfies NextAuthConfig;
