"""Settings › App: the release number (v146), the build's date and time, and in the Android app its own version and update time."""
import sys
p = sys.argv[1]; s = open(p, encoding="utf-8").read()
if "ver-rel" in s: sys.exit("already patched")
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, ("anchor", a[:90], s.count(a)); s = s.replace(a, b)
rep('''<p class="small" style="margin:0">Version <b>' + esc(updDate(window.__BUILD)) + '</b></p>''',
    '''<p class="small" style="margin:0">Version <b id="ver-rel">' + esc(window.__REL ? "v" + window.__REL : "…") + '</b> · built <b>' + esc(updDate(window.__BUILD)) + '</b></p>' + (window.AndroidApp && window.AndroidApp.version ? '<p class="small muted" style="margin:4px 0 0" id="ver-apk"></p>' : "") + \'''')
rep('''  function route() {\n''', '''  // the release number comes from the published service worker (ruta-dele-vN); the Android app reports its own version
  function verFill() {
    const r = document.getElementById("ver-rel"); if (!r) return;
    const show = () => { const el = document.getElementById("ver-rel"); if (el && window.__REL) el.textContent = "v" + window.__REL; };
    if (window.__REL) show(); else fetch("sw.js", { cache: "no-store" }).then((x) => x.text()).then((t) => { const m = t.match(/ruta-dele-v(\\d+)/); if (m) { window.__REL = m[1]; show(); } else if (r) r.textContent = "—"; }).catch(() => { const el = document.getElementById("ver-rel"); if (el) el.textContent = "—"; });
    const a = document.getElementById("ver-apk");
    if (a) try { const v = JSON.parse(window.AndroidApp.version() || "{}"); if (v.name) a.textContent = "Android app " + v.name + (v.updated ? " · installed or updated " + new Date(v.updated).toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }) : ""); } catch (e) {}
  }
  // the Android app: is a newer version published? (GitHub's public release info; checked at start, at most every 4 hours, and in Settings)
  const APK_URL = "https://github.com/timarjackson22/Ruta-dele/releases/download/apk/ruta-dele.apk";
  function apkMine() { try { return JSON.parse(window.AndroidApp.version() || "{}"); } catch (e) { return {}; } }
  function apkCheck(force) {
    if (!(window.AndroidApp && window.AndroidApp.version)) return;
    let last = 0; try { last = +localStorage.getItem("ruta-apk-chk") || 0; } catch (e) {}
    if (!force && Date.now() - last < 4 * 3600e3) { apkShow(); return; }
    fetch("https://api.github.com/repos/timarjackson22/Ruta-dele/releases/tags/apk", { cache: "no-store" }).then((r) => r.json()).then((j) => {
      const a = (j.assets || []).find((x) => /\.apk$/.test(x.name)); if (!a) return;
      try { localStorage.setItem("ruta-apk-chk", String(Date.now())); localStorage.setItem("ruta-apk-pub", a.updated_at); } catch (e) {}
      apkShow();
    }).catch(() => {});
  }
  // newer when the published app was built more than 10 minutes after this one was installed
  function apkNewer() { let pub = ""; try { pub = localStorage.getItem("ruta-apk-pub") || ""; } catch (e) {} const mine = apkMine(); return pub && mine.updated && Date.parse(pub) > mine.updated + 10 * 60e3 ? pub : ""; }
  function apkShow() {
    const pub = apkNewer(), when = pub ? new Date(pub).toLocaleString(undefined, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : "";
    const v = document.getElementById("ver-apk"); if (v && pub && !document.getElementById("ver-apk-up")) v.insertAdjacentHTML("afterend", '<p class="small" id="ver-apk-up" style="margin:6px 0 0"><b>A newer Android app is ready</b> (' + esc(when) + '). <a class="btn small primary" href="' + APK_URL + '" target="_blank" rel="noopener">Download update</a></p>');
    let dis = ""; try { dis = localStorage.getItem("ruta-apk-dis") || ""; } catch (e) {}
    let b = document.getElementById("apk-upd");
    if (!pub || dis === pub) { if (b) b.remove(); return; }
    if (!b) { b = document.createElement("div"); b.id = "apk-upd"; b.setAttribute("role", "status"); document.body.appendChild(b); }
    b.innerHTML = '<span>📲 A new version of the Ruta DELE app is ready (' + esc(when) + ').</span> <a class="btn small primary" href="' + APK_URL + '" target="_blank" rel="noopener">Download</a> <button class="btn small" data-act="apk-later" aria-label="Remind me later">Later</button>';
  }
  document.addEventListener("click", (e) => { const t = e.target.closest && e.target.closest('[data-act="apk-later"]'); if (!t) return; try { localStorage.setItem("ruta-apk-dis", apkNewer()); } catch (x) {} const b = document.getElementById("apk-upd"); if (b) b.remove(); });
  setTimeout(() => apkCheck(false), 2500); document.addEventListener("visibilitychange", () => { if (!document.hidden) apkCheck(false); });
  addEventListener("hashchange", () => { if (location.hash === "#ajustes") setTimeout(() => { verFill(); apkCheck(true); }, 30); });
  setTimeout(() => { if (location.hash === "#ajustes") { verFill(); apkCheck(true); } }, 400);
  function route() {\n''')
rep("</head>", '''<style>#apk-upd{position:fixed;left:12px;right:12px;bottom:calc(var(--tabh,64px) + 78px + env(safe-area-inset-bottom));z-index:70;display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:10px 12px;border-radius:14px;background:var(--surface,#fff);border:1px solid var(--line,#ddd);box-shadow:0 6px 22px rgba(0,0,0,.16);font-size:.9rem}#apk-upd span{flex:1 1 180px}</style></head>''')
open(p, "w", encoding="utf-8").write(s)
print("version ok")
