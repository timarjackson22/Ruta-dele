# DELE Curriculum Coverage Dashboard: metrics, validation rules and implementation

Admin page: **Settings › Admin › Curriculum coverage** (route `#cobertura`, tabs `#cobertura/<tab>`).
Requested 15 Nov 2026. Built on the app's existing stack: one embedded block, no server, no paid service (costs: no impact).

## Files

| File | What it is |
|---|---|
| `tools/curric/build_register.py` | Builds `register.json`: sources, 12 competencies, 245 outcomes, 82 DELE task families, the Master Topic-to-Skills Mapping, effort minutes, QA weights and thresholds. Validates itself: unique IDs, known sources and levels, prerequisites exist, regexes compile. |
| `tools/curric/topics.json` | The lessons and guides that have a skills mapping. A new lesson or guide that isn't listed is flagged "needs its own skills mapping" and is never counted as fully aligned. |
| `tools/curric/curric.js` | The engine and the views. It is embedded in `index.html` between `/* ==CURRIC== */` markers. |
| `tools/curric/curric.css` | Styles, between the `/* ==CURRIC-CSS== */` markers. |
| `tools/curric/admin.json` | SHA-256 of `"ruta-dele:" + passcode`. To change it, run `python3 tools/curric/patch_curric.py index.html --passcode NEW`. |
| `tools/curric/patch_curric.py` | Rebuilds the register and embeds data, code and CSS. It also wires the route and the Settings row. It can be re-run. |
| `tools/profe-tests/sCR.js` | The test suite (see TESTING.md). |

## Data model

- **Content records** are built live from what the app actually ships:
  - lessons (vocabulary, grammar blocks, intro, pitfalls, pronunciation notes and every practice item)
  - guides (sections and practice items)
  - exam guidance per level
  - listening and reading texts
  - videos
  - role-plays
  - speaking tasks
  - writing tasks
  - vocabulary decks
  - every mock-exam task and item, taken from `examdata/*.json`

  Each record has a role (teach, practice or assess), a level, a topic, the competencies it exercises with a share for each, an effort in minutes, and validation errors.
- **Outcomes** are stored in `register.json`. Each one has a source, level, section or page, competency, weight (1–3), mastery criteria, prerequisites, validation status and last review date. Admin validations are layered on top and kept per device.

## Coverage, per outcome

Each dimension is evaluated separately.

| Dimension | Skill outcomes (CEFR CV) and DELE tasks | Grammar points, functions, themes (PCIC) |
|---|---|---|
| **Taught** | A teaching record at the outcome's level exercises the competency. For DELE tasks this is exam guidance for that level. | A lesson grammar block, lesson intro or guide section at or below the level matches the outcome in its heading (title, rule, labels), with 2 or more examples. |
| **Practised** | 3 or more practice activities at the level, or 5 or more items for grammar or vocabulary. Competency share must be at least 0.3, or at least 0.1 for the cross-competencies (pragmatic, discourse, mediation). For mediation, only writing or speaking tasks that ask for a summary or synthesis count. | 5 or more items for grammar, or 1 or more activity of a fitting type, at or below the level. An item counts if it matches the outcome itself or sits in a section that teaches it (assignment as in the inline checks). |
| **Assessed** | A mock-exam task at the level targets the competency. Language criteria (grammar, vocabulary, pragmatic, discourse from B1) count through the writing and speaking tasks that are graded against points. Pronunciation counts only if speech is scored for pronunciation, so today it is never assessed. Mediation is *not applicable* below C1. | **Direct:** a grammar or vocabulary cloze item at or above the level matches the outcome (its forms are checked in the answer key). **Indirect:** the point is taught and the level's writing and speaking tasks score grammatical accuracy, which is how the DELE itself does it at A1–A2. Indirect assessment is labelled as such everywhere. |

A dimension of an outcome counts as **covered** only when it meets these criteria. **Coverage %** = verified covered outcomes ÷ applicable mapped outcomes × 100, reported separately for taught, practised and assessed, plus the share that meets all three. An outcome's status is one of:
- **full**: every applicable dimension is met
- **partial**: some dimensions are met
- **missing**: none are met

Coverage is **not learner mastery**.

## Heatmap

Each cell is one competency at one level. Its value is the mean, over the outcomes in the cell, of (dimensions met ÷ applicable dimensions). The cell's state is:
- **Full**: every outcome in the cell is full
- **Missing**: every outcome is missing
- **Partial**: anything in between
- **n/a**: the cell has no outcomes

The cell is hatched when any of its outcomes is pending validation or needs reassessment.

## Exercise mix (Master Topic-to-Skills Mapping)

- **Actual share** for a competency = Σ(effort minutes × competency share) for the topic's practice activities, divided by the topic's total minutes.
- **Effort minutes per activity:**

  | Activity | Minutes |
  |---|---|
  | Multiple choice | 0.4 |
  | Gap fill | 0.6 |
  | Correction | 0.8 |
  | Translation | 1.2 |
  | Deck | 3 |
  | Listening | 5 |
  | Reading | 6 |
  | Video | 4 |
  | Role-play | 6 |
  | Speaking task | 4 |
  | Writing task | 20 |

  Weighting by minutes means a multiple-choice item never counts as much as a speaking or writing task.
- A deviation from the target of ±15 points or more is flagged.
- Level targets follow the DELE's four equally weighted papers. From C1 they add mediation.
- **Topic targets are internal design choices, not official weights.**

## Gap rules

Each finding has a rule, a severity and an action.

| Rule | Condition | Severity |
|---|---|---|
| not-taught | Taught = no | Outcome weight 3 → high, 2 → medium, 1 → low |
| not-practised | Taught but under the practice threshold | Weight 3 → medium, otherwise low |
| not-assessed | Practised but no assessment evidence | DELE task → high, otherwise low |
| prereq | Taught, but a prerequisite is not taught | High |
| weak-reinforcement | A grammar point appears in only one topic | Low |
| late | Taught only at a level above its PCIC level | Medium |
| no-productive | A topic has no translation, writing or speaking (grouped) | Medium |
| mc-heavy | Multiple choice is more than 50% of a topic's time (grouped) | Medium |
| pron-no-audio | A topic has a pronunciation target but no listening or speaking activity (grouped) | Low (high for the pronunciation guide) |
| no-interaction | Speaking tasks but fewer than 3 role-plays at a level | Medium |
| no-writing | Fewer than 3 writing tasks at a level | Medium |
| progression | A competency's practice minutes drop by more than 30% from one level to the next (from at least 30 minutes) | Medium |
| imbalance | A topic deviates from its mapping by 15+ points (grouped per competency) | Medium if 30+ points, otherwise low |
| unmapped-topic | A topic is not in `topics.json` | Medium |
| invalid-key | Answer key out of range, no answer, or a "correction" equal to the mistake | **Critical** |
| invalid-item | Duplicate options, a writing task with no word range or points, or an oral task with nothing to grade against | Medium |
| exam-structure | A mock task differs from the official task (missing task, item count, word range, speaking time, ungradeable) | High if no matching task, otherwise medium |
| exam-time / exam-extra / exam-prep | Paper timing, an extra task, or oral preparation time differs from the official guide | Medium / medium / low |
| source-superseded | A newer official version replaced the source (C2 2014 → 2024) | High |
| source-unchecked / source-overdue | Never checked line by line / past its review interval | Medium |

Findings are sorted by severity, then by outcome weight (instructional importance).

## DELE assessment alignment

Official task families were taken from the guides opened on 15 Nov 2026:
- A1 and A2: v2020
- B1 and B2: guides
- C1: 2024 specification table
- C2: 2014 guide, flagged as superseded

For each task, the dashboard checks whether a mock task with the same paper and number exists, and compares:
- item count
- word range (with a tolerance of ±1)
- speaking time
- whether the task has points to grade against
- paper timing and oral preparation time

The page keeps three things apart:
- curriculum alignment
- assessment alignment
- learner readiness

Learner readiness is shown only for the device in use and is labelled an internal estimate, not a DELE score.

## Quality scorecard (0–100 per dimension; the weights sum to 100)

| Dimension (weight) | Formula |
|---|---|
| Official curriculum alignment (12) | Official DELE tasks matched by a mock task (aligned = 1, partly = ½) ÷ tasks |
| Learning outcome coverage (14) | Outcomes fully covered, weighted by outcome weight |
| Exercise variety (6) | Distinct activity types ÷ 7 (topic) or ÷ 10 (level or whole course) |
| Receptive/productive balance (8) | 100 − 2 × \|productive share of practice time − 50\| |
| CEFR difficulty, proxy (6) | Share of prompts whose mean sentence length is inside the level band (A1 0–10 … C2 10–34 words) |
| Linguistic accuracy, automated (12) | Share of texts with no unmatched ¿/? or ¡/! and no doubled words. **Not a human review.** |
| Pronunciation and listening support (6) | Listening practice + pronunciation teaching + speaking practice (⅓ each) |
| Assessment validity (12) | Share of items with a valid key and structure, minus up to 40 for mock tasks that differ from the official format |
| Corrective feedback (8) | Share of items with an explanation of 20+ characters |
| Skills progression (6) | Share of competencies whose practice does not drop by more than 30% from one level to the next |
| Retention and reinforcement (5) | Share of taught outcomes met in 2 or more places (another topic or the exams) |
| Technical reliability (5) | Share of records that pass validation |

**Total** = the weighted mean of the dimensions that can be measured. **Any critical finding in scope caps the total at 59.** Every dimension under 50 is listed next to the total, so an average cannot hide a deficiency. Scores are given for each lesson or guide (the chapter), each level and the whole curriculum.

## Remediation and audit

**Issue states:**
1. Marked for review
2. In progress
3. Fixed – awaiting revalidation
4. On revalidation, the issue is **verified** if the finding has gone, or **reopened** if it is still detected
5. Approved and closed (only allowed from verified)

Won't fix is also available.

**Actions:**
- "Draft fix brief" and "Request Profe enhancement" only produce text. Nothing is generated or published automatically. Content changes go through the source files, a new build, then revalidation.
- Outcome validation (validated or needs update) records who did it and when.

**Audit log:**
- Every action is logged with time, name, action and target.
- The log can be exported and imported as JSON, so several administrators' devices can be merged.
- It is stored in `localStorage["ruta-curric-admin"]`, the only key the dashboard writes. Learner data is never touched.

## Access

The app has no server, so admin access is a passcode checked on the device (SHA-256 in the build). It keeps the tool out of learners' way. **It is not a security boundary.** Everything the dashboard shows is derived from content that is already public in the app.

## Exports

- **.xlsx** with 10 sheets: Overview, Register, Heatmap, Exercise mix, Gaps, DELE alignment, Scorecard, Remediation, Sources, Method. The workbook is written in the browser; no library is used.
- **CSV** of the register or the gaps.
- **Audit log** (JSON).
- **Curriculum Alignment Evidence Pack**: a printable page; use the browser's "Save as PDF". It separates verified findings, internal estimates and unvalidated claims, and states that alignment is not accreditation or endorsement by the Instituto Cervantes.

## Known limits

- **PCIC rows are pending.** The PCIC site could not be opened from the build environment, so every PCIC row is "pending validation" until a reviewer checks it against the inventories.
- **Outcome wording is paraphrased.** CEFR descriptor texts are the app's own paraphrases. The scale names and page numbers were checked against the Companion Volume's contents.
- **Matching is by keyword.** Grammar, function and theme outcomes are matched to content by keyword patterns on headings. The evidence lists under each outcome are there for a reviewer to confirm or reject the match.
- **C2 needs re-mapping.** C2 task families come from the 2014 guide. The 2024 guide must be added and the C2 rows re-mapped.
