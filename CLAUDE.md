# Ruta DELE: rules for every update

## Service gaps & costs dashboard (Settings → Service gaps & costs, route #costes)
Every change must be checked against `tools/costs/gaps.json`:
- Does it add, remove or change a dependency on an outside service (AI, speech, translation, hosting, analytics, accounts)?
- Does it change usage per user (more AI calls, longer audio, bigger downloads)?
- Does it close or open a gap (something now done well for free, or newly needing a paid tier)?
If yes: edit `tools/costs/gaps.json` (gap, tiers, prices with source URL, impact 0–10 on the five metrics, usage assumptions),
then run `python3 tools/sync_profe.py index.html /tmp/pvoice.orig.js` (it re-runs `tools/costs/model.py` and embeds the new numbers).
If no: say so in the commit message ("costs: no impact").

## Voice (Profe)
- `tools/pvoice.js` is embedded in index.html; edit it there, then sync as above and `cp tools/pvoice.js /tmp/pvoice.orig.js`.
- `node tools/profe_check.js` must pass (every route and data-act button has a voice status; no duplicate top-level names).
- Suggested phrases in page intros (PV_PAGES) must really work: `node tools/profe-tests/sP.js`.

## Exams
- Exam data is generated: `python3 tools/exgen/gen.py <level>` from `tools/exgen/<level>_part*.py`. Update `EXREADY` and `sw.js` when adding exams.

## Curriculum coverage dashboard (Settings › Admin, route #cobertura)
- Register: `tools/curric/build_register.py` (sources, outcomes, DELE tasks, skills mapping); embed with `python3 tools/curric/patch_curric.py index.html`.
- New lesson or guide: add its id to `tools/curric/topics.json` (and targets if not the default) or it is flagged "needs its own skills mapping".
- Exam format changes: update the DELE task rows/sources in build_register.py. `node tools/profe-tests/sCR.js` must pass. Method: tools/curric/METRICS.md.

## Skill drills (Check yourself cards, #ejercicios)
- `tools/skilldrills.js` (+ .css) embedded by `python3 tools/patch_skill.py index.html`; generated from lesson/guide content, so new content gets drills automatically.
- `node tools/profe-tests/sSK.js` must pass (every drill type renders and grades; difficulty by level).

## Versions
- Never edit `window.__BUILD`, `var BUILD` or `version.json` by hand: `tools/sync_profe.py` stamps all three with one value.
  If version.json is newer than the page's stamp, the update check reloads for ever ("Updating to the latest version…").
- Bump the `sw.js` cache name (ruta-dele-vNNN) with each release.
