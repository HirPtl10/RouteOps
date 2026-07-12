import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    // Placeholder until Developer 2 provides Prisma Schema and we integrate PrismaAdapter
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // TODO: Replace with Prisma DB query once Developer 2 adds the schema
        // and we configure the NextAuth Prisma adapter.
        console.warn("Auth.js is currently in scaffolding mode waiting for DB schema.");
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});
