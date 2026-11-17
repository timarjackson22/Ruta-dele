  /* ==GTM== */
  /* ---------- Admin › Go to market & unit economics (tools/costs/gtm.json → gtm.py → gtm_out.json, embedded as #gtm-data) ----------
     A planning model, shown with its arithmetic: options, revenue, costs (from the service costs model), unit economics, break-even. */
  const GTM = { conv: "base", tier: "cheap", st: "growth" };
  function gtmView() {
    if (typeof crAdmin === "function" && !crAdmin()) { location.hash = "#cobertura"; return; }
    let D = null; try { D = JSON.parse(document.getElementById("gtm-data").textContent.replace(/<\\\//g, "</")); } catch (e) {}
    if (!D) { app.innerHTML = '<div class="ui-page">' + uiTitle("Go to market") + '<p class="callout">The model isn\'t in this build.</p></div>'; return; }
    const T = D.tiers[GTM.tier], S = T.stages.find((x) => x.scenario === GTM.conv), rows = S.rows, U = T.unit;
    const usd = (v) => { const a = Math.abs(v), s = v < 0 ? "−" : ""; return s + (a >= 1e6 ? "$" + (a / 1e6).toFixed(2) + "M" : a >= 1e4 ? "$" + Math.round(a / 1e3) + "k" : a >= 1000 ? "$" + (a / 1e3).toFixed(1) + "k" : "$" + Math.round(a).toLocaleString("en")); };
    const usd2 = (v) => (v < 0 ? "−$" : "$") + Math.abs(v).toFixed(2), n = (v) => Math.round(v).toLocaleString("en"), pc = (v) => Math.round(v * 100) + "%";
    const seg = (act, cur, opts, label) => '<div class="gtm-seg" role="group" aria-label="' + label + '">' + opts.map(([v, t]) => '<button type="button" data-act="' + act + '" data-v="' + v + '" aria-pressed="' + (v === cur) + '">' + t + "</button>").join("") + "</div>";
    const be = T.breakeven[GTM.conv], A = D.assumptions;
    const verdict = be == null ? "Doesn't break even within 200,000 users at this conversion and service tier." : be <= 1000 ? "Positive from the soft launch (no staff costs yet)." : "Breaks even at about " + n(be) + " registered users.";
    // headline numbers at the chosen stage
    const R = rows.find((r) => r.id === GTM.st) || rows[rows.length - 1], u = U[R.id];
    const kpi = (k, v, sub, tone) => '<div class="gtm-kpi' + (tone ? " " + tone : "") + '"><p class="gtm-k">' + k + '</p><p class="gtm-v">' + v + "</p>" + (sub ? '<p class="gtm-s">' + sub + "</p>" : "") + "</div>";
    const head = '<div class="gtm-kpis">' + kpi("Revenue a year", usd(R.rev.total), n(R.payers) + " paying learners") + kpi("Costs a year", usd(R.cost.total), "running, acquisition, people") +
      kpi("Result a year", usd(R.net), R.net >= 0 ? "profit" : "loss", R.net >= 0 ? "pos" : "neg") + kpi("Break-even", be == null ? "—" : be <= 1000 ? "now" : n(be), be == null ? "not within 200k users" : be <= 1000 ? "" : "registered users") + "</div>";
    // per paying learner, per month
    const bar = (label, v, max, tone) => '<div class="gtm-bar"><span class="gtm-bl">' + label + '</span><span class="gtm-bt"><i class="' + (tone || "") + '" style="width:' + Math.max(2, Math.min(100, (Math.abs(v) / max) * 100)) + '%"></i></span><b>' + usd2(v) + "</b></div>";
    const mx = Math.max(u.net_arppu, u.cost_per_payer_month, Math.abs(u.contribution_month), 0.01);
    const unit = '<section class="gtm-card"><h2>Per paying learner, per month <span class="muted small">· ' + esc(u.name) + "</span></h2>" +
      bar("Pays, after store fee", u.net_arppu, mx, "pos") + bar("Costs to serve", -u.cost_per_payer_month, mx, "neg") + bar("Left over", u.contribution_month, mx, u.contribution_month >= 0 ? "pos" : "neg") +
      '<div class="gtm-unit">' + kpi("Lifetime value", usd2(u.ltv), A.paid_months + " paid months") + kpi("Cost to win one", usd2(u.cac), "ads, at " + pc(A.paid_install_share) + " paid installs") +
      kpi("Value ÷ cost", u.ltv_cac == null ? "—" : u.ltv_cac + "×", u.ltv_cac >= 3 ? "healthy (3× or more)" : u.ltv_cac >= 1 ? "pays back, thin" : "loses money", u.ltv_cac >= 3 ? "pos" : u.ltv_cac >= 1 ? "" : "neg") +
      kpi("Payback", u.payback_months == null ? "never" : u.payback_months + " mo", "to recover the cost to win one") + "</div>" +
      '<p class="muted small">If every learner, free or paying, used the cloud services, each paying learner would carry ' + usd2(u.cost_per_payer_month_all_cloud) + " a month instead.</p></section>";
    // year by stage
    const col = (f) => rows.map((r) => "<td>" + f(r) + "</td>").join("");
    const table = '<section class="gtm-card"><h2>Year by stage</h2><div class="tbl gtm-scroll"><table class="gtm-tbl"><thead><tr><th></th>' + rows.map((r) => '<th><button type="button" data-act="gtm-st" data-v="' + r.id + '" aria-pressed="' + (r.id === GTM.st) + '">' + esc(r.name) + '<span>' + n(r.users) + " users</span></button></th>").join("") + "</tr></thead><tbody>" +
      "<tr><th>Active each month</th>" + col((r) => n(r.mau)) + "</tr><tr><th>Paying (" + pc(S.conv) + ")</th>" + col((r) => n(r.payers)) + "</tr>" +
      '<tr class="gtm-sub"><th>Revenue</th>' + col(() => "") + "</tr><tr><th>Ruta Pro</th>" + col((r) => usd(r.rev.pro)) + "</tr><tr><th>DELE Exam Pass</th>" + col((r) => usd(r.rev.pass)) + "</tr><tr><th>Schools (B2B)</th>" + col((r) => usd(r.rev.b2b)) + '</tr><tr class="gtm-tot"><th>Total revenue</th>' + col((r) => usd(r.rev.total)) + "</tr>" +
      '<tr class="gtm-sub"><th>Costs</th>' + col(() => "") + "</tr><tr><th>Running (cloud for payers)</th>" + col((r) => usd(r.cost.running) + (r.cost.quotes ? "<sup>*</sup>" : "")) + "</tr><tr><th>Winning users (ads)</th>" + col((r) => usd(r.cost.acquisition)) + "</tr><tr><th>People</th>" + col((r) => usd(r.cost.people)) + '</tr><tr class="gtm-tot"><th>Total costs</th>' + col((r) => usd(r.cost.total)) + "</tr>" +
      '<tr class="gtm-net"><th>Result</th>' + col((r) => '<b class="' + (r.net >= 0 ? "pos" : "neg") + '">' + usd(r.net) + "</b>") + '</tr><tr class="gtm-alt"><th>If everyone used the cloud</th>' + col((r) => usd(r.net_all)) + "</tr></tbody></table></div>" +
      '<p class="muted small"><sup>*</sup> Song lyrics licensing is quoted on request and isn\'t included. Regional pricing (Panama/LatAm) instead of Pro would bring ' + rows.map((r) => esc(r.name) + " " + usd(r.rev.local_alt)).join(" · ") + " from subscriptions.</p></section>";
    const opts = '<section class="gtm-opts"><h2 class="gtm-h2">Ways to go to market</h2>' + D.options.map((o) => '<article class="gtm-opt"><h3>' + esc(o.name) + '</h3><p>' + esc(o.pitch) + '</p><p class="gtm-price">' + esc(o.price) + '</p><p class="muted small"><b>For:</b> ' + esc(o.who) + "</p>" +
      '<div class="gtm-pc"><ul class="gtm-pro">' + o.pros.map((x) => "<li>" + esc(x) + "</li>").join("") + '</ul><ul class="gtm-con">' + o.cons.map((x) => "<li>" + esc(x) + "</li>").join("") + "</ul></div></article>").join("") + "</section>";
    const rec = '<section class="gtm-rec"><p class="gtm-kick">Recommended path</p><ol>' +
      "<li><b>Free on the phone, cloud for Pro.</b> Free learners use on-device speech and offline content (near-zero cost); Profe's cloud AI, natural voices and pronunciation scoring come with Pro. This one decision is the difference between the two result rows below.</li>" +
      "<li><b>Ruta Pro at $9.99 a month or $69.99 a year</b>, under Duolingo Super and Babbel, with a 7-day trial.</li>" +
      "<li><b>Sell the DELE Exam Pass around the exam calendar</b> (registration closes about six weeks before each session) to people who won't subscribe.</li>" +
      "<li><b>Open B2B from launch</b> with exam centres and academies: the curriculum coverage dashboard is the teacher tool nobody else has.</li>" +
      "<li><b>Grow organically first</b> (Panama schools and employers, exam-centre partners, short videos from the lessons). Paid ads only once value ÷ cost is above 3×.</li></ol></section>";
    const moves = '<details class="gtm-det"><summary>What moves the numbers most</summary><ul class="small">' +
      "<li><b>Who uses the cloud.</b> Compare the two result rows: giving every free learner cloud AI multiplies running costs many times over.</li>" +
      "<li><b>Service tier.</b> Switch Cheapest/Modest above: the modest tier's natural voices, wake word licence and pronunciation scoring cost more per payer than Pro brings in until a large scale.</li>" +
      "<li><b>Conversion.</b> Each extra point of paying learners adds roughly " + usd(rows[rows.length - 1].mau * 0.01 * D.options[0].arppu_month * 12 * (1 - D.options[0].fee)) + " a year at maturity.</li>" +
      "<li><b>People.</b> Staff are the largest cost at every stage after launch; content review and support can be part-time until growth.</li>" +
      "<li><b>Cost to win users.</b> Ads at $" + A.cpi + " an install are fine for Pro only when organic growth carries most of the users.</li></ul></details>";
    const ass = '<details class="gtm-det"><summary>Assumptions and sources</summary><ul class="small">' +
      "<li>Paying learners: " + pc(A.conversion.low) + " / " + pc(A.conversion.base) + " / " + pc(A.conversion.high) + " of monthly active users. " + esc(A.conversion.note) + "</li>" +
      "<li>" + esc(D.options[0].arppu_note) + " Store fee: Google Play subscriptions " + pc(D.options[0].fee) + ", one-off purchases " + pc(D.options[1].fee) + ".</li>" +
      "<li>Exam Pass: " + pc(D.options[1].buy_share) + " of monthly active learners buy one a year. B2B: " + D.options[2].seats_per_account + " seats per account at $" + D.options[2].seat_year + " a seat.</li>" +
      "<li>Ads: " + pc(A.paid_install_share) + " of new users from ads at $" + A.cpi + " an install; paid months per subscriber: " + A.paid_months + ". " + esc(A.people_note) + "</li>" +
      "<li>Running costs: the service costs model (Settings › Service gaps & costs), " + (GTM.tier === "cheap" ? "cheapest" : "modest") + " tier; per-learner services are AI, speech recognition, pronunciation, voices and translation.</li></ul>" +
      '<ul class="gtm-bench">' + D.benchmarks.map((b) => '<li><span>' + esc(b.k) + "</span><b>" + esc(b.v) + '</b><a href="' + esc(b.src) + '" target="_blank" rel="noopener">source</a></li>').join("") + "</ul></details>";
    app.innerHTML = '<div class="ui-page gtm">' + '<p class="crumbs"><a href="#ajustes">Settings</a><span aria-hidden="true">›</span><span>Go to market</span></p>' + uiTitle("Go to market & unit economics", "Options, what each learner is worth, what it costs, and when it pays") +
      '<p class="muted small">' + esc(D.note) + " Updated " + esc(D.asof) + ".</p>" + rec +
      '<div class="gtm-ctl">' + seg("gtm-conv", GTM.conv, [["low", "Low " + pc(A.conversion.low)], ["base", "Base " + pc(A.conversion.base)], ["high", "High " + pc(A.conversion.high)]], "Paying learners") +
      seg("gtm-tier", GTM.tier, [["cheap", "Cheapest services"], ["modest", "Modest services"]], "Service tier") + "</div>" +
      '<p class="gtm-verdict ' + (be == null ? "neg" : "pos") + '">' + verdict + "</p>" + head + unit + table + opts + moves + ass + "</div>";
  }
  document.addEventListener("click", (e) => { const b = e.target.closest && e.target.closest('[data-act^="gtm-"]'); if (!b) return; const k = b.dataset.act.slice(4); GTM[k] = b.dataset.v; const y = scrollY; gtmView(); scrollTo(0, y); });
  /* ==/GTM== */
