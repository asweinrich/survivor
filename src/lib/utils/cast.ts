import type { Contestant } from '@/lib/types';

/**
 * Sort contestants based on season + spoiler state.
 * 
 * Rules:
 * - If spoilers are hidden:
 *    • Season 50 → DB order by id
 *    • Others   → A→Z by first name
 * - If spoilers are shown:
 *    • Season 50 → by first pastSeason.seasonNumber (if provided)
 *    • Others   → inPlay first, then points DESC, then voteOutOrder DESC
 */
export function sortContestants(
  contestants: Contestant[],
  season: string,
  revealSpoilers: boolean
): Contestant[] {
  const list = [...contestants];

  if (!revealSpoilers) {
    if (season === '50') {
      return list.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
    }
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }

  if (season === '50') {
    return list.sort((a, b) => {
      const aFirst = a.pastSeasons?.[0]?.seasonNumber ?? 999;
      const bFirst = b.pastSeasons?.[0]?.seasonNumber ?? 999;
      return aFirst - bFirst;
    });
  }

  return list.sort((a, b) => {
    if (a.inPlay !== b.inPlay) return a.inPlay ? -1 : 1;
    if (a.inPlay && b.inPlay) return (b.points ?? 0) - (a.points ?? 0);
    return (b.voteOutOrder ?? 0) - (a.voteOutOrder ?? 0);
  });
}
