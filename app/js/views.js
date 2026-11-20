// views.js — renders the header progress, the checklist, the roadmap, the
// missables page and the about page from the trophy data and saved state.
//
// All data-derived text is escaped before it reaches the page. Views render
// HTML strings; main.js owns the event listeners (delegation on the list).

import { KIND_LABELS, GRADE_LABELS, GRADE_ORDER, KIND_ORDER, countText } from './data.js';
import { isEarned, getCounter } from './store.js';
import { spoilerHides, earnedByGrade, totalByGrade } from './filters.js';

/** Things that look missable but are not, per PowerPyx's roadmap. */
export const FALSE_ALARMS = [
  { title: 'Kenton goes quiet after Chapter 1', text: 'He returns in Chapters 2–3 while you play as Jason, and every trophy quest giver is still around after the story.' },
  { title: 'Kingpin Bowling can be left half-robbed', text: 'The robbery respawns later, so the 3 key valuables for Let’s Go Bowling can be collected across visits.' },
  { title: 'Some fences leave for good', text: 'None of them has a trophy quest, and new fences unlock as the story goes on.' },
  { title: 'A few magazines sit in story buildings that close', text: 'They also spawn elsewhere, and no trophy needs every magazine.' },
  { title: 'Hourglass quests can fail on a timer', text: 'None of them is tied to a trophy or to 100% completion.' },
  { title: 'The Jason–Lucia relationship', text: 'It does not matter for any trophy.' },
];

export function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function medal(trophy) {
  const letter = trophy.grade[0].toUpperCase();
  return '<span class="medal medal-' + trophy.grade + '" title="' + GRADE_LABELS[trophy.grade] + '">' + letter + '</span>';
}

function sourceLinks(trophy, sources) {
  const links = (trophy.sources || []).map((key) => {
    const source = sources[key];
    if (!source) return escapeHtml(key);
    return '<a href="' + escapeHtml(source.url) + '" target="_blank" rel="noopener">' + escapeHtml(source.name) + '</a>';
  });
  return links.join(' &middot; ');
}

/** One trophy's card in the checklist. */
export function trophyCard(data, state, trophy, guideOpen) {
  const hidden = spoilerHides(trophy, state);
  const earned = isEarned(state, trophy.id);
  const counter = getCounter(state, trophy.id);
  const target = countText(trophy);
  const classes = ['trophy'];
  if (earned) classes.push('earned');
  if (trophy.missable) classes.push('missable-flag');

  let head = medal(trophy);
  if (hidden) {
    head += '<h3 class="trophy-name"><span class="hidden-name">Hidden story trophy</span></h3>';
  } else {
    head += '<h3 class="trophy-name">' + escapeHtml(trophy.name) + '</h3>';
  }
  head += '<span class="badge badge-kind">' + escapeHtml(KIND_LABELS[trophy.kind]) + '</span>';
  if (trophy.hidden) head += '<span class="badge badge-hidden">Hidden on PSN</span>';
  if (trophy.missable) head += '<span class="badge badge-missable">Possibly missable</span>';
  if (target) {
    const label = counter > 0 ? counter.toLocaleString('en-US') + ' / ' + target : target;
    head += '<span class="badge badge-count">' + escapeHtml(label) + '</span>';
  }

  let body = '';
  if (hidden) {
    body += '<p class="trophy-desc">Its name and description stay hidden while the spoiler setting is on. Earn it to reveal them.</p>';
  } else {
    body += '<p class="trophy-desc">' + escapeHtml(trophy.description) + '</p>';
    if (trophy.when) body += '<p class="trophy-when">When: ' + escapeHtml(trophy.when) + '</p>';
  }

  if (!hidden) {
    body += '<button type="button" class="guide-toggle" data-action="guide" aria-expanded="' + (guideOpen ? 'true' : 'false') + '">'
      + (guideOpen ? 'Hide guide' : 'Show guide') + '</button>';
    body += '<div class="guide"' + (guideOpen ? '' : ' hidden') + '>'
      + '<p class="guide-label">Guide</p>'
      + '<p>' + escapeHtml(trophy.guide) + '</p>'
      + '<p class="sources">Sources: ' + sourceLinks(trophy, data.sources) + '</p>';
    if (trophy.count) {
      body += '<div class="counter"><span>Your progress:</span>'
        + '<button type="button" data-action="counter-dec" aria-label="One less">−</button>'
        + '<input type="number" min="0" max="' + trophy.count.target + '" value="' + counter + '" data-action="counter-input" aria-label="' + escapeHtml(trophy.count.label) + ' done">'
        + '<button type="button" data-action="counter-inc" aria-label="One more">+</button>'
        + '<span class="counter-total">of ' + trophy.count.target.toLocaleString('en-US') + ' ' + escapeHtml(trophy.count.label) + '</span></div>';
    }
    body += '</div>';
  }

  return '<article class="' + classes.join(' ') + '" data-id="' + trophy.id + '">'
    + '<div class="trophy-check"><input type="checkbox" data-action="toggle" aria-label="Mark '
    + (hidden ? 'this hidden story trophy' : escapeHtml(trophy.name)) + ' as earned"' + (earned ? ' checked' : '') + '></div>'
    + '<div class="trophy-body"><div class="trophy-head">' + head + '</div>' + body + '</div></article>';
}

/** The header's earned count, bar and grade chips. */
export function renderProgress(data, state) {
  const earned = state.earned.length;
  const total = data.trophies.length;
  const pct = Math.round((earned / total) * 100);
  document.getElementById('earned-count').textContent = earned;
  document.getElementById('earned-pct').textContent = pct + '%';
  const fill = document.getElementById('progress-fill');
  fill.style.width = pct + '%';
  const bar = document.getElementById('progress-bar');
  bar.setAttribute('aria-valuenow', String(earned));
  bar.setAttribute('aria-valuemax', String(total));
  const byGrade = earnedByGrade(data.trophies, state);
  const totals = totalByGrade(data.trophies);
  document.getElementById('grade-chips').innerHTML = GRADE_ORDER.map((grade) =>
    '<span class="grade-chip"><span class="medal medal-' + grade + '">' + grade[0].toUpperCase() + '</span>'
    + GRADE_LABELS[grade] + ' ' + byGrade[grade] + '/' + totals[grade] + '</span>',
  ).join('');
}

/** The kind filter chips, with counts. */
export function renderKindChips(data, activeKind) {
  const counts = { all: data.trophies.length, missable: data.trophies.filter((t) => t.missable).length };
  for (const kind of KIND_ORDER) counts[kind] = data.trophies.filter((t) => t.kind === kind).length;
  const chips = [{ key: 'all', label: 'All' }]
    .concat(KIND_ORDER.map((kind) => ({ key: kind, label: KIND_LABELS[kind] })))
    .concat([{ key: 'missable', label: 'Missable' }]);
  document.getElementById('kind-chips').innerHTML = chips.map((chip) =>
    '<button type="button" class="chip' + (chip.key === activeKind ? ' active' : '') + '" data-kind="' + chip.key + '">'
    + escapeHtml(chip.label) + ' <span class="count">' + counts[chip.key] + '</span></button>',
  ).join('');
}

/** The filtered checklist, plus the "showing N of 55" note. */
export function renderChecklist(data, state, filtered, openGuides) {
  const list = document.getElementById('trophy-list');
  if (filtered.length === 0) {
    list.innerHTML = '<div class="empty-state">No trophies match these filters. Clear the search or pick another kind.</div>';
  } else {
    list.innerHTML = filtered.map((trophy) => trophyCard(data, state, trophy, openGuides.has(trophy.id))).join('');
  }
  const earned = state.earned.length;
  document.getElementById('list-note').textContent =
    'Showing ' + filtered.length + ' of ' + data.trophies.length + ' trophies · ' + earned + ' earned';
}

/** The three roadmap steps, each with its trophies and progress. */
export function renderRoadmap(data, state) {
  document.getElementById('roadmap-summary').textContent =
    'One playthrough, about 200 hours, difficulty 4 out of 10 (PowerPyx). ' + state.earned.length + ' of '
    + data.trophies.length + ' trophies earned so far. The steps follow PowerPyx’s roadmap; the trophy lists under each step come from the official descriptions.';
  document.getElementById('roadmap-steps').innerHTML = data.roadmap.map((step) => {
    const trophies = data.trophies.filter((t) => t.stage === step.step);
    const done = trophies.filter((t) => isEarned(state, t.id)).length;
    const items = trophies.map((t) => {
      const earned = isEarned(state, t.id);
      const name = spoilerHides(t, state) ? 'Hidden story trophy' : t.name;
      return '<li class="' + (earned ? 'done' : '') + '"><span class="mark">' + (earned ? '✓' : '○') + '</span>' + escapeHtml(name) + '</li>';
    }).join('');
    return '<div class="step-card"><h3>Step ' + step.step + ': ' + escapeHtml(step.title)
      + ' <span class="step-hours">· ' + escapeHtml(step.hours) + '</span></h3>'
      + '<p class="step-text">' + escapeHtml(step.text) + '</p>'
      + '<p class="step-progress">' + done + ' of ' + trophies.length + ' trophies in this step earned</p>'
      + '<ul class="step-trophies">' + items + '</ul></div>';
  }).join('');
}

/** The missables page: the one flagged trophy, open, plus the false alarms. */
export function renderMissables(data, state, openGuides) {
  const flagged = data.trophies.filter((t) => t.missable);
  document.getElementById('missable-list').innerHTML = '<div class="trophy-list">'
    + flagged.map((t) => trophyCard(data, state, t, openGuides.has(t.id) || true)).join('') + '</div>';
  document.getElementById('false-alarms-list').innerHTML = FALSE_ALARMS.map((item) =>
    '<li><strong>' + escapeHtml(item.title) + '.</strong> ' + escapeHtml(item.text) + '</li>',
  ).join('');
}

/** The about page's facts, sources and verification note. */
export function renderAbout(data) {
  const facts = data.facts;
  const rows = [
    ['Trophies', facts.total + ' (1 platinum, 2 gold, 6 silver, 46 bronze)'],
    ['Hidden until earned', String(facts.hidden)],
    ['Online trophies', String(facts.online)],
    ['Difficulty', facts.difficulty],
    ['Time to platinum', facts.time],
    ['Playthroughs', String(facts.playthroughs)],
    ['Missable', facts.missable],
    ['Cheats', facts.cheats],
    ['Saves', facts.saves],
  ];
  document.getElementById('facts-list').innerHTML = rows.map(([term, value]) =>
    '<div><dt>' + escapeHtml(term) + '</dt><dd>' + escapeHtml(value) + '</dd></div>',
  ).join('');
  document.getElementById('sources-list').innerHTML = Object.values(data.sources).map((source) =>
    '<li><a href="' + escapeHtml(source.url) + '" target="_blank" rel="noopener">' + escapeHtml(source.name) + '</a></li>',
  ).join('');
  document.getElementById('verify-note').textContent = data.verified || '';
}
