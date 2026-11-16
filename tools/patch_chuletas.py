# M5: Revision Cheat Sheets. Embeds tools/chuletas.js (re-running replaces it) and wires routes, Library tile and print CSS once.
import sys
P = sys.argv[1] if len(sys.argv) > 1 else "index.html"
s = open(P, encoding="utf-8").read()
js = open("tools/chuletas.js", encoding="utf-8").read().rstrip() + "\n"
if "/* ==CHULETAS==" in s:
    i = s.index("  /* ==CHULETAS=="); j = s.index("/* ==/CHULETAS== */", i) + len("/* ==/CHULETAS== */\n")
    s = s[:i] + js + s[j:]; open(P, "w", encoding="utf-8").write(s); print("chuletas block updated"); sys.exit()
def rep(a, b):
    global s
    assert s.count(a) == 1, (s.count(a), a[:120]); s = s.replace(a, b)
rep("  /* ==PLAN== ", js + "  /* ==PLAN== ")
rep('    else if (h === "plan") {', '    else if (h === "chuletas") { setSec("biblioteca"); navChips(null); chHub(); }\n    else if (/^chuleta-/.test(h)) { setSec("biblioteca"); navChips(null); chSheet(h.slice(8)); }\n    else if (h === "plan") {')
rep('    if (/^guia-/.test(h)) return ["#guias", "Guides"];', '    if (/^guia-/.test(h)) return ["#guias", "Guides"];\n    if (/^chuleta-/.test(h)) return ["#chuletas", "Cheat sheets"];\n    if (h === "chuletas") return ["#biblioteca", "Library"];')
rep('[["guides", "Guides", GUIDES.length + " topics", "#guias", "#4f8cff", "#2f5fd0"],', '[["guides", "Guides", GUIDES.length + " topics", "#guias", "#4f8cff", "#2f5fd0"], ["guides", "Revision Cheat Sheets", GUIDES.length + " one-page sheets", "#chuletas", "#ffb547", "#e07b00"],')
CSS = """
/* ===== revision cheat sheets (M5) ===== */
.chfilters { display: flex; flex-direction: column; gap: 8px; margin: 8px 0 12px }
.chfilters input { font: inherit; padding: 10px 12px; border: 1px solid var(--line); border-radius: 12px; background: var(--surface); color: inherit }
.chfilters .vchips { flex-wrap: wrap }
.chgrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 10px }
.chcard { position: relative; display: flex; flex-direction: column; gap: 3px; padding: 12px; border-radius: 16px; border: 1px solid var(--line); background: var(--surface); text-decoration: none; color: inherit; min-height: 92px }
.chcard small { color: var(--muted) } .chstar { position: absolute; top: 8px; right: 10px; color: #e07b00 }
.chlv { align-self: flex-start; font-size: .68rem; font-weight: 750; letter-spacing: .05em; padding: 2px 8px; border-radius: 999px; background: color-mix(in srgb, #ffb547 26%, transparent); color: #8a4b00 }
.chtools { display: flex; flex-wrap: wrap; gap: 8px; margin: 6px 0 12px }
.chsheet { background: var(--surface); border: 1px solid var(--line); border-radius: 16px; padding: 14px; font-size: .9rem; line-height: 1.35 }
.chsheet header h1 { font-size: 1.35rem; margin: 4px 0 } .chsheet header h1 small { font-weight: 500; color: var(--muted); font-size: .8em }
.chmem { margin: 6px 0 10px; padding: 8px 10px; border-radius: 10px; background: color-mix(in srgb, #ffb547 16%, transparent) } .chmem b { margin-right: 6px }
.chcols { display: grid; grid-template-columns: 1fr; gap: 12px }
@media (min-width: 760px) { .chcols { grid-template-columns: 1.25fr 1fr 1fr } }
.chsheet h2 { font-size: .8rem; text-transform: uppercase; letter-spacing: .05em; color: var(--cobalt); margin: 8px 0 4px }
.chsheet ul, .chflow { margin: 0; padding-left: 16px } .chsheet li { margin: 3px 0 }
.che { display: block; margin-top: 1px } .che i { font-style: normal; font-weight: 600 } .che small { color: var(--muted) }
.chflow { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0 }
.chflow li { position: relative; padding: 5px 8px; border: 1px solid var(--line); border-radius: 8px; margin-bottom: 12px; background: color-mix(in srgb, var(--cobalt) 5%, transparent) }
.chflow li:not(:last-child)::after { content: "↓ no"; position: absolute; left: 12px; bottom: -13px; font-size: .62rem; color: var(--muted) }
.chflow li b { color: #0f7a4f; margin-left: 4px; white-space: nowrap }
.chpit s { color: #c0143c } .chpit b { color: #0f7a4f } .chpit small { display: block; color: var(--muted) }
.chsheet footer { margin-top: 10px; border-top: 1px solid var(--line); padding-top: 6px }
/* cheat sheet v2: hero + quick answer, at-a-glance comparison, rule cards, decision path, ✗/✓ fixes */
.chs2 { padding: 0; overflow: hidden; border-radius: 20px }
.chs2 > *:not(.chhero) { margin-left: 14px; margin-right: 14px }
.chhero { padding: 16px 16px 14px; background: linear-gradient(135deg, color-mix(in srgb, #ffb547 30%, var(--surface)), color-mix(in srgb, #2563eb 14%, var(--surface))); border-bottom: 1px solid var(--line) }
.chhero h1 { font-size: 1.55rem; line-height: 1.15; margin: 6px 0 4px } .chhero h1 small { display: block; font-size: .62em; font-weight: 500; color: var(--muted); margin-top: 2px }
.chlead { margin: 4px 0 10px; color: var(--muted); font-size: .92rem }
.chquick { background: var(--surface); border-radius: 14px; padding: 10px 12px; box-shadow: 0 2px 10px rgba(20, 30, 60, .08); border-left: 5px solid #e07b00 }
.chquick b { display: block; font-size: .7rem; letter-spacing: .08em; text-transform: uppercase; color: #b45f00; margin-bottom: 2px } .chquick p { margin: 0; font-weight: 600; line-height: 1.4 }
.chsheet.chs2 h2 { font-family: inherit !important; font-weight: 800; font-size: .76rem !important; line-height: 1.2 !important; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); margin: 16px 0 8px; display: flex; align-items: center; gap: 6px }
.chsheet.chs2 h2::after { content: ""; flex: 1; height: 1px; background: var(--line) }
.chvs { display: grid; grid-template-columns: 1fr; gap: 6px; align-items: stretch }
@media (min-width: 560px) { .chvs { grid-template-columns: repeat(var(--n), 1fr) } .chvsx { display: none !important } }
.chside { border-radius: 14px; padding: 10px 12px; background: color-mix(in srgb, var(--c) 9%, var(--surface)); border: 1.5px solid color-mix(in srgb, var(--c) 35%, transparent) }
.chside h3 { margin: 0 0 4px; font-size: 1.15rem; color: var(--c); font-style: italic } .chside ul { margin: 0; padding-left: 16px; font-size: .86rem } .chside li { margin: 2px 0 }
.chvsx { display: block; text-align: center; font-weight: 800; font-size: .72rem; color: var(--muted); letter-spacing: .1em }
.chcards { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px }
.chcard2 { border-radius: 14px; padding: 10px 12px; background: var(--surface); border: 1px solid var(--line); border-top: 4px solid var(--c); break-inside: avoid }
.chct { display: flex; align-items: center; gap: 8px; margin-bottom: 3px } .chct b { line-height: 1.2 }
.chnum { flex: none; width: 22px; height: 22px; border-radius: 50%; display: grid; place-items: center; font-size: .72rem; font-weight: 800; color: #fff; background: var(--c) }
.chtag { flex: none; font-size: .68rem; font-weight: 800; padding: 2px 8px; border-radius: 999px; color: #fff; background: var(--c); font-style: italic }
.chrule { margin: 0 0 6px; font-size: .9rem; line-height: 1.4 }
.chnotes { margin: 0 0 6px; font-size: .8rem; color: var(--muted) } .chnote { margin: 2px 0 } .chnote b { color: var(--c); font-weight: 700; margin-right: 2px }
.chex { margin: 0; padding: 7px 10px; border-radius: 10px; background: color-mix(in srgb, var(--c) 7%, transparent); display: flex; flex-direction: column; gap: 1px }
.chex span { font-weight: 600 } .chex small { color: var(--muted); font-style: italic }
.chex mark { background: color-mix(in srgb, var(--c) 22%, transparent); color: inherit; padding: 0 3px; border-radius: 4px; font-weight: 800; box-shadow: inset 0 -2px 0 var(--c) }
.chpath ol { list-style: none; margin: 0; padding: 0; counter-reset: q; display: flex; flex-direction: column; gap: 0 }
.chpath li { counter-increment: q; position: relative; padding: 8px 10px 8px 34px; border-left: 2px dashed var(--line); margin-left: 11px }
.chpath li::before { content: counter(q); position: absolute; left: -12px; top: 8px; width: 22px; height: 22px; border-radius: 50%; display: grid; place-items: center; background: var(--surface); border: 2px solid var(--cobalt); color: var(--cobalt); font-size: .72rem; font-weight: 800 }
.chq { display: block; font-size: .88rem } .cha { display: inline-block; margin-top: 4px; font-size: .8rem; font-weight: 800; padding: 2px 9px; border-radius: 8px; color: var(--c, #0f7a4f); background: color-mix(in srgb, var(--c, #0f7a4f) 12%, transparent) } .cha::before { content: "→ " }
.chwatch ul, .chtips2 ul { margin: 0; padding: 10px 12px 10px 28px; border-radius: 12px; font-size: .86rem }
.chwatch ul { background: color-mix(in srgb, #f59e0b 12%, transparent) } .chtips2 ul { background: color-mix(in srgb, #2563eb 8%, transparent) } .chwatch li, .chtips2 li { margin: 4px 0 }
.chfix ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px }
.chfix li { border-radius: 12px; border: 1px solid var(--line); padding: 8px 10px; background: var(--surface) }
.chno, .chyes { margin: 0; font-weight: 600; font-size: .88rem } .chno { color: #b4123a; text-decoration: line-through; text-decoration-thickness: 1px; opacity: .85 } .chno span, .chyes span { text-decoration: none; display: inline-block; font-weight: 800 }
.chyes { color: #0f7a4f } .chfix small { display: block; color: var(--muted); margin-top: 2px }
.chquiz { margin-top: 6px } .chqz { border: 1px solid var(--line); border-radius: 12px; padding: 10px; margin-bottom: 8px } .chqz p { margin: 0 0 6px; font-weight: 600 }
.chopts { display: flex; flex-wrap: wrap; gap: 6px } .chopts .ok { background: color-mix(in srgb, #16a36a 18%, var(--surface)); border-color: #16a36a } .chopts .no { background: color-mix(in srgb, #e11d48 14%, var(--surface)); border-color: #e11d48 }
.chwhy { font-size: .84rem; color: var(--muted); margin-top: 6px !important; font-weight: 400 !important }
.chs2 footer { margin-top: 14px; margin-bottom: 12px }
@media print {
  body.ch-printing .chs2 { border-radius: 0 } body.ch-printing .chhero { padding: 0 0 4mm; background: none; border-bottom: 2px solid #e07b00 }
  body.ch-printing .chs2 > *:not(.chhero) { margin-left: 0; margin-right: 0 }
  body.ch-printing .chcard2, body.ch-printing .chfix li, body.ch-printing .chquick { box-shadow: none; padding: 4px 6px } body.ch-printing .chcards { gap: 3px }
  body.ch-printing .chs2 h2 { margin: 6px 0 3px } body.ch-printing .chvs { grid-template-columns: repeat(var(--n), 1fr) !important } body.ch-printing .chvsx { display: none !important }
  body.ch-printing .chsheet.chs2 { font-size: 7.4pt; line-height: 1.18 }
  body.ch-printing .chglance, body.ch-printing .chlead, body.ch-printing .chhero .chlv { display: none !important }
  body.ch-printing .chhero h1 { font-size: 15pt; margin: 0 } body.ch-printing .chhero h1 small { display: inline; font-size: 10pt; margin-left: 6px }
  body.ch-printing .chquick { padding: 2px 6px; margin-top: 2px } body.ch-printing .chquick b { display: inline; margin-right: 4px }
  body.ch-printing .chrule { margin: 0 0 2px; font-size: inherit } body.ch-printing .chnotes { font-size: 6.8pt; margin: 0 0 2px } body.ch-printing .chnote + .chnote { display: none }
  body.ch-printing .chex { padding: 1px 5px; flex-direction: row; flex-wrap: wrap; gap: 0 5px } body.ch-printing .chct { margin-bottom: 1px }
  body.ch-printing .chpath li { padding: 2px 4px 2px 22px } body.ch-printing .chpath li::before { width: 15px; height: 15px; left: -9px; top: 2px; font-size: 6pt }
  body.ch-printing .chfix li:nth-child(n+4) { display: none } body.ch-printing .chfix ul, body.ch-printing .chcards { gap: 2px }
  body.ch-printing .chwatch ul, body.ch-printing .chtips2 ul { padding: 3px 6px 3px 16px }
  body.ch-printing .chsheet.chs2 h2 { font-size: 7pt !important; margin: 4px 0 2px }
  body.ch-printing .chs2 :is(.chq, .cha, .chno, .chyes, .chwatch ul, .chtips2 ul, .chfix small, .chct b, .chex, .chex small, .chquick p) { font-size: 7pt !important; line-height: 1.2 }
  body.ch-printing .chs2 :is(.chtag, .chnum) { font-size: 6pt !important } body.ch-printing .chs2 footer { display: none } body.ch-printing .chcard2 { border-top-width: 2px }
  body.ch-printing .chcard2, body.ch-printing .chex, body.ch-printing .chside, body.ch-printing .chex mark, body.ch-printing .chnum, body.ch-printing .chtag, body.ch-printing .cha { -webkit-print-color-adjust: exact; print-color-adjust: exact }
}
@media print {
  @page { size: A4 landscape; margin: 9mm }
  body.ch-printing > *:not(main), body.ch-printing main > *:not(#app), body.ch-printing .noprint, body.ch-printing .tabbar, body.ch-printing #tutor, body.ch-printing header.top, body.ch-printing .crumb { display: none !important }
  body.ch-printing #app { margin: 0 !important; padding: 0 !important }
  body.ch-printing .ui-title, body.ch-printing .ui-hero { display: none !important }
  body.ch-printing .chsheet { border: 0; padding: 0; font-size: 8.6pt; line-height: 1.25; color: #000; background: #fff }
  body.ch-printing #app, body.ch-printing main, body.ch-printing .ui-page, body.ch-printing .chpage { max-width: none !important; width: auto !important; margin: 0 !important; padding: 0 !important }
  body.ch-printing .chcols { display: block !important; column-count: 3; column-gap: 6mm; column-fill: balance }
  body.ch-printing .chcols section { display: contents }
  body.ch-printing .chsheet h2 { break-after: avoid; margin-top: 4px }
  body.ch-printing .chflow li { margin-bottom: 9px; padding: 3px 6px }
  body.ch-printing .chsheet li, body.ch-printing .chflow li { break-inside: avoid }
}
"""
rep("/* ===== study plan (M4) ===== */", CSS + "/* ===== study plan (M4) ===== */")
open(P, "w", encoding="utf-8").write(s); print("chuletas wired")
