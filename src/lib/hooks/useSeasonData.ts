import { useEffect, useState } from "react";
import type { Contestant, PlayerTribe, Tribe } from "../types";

export function useSeasonData(season: string) {
  const [playerTribes, setPlayerTribes] = useState<PlayerTribe[]>([]);
  const [contestants, setContestants]   = useState<Contestant[]>([]);
  const [tribes, setTribes]             = useState<Tribe[]>([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    let alive = true;
    async function run() {
      try {
        setLoading(true);
        const [ptRes, castRes, tribesRes] = await Promise.all([
          fetch(`/api/player-tribes/${season}`),
          fetch(`/api/cast/${season}`),
          fetch(`/api/show-tribes/${season}`)
        ]);
        const [pt, cast, tr] = await Promise.all([ptRes.json(), castRes.json(), tribesRes.json()]);
        if (!alive) return;
        setPlayerTribes(pt);
        setContestants(cast);
        setTribes(tr);
      } finally {
        if (alive) setLoading(false);
      }
    }
    run();
    return () => { alive = false; };
  }, [season]);

  return { playerTribes, contestants, tribes, loading };
}
