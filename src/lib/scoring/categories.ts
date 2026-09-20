export type ScoringCategory = {
  name: string;
  description?: string;
  points: number;
  schemaKey: string;
  type?: 'boolean' | 'count' | 'scalar';
  recapTemplate?: string;
  recapTemplatePlural?: string;
};

// Map each weekly-scoring season to its category definitions.
// Add a new entry here whenever a season introduces new/changed categories —
// past seasons keep pointing at their own frozen file and are never affected.
const CATEGORY_FILES: Record<number, () => Promise<{ default: ScoringCategory[] }>> = {
  50: () => import('@/app/scoring/values50.json') as any,
  51: () => import('@/app/scoring/values51.json') as any,
};

const DEFAULT_SEASON_FOR_CATEGORIES = 50;

export async function loadCategoriesForSeason(season: number): Promise<ScoringCategory[]> {
  const loader = CATEGORY_FILES[season] || CATEGORY_FILES[DEFAULT_SEASON_FOR_CATEGORIES];
  const mod = await loader();
  return (mod.default || mod) as ScoringCategory[];
}

export function inferTypeForKey(schemaKey: string): 'boolean' | 'count' {
  const booleanKeys = new Set(['soleSurvivor', 'top3', 'madeFire', 'madeMerge']);
  return booleanKeys.has(schemaKey) ? 'boolean' : 'count';
}