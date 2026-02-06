'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AppTabBar() {
  const pathname = usePathname();
  const tabs = [
    { href: '/leaderboard/contestants', label: 'Leaderboard' },
    { href: '/cast', label: 'Cast' },
    { href: '/pick-em', label: 'Pick-Em' },
    { href: '/dashboard', label: 'Dashboard' },
  ];

  return (
    <nav className="w-full bg-stone-900 border-b border-stone-800">
      <ul className="max-w-6xl mx-auto px-4 grid grid-cols-4 gap-2 py-2">
        {tabs.map((t) => {
          const active = pathname.startsWith(t.href);
          return (
            <li key={t.href} className="text-center">
              <Link
                href={t.href}
                className={`block px-2 py-1 rounded-md text-sm ${
                  active ? 'bg-stone-800 text-stone-50' : 'text-stone-300 hover:text-stone-50'
                }`}
              >
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}