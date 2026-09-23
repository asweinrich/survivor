import { useEffect, useState } from 'react';
import type { UserBadge } from '@/lib/types';

type UserInfo = {
  name: string;
  badges: UserBadge[];
  allBadges: UserBadge[];
};

export function useUserInfo(identifier: { email?: string; phone?: string }) {
  const [data, setData] = useState<UserInfo>({ name: '', badges: [], allBadges: [] });
  const { email, phone } = identifier;

  useEffect(() => {
    if (!email && !phone) return;
    const ac = new AbortController();

    (async () => {
      const res = await fetch('/api/user-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone }),
        signal: ac.signal,
      });
      const json = await res.json();

      const sortedEarned = [...(json.badges || [])].sort((a: UserBadge, b: UserBadge) => a.rank - b.rank);
      const sortedAll = [...(json.allBadges || [])].sort((a: UserBadge, b: UserBadge) => a.rank - b.rank);

      setData({
        name: json.name || '',
        badges: sortedEarned,
        allBadges: sortedAll,
      });
    })();

    return () => ac.abort();
  }, [email, phone]);

  return data;
}