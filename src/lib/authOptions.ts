// lib/authOptions.ts
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";
import type { Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";


export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
  ],
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token?.email && session.user) {
        session.user.email = token.email as string;
      }
      return session;
    },
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user?.email) {
        token.email = user.email;
      }
      return token;
    },
  },
  events: {
    async signIn({ user }: { user?: User }) {
      if (!user?.email) return;

      const existing = await prisma.player.findFirst({
        where: { email: user.email || "" },
      });

      if (!existing) {
        await prisma.player.create({
          data: {
            name: user.name || "Unnamed Player",
            email: user.email || "",
            passwordHash: "",
          },
        });
      }
    },
  },
};
