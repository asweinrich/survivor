import { useWeeklyScoring } from '@/lib/utils/seasonGate';
import { totalPointsForContestantSeason } from '@/lib/scoring/weekly';

export async function scoreTribeIds(
  tribeArray: number[],
  season: number,
  contestantMap: Record<number, any>
) {
  if (!useWeeklyScoring(season)) {
    // Existing path (S49 and earlier):
    const base = tribeArray.reduce((sum, id) => sum + (contestantMap[id]?.points ?? 0), 0);
    const predictedId = tribeArray[0];
    const winnerBonus = contestantMap[predictedId]?.soleSurvivor ? 200 : 0;
    return base + winnerBonus;
  }

  // Weekly path for S50+:
  const totals = await Promise.all(tribeArray.map((id) => totalPointsForContestantSeason(id, season)));
  const base = totals.reduce((sum, pts) => sum + pts, 0);
  // Decide if you keep the predicted winner bonus for S50+ (if so, compute from WeeklyScore or contestantMap):
  return base;
}