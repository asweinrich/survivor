import { useEffect, useState } from "react";
import type { Contestant, PlayerTribe, Tribe, Player } from "../types";

export function useSeasonData(season: string) {
  const [playerTribes, setPlayerTribes] = useState<PlayerTribe[]>([]);
  const [contestants, setContestants]   = useState<Contestant[]>([]);
  const [tribes, setTribes]             = useState<Tribe[]>([]);
  const [players, setPlayers]           = useState<Player[]>([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    let alive = true;
    async function run() {
      try {
        setLoading(true);
        const [ptRes, castRes, tribesRes, playersRes] = await Promise.all([
          fetch(`/api/player-tribes/${season}`),
          fetch(`/api/cast/${season}`),
          fetch(`/api/show-tribes/${season}`),
          fetch(`/api/fantasy-players/${season}`)
        ]);
        const [pt, cast, tr, pl] = await Promise.all([ptRes.json(), castRes.json(), tribesRes.json(), playersRes.json()]);
        if (!alive) return;
        setPlayerTribes(pt);
        setContestants(cast);
        setTribes(tr);
        setPlayers(pl);
      } finally {
        if (alive) setLoading(false);
      }
    }
    run();
    return () => { alive = false; };
  }, [season]);

  return { playerTribes, contestants, tribes, players, loading };
}
