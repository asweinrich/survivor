import {
  VOTEOUT_LOST_FIRE,
  VOTEOUT_SECOND_PLACE,
  VOTEOUT_SOLE_SURVIVOR,
  VOTEOUT_THIRD_PLACE
} from "../constants";

/** 1st, 2nd, 3rd, 4th ... */
export function getOrdinalSuffix(n: number): string {
  if (n >= 11 && n <= 13) return `${n}th`;
  const d = n % 10;
  if (d === 1) return `${n}st`;
  if (d === 2) return `${n}nd`;
  if (d === 3) return `${n}rd`;
  return `${n}th`;
}

/** Human text for vote-out status codes. */
export function formatVotedOutOrder(v: number): string {
  if (v === VOTEOUT_SOLE_SURVIVOR) return "Sole Survivor";
  if (v === VOTEOUT_SECOND_PLACE)  return "2nd Place";
  if (v === VOTEOUT_THIRD_PLACE)   return "3rd Place";
  if (v === VOTEOUT_LOST_FIRE)     return "Lost Fire Making";
  return `${getOrdinalSuffix(v)} person voted out`;
}
