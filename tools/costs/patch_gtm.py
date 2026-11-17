"""Embeds Admin › Go to market & unit economics. Re-runnable.
Runs tools/costs/model.py and gtm.py, then puts gtm_out.json in <script id="gtm-data">, the view (gtm_view.js) after costsView, its CSS,
the route #gtm and the Admin row in Settings.   Usage: python3 tools/costs/patch_gtm.py index.html"""
import sys, os, re, subprocess, json
P = sys.argv[1] if len(sys.argv) > 1 else "index.html"; T = os.path.dirname(os.path.abspath(__file__))
for f in ("model.py", "gtm.py"): subprocess.run([sys.executable, os.path.join(T, f)], check=True, capture_output=True)
s = open(P, encoding="utf-8").read()
def rep(a, b):
    global s
    assert s.count(a) == 1, (a[:70], s.count(a)); s = s.replace(a, b)
data = json.dumps(json.load(open(os.path.join(T, "gtm_out.json"), encoding="utf-8")), ensure_ascii=False).replace("</", "<\\/")
tag = '<script type="application/json" id="gtm-data">'
if tag in s: s = re.sub(re.escape(tag) + r".*?</script>", lambda m: tag + data + "</script>", s, count=1, flags=re.S)
else: rep('<script type="application/json" id="cost-data">', tag + data + '</script>\n<script type="application/json" id="cost-data">')
view = open(os.path.join(T, "gtm_view.js"), encoding="utf-8").read()
if "/* ==GTM== */" in s: s = re.sub(r"  /\* ==GTM== \*/.*?/\* ==/GTM== \*/\n", lambda m: view, s, count=1, flags=re.S)
else: rep("  /* ==CURRIC== */", view + "  /* ==CURRIC== */")
css = """/* ==GTM-CSS== */
.gtm-rec { background: var(--surface); border: 1px solid var(--line); border-radius: 18px; padding: 16px 18px; margin: 14px 0 }
.gtm-rec ol { margin: 6px 0 0; padding-left: 20px } .gtm-rec li { margin: 6px 0; line-height: 1.5 } .gtm-kick { margin: 0; font-size: .74rem; font-weight: 750; letter-spacing: .08em; text-transform: uppercase; color: var(--cobalt) }
.gtm-ctl { display: flex; flex-wrap: wrap; gap: 10px; margin: 16px 0 10px }
.gtm-seg { display: inline-flex; background: color-mix(in srgb, var(--line) 55%, transparent); border-radius: 12px; padding: 3px }
.gtm-seg button { border: 0; background: transparent; padding: 8px 12px; min-height: 36px; border-radius: 9px; font: inherit; font-size: .86rem; font-weight: 600; color: var(--ink); cursor: pointer }
.gtm-seg button[aria-pressed="true"] { background: var(--surface); box-shadow: 0 1px 3px rgba(20,40,80,.15) }
.gtm-verdict { margin: 6px 0 12px; font-weight: 650 } .gtm .pos { color: #1f7a4d } .gtm .neg { color: #b4372f }
.gtm-kpis, .gtm-unit { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin: 10px 0 }
@media (min-width: 720px) { .gtm-kpis, .gtm-unit { grid-template-columns: repeat(4, minmax(0, 1fr)) } }
.gtm-kpi { background: var(--surface); border: 1px solid var(--line); border-radius: 16px; padding: 12px 14px } .gtm-kpi.pos { border-color: color-mix(in srgb, #1f7a4d 40%, var(--line)) } .gtm-kpi.neg { border-color: color-mix(in srgb, #b4372f 40%, var(--line)) }
.gtm-k { margin: 0; font-size: .78rem; color: var(--muted) } .gtm-v { margin: 2px 0 0; font-size: 1.35rem; font-weight: 750; font-variant-numeric: tabular-nums } .gtm-s { margin: 2px 0 0; font-size: .76rem; color: var(--muted) }
.gtm-kpi.pos .gtm-v { color: #1f7a4d } .gtm-kpi.neg .gtm-v { color: #b4372f }
.gtm-card { background: var(--surface); border: 1px solid var(--line); border-radius: 18px; padding: 14px 16px; margin: 14px 0 } .gtm-card h2, .gtm-h2 { font-size: 1.05rem; margin: 0 0 10px }
.gtm-bar { display: grid; grid-template-columns: 9.5em 1fr 4.5em; align-items: center; gap: 10px; margin: 8px 0; font-size: .9rem } .gtm-bar b { text-align: right; font-variant-numeric: tabular-nums }
.gtm-bt { height: 10px; border-radius: 6px; background: color-mix(in srgb, var(--line) 60%, transparent); overflow: hidden } .gtm-bt i { display: block; height: 100%; border-radius: 6px; background: var(--cobalt) } .gtm-bt i.pos { background: #2c8a5a } .gtm-bt i.neg { background: #c9544a }
.gtm-scroll { overflow-x: auto } .gtm-tbl { border-collapse: collapse; width: 100%; font-size: .86rem; font-variant-numeric: tabular-nums } .gtm-tbl th, .gtm-tbl td { padding: 7px 8px; text-align: right; border-bottom: 1px solid var(--line); white-space: nowrap }
.gtm-tbl th:first-child { text-align: left; font-weight: 500; position: sticky; left: 0; background: var(--surface) } .gtm-tbl thead button { border: 0; background: transparent; font: inherit; font-weight: 650; color: var(--ink); cursor: pointer; padding: 4px 6px; border-radius: 8px; text-align: right }
.gtm-tbl thead button span { display: block; font-weight: 400; font-size: .74rem; color: var(--muted) } .gtm-tbl thead button[aria-pressed="true"] { background: color-mix(in srgb, var(--cobalt) 12%, transparent) }
.gtm-sub th { font-size: .72rem; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); padding-top: 14px } .gtm-tot th, .gtm-tot td { font-weight: 650 } .gtm-net th, .gtm-net td { font-size: .98rem; border-bottom: 0 } .gtm-alt th, .gtm-alt td { color: var(--muted); font-size: .8rem }
.gtm-opts { margin: 18px 0 } .gtm-opt { background: var(--surface); border: 1px solid var(--line); border-radius: 18px; padding: 14px 16px; margin: 10px 0 } .gtm-opt h3 { margin: 0 0 6px; font-size: 1rem } .gtm-opt p { margin: 4px 0; line-height: 1.5 }
.gtm-price { font-weight: 650 } .gtm-pc { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 8px; font-size: .86rem } .gtm-pc ul { margin: 0; padding-left: 18px } .gtm-pro li::marker { content: "+  "; color: #1f7a4d } .gtm-con li::marker { content: "–  "; color: #b4372f }
.gtm-det { margin: 12px 0; background: var(--surface); border: 1px solid var(--line); border-radius: 16px; padding: 12px 16px } .gtm-det summary { font-weight: 650; cursor: pointer; min-height: 28px } .gtm-det li { margin: 6px 0; line-height: 1.5 }
.gtm-bench { list-style: none; padding: 0; margin: 10px 0 0 } .gtm-bench li { display: flex; gap: 10px; align-items: baseline; flex-wrap: wrap; padding: 6px 0; border-top: 1px solid var(--line); font-size: .86rem } .gtm-bench span { flex: 1 1 12em } .gtm-bench a { font-size: .8rem }
.gtm-tbl tbody th, .gtm-tbl thead th { text-transform: none !important; letter-spacing: 0 !important; background: var(--surface) !important; color: var(--ink) }
.gtm-tbl tbody th { white-space: normal; min-width: 7.5em; max-width: 9.5em; font-size: .82rem; line-height: 1.3 } .gtm-tbl td { padding: 7px 6px }
.gtm-tbl tr.gtm-sub th { text-transform: uppercase !important; letter-spacing: .06em !important; color: var(--muted) } .gtm-tbl tr.gtm-alt th { color: var(--muted) }
.gtm .tbl.gtm-scroll { border: 0; border-radius: 0; margin: 0 -4px; padding: 0 4px }
/* ==/GTM-CSS== */
"""
s = re.sub(r"/\* ==GTM-CSS== \*/.*?/\* ==/GTM-CSS== \*/\n", "", s, flags=re.S); s = s.replace("</style>", css + "</style>", 1)
if 'else if (h === "gtm")' not in s:
    rep('    else if (h === "costes") { setSec("hoy"); navChips(null); costsView(); }', '    else if (h === "costes") { setSec("hoy"); navChips(null); costsView(); }\n    else if (h === "gtm") { setSec("hoy"); navChips(null); gtmView(); }')
row = 'href: "#cobertura" })'
if '"#gtm"' not in s:
    rep(row + "])", row + ', ...(crAdmin() ? [uiRow({ ic: "chart", t: "Go to market & unit economics", sub: "Pricing options, what each learner is worth and costs, break-even", href: "#gtm" })] : [])])')
open(P, "w", encoding="utf-8").write(s); print("gtm embedded")
