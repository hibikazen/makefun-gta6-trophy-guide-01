# Leonida Platinum — GTA VI Trophy Guide & Tracker

[![make.fun bounty](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/hibikazen/makefun-gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/hibikazen/makefun-gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline web app that is the best guide and tracker for the 55 PlayStation 5
trophies of Grand Theft Auto VI — built for the
[make.fun GTA 6 trophy guide bounty](https://make.fun/bounty/gta6-trophy-guide-01).

## What it is

- **Every one of the 55 official trophies**, by exact name, with its official
  description and grade (1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden).
- **A checklist saved in the browser** (localStorage), with export to a file
  and import back — plus per-trophy counters for the counted goals (250
  stunts, 100 vehicles, 18 meditations…).
- **Filters by kind** (story, side strands, collectibles, activities, crime,
  miscellaneous, completion), by grade, by earned status, and by search —
  plus a one-click Missable filter.
- **A spoiler setting** that hides the 12 story trophies' names and
  descriptions until you earn them.
- **A roadmap to the platinum** in three steps (story, 100% checklist,
  cleanup), with per-step progress — and the missable trophies flagged.
- **A guide to each trophy in our own words, citing its sources**
  (PowerPyx, Exophase, PSNProfiles, Sixshore). Where no guide has confirmed
  a method, the guide says so instead of guessing.
- **Fully offline**: static files under `app/`, no build step, no network
  request at run time. No Rockstar logo or official artwork — the look is
  our own.

## Try it

```sh
node serve.ts
```

Then open <http://localhost:8080> in desktop Chrome. Any static file server
with `app/` at its root works the same way.

## Layout

- `app/index.html` — the guide's shell (header progress, tabs, toolbar)
- `app/css/style.css` — the whole look, CSS alone
- `app/js/main.js` — boot, routing, event wiring, export/import
- `app/js/data.js` — loads `data/trophies.json`, kind/grade helpers
- `app/js/store.js` — localStorage progress, counters, export/import
- `app/js/filters.js` — checklist filters and the spoiler rule
- `app/js/views.js` — renders checklist, roadmap, missables, about
- `app/data/trophies.json` — the 55 trophies with their guides and sources
- `screenshots/` — renders of the app's own code
- `main.ts` — hands the guide in: copies `app/` and `screenshots/` to
  `/output` and writes `dossier.json` with the kit's `buildDossier`

## Sources

Names, descriptions and grades are the official list as PlayStation
publishes it, as listed by
[Exophase](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/)
and [PSNProfiles](https://psnprofiles.com/trophies/43531-grand-theft-auto-vi)
(the two agree on every name, description and grade). Methods come from
[PowerPyx's GTA 6 Trophy Guide & Roadmap](https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/),
PowerPyx's
[100% Completion Checklist](https://www.powerpyx.com/gta-6-100-completion-checklist-guide/)
and
[Sixshore's trophy list](https://sixshore.com/gta-6/guides/trophies-and-achievements/),
paraphrased in our own words and cited beside each guide.

## License

MIT — see [LICENSE](LICENSE). An unofficial fan guide; Grand Theft Auto,
GTA and Rockstar Games are trademarks of their owners.
