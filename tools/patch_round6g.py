# (16:54) Profe panel header: "‹ Profe" top-left closes Profe (no ✕); ⚙ top-right. Second row: 🗣️ Practice · 🇬🇧 · ✋.
# Chat and New chat only outside a practice session. Practice (tab) during a session goes back to the practice list
# (the session can be resumed for an hour); End session lives in the bottom bar of the drill.
import sys
P = sys.argv[1] if len(sys.argv) > 1 else "index.html"
s = open(P, encoding="utf-8").read()
def rep(a, b):
    global s
    assert s.count(a) == 1, (s.count(a), a[:100]); s = s.replace(a, b)
i = s.index("    const tabs = [[\"chat\", \"Chat\", \"\"], [\"practice\", \"Practice\", \"\"], [\"hist\", \"⚙️\", \"History & settings\"]]")
j = s.index("\n", i)
s = s[:i] + """    const inPr = typeof PR !== "undefined" && !!PR && tView === "practice";
    const hfOn = (() => { try { return HF.on; } catch (e) { return false; } })();
    const tabs = (inPr ? "" : '<button class="btn small" data-act="t-tab" data-v="chat" aria-pressed="' + (tView === "chat") + '">Chat</button>') +
      '<button class="btn small" data-act="t-tab" data-v="practice" aria-pressed="' + (tView === "practice") + '" aria-label="Practice: speaking and translation drills"><svg class="ic-speak" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21v-3H7a2 2 0 0 1-2-2v-3l-2-.6 2-3.4A6 6 0 0 1 11 3a6 6 0 0 1 6 6c0 2-.9 3.5-2 4.6V21"/><path d="M19 8.5a4 4 0 0 1 0 5M21.4 6.4a7 7 0 0 1 0 9.2"/></svg> Practice</button>' +
      '<button class="btn small t-enbtn" data-act="t-en" aria-pressed="' + !TS.noEnLine + '" title="English under Profe’s Spanish" aria-label="English translations">🇬🇧</button>' +
      (CAN_MIC ? '<button class="btn small hfchip" data-act="hf-toggle" aria-pressed="' + hfOn + '" aria-label="Hands-free ' + (hfOn ? "on" : "off") + '" title="Hands-free: say “Ok Profe”">✋ ' + (hfOn ? "On" : "Off") + "</button>" : "");""" + s[j:]
rep("""    const head = back + '<div class="th"><div><b>' + esc(pName()) + '</b></div><span class="row"><button class="btn small t-enbtn" data-act="t-en" aria-pressed="' + !TS.noEnLine + '" title="English under Profe’s Spanish" aria-label="English translations">🇬🇧</button><button class="btn small" data-act="t-new">New chat</button><button class="btn small" data-act="t-close" aria-label="Close tutor">✕</button></span><div class="row ttabs">' + tabs + "</div></div>";""",
    """    const head = back + '<div class="th"><button type="button" class="tbrand" data-act="t-close" aria-label="Close Profe" title="Close Profe"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg><b>' + esc(pName()) + '</b></button><span class="row">' + '<button class="btn small ticon" data-act="t-tab" data-v="hist" aria-pressed="' + (tView === "hist") + '" aria-label="History & settings" title="History & settings">⚙️</button></span><div class="row ttabs">' + tabs + "</div></div>";""")
# Practice tab while a session runs: back to the list (resumable)
rep("""    else if (act === "t-tab") { tView = t.dataset.v; tRender(); }""",
    """    else if (act === "t-tab") { if (t.dataset.v === "practice" && tView === "practice" && PR) { try { stopListening(); } catch (e) {} window.__sttOver = null; PR = null; TS.prType = ""; } tView = t.dataset.v; tRender(); }""")
rep(""".t-enbtn { font-size: 1.05rem; line-height: 1; padding: 4px 8px }""", """.t-enbtn { font-size: 1.05rem; line-height: 1; padding: 4px 8px } .tbrand { display: inline-flex; align-items: center; gap: 2px; border: 0; background: none; padding: 4px 6px 4px 0; margin-left: -4px; font: inherit; font-size: 1.15rem; color: var(--ink); cursor: pointer; border-radius: 10px } .tbrand svg { color: var(--cobalt) } .tbrand:active { background: var(--surface-2, rgba(0,0,0,.06)) }""")
open(P, "w", encoding="utf-8").write(s); print("ok")
