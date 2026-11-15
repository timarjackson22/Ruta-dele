"""Profe hands-free: capability registry (tools/profe_registry.py → JSON in the page), voice/text commands that drive the app's
own routes and buttons, "Ok Profe" (Android, on-device), tap-to-talk elsewhere, hands-free lessons, mic hardening for the
Speak tile (tools/PROFE_HANDSFREE_BRIEF.md)."""
import sys, json, subprocess, os
p = sys.argv[1]; s = open(p, encoding="utf-8").read()
if 'id="pv-registry"' in s: sys.exit("already patched")
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, ("anchor", a[:90], s.count(a)); s = s.replace(a, b)
TOOLS = "/home/claude/ruta-dele/tools"
reg = subprocess.run([sys.executable, os.path.join(TOOLS, "profe_registry.py")], capture_output=True, text=True, check=True).stdout
json.loads(reg)
rep('<script>window.__BUILD', '<script type="application/json" id="pv-registry">' + reg.replace("</", "<\\/") + '</script>\n<script>window.__BUILD')
js = open("/home/claude/app/pvoice.js", encoding="utf-8").read()
rep("  function route() {\n", js + "\n  function route() {\n")
# commands typed or said in Profe's chat run first; everything else goes to Profe as before
rep('''    text = String(text || "").trim(); if (!text) return;
    try { if (localTurn(text)) return; } catch (e) {}''', '''    text = String(text || "").trim(); if (!text) return;
    try { if (pvTry(text, byVoice)) return; } catch (e) {}
    try { if (localTurn(text)) return; } catch (e) {}''')
# the mic: nothing else holds the recogniser; a busy/aborted start is retried once, then explained (never a silent dead mic)
rep('''    if (!CAN_MIC) return;
    try { speechCut(); } catch (e) {}
    SPK_GEN++;''', '''    if (!CAN_MIC) return;
    try { hfAbort(); hfStopOthers(); } catch (e) {}
    try { speechCut(); } catch (e) {}
    SPK_GEN++;''')
rep('''    rec.onerror = (e) => { listening = false; if (heard && /no-speech|aborted|network/.test(e.error)) { uiVoice(); return; }''',
'''    rec.onerror = (e) => { listening = false; if (heard && /no-speech|aborted|network/.test(e.error)) { uiVoice(); return; }
      if (/aborted|busy|audio-capture/.test(e.error) && rec === me && !done) { done = true; clearTimeout(quiet);
        if (!opts._retry) { try { pvLog("mic " + e.error + ": trying again"); } catch (x) {} setTimeout(() => { if (!listening) listen0(onFinal, Object.assign({}, opts, { _retry: 1 })); }, 400); return; }
        liveText = "The microphone is busy: another app or feature may be using it. Tap the mic to try again (Profe › History & settings › Mic diagnostics shows details)."; paintLive(); uiVoice(); return; }''')
# hands-free: when the panel's follow-up listening ends in silence, go back to waiting for "Ok Profe"
rep('''      if (t && !done) { done = true; listening = false; try { me.abort(); } catch (e) {} uiVoice(); liveText = ""; paintLive(); onFinal(t); }
      else stopListening();''', '''      if (t && !done) { done = true; listening = false; try { me.abort(); } catch (e) {} uiVoice(); liveText = ""; paintLive(); onFinal(t); }
      else { stopListening(); try { if (HF.on && HF.engaged) hfEnd(); } catch (e) {} }''')
# Practice › Speak opens Profe already listening (voice chat), instead of only opening the panel
rep('''["speak", "Speak", "Hablar", "", "t-open", "#9b6bff", "#6a3fd8"]''', '''["speak", "Speak", "Hablar", "", "t-speak", "#9b6bff", "#6a3fd8"]''')
# settings: hands-free and mic diagnostics in Profe › History & settings
rep('''return '<div class="tscroll">' +''', '''return '<div class="tscroll">' + pvSettingsHTML() +''')
rep("</head>", '''<style>
#hfpill{position:fixed;left:12px;bottom:calc(var(--tabh,64px) + 18px + env(safe-area-inset-bottom));z-index:60;display:flex;align-items:center;gap:2px;background:var(--surface,#fff);border:1px solid var(--line,#ddd);border-radius:999px;box-shadow:0 4px 18px rgba(0,0,0,.14);padding:3px}
body.no-tabs #hfpill{bottom:calc(18px + env(safe-area-inset-bottom))}
#hfpill .hfmain{display:flex;align-items:center;gap:8px;border:0;background:none;padding:8px 12px;font:600 .9rem var(--body,inherit);color:var(--ink,#111);min-height:40px;cursor:pointer}
#hfpill .hfx{border:0;background:none;width:36px;height:36px;border-radius:50%;font-size:.8rem;color:var(--muted,#666);cursor:pointer}
#hfpill .hfdot{width:10px;height:10px;border-radius:50%;background:#9aa3ad;flex:none}
#hfpill[data-st=wake] .hfdot,#hfpill[data-st=starting] .hfdot{background:#2e9e6b}
#hfpill[data-st=listening] .hfdot{background:#e0452e;animation:hfpulse 1s infinite}
#hfpill[data-st=thinking] .hfdot{background:#e0a72e;animation:hfpulse 1.4s infinite}
#hfpill[data-st=speaking] .hfdot{background:#3f6fe0}
#hfpill[data-st=paused] .hfdot{background:#9aa3ad}
@keyframes hfpulse{50%{opacity:.35}}
@media (prefers-reduced-motion:reduce){#hfpill .hfdot{animation:none!important}}
body.tutor-open #hfpill{bottom:auto;top:calc(10px + env(safe-area-inset-top));left:auto;right:64px}
.pvset pre{white-space:pre-wrap;max-height:240px;overflow:auto;background:var(--chip,#f3f3f3);padding:8px;border-radius:8px}
.pvset{margin:4px 0 18px;padding:14px 14px 10px;border:1px solid var(--line,#dde);border-radius:16px;background:var(--surface,#fff);box-shadow:0 1px 3px rgba(0,0,0,.05)}
.pvhead{display:flex;align-items:center;gap:12px}.pvhead>div{flex:1;min-width:0}
.pvico{width:40px;height:40px;border-radius:12px;display:grid;place-items:center;background:var(--chip,#eef1f8);font-size:1.25rem;flex:none}
.pvset h3{margin:0;font:700 1.05rem/1.2 var(--body,inherit);display:flex;align-items:center;gap:8px}
.pvbeta{font:600 .68rem/1 var(--body,inherit);text-transform:uppercase;letter-spacing:.04em;padding:3px 6px;border-radius:6px;background:#fdf0d5;color:#8a5a00}
.pvst{display:block;font-size:.85rem;color:var(--muted,#667);margin-top:2px}.pvst[data-on=true]{color:#1f7a4f;font-weight:600}
.pvsw{flex:none;width:52px;height:32px;border-radius:999px;border:0;background:#c7ccd6;position:relative;cursor:pointer;transition:background .2s}
.pvsw i{position:absolute;top:3px;left:3px;width:26px;height:26px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.25);transition:transform .2s}
.pvsw[aria-checked=true]{background:#2e9e6b}.pvsw[aria-checked=true] i{transform:translateX(20px)}
.pvsw:focus-visible{outline:3px solid var(--accent,#1f4fa3);outline-offset:2px}
.pvintro{margin:10px 0 8px;line-height:1.45}
.pvrows{list-style:none;margin:6px 0;padding:0;border-top:1px solid var(--line,#e4e6ee)}
.pvrow{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--line,#e4e6ee)}
.pvi{width:24px;height:24px;border-radius:50%;flex:none;display:grid;place-items:center;font:700 .8rem/1 var(--body,inherit);background:#e3e6ec;color:#556}
.pvrow.ok .pvi{background:#dff3e8;color:#1f7a4f}.pvrow.warn .pvi{background:#fdecd2;color:#a05a00}
.pvl{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;font-size:.9rem}.pvv{font-size:.82rem;color:var(--muted,#667)}
.pvbar{display:inline-block;vertical-align:middle;width:90px;height:6px;border-radius:3px;background:#e3e6ec;overflow:hidden}.pvbar i{display:block;height:100%;background:#2e9e6b}
.pvchk{display:flex;gap:8px;align-items:flex-start;font-size:.85rem;margin:8px 0}
.pvtry{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:10px 0 6px}.pvq{padding:4px 9px;border-radius:999px;background:var(--chip,#eef1f8);font-size:.8rem}
.pvdiag{margin-top:6px}.pvdiag summary{cursor:pointer;font-size:.85rem;color:var(--muted,#667);padding:6px 0}
.ttabs{flex-wrap:nowrap!important;overflow-x:auto;scrollbar-width:none;gap:6px}.ttabs::-webkit-scrollbar{display:none}.ttabs .btn{flex:none;white-space:nowrap}
</style></head>''')
# hands-free speaks from any screen (speakMixed stays silent while the panel is closed, except for hands-free)
rep('''if (tp && tp.hidden && !document.getElementById("litem") && !(typeof PR !== "undefined" && PR)) { if (onDone) onDone(); return; } }''', '''if (tp && tp.hidden && !document.getElementById("litem") && !(typeof PR !== "undefined" && PR) && !window.__pvSayOK) { if (onDone) onDone(); return; } }''')
# Profe's header: a Hands-free button next to the tabs (easy to find; shows on/off)
rep('''["chat", "Chat"], ["practice", "Practice"], ["hist", "History & settings"]].map(([k, n]) => '<button class="btn small" data-act="t-tab" data-v="' + k + '" aria-pressed="' + (tView === k) + '">' + n + "</button>").join("");''',
    '''["chat", "Chat"], ["practice", "Practice"], ["hist", "History & settings"]].map(([k, n]) => '<button class="btn small" data-act="t-tab" data-v="' + k + '" aria-pressed="' + (tView === k) + '">' + n + "</button>").join("") + (() => { let on = false; try { on = HF.on; } catch (e) {} return CAN_MIC ? '<button class="btn small hfchip" data-act="hf-toggle" aria-pressed="' + on + '">🎙️ Hands-free ' + (on ? "on" : "off") + "</button>" : ""; })();''')
open(p, "w", encoding="utf-8").write(s)
print("pvoice ok")
