# Round 6 (15 Nov): practice waits for Next, back/next bar, session history; vocab drill waits too.
import sys
P = sys.argv[1] if len(sys.argv) > 1 else "index.html"
s = open(P, encoding="utf-8").read()
def rep(a, b):
    global s
    assert s.count(a) == 1, (s.count(a), a[:100]); s = s.replace(a, b)
rep('    else if (act === "ad-skip") adSkip();', '    else if (act === "ad-skip") adSkip();\n    else if (act === "ad-back") adBack();\n    else if (act === "ad-fwd") adFwd();')
rep('else if (act === "pr-exit") { window.__sttOver = null; PR = null;', 'else if (act === "pr-exit") { window.__sttOver = null; if (PR && (PR.kind === "tr" || PR.kind === "cj")) adHistEnd(); PR = null;')
rep('    const pf = document.getElementById("pr-form"); if (pf) pf.addEventListener("submit",', '    if (typeof PR !== "undefined" && PR && (PR.kind === "tr" || PR.kind === "cj")) try { adScroll(); } catch (e) {}\n    try { uiVoice(); } catch (e) {}\n    const pf = document.getElementById("pr-form"); if (pf) pf.addEventListener("submit",')
# vocabulary / old drills: no auto-advance; "next" by voice moves on
rep("const at = PR.i; tRender(); speakMixed(pes.replace(/[^\\p{L}\\p{P}\\s]/gu, \"\").trim() + \" \" + full, () => { setTimeout(() => { if (PR && PR.i === at && PR.fb && !PR.fb.retry) prNext(); }, 700); });",
    "const at = PR.i; tRender(); speakMixed(pes.replace(/[^\\p{L}\\p{P}\\s]/gu, \"\").trim() + \" \" + full, () => { if (PR && PR.i === at && PR.fb && !PR.fb.retry && PR.autoMic && CAN_MIC) listen(prAnswer); }); // waits for Next: time to read the correction")
rep("      if ((PR.fb && !PR.fb.retry) || PR.done) return;", "      if (PR.fb && !PR.fb.retry && !PR.done && /^(next|siguiente|otra|vale|ok|skip|pasa)\\b/i.test(said.trim())) return prNext();\n      if ((PR.fb && !PR.fb.retry) || PR.done) return;")
rep('.adask { border-color: var(--cobalt) }', '.adask { border-color: var(--cobalt) } .adhist .adh { opacity: .92; margin-bottom: 8px } .adhist .adh.adsel { outline: 3px solid var(--cobalt); opacity: 1 } .adnow { text-transform: uppercase; letter-spacing: .08em; margin: 10px 0 4px; border-top: 1px dashed var(--line); padding-top: 6px } .adnav { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 6px 14px; border-top: 1px solid var(--line); background: var(--card) }')
open(P, "w", encoding="utf-8").write(s); print("ok")

# ===== video page =====
s = open(P, encoding="utf-8").read()
# 1. a bottom controller: back 5 s, replay, play/pause, speed, ▾ more (Verbatim, English, Just listen, captions from the audio)
rep("""      '<div class="vctl"><button class="btn small" data-act="v-back5" aria-label="Back 5 seconds">' + IC("back") + ' 5 s</button><button class="btn small" data-act="v-loop" aria-pressed="false" aria-label="Replay sentence" title="Replay sentence">' + IC("repeat") + ' Replay</button><button class="btn small" data-act="v-rate" aria-pressed="false" aria-label="Playback speed">Speed 1×</button></div>' +""",
    """      (() => { const P = vcPref(); return '<div class="vctl vbar" id="vbar"><button class="btn small" data-act="v-back5" aria-label="Back 5 seconds">' + IC("back") + ' 5 s</button><button class="btn small" data-act="v-loop" aria-pressed="false" aria-label="Replay sentence" title="Replay sentence">' + IC("repeat") + ' Replay</button><button class="btn small vplaybtn" data-act="v-play" aria-label="Play or pause">' + IC("play") + '</button><button class="btn small" data-act="v-rate" aria-pressed="false" aria-label="Playback speed">Speed 1×</button>' +
        '<button class="btn small vmorebtn" data-act="v-more" aria-label="More options" aria-expanded="false" aria-controls="vmenu"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 15 6-6 6 6"/></svg></button>' +
        '<div class="vmenu vcap-tg" id="vmenu"><button class="btn small" data-act="vc-cue" aria-pressed="' + cueOn() + '" title="Verbatim: live word-by-word translation">Verbatim</button><button class="btn small" data-act="vc-en" aria-pressed="' + !!P.en + '">English</button><button class="btn small" data-act="vc-hide" aria-pressed="' + !!P.hide + '">Just listen</button><span id="vmenu-x"></span></div></div>'; })() +""")
rep("""    return '<section class="vcapw" id="vcapw" aria-label="Captions"><div class="vcap-head"><span class="vcap-tg"><button class="btn small" data-act="vc-cue" aria-pressed="' + cueOn() + '" title="Verbatim: live word-by-word translation">Verbatim</button><button class="btn small" data-act="vc-en" aria-pressed="' + !!P.en + '">English</button><button class="btn small" data-act="vc-hide" aria-pressed="' + !!P.hide + '">Just listen</button></span></div>' +""",
    """    return '<section class="vcapw" id="vcapw" aria-label="Captions">' +""")
# 2. the note under the captions: only the informal-word key (same style as the words), lyrics sync controls for songs;
#    the source line and the playback report are hidden; "captions from the audio" moves into the ▾ menu
rep("""    const n = document.getElementById("vcap-note"); if (n) n.innerHTML = '<span class="vkey"><i aria-hidden="true"></i>Informal word</span> ' + (VCAP.kind === "lyrics" ? vlNote() : "") + esc(""",
    """    const n = document.getElementById("vcap-note"); if (n) n.innerHTML = '<span class="vkey"><span class="vword vinf" aria-hidden="true">palabra</span> = informal word</span> ' + (VCAP.kind === "lyrics" ? vlNote() : "") + '<span class="vsrc" hidden>' + esc(""")
rep("""      (vaOk() && VCAP.kind !== "manual" && VCAP.kind !== "lyrics" ? ' <button class="lnk" data-act="' + (VCAP.kind === "audio" ? "va-redo" : "va-start") + '">' + (VCAP.kind === "audio" ? "Make them again from the audio" : "Make captions from the audio instead") + "</button>" : "") + ' <button class="lnk" data-act="v-report">Report a playback problem</button>';""",
    """      "</span>" + ' <button class="lnk" data-act="v-report" hidden>Report a playback problem</button>';
    const mx = document.getElementById("vmenu-x"); if (mx) mx.innerHTML = vaOk() && VCAP.kind !== "manual" && VCAP.kind !== "lyrics" ? '<button class="btn small" data-act="' + (VCAP.kind === "audio" ? "va-redo" : "va-start") + '">' + (VCAP.kind === "audio" ? "Remake captions from the audio" : "Captions from the audio") + "</button>" : "";""")
# play/pause and the menu
rep("""    if (a === "v-back5") vpSeek(vpT() - 5);""",
    """    if (a === "v-back5") vpSeek(vpT() - 5);
    else if (a === "v-play") { let st = -1; try { st = VP.p.getPlayerState(); } catch (x) {} if (st === 1) vpPause(); else vpPlay(); }
    else if (a === "v-more") { const b = document.getElementById("vbar"); const on = b.classList.toggle("more"); t.setAttribute("aria-expanded", String(on)); }""")
# play button shows play/pause
rep("""  function vpStop() {""", """  setInterval(() => { const b = document.querySelector(".vplaybtn"); if (!b || !VP.p) return; let st = -1; try { st = VP.p.getPlayerState(); } catch (e) {} const want = st === 1 ? "pause" : "play"; if (b.dataset.ic !== want) { b.dataset.ic = want; b.innerHTML = want === "pause" ? '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>' : IC("play"); } }, 500);
  function vpStop() {""")
# 3. captions: the current and the next sentence fully clear (Spanish and English); only lines already said fade
rep(""".vcue { display: flex; gap: 10px; align-items: flex-start; margin: 0 0 1.25em; opacity: .55; transition: opacity .4s }
.vcue.on { opacity: 1 } .vcue.past { opacity: .28 }""",
    """.vcue { display: flex; gap: 10px; align-items: flex-start; margin: 0 0 1.25em; opacity: .55; transition: opacity .4s }
.vcue.on { opacity: 1 } .vcue.past { opacity: .28 } .vcue.on + .vcue { opacity: 1 }
.vcue.on .ven, .vcue.on + .vcue .ven { color: color-mix(in srgb, var(--ink) 78%, var(--surface)) }""")
rep("""  -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 11%, #000 84%, transparent 100%); mask-image: linear-gradient(to bottom, transparent 0, #000 11%, #000 84%, transparent 100%) }""",
    """  -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 9%, #000 100%); mask-image: linear-gradient(to bottom, transparent 0, #000 9%, #000 100%) }""")
# the informal key is drawn exactly like an informal word in the captions
rep(""".vword.vinf { color: var(--vinf); font-weight: 600; text-decoration: underline dotted; text-underline-offset: 3px }""",
    """.vword.vinf, .vword.vinf * { color: var(--vinf) !important; font-weight: 600; text-decoration: underline dotted; text-underline-offset: 3px }
.vkey .vword.vinf { font-size: 13.5px; cursor: default }""")
# bar layout: fixed at the bottom of the video page (above the menu handle), options drop up
rep(""".vcatch { background: var(--surface); border: 1px solid var(--line); border-radius: 14px; padding: 12px }""",
    """.vcatch { background: var(--surface); border: 1px solid var(--line); border-radius: 14px; padding: 12px }
.vbar { position: fixed; left: 10px; right: 10px; bottom: calc(34px + env(safe-area-inset-bottom, 0px)); z-index: 12; display: flex; flex-wrap: nowrap; gap: 6px; align-items: center; justify-content: space-between; max-width: 760px; margin: 0 auto; padding: 8px 10px; border-radius: 14px; border: 1px solid var(--line); background: var(--surface); box-shadow: 0 6px 22px rgba(0, 0, 0, .16) }
.vbar .vmorebtn svg { transition: transform .25s } .vbar.more .vmorebtn svg { transform: rotate(180deg) }
.vbar .vmenu { display: none; position: absolute; right: 8px; bottom: calc(100% + 8px); flex-direction: column; align-items: stretch; gap: 8px; min-width: 190px; padding: 10px; border-radius: 14px; border: 1px solid var(--line); background: var(--surface); box-shadow: 0 10px 28px rgba(0, 0, 0, .18) }
.vbar.more .vmenu { display: flex } .vbar .vmenu .btn { justify-content: center } #vmenu-x:empty { display: none } #vmenu-x .btn { width: 100% }
body.vpage-on .vpage { padding-bottom: 96px }""")
rep(""".vcap { position: relative; height: clamp(190px, calc(100svh - 56vw - 210px), 360px);""", """.vcap { position: relative; height: clamp(220px, calc(100svh - 56vw - 150px), 460px);""")

# ===== videos list: My videos, then Music, then the other sections collapsed (your choice remembered) =====
rep("""    if (!F.c) list = (mine.length ? '<h2 class="ghead">My videos</h2><div class="vgrid">' + mine.map((v) => card(v)).join("") + "</div>" : "") + VCATS.map(([c, en, es]) => { const xs = lib.filter((v) => v.cat === c); return xs.length ? '<h2 class="ghead">' + en + ' <span class="es">(' + es + ")</span></h2>" + '<div class="vgrid">' + xs.map((v) => card(v)).join("") + "</div>" : ""; }).join("");""",
    """    const VOPEN = (S.vopen = S.vopen || {}), isOpen = (c) => (c in VOPEN ? VOPEN[c] : c === "musica" || c === "mine");
    const sec = (c, title, xs) => '<details class="vsec" data-c="' + c + '"' + (isOpen(c) ? " open" : "") + '><summary class="ghead">' + title + ' <span class="vsec-n">' + xs.length + "</span></summary>" + '<div class="vgrid">' + xs.map((v) => card(v)).join("") + "</div></details>";
    const order = VCATS.filter((x) => x[0] === "musica").concat(VCATS.filter((x) => x[0] !== "musica"));
    if (!F.c) list = (mine.length ? sec("mine", "My videos", mine) : "") + order.map(([c, en, es]) => { const xs = lib.filter((v) => v.cat === c); return xs.length ? sec(c, en + ' <span class="es">(' + es + ")</span>", xs) : ""; }).join("");""")
rep("""    else if (a === "v-showhid") VP.showHid = !t.parentElement.open;""", """    else if (a === "v-showhid") VP.showHid = !t.parentElement.open;""")
rep("""  document.addEventListener("submit", (e) => {
    if (e.target.id !== "vadd") return;""", """  document.addEventListener("toggle", (e) => { const d = e.target; if (!d || !d.classList || !d.classList.contains("vsec")) return; S.vopen = S.vopen || {}; S.vopen[d.dataset.c] = d.open; save(); }, true);
  document.addEventListener("submit", (e) => {
    if (e.target.id !== "vadd") return;""")
rep(""".vcatch { background: var(--surface);""", """.vsec > summary { cursor: pointer; list-style: none; display: flex; align-items: center; gap: 8px } .vsec > summary::-webkit-details-marker { display: none } .vsec > summary::after { content: "▾"; margin-left: auto; transition: transform .2s; color: var(--muted) } .vsec:not([open]) > summary::after { transform: rotate(-90deg) } .vsec-n { font-size: 12px; font-weight: 600; color: var(--muted); background: var(--surface-2, rgba(0,0,0,.05)); border-radius: 999px; padding: 1px 8px }
.vcatch { background: var(--surface);""")
open(P, "w", encoding="utf-8").write(s); print("video ok")
# (16:33) End session + practice switcher in the drill header: wired directly in index.html; see tools/adaptive.js adEnd()
