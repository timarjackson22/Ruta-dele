# (16:38) Replay loops the previous + current line until switched off. (16:41) Song-lyrics source and sync buttons move
# off the page into the ▾ menu (source kept hidden for assistive tech/tests); every informal word looks the same.
import sys
P = sys.argv[1] if len(sys.argv) > 1 else "index.html"
s = open(P, encoding="utf-8").read()
def rep(a, b):
    global s
    assert s.count(a) == 1, (s.count(a), a[:100]); s = s.replace(a, b)
rep("""    else if (a === "v-loop") { VP.loop = null; const n = vpT(), k = VCAP.cues.length ? vcFind(n) : -1; const from = k >= 0 ? VCAP.cues[Math.max(0, k - 1)].s - 0.15 : n - 8; vpSeek(Math.max(vpLo(), from)); vpPlay(); }""",
    """    else if (a === "v-loop") { // on: replay the previous line and the current one, again and again, until it's switched off
      if (VP.loop) { VP.loop = null; t.setAttribute("aria-pressed", "false"); return; }
      const n = vpT(), k = VCAP.cues.length ? vcFind(n) : -1, cur = k >= 0 ? VCAP.cues[k] : null, prev = k >= 0 ? VCAP.cues[Math.max(0, k - 1)] : null;
      VP.loop = cur ? { a: Math.max(vpLo(), prev.s - 0.15), b: (cur.e || (VCAP.cues[k + 1] ? VCAP.cues[k + 1].s : cur.s + 4)) + 0.1 } : { a: Math.max(vpLo(), n - 8), b: n + 0.3 };
      vpSeek(VP.loop.a); vpPlay(); t.setAttribute("aria-pressed", "true"); }""")
rep("""(VCAP.kind === "lyrics" ? vlNote() : "") + '<span class="vsrc" hidden>' + esc(""", """'<span class="vsrc" hidden>' + (VCAP.kind === "lyrics" ? vlNote() : "") + esc(""")
rep("""    const mx = document.getElementById("vmenu-x"); if (mx) mx.innerHTML = vaOk() && VCAP.kind !== "manual" && VCAP.kind !== "lyrics" ?""",
    """    const mx = document.getElementById("vmenu-x"); if (mx) mx.innerHTML = VCAP.kind === "lyrics" ? vlMenu() : vaOk() && VCAP.kind !== "manual" ?""")
rep("""  function vlNote() {""", """  // the lyric sync buttons live in the ▾ menu of the video controller
  function vlMenu() { const x = vlGet(VCAP.id) || {}, failed = VL.failed === VCAP.id, auto = vaOk() && !failed;
    return (VL.sync ? '<span class="vlnow small">Syncing…</span>' : auto ? '<button class="btn small" data-act="vl-auto">' + (x.synced ? "Sync lyrics again" : "Sync lyrics with the video") + "</button>" : '<button class="btn small" data-act="vl-tap">Tap when the singing starts</button>') + '<button class="btn small" data-act="vl-off">Wrong song?</button>'; }
  function vlNote() {""")
rep("""#vmenu-x:empty { display: none } #vmenu-x .btn { width: 100% }""", """#vmenu-x:empty { display: none } #vmenu-x { display: flex; flex-direction: column; gap: 8px } #vmenu-x .btn { width: 100%; justify-content: center }""")
# one look for every informal word (no dashed variant)
rep(""".vword.vinf-jargon { text-decoration-style: dashed }""", """.vword.vinf-jargon { text-decoration-style: dotted }""")
open(P, "w", encoding="utf-8").write(s); print("ok")
# vlNote: source text only (the buttons are in vlMenu)
