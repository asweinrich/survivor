// lib/authOptions.ts
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import type { Session, NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { verifyPhoneVerificationToken } from "./verifyToken";

export const authOptions: NextAuthOptions = {
  // No PrismaAdapter — phone-based sessions are pure JWT, not tied to the
  // NextAuth Account/Session/User tables. Those tables can stay unused in
  // the schema or be dropped later.
  providers: [
    CredentialsProvider({
      id: "phone",
      name: "Phone",
      credentials: {
        phone: { label: "Phone", type: "text" },
        verificationToken: { label: "Verification Token", type: "text" },
      },
      async authorize(credentials) {
        const phone = credentials?.phone;
        const verificationToken = credentials?.verificationToken;

        if (!phone || !verificationToken) return null;

        // Proves the phone was just verified via Twilio moments ago
        // (see /api/auth/phone/verify — short TTL, can't be replayed).
        if (!verifyPhoneVerificationToken(verificationToken, phone)) return null;

        const player = await prisma.player.findUnique({ where: { phone } });

        // Gate again at auth time: must already exist AND have drafted a
        // tribe. Mirrors the check in sign-in/send-code so this endpoint
        // can't be used directly to bypass that requirement.
        if (!player || !player.playerTribes || player.playerTribes.length === 0) return null;

        return {
          id: String(player.id),
          name: player.name,
          phone: player.phone,
          email: player.email,
        } as any;
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      try {
        if (url.startsWith(baseUrl)) return url;
        if (url.startsWith("/")) return `${baseUrl}${url}`;
      } catch {}
      return `${baseUrl}/dashboard`;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      if (token?.phone && session.user) (session.user as any).phone = token.phone as string;
      if (token?.email && session.user) session.user.email = token.email as string;
      if (token?.playerId && session.user) (session.user as any).playerId = token.playerId as number;
      return session;
    },
    async jwt({ token, user }: { token: JWT; user?: any }) {
      if (user?.phone) token.phone = user.phone;
      if (user?.email) token.email = user.email;
      if (user?.id) token.playerId = Number(user.id);
      return token;
    },
  },
};