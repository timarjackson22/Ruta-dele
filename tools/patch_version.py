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
  addEventListener("hashchange", () => { if (location.hash === "#ajustes") setTimeout(verFill, 30); });
  setTimeout(() => { if (location.hash === "#ajustes") verFill(); }, 400);
  function route() {\n''')
open(p, "w", encoding="utf-8").write(s)
print("version ok")
