// lib/authOptions.ts
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";
import type { Session, User, NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import nodemailer from "nodemailer";

// Map the magic-link data to the params you used in your Brevo template.
// In the Brevo template editor, reference them as {{ params.MAGIC_LINK }} and {{ params.HOST }}.
function magicLinkParams(url: string, host: string) {
  return {
    MAGIC_LINK: url,
    HOST: host,
    PRODUCT: "Survivor Fantasy", // optional; add/remove as you like
  };
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.Google_CLIENT_SECRET ?? process.env.GOOGLE_CLIENT_SECRET!, // tolerate either
    }),

    // Keep Apple when you’re ready to enable it:
    // AppleProvider({ ... }),

    EmailProvider({
      server: process.env.EMAIL_SERVER, // smtp://<login>:<key>@smtp-relay.brevo.com:587
      from: process.env.EMAIL_FROM,     // "Survivor Fantasy <login@yourdomain.com>"

      // Optional: shorten magic-link lifetime (default ~24h)
      maxAge: 10 * 60, // 10 minutes

      // Use your Brevo *template* via SMTP by adding the X-SIB-API header.
      async sendVerificationRequest({ identifier, url, provider }) {
        const transport = nodemailer.createTransport(provider.server as any);
        const { host } = new URL(url);

        const templateId = 1; // e.g. 1234567

        await transport.sendMail({
          to: identifier,
          from: provider.from as string,
          // If the template has its own subject, it will take precedence.
          subject: `Your sign-in link for ${host}`,

          // 👇 This header tells Brevo to render your saved transactional template
          headers: {
            "X-SIB-API": JSON.stringify({
              templateId,
              params: magicLinkParams(url, host),
              tags: ["nextauth", "magic-link"], // optional
            }),
          },

          // Fallbacks in case the template can’t be used for some reason:
          text: `Sign in to ${host}\n${url}\n\nIf you didn’t request this, ignore this email.`,
          html: `
            <div style="font-family:system-ui;padding:24px;background:#0c0a09;color:#e7e5e4">
              <h1 style="margin:0 0 12px;font-size:20px;">Sign in to ${host}</h1>
              <p>Click the secure link below to finish signing in:</p>
              <p><a href="${url}" style="display:inline-block;padding:10px 16px;border-radius:10px;background:#22c55e;color:#0c0a09;text-decoration:none;font-weight:600">Sign in</a></p>
              <p style="margin-top:12px;font-size:12px;opacity:.7;word-break:break-all">${url}</p>
            </div>
          `,
        });
      },
    }),
  ],
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      try {
        // allow same-origin absolute
        if (url.startsWith(baseUrl)) return url;
        // allow relative
        if (url.startsWith("/")) return `${baseUrl}${url}`;
      } catch {}
      return `${baseUrl}/dashboard`;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      if (token?.email && session.user) session.user.email = token.email as string;
      return session;
    },
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user?.email) token.email = user.email;
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
