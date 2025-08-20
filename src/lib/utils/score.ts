// src/lib/utils/score.ts
import type { Contestant, PlayerTribe } from "../types";

/** Detailed breakdown of a tribe's score. */
export type ScoreBreakdown = {
  /** Sum of contestant points (or pastScore on S47). */
  base: number;
  /** Bonus components applied on top of base. */
  bonus: {
    /** +200 if the first pick is the sole survivor (S48+ only). */
    predictedWinner: number;
  };
  /** Per-contestant contribution (useful for UI or debugging). */
  perContestant: Array<{
    id: number;
    name?: string;
    points: number; // 0 if missing
  }>;
  /** base + all bonuses. */
  total: number;
};

/** A PlayerTribe with computed score & breakdown. */
export type ScoredPlayerTribe = PlayerTribe & {
  score: number;
  breakdown: ScoreBreakdown;
  /** Convenience flag for highlighting the +200 bonus in UI. */
  hasWinnerBonus: boolean;
};

/**
 * Calculate just the numeric score for a tribe in a given season.
 * - S47: returns `pastScore`
 * - S48+: sum of contestant points +200 if first pick is the sole survivor
 */
export function calculateScoreForSeason(
  tribe: PlayerTribe,
  season: string,
  contestantMap: Record<number, Contestant>
): number {
  if (season === "47") return tribe.pastScore || 0;

  const base = tribe.tribeArray.reduce((sum, id) => sum + (contestantMap[id]?.points ?? 0), 0);
  const predictedId = tribe.tribeArray[0];
  const winnerBonus = contestantMap[predictedId]?.soleSurvivor ? 200 : 0;
  return base + winnerBonus;
}

/**
 * Produce a rich scoring breakdown for a single tribe.
 * - S47: uses `pastScore` as base; no bonuses; perContestant is derived from map when available
 * - S48+: sums contestant points + applies +200 predicted winner bonus if applicable
 */
export function scoreTribe(
  tribe: PlayerTribe,
  season: string,
  contestantMap: Record<number, Contestant>
): ScoredPlayerTribe {
  if (season === "47") {
    // Still generate a per-contestant snapshot where possible (for UI)
    const perContestant = (tribe.tribeArray ?? []).map((id) => ({
      id,
      name: contestantMap[id]?.name,
      points: contestantMap[id]?.points ?? 0
    }));

    const base = tribe.pastScore || 0;
    const breakdown: ScoreBreakdown = {
      base,
      bonus: { predictedWinner: 0 },
      perContestant,
      total: base
    };

    return {
      ...tribe,
      score: breakdown.total,
      breakdown,
      hasWinnerBonus: false
    };
  }

  // S48+ flow
  const perContestant = (tribe.tribeArray ?? []).map((id) => ({
    id,
    name: contestantMap[id]?.name,
    points: contestantMap[id]?.points ?? 0
  }));

  const base = perContestant.reduce((sum, c) => sum + c.points, 0);

  const predictedId = tribe.tribeArray[0];
  const predictedIsWinner = !!contestantMap[predictedId]?.soleSurvivor;
  const predictedWinnerBonus = predictedIsWinner ? 200 : 0;

  const breakdown: ScoreBreakdown = {
    base,
    bonus: { predictedWinner: predictedWinnerBonus },
    perContestant,
    total: base + predictedWinnerBonus
  };

  return {
    ...tribe,
    score: breakdown.total,
    breakdown,
    hasWinnerBonus: predictedIsWinner
  };
}

/** Score a list of tribes for a season. */
export function scorePlayerTribes(
  tribes: PlayerTribe[],
  season: string,
  contestantMap: Record<number, Contestant>
): ScoredPlayerTribe[] {
  return tribes.map((t) => scoreTribe(t, season, contestantMap));
}

/** Sort by score (desc), then createdAt (desc) to break ties deterministically. */
export function sortTribesByScoreThenRecency<T extends { score?: number; createdAt: string }>(
  list: T[]
): T[] {
  return [...list].sort(
    (a, b) =>
      (b.score ?? 0) - (a.score ?? 0) ||
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/** Assign ranks with tie handling (same score => same rank). */
export function rankTribes<T extends { score?: number }>(
  sorted: T[]
): Array<T & { rank: number }> {
  let lastScore: number | null = null;
  let lastRank = 0;

  return sorted.map((item, index) => {
    const rank = (item.score === lastScore) ? lastRank : index + 1;
    lastScore = item.score ?? null;
    lastRank = rank;
    return { ...item, rank };
  });
}

/**
 * Convenience: go from raw PlayerTribe[] to ranked ScoredPlayerTribe[] in one call.
 * Useful in pages/components:
 *   const scoredRanked = rankAndScorePlayerTribes(playerTribes, season, contestantMap);
 */
export function rankAndScorePlayerTribes(
  tribes: PlayerTribe[],
  season: string,
  contestantMap: Record<number, Contestant>
): Array<ScoredPlayerTribe & { rank: number }> {
  const scored = scorePlayerTribes(tribes, season, contestantMap);
  const sorted = sortTribesByScoreThenRecency(scored);
  return rankTribes(sorted);
}
