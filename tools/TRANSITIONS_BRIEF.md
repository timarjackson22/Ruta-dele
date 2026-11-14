# Transitions brief — moving between tabs, pages and Profe

**Goal:** at every move you always know where you are, how you got there and how to get back, and nothing you were doing is lost or keeps running behind you. Profe opening and closing is the most important case.

**What to audit (automated walk on a phone-sized screen)**
1. **Where am I** — the highlighted tab matches the page's tab (the one it is reached from), the header shows a title and a back button that leads one level up.
2. **Going back** — the back button and the phone's back gesture land on the page you came from, at the same scroll position (long lists: verbs, words, texts, units).
3. **Switching tabs** — tapping a tab goes to its home screen, the highlight moves, and the page you left doesn't keep playing audio.
4. **Opening Profe** from: the Profe button, "Ask Profe" on a question or answer, the home card, a lesson. Profe must say which page it is looking at; anything reading aloud on the page pauses; the page underneath keeps its place.
5. **Leaving Profe** with ✕, a tab, or the return button: Profe stops talking and listening, you land exactly where you were (same question, same scroll), and a "back to question N / back to the lesson" button is offered when Profe was opened from one.
6. **Long moves**: Hoy's "Today's session" pill, "Back to question" after finding the answer, the drill's ✕ — each shows where it leads.

**Indicators required**
- Active tab highlight and header back label on every page.
- A context chip in Profe's header: "Looking at: <page>", updated when the page changes.
- A return button whenever Profe was opened from a question or lesson.
- Visible feedback that page audio paused when Profe opens.

**Done when** each move above is checked by the walk, every failure is fixed at its cause, and the earlier tests still pass.
