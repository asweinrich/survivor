type PickSubmission = { optionId: number };

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

  if (isCorrect) {
    return option.pointValue;
  } else {
    if (option.type === 'contestant') {
      return -Math.round(option.pointValue / 4);
    } else if (option.type === 'tribe' || option.type === 'boolean') {
      return -Math.round(option.pointValue / 2);
    } else {
      return -Math.round(option.pointValue / 4);
    }
  }
}