import {
  VOTEOUT_SECOND_PLACE,
  VOTEOUT_SOLE_SURVIVOR,
  VOTEOUT_THIRD_PLACE
} from "../constants";
import type { Contestant } from "../types";

/**
 * Returns a Tailwind border class for a contestant’s avatar.
 * When spoilers are hidden, returns a uniform border.
 */
export function getStatusBorder(contestant: Contestant, revealSpoilers: boolean): string {
  if (!revealSpoilers) return "border-gray-400";

  if (!contestant.inPlay && contestant.voteOutOrder) {
    if (contestant.voteOutOrder === VOTEOUT_SOLE_SURVIVOR) return "border-yellow-400";
    if (contestant.voteOutOrder === VOTEOUT_SECOND_PLACE)  return "border-zinc-400";
    if (contestant.voteOutOrder === VOTEOUT_THIRD_PLACE)   return "border-amber-600";
  }
  return contestant.inPlay ? "border-green-400" : "border-red-500";
}
