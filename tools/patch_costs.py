"""Service gaps & costs dashboard (requested 15 Nov 2026): Settings › Planning › "Service gaps & costs" (Android app), route #costes.
Data: tools/costs/gaps.json (prices, sources, assumptions, impact scores) → tools/costs/model.py → costs.json, embedded by tools/sync_profe.py
as <script id="cost-data">. Usage: python3 tools/patch_costs.py index.html"""
import sys
p = sys.argv[1]; s = open(p, encoding="utf-8").read()
if "function costsView(" in s: sys.exit("already patched")
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, ("anchor", a[:90], s.count(a)); s = s.replace(a, b)
rep('''    else if (h === "ajustes") { setSec("hoy"); navChips(null); settingsView(); }''', '''    else if (h === "ajustes") { setSec("hoy"); navChips(null); settingsView(); }
    else if (h === "costes") { setSec("hoy"); navChips(null); costsView(); }''')
rep('''      (app2.length ? uiGroup("App", app2) : "") +''', '''      (app2.length ? uiGroup("App", app2) : "") +
      (window.AndroidApp ? uiGroup("Planning", [uiRow({ ic: "res", t: "Service gaps & costs", sub: "What the free services hold back, the paid alternatives, their impact and yearly cost from testing to 100,000 users", href: "#costes" })]) : "") +''')
rep('''  function route() {''', r'''  /* ---------- service gaps & costs dashboard (tools/patch_costs.py, data from tools/costs) ---------- */
  const CST = { st: "test" };
  function costsView() {
    let D = null; try { D = JSON.parse(document.getElementById("cost-data").textContent.replace(/<\\\//g, "</")); } catch (e) {}
    if (!D) { app.innerHTML = '<div class="ui-page">' + uiTitle("Service gaps & costs") + '<p class="callout">The cost data isn\'t in this build.</p></div>'; return; }
    const st = D.stages.some((x) => x[0] === CST.st) ? CST.st : D.stages[0][0], stName = (D.stages.find((x) => x[0] === st) || [])[1];
    const usd = (v) => v == null ? "quote" : v >= 1e6 ? "$" + (v / 1e6).toFixed(v >= 1e7 ? 1 : 2) + "M" : v >= 1e4 ? "$" + Math.round(v / 1e3) + "k" : v >= 1000 ? "$" + (v / 1e3).toFixed(1) + "k" : "$" + Math.round(v).toLocaleString("en");
    const TN = { cheap: "Cheap", modest: "Modest", best: "Best in class" }, mx = D.metrics;
    const chips = '<div class="cst-chips" role="group" aria-label="Number of users">' + D.stages.map(([id, n, u]) => '<button type="button" class="vchip" data-act="cst-st" data-v="' + id + '" aria-pressed="' + (id === st) + '">' + n + ' <span class="muted">· ' + Number(u).toLocaleString("en") + "</span></button>").join("") + "</div>";
    const maxT = Math.max(...Object.values(D.totals).map((t) => t[st].sum), 1);
    const sum = '<div class="cst-sum">' + Object.keys(TN).map((t) => { const x = D.totals[t][st]; return '<div class="cst-tot cst-' + t + '"><p class="cst-tn">' + TN[t] + '</p><p class="cst-big">' + usd(x.sum) + (x.quotes ? '<span class="cst-q"> + ' + x.quotes + " quote" + (x.quotes > 1 ? "s" : "") + "</span>" : "") + '</p><p class="muted small">a year · ' + (x.per_mau != null ? usd(x.per_mau) + " per active learner" : "") + '</p><i class="cst-bar" style="width:' + Math.max(2, Math.round((x.sum / maxT) * 100)) + '%"></i></div>'; }).join("") + "</div>";
    // the three tiers' totals across every stage, as bars (log-ish scale would hide the jump, so linear per stage)
    const trend = '<details class="cst-trend"><summary>Totals at every stage</summary><table class="cst-tbl"><thead><tr><th>Users</th>' + Object.keys(TN).map((t) => "<th>" + TN[t] + "</th>").join("") + "</tr></thead><tbody>" + D.stages.map(([id, n, u]) => "<tr><td>" + n + ' <span class="muted small">' + Number(u).toLocaleString("en") + "</span></td>" + Object.keys(TN).map((t) => { const x = D.totals[t][id]; return "<td>" + usd(x.sum) + (x.quotes ? '<span class="cst-q">+q</span>' : "") + "</td>"; }).join("") + "</tr>").join("") + "</tbody></table></details>";
    const dots = (v) => '<span class="cst-imp" aria-label="' + v + ' out of 10"><i style="width:' + v * 10 + '%"></i></span><b class="cst-iv">' + v + "</b>";
    const gaps = D.gaps.map((g) => '<section class="cst-gap"><h2>' + esc(g.name) + '</h2><p class="small"><b>Today:</b> ' + esc(g.today) + '</p><p class="small"><b>Gap:</b> ' + esc(g.gap) + '</p><p class="muted small"><b>Cost is set by:</b> ' + esc(g.driver) + "</p>" +
      g.tiers.map((t) => '<div class="cst-tier cst-' + t.t + '"><div class="cst-th"><span class="cst-tag">' + TN[t.t] + '</span><b>' + esc(t.name) + '</b></div><p class="muted small">' + esc(t.unit) + (t.src ? ' · <a href="' + esc(t.src) + '" target="_blank" rel="noopener">source</a>' : "") + '</p>' +
        '<p class="cst-yr">' + (t.quote ? "Price on request" : (t.from ? "from " : "") + usd(t.year[st]) + ' <span class="muted small">a year at ' + esc(stName) + "</span>") + "</p>" +
        (t.quote ? "" : '<p class="cst-all muted small">' + D.stages.map(([id, n]) => n + " " + usd(t.year[id])).join(" · ") + "</p>") +
        '<div class="cst-mx">' + mx.map(([k, n]) => '<span class="cst-m"><span class="small">' + esc(n) + "</span>" + dots(t.impact[k]) + "</span>").join("") + "</div></div>").join("") + "</section>").join("");
    const U = D.usage, ass = '<details class="cst-ass"><summary>Assumptions behind the numbers</summary><ul class="small"><li>Active learners each month: ' + D.stages.map(([id, n]) => n + " " + Math.round(U.mau_share[id] * 100) + "%").join(", ") + " of users.</li><li>An active learner practises " + U.days_per_month + " days a month. Each day: " + U.ai_turns_per_day + " AI replies (~" + U.ai_in_tokens.toLocaleString("en") + " tokens in, " + U.ai_out_tokens + " out, " + Math.round(U.ai_cached_share * 100) + "% of the input cached), " + U.stt_min_per_day + " min of speech recognised, " + U.pron_min_per_day + " min scored for pronunciation, " + U.tts_chars_per_day.toLocaleString("en") + " characters spoken (half reused from a cache), " + U.tr_chars_per_day.toLocaleString("en") + " characters translated.</li><li>Video captions: a " + U.video_minutes_library.toLocaleString("en") + "-minute library once, plus " + U.video_minutes_new_per_month + " new minutes a month.</li><li>Free monthly allowances are subtracted where the provider has one. Quotes aren't added to totals.</li></ul></details>";
    app.innerHTML = '<div class="ui-page cst">' + '<p class="crumbs"><a href="#ajustes">Settings</a><span aria-hidden="true">›</span><span>Service gaps & costs</span></p>' + uiTitle("Service gaps & costs", "What running on free services holds back, and what paying would buy", "", "Prices as of " + esc(D.asof)) +
      '<p class="small">' + esc(D.note) + "</p>" + chips + sum + trend + (D.hybrid_note ? '<p class="callout small">💡 ' + esc(D.hybrid_note) + "</p>" : "") +
      '<p class="muted small">Impact: 0 = no better than today, 10 = the gap is gone. Five measures: ' + mx.map((x) => x[1]).join(", ") + ".</p>" + gaps + ass + '<p class="muted small">' + esc(D.revenue_note) + "</p></div>";
  }
  document.addEventListener("click", (e) => { const b = e.target.closest && e.target.closest('[data-act="cst-st"]'); if (!b) return; CST.st = b.dataset.v; const y = scrollY; costsView(); scrollTo(0, y); });
  function route() {''')
s = s.replace("</style>", """.cst-chips { display: flex; gap: 6px; overflow-x: auto; padding: 4px 0 10px }
.cst-sum { display: grid; gap: 8px; grid-template-columns: repeat(3, minmax(0, 1fr)); margin: 6px 0 10px }
.cst-tot { position: relative; border: 1px solid var(--line); border-radius: 14px; padding: 10px; background: var(--surface); overflow: hidden }
.cst-tn { margin: 0; font-size: .78rem; font-weight: 800; text-transform: uppercase; letter-spacing: .04em }
.cst-big { margin: 2px 0; font-size: 1.25rem; font-weight: 800; font-variant-numeric: tabular-nums }
.cst-q { font-size: .72rem; font-weight: 700; color: var(--muted) }
.cst-bar { position: absolute; left: 0; bottom: 0; height: 4px; background: var(--cobalt); border-radius: 0 4px 4px 0 }
.cst-modest .cst-bar, .cst-tier.cst-modest .cst-tag { background: #b7791f } .cst-best .cst-bar, .cst-tier.cst-best .cst-tag { background: #2f855a }
.cst-tbl { width: 100%; border-collapse: collapse; font-size: .85rem; font-variant-numeric: tabular-nums } .cst-tbl th, .cst-tbl td { text-align: right; padding: 4px 6px; border-bottom: 1px solid var(--line) } .cst-tbl th:first-child, .cst-tbl td:first-child { text-align: left }
.cst-gap { border-top: 1px solid var(--line); padding-top: 12px; margin-top: 14px } .cst-gap h2 { margin: 0 0 4px; font-size: 1.1rem }
.cst-tier { border: 1px solid var(--line); border-radius: 12px; padding: 10px; margin: 8px 0; background: var(--surface) }
.cst-th { display: flex; gap: 8px; align-items: baseline; flex-wrap: wrap } .cst-tag { font-size: .7rem; font-weight: 800; color: #fff; background: var(--cobalt); border-radius: 999px; padding: 2px 8px; white-space: nowrap }
.cst-yr { margin: 4px 0 0; font-weight: 800; font-size: 1.05rem; font-variant-numeric: tabular-nums } .cst-all { margin: 2px 0 6px }
.cst-mx { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 4px 12px } .cst-m { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 2px 6px }
.cst-m > .small { grid-column: 1 / -1 } .cst-imp { display: block; height: 6px; border-radius: 999px; background: var(--line); overflow: hidden } .cst-imp i { display: block; height: 100%; background: var(--cobalt) } .cst-iv { font-size: .8rem; font-variant-numeric: tabular-nums }
@media (max-width: 420px) { .cst-sum { grid-template-columns: 1fr } }
</style>""", 1)
open(p, "w", encoding="utf-8").write(s); print("patched", p)
