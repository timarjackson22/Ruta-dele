// Grades sample texts in the real app with the model in eval/server (Gemma via LiteRT-LM) and checks the grades are sensible.
const fs = require("fs");
const { chromium, devices } = require("playwright");
const SAMPLES = JSON.parse(fs.readFileSync(__dirname + "/writing_samples.json", "utf8"));
const MODEL = process.env.MODEL_NAME || "gemma-4-E2B-it.litertlm";
const OUT = process.env.OUT || "out"; fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch(); const res = [];
  for (const sm of SAMPLES) {
    const ctx = await b.newContext({ ...devices["Galaxy S9+"], serviceWorkers: "block" }); const p = await ctx.newPage(); const errs = []; p.on("pageerror", (e) => errs.push(e.message));
    await p.addInitScript((model) => {
      const emit = (id, txt) => { window.__allm.ev("part", id, txt || ""); window.__allm.ev("done", id, ""); };
      const call = (path, body, id) => fetch("http://127.0.0.1:8800" + path, { method: "POST", body: JSON.stringify(body) }).then((r) => r.json()).then((j) => emit(id, j.text || "")).catch((e) => window.__allm.ev("err", id, String(e)));
      window.AndroidLLM = { canLm: () => true, status: () => JSON.stringify({ state: "loaded", model }), hasChat: () => true, preload() {}, resetChat() {}, tokens: () => -1, cancel() {},
        chat: (id, key, sys, user, max, temp) => call("/chat", { key, sys, user, max, temp }, id), generate: (id, prompt, max, temp) => call("/gen", { prompt, max, temp }, id) };
    }, MODEL);
    await p.goto("http://127.0.0.1:8766/#escritura-" + sm.task); await p.waitForTimeout(1200);
    await p.click('[data-act="w-start"][data-m="practice"]'); await p.fill("#w-text", sm.text); await p.click('[data-act="w-submit"]');
    const t0 = Date.now(); await p.waitForSelector(".wscore", { timeout: 600000 }).catch(() => {});
    const r = await p.evaluate(() => { const W = window.__wr(), R = W && W.rep; return R ? { total: R.total, sc: R.sc, ai: R.ai, items: R.items.map((f) => f.from + "→" + f.to + (f.why ? " (" + f.why.slice(0, 60) + ")" : "")), better: R.better, tips: R.tips } : null; });
    const ok = r && (sm.expect === "pass" ? r.total >= 15 : sm.expect === "fail" ? r.total < 15 : true);
    res.push({ ...sm, r, ok, secs: Math.round((Date.now() - t0) / 1000), errs });
    console.log(sm.task, sm.q, r ? r.total + "/25 " + JSON.stringify(r.sc) : "no report", ok ? "✓" : "✗", Math.round((Date.now() - t0) / 1000) + "s");
    await ctx.close();
  }
  // ordering: for each task, strong > medium > weak
  const order = {}; res.forEach((x) => { (order[x.task] = order[x.task] || {})[x.q] = x.r ? x.r.total : null; });
  const ordered = Object.values(order).every((o) => (o.strong == null || o.weak == null || o.strong > o.weak) && (o.medium == null || ((o.strong == null || o.strong >= o.medium) && (o.weak == null || o.medium >= o.weak))));
  let md = "# Writing grader check — " + res.filter((x) => x.ok).length + "/" + res.length + " expectations met · ordering " + (ordered ? "✓" : "✗") + "\n\n";
  res.forEach((x) => { md += "## " + x.task + " · " + x.q + " → " + (x.r ? x.r.total + "/25 " + JSON.stringify(x.r.sc) : "—") + " " + (x.ok ? "✓" : "✗") + " (" + x.secs + " s)\n\n" + x.text.replace(/\n+/g, " ⏎ ") + "\n\n" + (x.r ? "**Corrections:** " + x.r.items.join(" · ") + "\n\n**AI:** " + JSON.stringify(x.r.ai) + "\n\n**Tips:** " + x.r.tips.join(" | ") + "\n\n**Improved:** " + (x.r.better || "—").replace(/\n+/g, " ⏎ ") + "\n\n" : "") + (x.errs.length ? "Errors: " + x.errs.join("; ") + "\n\n" : ""); });
  fs.writeFileSync(OUT + "/report.md", md); fs.writeFileSync(OUT + "/summary.json", JSON.stringify({ met: res.filter((x) => x.ok).length, n: res.length, ordered }, null, 1));
  fs.writeFileSync(OUT + "/results-0.json", JSON.stringify(res, null, 1));
  await b.close();
})();
