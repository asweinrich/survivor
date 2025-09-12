// /lib/pickems/lock.ts
// Deterministic “Wednesday 5:00 PM PT” lock for any (season, week)
// without storing lock times per pick.
import { DateTime } from 'luxon';

type Anchor = { year: number; month: number; day: number }; // month: 1-12

// Configure your season anchors (Week 1 lock). Fill real dates.
const SEASON_WEEK1_ANCHORS: Record<number, Anchor> = {
  49: { year: 2025, month: 9, day: 24 }, 
  // 50: { year: 2025, month: X, day: Y },
};

function buildPTDate(parts: Anchor, hour = 17, minute = 0) {
  // Use Luxon to create a PT time and output as UTC JS Date
  return DateTime.fromObject({
    year: parts.year,
    month: parts.month,
    day: parts.day,
    hour,
    minute,
  }, { zone: 'America/Los_Angeles' }).toUTC().toJSDate();
}

export function weeklyLockAtPT(season: number, week: number): Date {
  const anchor = SEASON_WEEK1_ANCHORS[season];
  if (!anchor) {
    // Fallback: next Wednesday 5pm PT from "now" (dev-safe)
    const nowPT = DateTime.now().setZone('America/Los_Angeles');
    // Find the next Wednesday
    const daysToWed = ((3 - nowPT.weekday + 7) % 7) || 7;
    const nextWed = nowPT.plus({ days: daysToWed }).set({ hour: 17, minute: 0, second: 0, millisecond: 0 });
    return nextWed.toUTC().toJSDate();
  }

  console.log("datetime: ", DateTime)

    // Create PT date for anchor, then add week offset
  const anchorDT = DateTime.fromObject({
    year: anchor.year,
    month: anchor.month,
    day: anchor.day,
    hour: 17,
    minute: 0,
  }, { zone: "America/Los_Angeles" }).plus({ days: 7 * (week - 1) });
  return anchorDT.toUTC().toJSDate();
}

export function isLocked(season: number, week: number, now = Date.now()): boolean {
  return weeklyLockAtPT(season, week).getTime() <= now;
}
