import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { HomeIcon } from '@heroicons/react/24/solid';


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Survivor Fantasy App",
  description: "A fantasy game for Surivor enthusiasts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}

function Navbar() {
  return (
    <nav className="bg-stone-700 text-white p-4">
      <div className="flex justify-start space-x-4 font-lostIsland uppercase tracking-wider text-lg">
        <a href="/" className="hover:underline me-auto">
          <HomeIcon className="h-6 w-6 text-white" />
        </a>
        <a href="/contestants" className="hover:underline">
          Contestants
        </a>
        <a href="/scores" className="hover:underline">
          Scores
        </a>
      </div>
    </nav>
  );
}