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
