# Curriculum dashboard: testing record (15 Nov 2026, build v191)

Suite: `node tools/profe-tests/sCR.js` (headless Chromium against the real app). Result: **12/12 passed**.

| Test | What it proves |
|---|---|
| Admin gate | Settings shows the Admin row. `#cobertura` stays locked for learners. A wrong passcode is refused and the right one unlocks the dashboard, recording who signed in. |
| All nine views draw | Overview, Heatmap, Traceability, Exercise mix, Gaps, DELE alignment, Scorecard, Remediation and Reports all render. |
| Figures derived from records | Topic count = lessons + guides. The B1 "taught %" shown on screen matches a recount from the evidence. Evidence links point at real pages. Every practice item in the lessons is in the inventory. |
| Outdated source | All 12 C2 task rows are flagged superseded (2014 guide replaced by the 2024 exam). |
| Partially covered outcomes | Partial outcomes are reported per dimension (taught, practised, assessed). |
| Missing mapping | An injected outcome with no matching content comes out *missing* and produces a high-severity "not taught" gap. |
| Invalid exercise + new lesson | An injected lesson with a bad answer key produces a **critical** finding and caps the A1 and overall scores at 59. The lesson is flagged as needing its own skills mapping. Removing it clears both findings. |
| Remediation | An issue marked *fixed* that is still detected is reopened on revalidation; one that is gone is verified. Approval is offered only after verification, and every step is in the audit log. |
| Outcome validation | An admin marks an outcome validated; the name and time are kept. |
| Exports | The .xlsx is a valid zip with 10 sheets. The register has one row per outcome (sheet and CSV). The evidence pack separates verified findings, internal estimates and unvalidated claims, and disclaims accreditation. |
| Learner data untouched | Only `ruta-curric-admin` changes. |
| No page errors | No uncaught errors during the run. |

Regression suites run on the same build:
- sQ 6/6
- sK 15/15
- sP 27/27
- sX 15/15
- sH 70/70
- `node tools/profe_check.js` OK

Engine timing in headless Chromium: about 1.1 s for about 4,400 content records. The result is cached until "Revalidate now".
