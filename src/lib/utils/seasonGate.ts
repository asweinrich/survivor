export const USE_WEEKLY_FROM_SEASON = 50;

export function useWeeklyScoring(season: number | string) {
  const s = Number(season);
  return Number.isFinite(s) && s >= USE_WEEKLY_FROM_SEASON;
}