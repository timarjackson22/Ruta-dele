"""DELE curriculum coverage dashboard (admin): embeds tools/curric/curric.js, the register (tools/curric/register.json, built by
build_register.py) and its CSS into index.html, and wires the #cobertura route and the Settings › Admin row. Re-runnable.
Usage: python3 tools/curric/patch_curric.py index.html [--passcode NEW]"""
import sys, os, re, json, hashlib, subprocess
T = os.path.dirname(os.path.abspath(__file__)); p = sys.argv[1]; s = open(p, encoding="utf-8").read()
if "--passcode" in sys.argv:
    code = sys.argv[sys.argv.index("--passcode") + 1]
    json.dump({"hash": hashlib.sha256(("ruta-dele:" + code).encode()).hexdigest(), "note": "SHA-256 of \"ruta-dele:\" + passcode."}, open(os.path.join(T, "admin.json"), "w"), indent=1)
subprocess.run([sys.executable, os.path.join(T, "build_register.py")], check=True, capture_output=True)
reg = json.load(open(os.path.join(T, "register.json"), encoding="utf-8")); reg["admin_hash"] = json.load(open(os.path.join(T, "admin.json")))["hash"]
data = json.dumps(reg, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
js = open(os.path.join(T, "curric.js"), encoding="utf-8").read()
css = open(os.path.join(T, "curric.css"), encoding="utf-8").read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, ("anchor", a[:90], s.count(a)); s = s.replace(a, b)
# data
if 'id="curric-data"' in s: s = re.sub(r'(<script type="application/json" id="curric-data">)[\s\S]*?(</script>)', lambda m: m.group(1) + data + m.group(2), s, count=1)
else: rep('<script type="application/json" id="pv-registry">', '<script type="application/json" id="curric-data">' + data + '</script>\n<script type="application/json" id="pv-registry">')
# code
blk = "  /* ==CURRIC== */\n" + js.rstrip() + "\n  /* ==/CURRIC== */\n"
if "/* ==CURRIC== */" in s: s = re.sub(r"  /\* ==CURRIC== \*/\n[\s\S]*?  /\* ==/CURRIC== \*/\n", lambda m: blk, s, count=1)
else: rep("  // a page that throws while drawing must not leave a blank screen\n  function route() {", blk + "  // a page that throws while drawing must not leave a blank screen\n  function route() {")
# css
cblk = "/* ==CURRIC-CSS== */\n" + css.rstrip() + "\n/* ==/CURRIC-CSS== */\n"
if "/* ==CURRIC-CSS== */" in s: s = re.sub(r"/\* ==CURRIC-CSS== \*/\n[\s\S]*?/\* ==/CURRIC-CSS== \*/\n", lambda m: cblk, s, count=1)
else: rep("/* ==READABLE== */", cblk + "/* ==READABLE== */")
# route + settings row (once)
if "else if (/^cobertura" not in s:
    rep('    else if (h === "costes") { setSec("hoy"); navChips(null); costsView(); }', '    else if (h === "costes") { setSec("hoy"); navChips(null); costsView(); }\n    else if (/^cobertura(\\/[a-z-]+)?$/.test(h)) { setSec("hoy"); navChips(null); curricView(h.split("/")[1]); }')
if 'href: "#cobertura"' not in s:
    rep('      (app2.length ? uiGroup("App", app2) : "") +', '      (app2.length ? uiGroup("App", app2) : "") +\n      uiGroup("Admin", [uiRow({ ic: "res", t: crAdmin() ? "Curriculum coverage" : "Admin sign-in", sub: crAdmin() ? "DELE and CEFR coverage, gaps, exam alignment, quality scorecard and evidence reports" : "For course administrators: curriculum coverage and quality dashboard", href: "#cobertura" })]) +')
open(p, "w", encoding="utf-8").write(s); print("patched", p, "·", len(reg["outcomes"]), "outcomes")
