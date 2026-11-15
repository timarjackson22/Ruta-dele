# Study plan: how time is estimated and scheduled

Written 15 November 2026 for the Study Plan (`tools/plan.js`, route `#plan`). The engine is the `PL_RUBRIC` constant in that file, and every number below can be changed there.

## Sources (checked 15 November 2026)

| What | Figure | Kind of hours | Source |
|---|---|---|---|
| Hours to reach each CEFR level, counted from beginner | A1 90–100 · A2 180–200 · B1 350–400 · B2 500–600 · C1 700–800 · C2 1,000–1,200 | Cumulative, **guided** (with a teacher) | Cambridge English, "Guided learning hours": https://support.cambridgeenglish.org/hc/en-gb/articles/202838506 |
| Hours for each level on its own | A1 95 · A2 95 · B1 180 · B2 180 · C1 200 · C2 250 | Additional (non-cumulative), guided | LanguageCert, "Guided Learning Hours": https://www.languagecert.org/Guided-Learning-Hours |
| Spanish for English speakers | Category I: 600–750 class hours (24–30 weeks) to professional working proficiency | Intensive classroom hours | US Foreign Service Institute, foreign language training: https://www.state.gov/foreign-language-training/ |

### Limitations

- These figures describe English (Cambridge) or general CEFR courses (LanguageCert). Only the FSI figure is about Spanish, and it measures FSI's own proficiency scale, not CEFR levels.
- All three count **guided** hours. Independent study, previous knowledge and everyday exposure can change the real number a great deal.
- They are guidelines from the publishers, not research-based predictions for one person. The app never presents them as a guarantee.

## What the engine does with them

1. **Development vs exam preparation.** The guided-hours table is shown as context only: "about N guided hours from your level to the target". It uses the midpoints in `PL_RUBRIC.glh`. Exam preparation is counted separately in `PL_RUBRIC.examPrepH`: A1 8 h, A2 12 h, B1 20 h, B2 28 h, C1 36 h, C2 44 h. These are the app's own working assumptions, not published figures. They grow with paper length (`PL_MINS`) and with the number of tasks.
2. **The plan is built from what is actually left in the app**, not from the published hours:
   - units up to the target level (30 min each by default);
   - guides with no practice score (25 min each);
   - timed paper sections from exam papers not kept back as mocks;
   - full mocks on unseen papers.
   
   Once the learner has finished sessions, their own measured durations (`plObservedDur`) replace the defaults.
3. **Available time vs commitment.** The learner gives free-time windows and, separately, how many minutes of that time to schedule. The engine never schedules more than the chosen minutes. It never places a session outside a window, and it always leaves the chosen break between sessions.
4. **Allocation and stage.** Each day is filled from six categories, with a mix that moves from early in the plan to late:

   | Category | Early | Late |
   |---|---|---|
   | New material | 38% | 8% |
   | Guided application | 22% | 12% |
   | Question bank | 15% | 22% |
   | Spaced revision | 13% | 18% |
   | Mistakes | 7% | 8% |
   | Timed sections and mocks | 5% | 32% |

   About 10% a week is kept as **buffer** for catching up (`bufferShare`).
5. **Weak skills.** Skills the learner marks as weak come first in the timed-section queue.
6. **Mock protection.** The last one or two unseen papers at the target level are kept back for full mocks in the final 40% of the plan, and no timed section uses them. A mock longer than the longest study day is split into parts on consecutive study days. Each mock is followed by a review session.
7. **Feasibility.** If the chosen time can't cover the remaining material plus exam preparation, the plan says how many hours are missing and offers three alternatives: more minutes a week, a later date, or the level below first. It then builds a prioritised plan instead of overloading the calendar.
8. **Replanning.** Completed and partly completed sessions are kept. The review screen shows the change in upcoming sessions and hours before anything is saved.

## Progress › Exam preparation keeps three things apart

- **Activity completion**: what has been worked through (units, guides, papers).
- **Adherence**: how much of the scheduled work was done, with partly-done sessions counted as half.
- **Readiness**: an estimate from timed DELE papers only, shown as a range. The range is ±6 points per group with one paper per skill, ±4 with two or three papers, and ±3 with more. Writing and speaking scores are labelled as estimates. If not every skill has at least one paper, the screen shows "not enough evidence" instead of a number.
