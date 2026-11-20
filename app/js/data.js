// data.js — loads the trophy list and names its kinds and grades.
//
// The list lives in data/trophies.json: the 55 official trophies with their
// names, descriptions and grades as PlayStation publishes them, plus this
// guide's own words, kinds, roadmap stages and cited sources. The app fetches
// that one file from its own folder and nothing else, so it works offline.

export const KIND_LABELS = {
  story: 'Story',
  side: 'Side strands',
  collectibles: 'Collectibles',
  activities: 'Activities',
  crime: 'Crime',
  misc: 'Miscellaneous',
  completion: 'Completion',
};

export const GRADE_LABELS = {
  platinum: 'Platinum',
  gold: 'Gold',
  silver: 'Silver',
  bronze: 'Bronze',
};

export const GRADE_ORDER = ['platinum', 'gold', 'silver', 'bronze'];

export const KIND_ORDER = ['story', 'side', 'collectibles', 'activities', 'crime', 'misc', 'completion'];

/** Fetch the trophy data file. Throws when it cannot be read. */
export async function loadTrophyData() {
  const response = await fetch('data/trophies.json');
  if (!response.ok) throw new Error('Could not load data/trophies.json (HTTP ' + response.status + '). Serve app/ with a static file server and open index.html over http://, not file://.');
  return response.json();
}

/** A trophy's PSN target as short text, e.g. "250 stunts" or "18 spots". */
export function countText(trophy) {
  if (!trophy.count) return null;
  const target = trophy.count.target.toLocaleString('en-US');
  return target + ' ' + trophy.count.label;
}

/** True when the trophy belongs to the story (chapter or mission). */
export function isStoryTrophy(trophy) {
  return trophy.kind === 'story';
}
