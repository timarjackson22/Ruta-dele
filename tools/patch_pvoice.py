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
rep('''body = settingsHTML()''', '''body = settingsHTML() + pvSettingsHTML()''')
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
</style></head>''')
# hands-free speaks from any screen (speakMixed stays silent while the panel is closed, except for hands-free)
rep('''if (tp && tp.hidden && !document.getElementById("litem") && !(typeof PR !== "undefined" && PR)) { if (onDone) onDone(); return; } }''', '''if (tp && tp.hidden && !document.getElementById("litem") && !(typeof PR !== "undefined" && PR) && !window.__pvSayOK) { if (onDone) onDone(); return; } }''')
# Profe's header: a Hands-free button next to the tabs (easy to find; shows on/off)
rep('''["chat", "Chat"], ["practice", "Practice"], ["hist", "History & settings"]].map(([k, n]) => '<button class="btn small" data-act="t-tab" data-v="' + k + '" aria-pressed="' + (tView === k) + '">' + n + "</button>").join("");''',
    '''["chat", "Chat"], ["practice", "Practice"], ["hist", "History & settings"]].map(([k, n]) => '<button class="btn small" data-act="t-tab" data-v="' + k + '" aria-pressed="' + (tView === k) + '">' + n + "</button>").join("") + (() => { let on = false; try { on = HF.on; } catch (e) {} return CAN_MIC ? '<button class="btn small hfchip" data-act="hf-toggle" aria-pressed="' + on + '">🎙️ Hands-free ' + (on ? "on" : "off") + "</button>" : ""; })();''')
open(p, "w", encoding="utf-8").write(s)
print("pvoice ok")
