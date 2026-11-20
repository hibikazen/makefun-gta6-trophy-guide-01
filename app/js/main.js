// main.js — boots the guide: loads the data, wires the toolbar, the tabs,
// the checklist's delegated clicks, and export / import / reset.
//
// Views switch by hash (#checklist, #roadmap, #missables, #about), so any
// view can be linked to directly. The checklist re-renders from the saved
// state on every change; the search box and toolbar live outside the
// re-rendered list, so typing never loses focus.

import { loadTrophyData } from './data.js';
import {
  loadState,
  saveState,
  toggleEarned,
  setCounter,
  getCounter,
  downloadExport,
  importStateText,
  resetProgress,
} from './store.js';
import { applyFilters } from './filters.js';
import {
  renderProgress,
  renderKindChips,
  renderChecklist,
  renderRoadmap,
  renderMissables,
  renderAbout,
} from './views.js';

const VIEWS = ['checklist', 'roadmap', 'missables', 'about'];

let data = null;
let state = loadState();
let filters = { query: '', kind: 'all', grade: 'all', status: 'all' };
const openGuides = new Set();

function currentView() {
  const hash = window.location.hash.replace('#', '');
  return VIEWS.includes(hash) ? hash : 'checklist';
}

function showView(view) {
  for (const name of VIEWS) {
    document.getElementById('view-' + name).hidden = name !== view;
    document.getElementById('tab-' + name).classList.toggle('active', name === view);
  }
}

function renderAll() {
  renderProgress(data, state);
  renderKindChips(data, filters.kind);
  renderChecklist(data, state, applyFilters(data.trophies, state, filters), openGuides);
  renderRoadmap(data, state);
  renderMissables(data, state, openGuides);
  renderAbout(data);
}

function renderDynamic() {
  renderProgress(data, state);
  renderChecklist(data, state, applyFilters(data.trophies, state, filters), openGuides);
  renderRoadmap(data, state);
  renderMissables(data, state, openGuides);
}

function note(text, isError) {
  const el = document.getElementById('import-note');
  el.textContent = text;
  el.style.color = isError ? 'var(--danger)' : 'var(--good)';
}

/** One delegated click handler for every trophy card on the page. */
function onCardClick(event) {
  const target = event.target.closest('[data-action]');
  if (!target) return;
  const card = target.closest('[data-id]');
  if (!card) return;
  const id = Number(card.dataset.id);
  const action = target.dataset.action;

  if (action === 'toggle') {
    toggleEarned(state, id);
    renderDynamic();
  } else if (action === 'guide') {
    const guide = card.querySelector('.guide');
    const open = guide.hidden;
    guide.hidden = !open;
    target.textContent = open ? 'Hide guide' : 'Show guide';
    target.setAttribute('aria-expanded', String(open));
    if (open) openGuides.add(id);
    else openGuides.delete(id);
  } else if (action === 'counter-inc' || action === 'counter-dec') {
    const trophy = data.trophies.find((t) => t.id === id);
    const next = getCounter(state, id) + (action === 'counter-inc' ? 1 : -1);
    setCounter(state, id, Math.min(Math.max(0, next), trophy.count.target));
    renderDynamic();
  }
}

/** A counter's typed value, committed on change. */
function onCounterInput(event) {
  const input = event.target.closest('[data-action="counter-input"]');
  if (!input) return;
  const card = input.closest('[data-id]');
  if (!card) return;
  const id = Number(card.dataset.id);
  const trophy = data.trophies.find((t) => t.id === id);
  setCounter(state, id, Math.min(Math.max(0, Number(input.value) || 0), trophy.count.target));
  renderDynamic();
}

function wireToolbar() {
  document.getElementById('search').addEventListener('input', (event) => {
    filters.query = event.target.value;
    renderDynamic();
  });

  document.getElementById('kind-chips').addEventListener('click', (event) => {
    const chip = event.target.closest('[data-kind]');
    if (!chip) return;
    filters.kind = chip.dataset.kind;
    renderAll();
  });

  document.getElementById('grade-filter').addEventListener('change', (event) => {
    filters.grade = event.target.value;
    renderDynamic();
  });

  document.getElementById('status-filter').addEventListener('change', (event) => {
    filters.status = event.target.value;
    renderDynamic();
  });

  const spoiler = document.getElementById('spoiler');
  spoiler.checked = state.spoiler;
  spoiler.addEventListener('change', () => {
    state.spoiler = spoiler.checked;
    saveState(state);
    renderDynamic();
  });

  document.getElementById('export-btn').addEventListener('click', () => {
    downloadExport(state);
    note('Progress exported: ' + state.earned.length + ' earned trophies.');
  });

  document.getElementById('import-file').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    event.target.value = '';
    if (!file) return;
    const result = importStateText(await file.text());
    if (result.error) {
      note('Import failed: ' + result.error, true);
      return;
    }
    state = result.state;
    saveState(state);
    document.getElementById('spoiler').checked = state.spoiler;
    renderAll();
    note('Progress imported: ' + state.earned.length + ' earned trophies.');
  });

  document.getElementById('reset-btn').addEventListener('click', () => {
    if (window.confirm('Clear all earned trophies and counters? Export first if you want to keep them.')) {
      state = resetProgress(state);
      renderAll();
      note('Progress cleared.');
    }
  });
}

async function boot() {
  try {
    data = await loadTrophyData();
  } catch (error) {
    document.getElementById('trophy-list').innerHTML =
      '<div class="empty-state">Could not load the trophy list. ' + error.message + '</div>';
    return;
  }
  wireToolbar();
  document.querySelector('main').addEventListener('click', onCardClick);
  document.querySelector('main').addEventListener('change', onCounterInput);
  window.addEventListener('hashchange', () => showView(currentView()));
  showView(currentView());
  renderAll();
}

boot();
