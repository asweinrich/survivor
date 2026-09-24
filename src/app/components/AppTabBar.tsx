'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  HomeIcon,
  UserGroupIcon,
  TrophyIcon,
  CursorArrowRaysIcon,
  ArrowRightEndOnRectangleIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  TrophyIcon as TrophyIconSolid,
  CursorArrowRaysIcon as CursorArrowRaysIconSolid,
  SparklesIcon as SparklesIconSolid, // used by the Draft tab — re-enable when draft is live
} from '@heroicons/react/24/solid';
import { useLatestTribe } from '@/lib/hooks/useLatestTribe';

export default function AppTabBar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { color, emoji } = useLatestTribe((session?.user as any)?.phone);

  const tabs = [
    { href: '/', label: 'Home', icon: HomeIcon, iconActive: HomeIconSolid, exact: true, grow: 4 },
    { href: '/cast', label: 'Cast', icon: UserGroupIcon, iconActive: UserGroupIconSolid, grow: 4 },
    { href: '/leaderboard', label: 'Standings', icon: TrophyIcon, iconActive: TrophyIconSolid, grow: 2 },
    { href: '/pick-em', label: 'Pick Ems', icon: CursorArrowRaysIcon, iconActive: CursorArrowRaysIconSolid, grow: 3 },
  ];

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const isSignedIn = status === 'authenticated' && !!session;

  return (
    <>
      
      <div className="fixed bottom-[6rem] inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
        <Link
          href="/draft"
          className="pointer-events-auto tracking-wider border border-stone-950 w-full max-w-md sm:max-w-lg flex items-center justify-center gap-2
                     px-4 py-3 rounded-full bg-gradient-to-tr from-orange-500 to-orange-700 text-white
                     shadow-[0_8px_24px_rgba(234,88,12,0.5)] hover:from-orange-600 hover:to-orange-800
                     transition-colors duration-150"
        >
          <SparklesIconSolid className="w-6 h-6" />
          <span className="text-lg uppercase tracking-wide font-lostIsland">Draft your tribe!</span>
        </Link>
      </div>
      

      <nav
        className="fixed bottom-0 inset-x-0 z-40 flex justify-center px-4 pointer-events-none
                   pb-[calc(1rem+env(safe-area-inset-bottom))]"
      >
        <div
          className="pointer-events-auto flex items-center gap-1 px-3 py-2 rounded-full
                     w-full max-w-md sm:max-w-lg justify-between
                     bg-stone-900/40 backdrop-blur-2xl backdrop-saturate-150
                     border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.35)]
                     supports-[backdrop-filter]:bg-stone-900/30"
        >
          {tabs.map((t) => {
            const active = isActive(t.href, t.exact);
            const Icon = active ? t.iconActive : t.icon;
            return (
              <Link
                key={t.href}
                href={t.href}
                style={{ flexGrow: t.grow }}
                className={`flex-shrink flex flex-col items-center justify-center py-2 rounded-full transition-colors duration-150 ${
                  active ? 'bg-white/15 text-stone-50' : 'text-stone-300 hover:text-stone-50 hover:bg-white/5'
                }`}
              >
                <Icon className="w-6 h-6 stroke-2" />
                <span className="mt-0.5 text-sm font-lostIsland lowercase tracking-wide leading-none">{t.label}</span>
              </Link>
            );
          })}

          {/*
          // Draft tab — commented out until drafting is active. Re-enable alongside the banner above.
          <Link
            href="/draft"
            className="flex flex-col items-center justify-center w-16 py-1.5 rounded-full
                       bg-gradient-to-tr from-orange-500 to-orange-700 text-white
                       shadow-[0_4px_16px_rgba(234,88,12,0.5)] hover:from-orange-600 hover:to-orange-800
                       transition-colors duration-150"
          >
            <SparklesIconSolid className="w-6 h-6" />
            <span className="mt-0.5 text-[10px] uppercase tracking-wide leading-none">Draft</span>
          </Link>
          */}

          {isSignedIn ? (
            <Link
              href="/dashboard"
              className="flex items-center justify-center w-14 h-14 rounded-full text-3xl shadow-md
                         border-2 border-stone-950 transition-transform duration-150 hover:scale-105"
              style={{ backgroundColor: color || '#44403c' }}
              aria-label="Dashboard"
            >
              {emoji || '🏝️'}
            </Link>
          ) : (
            <Link
              href="/sign-in"
              className="flex flex-col items-center justify-center w-14 h-14 py-1.5 rounded-full border-2 border-stone-950
                         bg-gradient-to-tr from-blue-500 to-blue-700 text-white
                         shadow-[0_4px_16px_rgba(37,99,235,0.5)] hover:from-blue-600 hover:to-blue-800
                         transition-colors duration-150"
            >
              <span className="mt-0.5 lowercase font-lostIsland tracking-wide text-center leading-none">Sign<br/>In</span>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}