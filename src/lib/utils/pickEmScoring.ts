type PickSubmission = { optionId: number };

type PickEmConfig = {
  id: number;
  options: { id: number; label?: string; value?: any; type?: string; pointValue?: number }[];
  answers: number[];
  // add other fields if needed
};

const WRONG_PICK_PENALTY = 50;

export function computePickEmScore(
  pick: PickSubmission,
  pickEm: PickEmConfig
): number {
  const option = pickEm.options.find(opt => opt.id === pick.optionId);

  // If no valid option, skip
  if (!option) return 0;

  // If no answers, or answers is not an array with at least one integer, skip this pick
  if (!Array.isArray(pickEm.answers) || pickEm.answers.length === 0 || !pickEm.answers.some(a => typeof a === "number")) {
    return 0;
  }

  const isCorrect = pickEm.answers.includes(option.id);

  const pV = Number(option.pointValue)

  if (isCorrect) {
    return pV;
  } else {
    return -WRONG_PICK_PENALTY;
  }
}