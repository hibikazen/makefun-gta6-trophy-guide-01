// store.js — saved progress: earned trophies, per-trophy counters and the
// spoiler setting, kept in localStorage, with export and import.
//
// One key holds everything, so an export is one small JSON file and an import
// is one file read. Imported data is validated before it replaces anything.

export const STORAGE_KEY = 'leonida-platinum-v1';
export const EXPORT_APP = 'leonida-platinum';

function blankState() {
  return { earned: [], counters: {}, spoiler: true };
}

function normaliseState(raw) {
  const state = blankState();
  if (!raw || typeof raw !== 'object') return state;
  if (Array.isArray(raw.earned)) {
    state.earned = [...new Set(raw.earned.filter((id) => Number.isInteger(id) && id >= 1 && id <= 55))];
  }
  if (raw.counters && typeof raw.counters === 'object') {
    for (const [key, value] of Object.entries(raw.counters)) {
      const id = Number(key);
      if (Number.isInteger(id) && id >= 1 && id <= 55 && Number.isFinite(value) && value >= 0) {
        state.counters[id] = Math.floor(value);
      }
    }
  }
  if (typeof raw.spoiler === 'boolean') state.spoiler = raw.spoiler;
  return state;
}

/** Read the saved state, or a blank one when nothing is stored yet. */
export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return blankState();
    return normaliseState(JSON.parse(raw));
  } catch {
    return blankState();
  }
}

/** Write the state back to localStorage. */
export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normaliseState(state)));
}

/** True when the trophy id is in the earned set. */
export function isEarned(state, id) {
  return state.earned.includes(id);
}

/** Toggle one trophy's earned flag and save. */
export function toggleEarned(state, id) {
  const at = state.earned.indexOf(id);
  if (at === -1) state.earned.push(id);
  else state.earned.splice(at, 1);
  saveState(state);
  return state;
}

/** Set a trophy's counter (clamped at 0) and save. */
export function setCounter(state, id, value) {
  const clamped = Math.max(0, Math.floor(Number(value) || 0));
  if (clamped === 0) delete state.counters[id];
  else state.counters[id] = clamped;
  saveState(state);
  return state;
}

/** Read one trophy's counter, defaulting to 0. */
export function getCounter(state, id) {
  return state.counters[id] || 0;
}

/** Serialise the state for export, with app and version markers. */
export function exportState(state) {
  return JSON.stringify(
    { app: EXPORT_APP, version: 1, exportedAt: new Date().toISOString(), ...normaliseState(state) },
    null,
    2,
  );
}

/**
 * Parse and validate an imported file's text. Returns { state } on success
 * or { error } naming the problem; nothing is saved on failure.
 */
export function importStateText(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { error: 'That file is not valid JSON.' };
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { error: 'That file does not hold a progress export.' };
  }
  if (parsed.app && parsed.app !== EXPORT_APP) {
    return { error: 'That file is an export from another app (' + parsed.app + ').' };
  }
  if (!Array.isArray(parsed.earned)) {
    return { error: 'That file holds no earned list to import.' };
  }
  return { state: normaliseState(parsed) };
}

/** Download the current state as a JSON file. */
export function downloadExport(state) {
  const blob = new Blob([exportState(state)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'leonida-platinum-progress.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/** Clear all saved progress and counters, keeping the spoiler setting. */
export function resetProgress(state) {
  const kept = { earned: [], counters: {}, spoiler: state.spoiler };
  saveState(kept);
  return kept;
}
