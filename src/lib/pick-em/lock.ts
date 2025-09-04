// /lib/pickems/lock.ts
// Deterministic “Wednesday 5:00 PM PT” lock for any (season, week)
// without storing lock times per pick.

type Anchor = { year: number; month: number; day: number }; // month: 1-12

// Configure your season anchors (Week 1 lock). Fill real dates.
const SEASON_WEEK1_ANCHORS: Record<number, Anchor> = {
  49: { year: 2025, month: 9, day: 24 }, 
  // 50: { year: 2025, month: X, day: Y },
};

function buildPTDate(parts: Anchor, hour = 17, minute = 0) {
  // Build a PT-local date for (Y, M, D, hour:minute).
  const baseline = new Date(parts.year, parts.month - 1, parts.day, hour, minute, 0, 0);
  // Re-set hours to 17:00 local PT in case DST shifts affect arithmetic.
  baseline.setHours(hour, minute, 0, 0);
  return baseline;
}

export function weeklyLockAtPT(season: number, week: number): Date {
  const anchor = SEASON_WEEK1_ANCHORS[season];
  if (!anchor) {
    // Fallback: next Wednesday 5pm PT from "now" (dev-safe)
    const now = new Date();
    const ptNow = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false,
    }).formatToParts(now).reduce((a: any, p) => ((a[p.type] = p.value), a), {});
    const base = new Date(+ptNow.year, +ptNow.month - 1, +ptNow.day, 17, 0, 0, 0);
    const WED = 3, day = base.getDay();
    const offset = ((WED - day + 7) % 7) || 7;
    base.setDate(base.getDate() + offset);
    base.setHours(17, 0, 0, 0);
    return base;
  }

  // Week N = anchor + 7*(N-1) days, then set to 5:00 PM PT
  const d = buildPTDate(anchor, 17, 0);
  d.setDate(d.getDate() + 7 * (week - 1));
  d.setHours(17, 0, 0, 0);
  return d;
}

export function isLocked(season: number, week: number, now = Date.now()): boolean {
  return weeklyLockAtPT(season, week).getTime() <= now;
}
