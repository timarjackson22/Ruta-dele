# Round 6, stability: a page that fails to draw shows a message instead of a blank screen; restarts while you were
# using the app are logged and bring you back where you were; the screen stays on while a video plays or a practice runs.
import sys
P = sys.argv[1] if len(sys.argv) > 1 else "index.html"
s = open(P, encoding="utf-8").read()
def rep(a, b):
    global s
    assert s.count(a) == 1, (s.count(a), a[:100]); s = s.replace(a, b)
rep("  function route() {\n    const h = location.hash.replace(/^#/, \"\");\n    const m = h.match(",
    """  // a page that throws while drawing must not leave a blank screen
  function route() {
    try { route0(); }
    catch (e) {
      try { pvLog("page error on " + location.hash + ": " + (e && e.message)); } catch (x) {}
      try { (S.pageErr = S.pageErr || []).push({ t: Date.now(), h: location.hash, m: String(e && e.message).slice(0, 160) }); S.pageErr = S.pageErr.slice(-20); save(); } catch (x) {}
      app.innerHTML = '<div class="stack"><h1>This page didn’t open</h1><p class="muted">Something went wrong drawing it. Your progress is safe.</p><p class="small muted">' + esc(String(e && e.message || e)) + '</p><div class="row"><button class="btn primary" onclick="location.reload()">Try again</button><a class="btn" href="#hoy">Home</a></div></div>';
    }
  }
  function route0() {
    const h = location.hash.replace(/^#/, "");
    const m = h.match(""")
rep("""    try { if (voiceMode || listening) return true; } catch (e) {}
    return false;
  }""", """    try { if (voiceMode || listening) return true; } catch (e) {}
    try { if (VP.p && VP.ready && VP.p.getPlayerState && VP.p.getPlayerState() === 1) return true; } catch (e) {} // a video playing: no screen timeout mid-scene
    try { if (PR && document.body.classList.contains("tutor-open") && tView === "practice") return true; } catch (e) {} // a practice in progress: reading the correction isn't "idle"
    return false;
  }""")
# restart detector: the page beats every 5 s while visible; a restart without a clean exit while you were using it is logged
rep("""  setTimeout(() => apkCheck(false), 2500);""", """  (function liveBeat() {
    const K = "rd-live"; let prev = null; try { prev = JSON.parse(localStorage.getItem(K) || "null"); } catch (e) {}
    const now = Date.now(), beat = (clean) => { try { localStorage.setItem(K, JSON.stringify({ t: Date.now(), h: location.hash, clean: !!clean, b: window.__BUILD || "" })); } catch (e) {} };
    if (prev && !prev.clean && now - prev.t < 10 * 60000) {
      try { pvLog("restart: the app stopped while in use (last beat " + Math.round((now - prev.t) / 1000) + " s ago, on " + (prev.h || "home") + ", build " + prev.b + ")"); } catch (e) {}
      try { (S.restarts = S.restarts || []).push({ t: now, h: prev.h || "", ago: now - prev.t }); S.restarts = S.restarts.slice(-30); save(); } catch (e) {}
      // back where you were (not into a running drill or recording: just the page)
      if (prev.h && (!location.hash || location.hash === "#hoy" || location.hash === "#inicio") && now - prev.t < 3 * 60000 && !/^#(drill)$/.test(prev.h)) setTimeout(() => { if (!location.hash || /^#(hoy|inicio)$/.test(location.hash)) { location.hash = prev.h; try { coachToast("Ruta DELE restarted · back where you were"); } catch (e) {} } }, 900);
    }
    beat(false); setInterval(() => { if (!document.hidden) beat(false); }, 5000);
    document.addEventListener("visibilitychange", () => beat(document.hidden));
    addEventListener("pagehide", () => beat(true)); addEventListener("beforeunload", () => beat(true));
  })();
  setTimeout(() => apkCheck(false), 2500);""")
open(P, "w", encoding="utf-8").write(s); print("ok")

# English caption lines: a stuck or failed translation is retried (it used to block that line until the next sentence)
s = open(P, encoding="utf-8").read()
rep("""for (let i = Math.max(0, k); i < Math.min(VCAP.cues.length, k + 4); i++) { const c = VCAP.cues[i]; if (c.en || c.enBusy) continue; c.enBusy = 1; const id = VCAP.id;""",
    """for (let i = Math.max(0, k); i < Math.min(VCAP.cues.length, k + 4); i++) { const c = VCAP.cues[i]; if (c.en || (c.enBusy && Date.now() - c.enBusy < 3000)) continue; c.enBusy = Date.now(); const id = VCAP.id;""")
rep("""      if (vcPref().en || window.AndroidTR) vcFillEn(k); // the sentence's English is also Verbatim's context
    }""", """      if (vcPref().en || window.AndroidTR) vcFillEn(k); // the sentence's English is also Verbatim's context
    } else if (k >= 0 && (vcPref().en || window.AndroidTR) && Date.now() - (VCAP.enTry || 0) > 1000 && (!VCAP.cues[k].en || (VCAP.cues[k + 1] && !VCAP.cues[k + 1].en))) { VCAP.enTry = Date.now(); vcFillEn(k); } // still missing: try again""")
open(P, "w", encoding="utf-8").write(s); print("en retry ok")
