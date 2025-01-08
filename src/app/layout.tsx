import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { HomeIcon, UserGroupIcon, TrophyIcon, FireIcon, SparklesIcon, DocumentTextIcon } from '@heroicons/react/24/solid';


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
    <nav className="bg-stone-700 text-white p-3">
      <div className="flex justify-start space-x-4 font-lostIsland uppercase tracking-widest text-xs">
        <a href="/" className="flex flex-col hover:opacity-70 me-auto px-2">
          <HomeIcon className="h-6 w-6 text-white mx-auto mb-1" />
          Home
        </a>
        <a href="/cast" className="flex flex-col hover:opacity-70 px-2">
          <FireIcon className="h-6 w-6 text-white mx-auto mb-1" />
          Cast
        </a>
        <a href="/scores" className="flex flex-col hover:opacity-70 px-2">
          <TrophyIcon className="h-6 w-6 text-white mx-auto mb-1" />
          Scores
        </a>
        <a href="/rules" className="flex flex-col hover:opacity-70 px-2">
          <DocumentTextIcon className="h-6 w-6 text-white mx-auto mb-1" />
          Rules
        </a>
        <a href="/draft" className="flex flex-col hover:opacity-70 px-2">
          <SparklesIcon className="h-6 w-6 text-white mx-auto mb-1" />
          Draft
        </a>
      </div>
    </nav>
  );
}