import type { Contestant } from '@/lib/types';

/**
 * Sort contestants based on season + spoiler state.
 * 
 * Rules:
 * - If spoilers are hidden:
 *    • Season 50 → DB order by id
 *    • Season 49 → group players by identical tribeArray values (if they have tribes)
 *    • Others   → A→Z by first name
 * - If spoilers are shown:
 *    • Season 50 → by first pastSeason.seasonNumber (if provided)
 *    • Season 49 → group in-play players by identical tribeArray values,
 *                  others follow standard ordering
 *    • Others   → inPlay first, then points DESC, then voteOutOrder DESC
 */
export function sortContestants(
  contestants: Contestant[],
  season: string,
  revealSpoilers: boolean
): Contestant[] {
  const list = [...contestants];

  // HIDDEN SPOILERS
  if (!revealSpoilers) {
    if (season === '50') {
      return list.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
    }
    if (season === '49') {
      // group players by tribes if they exist
      return list.sort((a, b) => {
        const aKey = a.tribes?.length ? a.tribes.join('-') : '';
        const bKey = b.tribes?.length ? b.tribes.join('-') : '';
        if (aKey < bKey) return -1;
        if (aKey > bKey) return 1;
        return a.name.localeCompare(b.name); // fallback within same group
      });
    }
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }

  // SHOWN SPOILERS
  if (season === '50') {
    return list.sort((a, b) => {
      const aFirst = a.pastSeasons?.[0]?.seasonNumber ?? 999;
      const bFirst = b.pastSeasons?.[0]?.seasonNumber ?? 999;
      return aFirst - bFirst;
    });
  }

  if (season === '49') {
    const inPlay = list.filter(c => c.inPlay);
    const outPlay = list.filter(c => !c.inPlay);

    const grouped = inPlay.sort((a, b) => {
      const aKey = a.tribes?.join('-') ?? '';
      const bKey = b.tribes?.join('-') ?? '';
      if (aKey < bKey) return -1;
      if (aKey > bKey) return 1;
      return (b.points ?? 0) - (a.points ?? 0); // tie-breaker
    });

    const others = outPlay.sort((a, b) => (b.voteOutOrder ?? 0) - (a.voteOutOrder ?? 0));

    return [...grouped, ...others];
  }

  // DEFAULT
  return list.sort((a, b) => {
    if (a.inPlay !== b.inPlay) return a.inPlay ? -1 : 1;
    if (a.inPlay && b.inPlay) return (b.points ?? 0) - (a.points ?? 0);
    return (b.voteOutOrder ?? 0) - (a.voteOutOrder ?? 0);
  });
}
