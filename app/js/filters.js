// filters.js — the checklist's filters and the spoiler rule.
//
// The spoiler setting hides the story trophies' names, descriptions and
// guides until they are earned. Hidden side trophies keep their names —
// only the story ones give the plot away — and carry a "Hidden" badge.

import { isEarned } from './store.js';
import { isStoryTrophy } from './data.js';

/** True when the spoiler setting hides this trophy's details right now. */
export function spoilerHides(trophy, state) {
  return state.spoiler && isStoryTrophy(trophy) && !isEarned(state, trophy.id);
}

/**
 * Filter the trophy list by the toolbar's state.
 * filters: { query, kind, grade, status } where kind may be "missable" too.
 */
export function applyFilters(trophies, state, filters) {
  const query = (filters.query || '').trim().toLowerCase();
  return trophies.filter((trophy) => {
    if (filters.kind !== 'all') {
      if (filters.kind === 'missable') {
        if (!trophy.missable) return false;
      } else if (trophy.kind !== filters.kind) {
        return false;
      }
    }
    if (filters.grade !== 'all' && trophy.grade !== filters.grade) return false;
    if (filters.status === 'earned' && !isEarned(state, trophy.id)) return false;
    if (filters.status === 'unearned' && isEarned(state, trophy.id)) return false;
    if (query) {
      const haystack = (trophy.name + ' ' + trophy.description + ' ' + trophy.guide + ' ' + (trophy.when || '')).toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

/** Count earned trophies per grade, for the header chips. */
export function earnedByGrade(trophies, state) {
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const trophy of trophies) {
    if (isEarned(state, trophy.id)) counts[trophy.grade] += 1;
  }
  return counts;
}

/** Count trophies per grade overall. */
export function totalByGrade(trophies) {
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const trophy of trophies) counts[trophy.grade] += 1;
  return counts;
}
