'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  UserGroupIcon,
  TrophyIcon,
  CursorArrowRaysIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  TrophyIcon as TrophyIconSolid,
  CursorArrowRaysIcon as CursorArrowRaysIconSolid,
  SparklesIcon as SparklesIconSolid,
} from '@heroicons/react/24/solid';

export default function AppTabBar() {
  const pathname = usePathname();

  const tabs = [
    { href: '/', label: 'Home', icon: HomeIcon, iconActive: HomeIconSolid, exact: true },
    { href: '/cast', label: 'Cast', icon: UserGroupIcon, iconActive: UserGroupIconSolid },
    { href: '/leaderboard', label: 'Standings', icon: TrophyIcon, iconActive: TrophyIconSolid },
    { href: '/pick-em', label: 'Pick Ems', icon: CursorArrowRaysIcon, iconActive: CursorArrowRaysIconSolid },
  ];

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 flex justify-center px-4 pointer-events-none
                 pb-[calc(1rem+env(safe-area-inset-bottom))]"
    >
      <div
        className="pointer-events-auto flex items-center gap-1 px-3 py-2 rounded-3xl
                   w-full max-w-md sm:max-w-lg justify-center
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
              className={`flex flex-col items-center justify-center w-20 px-1 py-1.5 rounded-2xl transition-colors duration-150 ${
                active ? 'bg-white/15 text-stone-50' : 'text-stone-300 hover:text-stone-50 hover:bg-white/5'
              }`}
            >
              <Icon className="w-6 h-6 stroke-2" />
              <span className="mt-1.5 text-[10px] uppercase tracking-wide leading-none">{t.label}</span>
            </Link>
          );
        })}

        <Link
          href="/draft"
          className="flex flex-col items-center justify-center w-20 py-1.5 rounded-2xl
                     bg-gradient-to-tr from-orange-500 to-orange-700 text-white
                     shadow-[0_4px_16px_rgba(234,88,12,0.5)] hover:from-orange-600 hover:to-orange-800
                     transition-colors duration-150"
        >
          <SparklesIconSolid className="w-6 h-6" />
          <span className="mt-1 text-[10px] uppercase tracking-wide leading-none">Draft</span>
        </Link>
      </div>
    </nav>
  );
}