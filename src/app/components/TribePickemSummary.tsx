import { CheckCircleIcon, XCircleIcon, MinusCircleIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/solid';

type Pick = {
  answered: boolean;
  pending?: boolean;
  isCorrect?: boolean;
};

type PickemWeek = {
  week: number;
  picks: Pick[];
  score: number;
};

interface WeekQuestion {
  week: number;
  numQuestions: number;
}

interface TribePickemSummaryProps {
  pickemWeeks: PickemWeek[];
  weekQuestionMatrix: WeekQuestion[]; // e.g., [{week:2, numQuestions:3}, ...]
}

export default function TribePickemSummary({
  pickemWeeks,
  weekQuestionMatrix
}: TribePickemSummaryProps) {
  // Build a map for easy lookup
  const weekMap = Object.fromEntries((pickemWeeks ?? []).map(w => [w.week, w]));

  return (
    <div className="flex flex-col pt-2">
      {weekQuestionMatrix.map(({ week, numQuestions }) => {
        const weekData = weekMap[week];
        let picks: (Pick | null)[] = [];

        if (weekData && weekData.picks?.length) {
          // Fill any missing picks with nulls (if tribe answered less than max)
          picks = Array.from({ length: numQuestions }).map(
            (_, idx) => weekData.picks[idx] ?? null
          );
        } else {
          // Tribe skipped this week, show all as faded minus
          picks = Array(numQuestions).fill(null);
        }

        // Passed if no picks for this week (not submitted)
        const isPassed = !(weekData && weekData.picks && weekData.picks.length);
        // Consider "scored" if weekData exists and none of the picks are pending
        const isSubmitted = !isPassed;
        // New logic: consider the week "scored" if weekData exists and none of the picks are pending
        const isScored = isSubmitted && picks.length > 0 && picks.every(
          pick => pick && pick.answered && !pick.pending
        );
        // But ALSO, if weekData.score !== undefined/null, treat as scored (for partial answers)
        const hasScoredPoints = isSubmitted && typeof weekData?.score === 'number';

        // Score styling logic (duplicating pick-em page)
        let scoreElem;
        if (!isSubmitted) {
          // Passed
          scoreElem = (
            <span
              className="text-sm tracking-wider inline-flex items-center gap-1 text-gray-300 font-lostIsland uppercase bg-gray-600/60 px-2 py-1 rounded-lg"
              title="Passed (no picks this week)"
            >
              passed
            </span>
          );
        } else if (hasScoredPoints) {
          // Show score regardless of number of questions answered
          const points = weekData?.score ?? 0;
          let textColor = "text-green-300";
          let bgColor = "bg-green-900/60";
          let displayPoints = `${points} pts`;
          if (points < 0) {
            textColor = "text-red-300";
            bgColor = "bg-red-900/60";
          } else if (points === 0) {
            textColor = "text-stone-300";
            bgColor = "bg-stone-700/50";
          }
          scoreElem = (
            <span
              className={`inline-flex items-center gap-1 font-lostIsland lowercase tracking-wider px-2 py-1 rounded-lg ${textColor} ${bgColor}`}
              title="Scored"
            >
              {displayPoints}
            </span>
          );
        } else {
          // Locked in (not yet scored)
          scoreElem = (
            <span
              className="text-sm tracking-wider inline-flex items-center gap-1 text-orange-300 font-lostIsland uppercase bg-orange-900/60 px-2 py-1 rounded-lg"
              title="Locked In"
            >
              locked in
            </span>
          );
        }

        return (
          <div key={week} className="flex justify-start items-center w-full py-1">
            {/* Left column: Week label */}
            <div className="w-16 text-center font-lostIsland lowercase text-stone-300 text-xl">Week {week}</div>

            {/* Middle column: Picks */}
            <div className="flex flex-row gap-2 flex-1 justify-start ps-6">
              {picks.map((pick, idx) => (
                <span key={idx} className="relative flex items-center justify-center bg-black rounded-full">
                  {pick ? (
                    pick.answered ? (
                      pick.pending ? (
                        <QuestionMarkCircleIcon className="w-7 h-7 text-stone-400" title="Pending" />
                      ) : pick.isCorrect ? (
                        <CheckCircleIcon className="w-7 h-7 text-green-400" title="Correct" />
                      ) : (
                        <XCircleIcon className="w-7 h-7 text-red-400" title="Incorrect" />
                      )
                    ) : (
                      <MinusCircleIcon className="w-7 h-7 text-stone-600" title="Unanswered" />
                    )
                  ) : (
                    <MinusCircleIcon className="w-7 h-7 text-stone-600" title="Unanswered" />
                  )}
                </span>
              ))}
            </div>

            {/* Right column: Score */}
            <div className="w-24 text-right">{scoreElem}</div>
          </div>
        );
      })}
    </div>
  );
}