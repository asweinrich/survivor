type PickSubmission = { optionId: number };

type PickEmConfig = {
  id: number;
  options: { id: number; label?: string; value?: any; type?: string; pointValue?: number }[];
  answers: number[];
  // add other fields if needed
};

const WRONG_PICK_PENALTY = 50;

export type PickEmScoreStatus = "correct" | "incorrect" | "invalidated" | "pending" | "skipped";

export function isPickEmInvalidated(pickEm: PickEmConfig): boolean {
  // Only consider invalidation once the pick-em is scorable
  if (!Array.isArray(pickEm.answers) || pickEm.answers.length === 0) return false;
  if (!pickEm.answers.some(a => typeof a === "number")) return false;

  const answerIds = (pickEm.answers as unknown[]).filter((a): a is number => typeof a === "number");
  const answerOptions = pickEm.options.filter(opt => answerIds.includes(opt.id));

  // Option A: if ANY correct option has pointValue === 0 => invalidate the question
  return answerOptions.some(opt => Number(opt.pointValue) === 0);
}

export function computePickEmResult(
  pick: PickSubmission,
  pickEm: PickEmConfig
): { points: number; status: PickEmScoreStatus; isCorrect?: boolean } {
  const option = pickEm.options.find(opt => opt.id === pick.optionId);

  // If no valid option, skip
  if (!option) return { points: 0, status: "skipped" };

  const validAnswers =
    Array.isArray(pickEm.answers) &&
    pickEm.answers.length > 0 &&
    pickEm.answers.some(a => typeof a === "number");

  // Not yet scored (pending)
  if (!validAnswers) return { points: 0, status: "pending" };

  // Invalidated question: no points for anyone, no penalties
  if (isPickEmInvalidated(pickEm)) return { points: 0, status: "invalidated" };

  const isCorrect = pickEm.answers.includes(option.id);
  const pV = Number(option.pointValue);

  if (isCorrect) {
    return { points: Number.isFinite(pV) ? pV : 0, status: "correct", isCorrect: true };
  }
  return { points: -WRONG_PICK_PENALTY, status: "incorrect", isCorrect: false };
}

// Keep existing API intact for callers that only need the numeric score
export function computePickEmScore(
  pick: PickSubmission,
  pickEm: PickEmConfig
): number {
  return computePickEmResult(pick, pickEm).points;
}