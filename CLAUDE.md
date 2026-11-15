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
