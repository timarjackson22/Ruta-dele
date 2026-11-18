"""Profe video call (v228): embeds tools/vcall.js and tools/vcall.css and wires the call into Profe.
Re-runnable. Usage: python3 tools/patch_vcall.py index.html"""
import sys, os, re
T = os.path.dirname(os.path.abspath(__file__)); p = sys.argv[1]; s = open(p, encoding="utf-8").read()
js = open(os.path.join(T, "vcall.js"), encoding="utf-8").read(); css = open(os.path.join(T, "vcall.css"), encoding="utf-8").read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, ("anchor", a[:90], s.count(a)); s = s.replace(a, b)
blk = "  /* ==VCALL== */\n" + js.rstrip() + "\n  /* ==/VCALL== */\n"
if "/* ==VCALL== */" in s: s = re.sub(r"  /\* ==VCALL== \*/\n[\s\S]*?  /\* ==/VCALL== \*/\n", lambda m: blk, s, count=1)
else: rep("  // a page that throws while drawing must not leave a blank screen\n  function route() {", blk + "  // a page that throws while drawing must not leave a blank screen\n  function route() {")
cb = css.rstrip() + "\n"
if "/* ==VCALL-CSS (v228)==" in s: s = re.sub(r"/\* ==VCALL-CSS \(v228\)==[\s\S]*?/\* ==/VCALL-CSS== \*/\n", lambda m: cb, s, count=1)
else: k = s.rfind("</style>"); s = s[:k] + cb + s[k:]
# the call button beside Practice in Profe's header
if "window.__vcBtn" not in s.split("/* ==VCALL== */")[0]:
    rep('''    const tabs = '<div class="tseg tseg1" role="group" aria-label="Profe">' +''', '''    const tabs = '<div class="tseg tseg1" role="group" aria-label="Profe">' + (window.__vcBtn ? window.__vcBtn() : "") +''')
# during a call, the chat's own "listen again after Profe speaks" stays off: the call runs the turns
if "window.__vcOn) return; // the call" not in s:
    rep('''  function autoAgain() {
''', '''  function autoAgain() {
    if (window.__vcOn) return; // the call runs the turns
''')
    rep('''  function afterSpeech() {
''', '''  function afterSpeech() {
    if (window.__vcOn) return; // the call runs the turns
''')
# during a call the call owns the mic: the chat's own listening (e.g. waiting for "which one?") goes through the call's turns
if "if (window.__vcOn) return; // the call owns the mic" not in s:
    rep('''  function listen(onFinal, opts) { if (IS_IOS && !MIC_OK)''', '''  function listen(onFinal, opts) { if (window.__vcOn) return; // the call owns the mic
    if (IS_IOS && !MIC_OK)''')
    rep('''  function hfCapture(done, o) {
''', '''  function hfCapture(done, o) {
    if (window.__vcOn) { done(null); return; } // the call owns the mic
''')
# Profe's voice stays on during a call even if the Profe panel itself is closed
if "&& !window.__pvSayOK && !window.__vcOn)" not in s:
    rep('''if (tp && tp.hidden && !document.getElementById("litem") && !(typeof PR !== "undefined" && PR) && !window.__pvSayOK) { if (onDone) onDone(); return; } }''', '''if (tp && tp.hidden && !document.getElementById("litem") && !(typeof PR !== "undefined" && PR) && !window.__pvSayOK && !window.__vcOn) { if (onDone) onDone(); return; } }''')
# call preferences and the learner's instructions go into Profe's prompt
if "window.__vcNote ?" not in s:
    rep('''  function rules(ctx, compact) { return rules0(ctx, compact) + (compact ? TASK_RULES_SHORT : TASK_RULES_FULL) + taskNote(false) + turnNote() + teachNote(); }''',
        '''  function rules(ctx, compact) { return rules0(ctx, compact) + (compact ? TASK_RULES_SHORT : TASK_RULES_FULL) + taskNote(false) + turnNote() + teachNote() + (window.__vcNote ? window.__vcNote() : ""); }''')
# the call's speed applies to everything Profe says during the call
if "window.__vcOn ? (window.__vcRate" not in s:
    rep('''    let r = rate || 0.92; if (vv && !isNatural(vv) && r > 0.9) r -= 0.04;''', '''    let r = (rate || 0.92) * (window.__vcOn ? (window.__vcRate || 1) : 1); if (vv && !isNatural(vv) && r > 0.9) r -= 0.04;''')
open(p, "w", encoding="utf-8").write(s)
print("patched", p)
