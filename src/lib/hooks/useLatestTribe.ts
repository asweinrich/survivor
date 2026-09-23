import { useEffect, useState } from 'react';

type LatestTribe = {
  color: string | null;
  emoji: string | null;
  tribeName: string | null;
  season: number | null;
};

export function useLatestTribe(userPhone?: string | null) {
  const [data, setData] = useState<LatestTribe>({
    color: null,
    emoji: null,
    tribeName: null,
    season: null,
  });

  useEffect(() => {
    if (!userPhone) return;
    const ac = new AbortController();

    (async () => {
      try {
        const res = await fetch(`/api/latest-tribe?phone=${encodeURIComponent(userPhone)}`, {
          signal: ac.signal,
        });
        if (!res.ok) return;
        const json = await res.json();
        setData(json);
      } catch {
        // ignore aborts/errors
      }
    })();

    return () => ac.abort();
  }, [userPhone]);

  return data;
}