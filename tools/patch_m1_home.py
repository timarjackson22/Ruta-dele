# M1 (15 Nov 2026, feature brief §2, 7, 8, 9, 10): Today → Home; Word of the Day right after "Start today's session"
# (with example and save); Quick Drill and Progress as large tiles; today's badges beside the streak; Keep Going =
# Flashcards, Stories & Podcasts, Videos, Read, Revision Cheat Sheets, My Mistakes (resuming where you were).
import sys
P = sys.argv[1] if len(sys.argv) > 1 else "index.html"
s = open(P, encoding="utf-8").read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:100]); s = s.replace(a, b)
HOMEIC = '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/>'
# §2 navigation and labels
rep('<a data-s="hoy" href="#inicio">Today</a>', '<a data-s="hoy" href="#inicio">Home</a>')
rep('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg><span>Today</span></a>', HOMEIC + '</svg><span>Home</span></a>')
rep('if (h === "ajustes" || h === "progreso" || h === "hoy") return ["#inicio", "Today"];', 'if (h === "ajustes" || h === "progreso" || h === "hoy" || h === "plan") return ["#inicio", "Home"];')
rep('<section class="today" aria-label="Today">', '<section class="today" aria-label="Home: today">')
# #home works as an address too (old #inicio / #hoy links keep working)
rep("  function route() {\n    try { route0(); }", "  function route() {\n    if (location.hash === \"#home\") { try { history.replaceState(null, \"\", \"#inicio\"); } catch (e) { location.hash = \"#inicio\"; return; } }\n    try { route0(); }")

# remember what you were reading, listening to and watching (Keep Going and the Continue banner resume it)
rep("  function listenItem(x) {\n", "  function listenItem(x) {\n    try { const rd = isReading(x); S[rd ? \"lastRead\" : \"lastLi\"] = { id: x.id, t: x.t, cat: x.cat, lvl: x.lvl, at: Date.now() }; save(); } catch (e) {}\n")
rep("  function videoPage(id) {\n", "  function videoPage(id) {\n    try { const v0 = vFind(id); if (v0) { S.lastVid = { id, t: v0.t, at: Date.now() }; save(); } } catch (e) {}\n")

# §8 today's badges: remember the day each badge is earned (earlier badges have no day, so they never show as today's)
rep("now.forEach((b) => { if (!got.has(b.id)) { got.add(b.id); setTimeout(", "now.forEach((b) => { if (!got.has(b.id)) { got.add(b.id); S.badgeAt = S.badgeAt || {}; S.badgeAt[b.id] = dayKey(); setTimeout(")

# the Home page
rep("""    const goal = '<div class="goal3">' + ring + '<div class="g3-t"><b>' + (st ? '<span class="flame">🔥</span> ' + st + "-day streak" : "Start a streak today") + "</b><small>" + msg + "</small>" + week() + "</div></div>";""",
    """    const tb = BADGES.filter((b) => (S.badgeAt || {})[b.id] === dayKey());
    const tbH = tb.length ? '<div class="g3-badges" aria-label="Badges earned today">' + tb.slice(0, 4).map((b) => '<button type="button" class="g3b" data-act="badge-info" data-id="' + b.id + '" aria-label="Badge earned today: ' + esc(b.t) + '" title="' + esc(b.t) + '">' + b.ic + "</button>").join("") + (tb.length > 4 ? '<button type="button" class="g3b more" data-act="badge-info" data-id="_all" aria-label="' + (tb.length - 4) + ' more badges today">+' + (tb.length - 4) + "</button>" : "") + '<small>today</small></div>' : "";
    const goal = '<div class="goal3">' + ring + '<div class="g3-t"><b>' + (st ? '<span class="flame">🔥</span> ' + st + "-day streak" : "Start a streak today") + "</b><small>" + msg + "</small>" + week() + "</div>" + tbH + "</div>";""")
# §10 word of the day: meaning, sound, an example, save
rep("""        wod = '<div class="wod"><p class="wod-eye">Palabra del día · Word of the day</p><p class="wod-es" lang="es">' + esc(w[0]) + '</p><p class="wod-en">' + esc(w[1]) + '</p><button class="wod-say" data-act="say" data-t="' + esc(w[0]) + '" aria-label="Listen">🔊 Escuchar</button></div>'; }""",
    """        const ex = wodExample(w[0], cl), saved = wodSaved(w[0]);
        wod = '<div class="wod"><div class="wod-main"><p class="wod-eye">Palabra del día · Word of the day</p><p class="wod-es" lang="es">' + esc(w[0]) + '</p><p class="wod-en">' + esc(String(w[1]).split(/[;(]/)[0].trim()) + '</p></div><div class="wod-acts"><button class="wod-say" data-act="say" data-t="' + esc(w[0]) + '" aria-label="Listen to ' + esc(w[0]) + '">🔊</button><button class="wod-save" data-act="wod-save" data-es="' + esc(w[0]) + '" data-en="' + esc(w[1]) + '" aria-pressed="' + saved + '" aria-label="' + (saved ? "Saved to your flashcards" : "Save to your flashcards") + '">' + (saved ? "✓ Saved" : "+ Save") + "</button></div>" +
          (ex ? '<details class="wod-ex"><summary>Example</summary><p lang="es">' + esc(ex[0]) + ' <button class="say" data-act="say" data-t="' + esc(ex[0]) + '" aria-label="Listen to the example">🔊</button></p><p class="muted small">' + esc(ex[1]) + "</p></details>" : "") + "</div>"; }""")
# Keep going
old = s[s.index("    const cards = [\n      card({ ic: \"cards\", t: \"Flashcards\""):s.index("    ].join(\"\");", s.index("    const cards = [\n      card({ ic: \"cards\", t: \"Flashcards\""))]
new = """    const LL = S.lastLi && LI[S.lastLi.id] ? S.lastLi : null, LR = S.lastRead && LI[S.lastRead.id] ? S.lastRead : null, LVd = S.lastVid && vFind(S.lastVid.id) ? S.lastVid : null;
    const cards = [
      card({ ic: "cards", t: "Flashcards", href: "#repaso", sub: due ? due + " ready to review" : "All caught up ✓", badge: due || "", c: ["#ffb02e", "#f07b16"] }),
      card({ ic: "listen", t: "Stories & Podcasts", href: LL ? "#" + LL.id : "#escuchar", sub: LL ? "Continue «" + esc(LL.t) + "»" : "Stories, podcasts, news", c: ["#3fa0ff", "#1f63e0"] }),
      card({ ic: "video", t: "Videos", href: LVd ? "#video-" + LVd.id : "#videos", sub: LVd ? "Back to «" + esc(LVd.t) + "»" : "Real Spanish clips", c: ["#ff5f8f", "#d6336c"] }),
      card({ ic: "read", t: "Read", href: LR ? "#" + LR.id : "#leer", sub: LR ? "Continue «" + esc(LR.t) + "»" : "Texts with tap-to-translate", c: ["#ff9f6b", "#e0592e"] }),
      card({ ic: "guides", t: "Revision Cheat Sheets", href: "#chuletas", sub: GUIDES.length + " topics on a page or two", c: ["#2bb3a3", "#0f7f86"] }),
      card({ ic: "mist", t: "My mistakes", href: "#errores", sub: nm ? nm + " to fix" : "Nothing to fix yet ✓", badge: nm || "", c: ["#ff6b6b", "#d93b4c"] }),
"""
s = s.replace(old, new)
# Home order: session + word of the day, then the Continue banner, streak, Quick drill / Progress, Keep going, journey
rep("""      hoyHero() + hero + goal +
      '<h2 class="ghead">Keep going</h2><div class="kscroll">' + cards + "</div>" +
      wod +""",
    """      '<div class="home-top">' + hoyHero() + wod + "</div>" + hero + goal +
      '<div class="qp2"><a class="qp2t qd" href="#drill"><span class="qp2i" aria-hidden="true">🧩</span><span><b>Quick drill</b><small>5 minutes · mixed practice</small></span></a><a class="qp2t pg" href="#progreso"><span class="qp2i" aria-hidden="true">📊</span><span><b>Progress</b><small>' + (st ? st + "-day streak" : "Streak, skills, badges") + ((S.frz || 0) ? " · 🧊" + S.frz : "") + "</small></span></a></div>" +
      '<h2 class="ghead">Keep going</h2><div class="kscroll">' + cards + "</div>" +""")
# the session tile no longer carries the small Quick drill / Progress chips (they are tiles now)
rep("""      '<div class="hhchips"><a href="#drill">🧩 Quick drill</a><a href="#progreso">📊 Progress' + ((S.frz || 0) ? " · 🧊" + S.frz : "") + "</a></div>";""", """      "";""")
# helpers: an example sentence for the word, saving it, badge details
rep("""  function courseHub() {""", """  function wodExample(word, lv) {
    const k = String(word).toLowerCase().replace(/^(el|la|los|las|un|una)\\s+/, "").split(/[ ,]/)[0]; if (k.length < 3) return null;
    const re = new RegExp("(^|[^\\\\p{L}])" + k.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&") + "([^\\\\p{L}]|$)", "iu"), lvs = [lv, "a1", "a2", "b1"];
    try { for (const l of lvs) for (const u of (LXS[l] || [])) for (const e of (u.e || [])) if (e[0] && e[1] && re.test(e[0]) && e[0].length < 110) return e; } catch (e) {}
    try { for (const x of LISTEN) if (lvs.includes(x.lvl)) for (const p of x.paras) for (const s2 of p.s) if (s2[1] && re.test(s2[0]) && s2[0].length < 110 && /^[¿¡A-ZÁÉÍÓÚÑ]/.test(s2[0])) return s2; } catch (e) {}
    return null;
  }
  function wodSaved(es) { try { const D = (SRD.decks || []).find((x) => x.name === "Word of the day"); return !!(D && D.w.some((m) => m.es === es)); } catch (e) { return false; } }
  document.addEventListener("click", (e) => {
    const t = e.target.closest && e.target.closest("[data-act]"); if (!t) return;
    if (t.dataset.act === "wod-save") { let D = (SRD.decks || []).find((x) => x.name === "Word of the day"); if (!D) D = dkNew("Word of the day"); const ok = dkAdd(D.id, t.dataset.es, t.dataset.en, "wod"); t.setAttribute("aria-pressed", "true"); t.setAttribute("aria-label", "Saved to your flashcards"); t.textContent = "✓ Saved"; try { coachToast(ok ? "Saved to your “Word of the day” flashcards" : "Already in your flashcards"); } catch (x) {} }
    else if (t.dataset.act === "badge-info") { const tb = BADGES.filter((b) => (S.badgeAt || {})[b.id] === dayKey()), list = t.dataset.id === "_all" ? tb : tb.filter((b) => b.id === t.dataset.id);
      openSheet('<div class="row" style="justify-content:space-between"><b>Earned today</b><button class="btn small" data-act="l-close">Close</button></div>' + list.map((b) => '<p style="font-size:1.05rem"><span style="font-size:1.6rem">' + b.ic + "</span> <b>" + esc(b.t) + '</b><br><span class="muted small">' + esc(b.s) + "</span></p>").join("") + '<p class="small"><a href="#progreso">All badges in Progress ›</a></p>'); }
  });
  function courseHub() {""")
# styles
rep("""/* ===== type system""", """.home-top { display: grid; gap: 10px } @media (min-width: 700px) { .home-top { grid-template-columns: 1.4fr 1fr; align-items: stretch } }
.home-top .wod { margin: 0; display: grid; grid-template-columns: 1fr auto; gap: 4px 10px; align-items: center }
.wod-acts { display: flex; gap: 6px } .wod-save, .wod-say { border: 1px solid var(--line); background: var(--surface); color: var(--ink); border-radius: 999px; padding: 6px 12px; font: inherit; font-weight: 600; cursor: pointer; min-height: 40px } .wod-save[aria-pressed="true"] { color: #1a9c6b; border-color: #1a9c6b }
.wod-ex { grid-column: 1 / -1; font-size: .95rem } .wod-ex summary { cursor: pointer; color: var(--cobalt); font-weight: 600 } .wod-ex p { margin: 4px 0 }
.qp2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 12px 0 4px }
.qp2t { display: flex; align-items: center; gap: 10px; min-height: 72px; padding: 12px 14px; border-radius: 18px; text-decoration: none; color: #fff; box-shadow: 0 6px 18px rgba(0,0,0,.12) }
.qp2t.qd { background: linear-gradient(135deg, #7c4dff, #4527a0) } .qp2t.pg { background: linear-gradient(135deg, #0f9d8a, #0b6b78) }
.qp2t b { display: block; font-size: 1.08rem } .qp2t small { display: block; opacity: .9; font-size: .82rem; margin-top: 2px } .qp2i { font-size: 1.6rem; line-height: 1 } .qp2i svg { width: 26px; height: 26px; stroke: #fff }
.qp2t:focus-visible { outline: 3px solid var(--ink); outline-offset: 2px }
.g3-badges { margin-left: auto; display: flex; flex-wrap: wrap; gap: 4px; align-items: center; justify-content: flex-end; max-width: 120px }
.g3b { width: 36px; height: 36px; border-radius: 50%; border: 1px solid var(--line); background: var(--surface); font-size: 1.15rem; cursor: pointer; display: grid; place-items: center; padding: 0 } .g3b.more { font-size: .8rem; font-weight: 700 }
.g3-badges small { width: 100%; text-align: right; color: var(--muted); font-size: .72rem }
/* ===== type system""")
rep("const UIC = {listen:", 'const UIC = {video:["#d6336c",\'<rect x="2" y="5" width="15" height="14" rx="2"/><path d="m17 10 5-3v10l-5-3z"/>\'],listen:')
open(P, "w", encoding="utf-8").write(s); print("ok")
