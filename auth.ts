// auth.ts (NextAuth v5)
import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const credentialsSchema = z.object({
  // If your zod doesn't have z.email(), use: z.string().email()
  email: z.email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [
    Credentials({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (rawCreds) => {
        // ✅ Zod validation
        const parsed = credentialsSchema.safeParse(rawCreds);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        // Lookup
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;

        // Verify
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        // Return minimal session user
        return {
          id: user.id,
          email: user.email ?? undefined,
          name: user.name ?? undefined,
          role: user.role,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.uid = (user as any).id; // custom id copy
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role as any;
        (session.user as any).id = (token as any).uid ?? (token.sub as string);
      }
      return session;
    },
  },
} satisfies NextAuthConfig);
