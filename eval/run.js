// Drives the real app (index.html) in a phone-sized browser, with the on-device AI replaced by the same
// Qwen model running in eval/server.py. Plays each scenario, scores every Profe reply, writes a report.
const fs = require("fs");
const { chromium, devices } = require("playwright");
const SC = JSON.parse(fs.readFileSync(__dirname + "/scenarios.json", "utf8"));
const SHARD = +(process.env.SHARD || 0), N = +(process.env.SHARDS || 1);
const MODEL = process.env.MODEL_NAME || "Qwen2.5-1.5B-Instruct_multi-prefill-seq_q8_ekv4096.task";
const OUT = process.env.OUT || "out";
fs.mkdirSync(OUT, { recursive: true });

const words = (t) => (t.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ']+/g) || []);
const EN_W = new Set("the and is are you your what how this that with for have to of it in my do does can will would please practice practise tenses tense verb sentence example let's".split(" "));
const ES_W = new Set("el la los las que de es y en un una por para con muy bien yo tú usted qué cómo está son hola gracias me te se lo le mi tu su no sí más pero también hoy ayer".split(" "));
const norm = (t) => t.toLowerCase().replace(/[*_¿¡?!.,;:«»"“”()]/g, "").replace(/\s+/g, " ").trim();
function same(a, b) {
  const A = new Set(norm(a).split(" ").filter((w) => w.length > 2)), B = new Set(norm(b).split(" ").filter((w) => w.length > 2));
  if (!A.size || !B.size) return false; let n = 0; A.forEach((w) => B.has(w) && n++); return n / Math.min(A.size, B.size) >= 0.75;
}
function score(turn, reply, prev, fix, learnerEn) {
  const f = [];
  const body = reply.replace(/\n?EN\s.*$/s, "").trim();
  const nw = words(body).length;
  if (!body || body === "…") f.push("empty");
  if (/[一-鿿]/.test(body)) f.push("chinese");
  if (/learner notes|instructions|background \(|private reference|reply as profe|you are profe/i.test(body)) f.push("echo");
  if (nw > 90) f.push("long:" + nw);
  const qs = (body.match(/\?/g) || []).length; if (qs > 2) f.push("questions:" + qs);
  if (prev && same(body, prev)) f.push("repeat");
  // English words inside Spanish sentences (not in an italic English line)
  const esLines = body.split("\n").filter((l) => { const ws = words(l.toLowerCase()); return ws.filter((w) => ES_W.has(w)).length >= 2 && ws.filter((w) => EN_W.has(w)).length <= 1; });
  const mix = esLines.flatMap((l) => words(l.toLowerCase()).filter((w) => ["tenses", "tense", "verb", "practice", "sentence", "example", "please"].includes(w)));
  if (mix.length) f.push("mixed:" + mix.join(","));
  if (!learnerEn) { const ws = words(body.toLowerCase()); const es = ws.filter((w) => ES_W.has(w)).length, en = ws.filter((w) => EN_W.has(w)).length; if (en > es + 3) f.push("too-english"); }
  if (turn.fix) { const t = (body + " " + fix).toLowerCase(); if (!t.includes(turn.fix.toLowerCase())) f.push("missed-fix:" + turn.fix); }
  if (turn.has && !new RegExp(turn.has, "i").test(body)) f.push("missing:" + turn.has);
  if (turn.move && /c[oó]mo quieres practicar|what would you like to practi|qu[eé] quieres practicar|how would you like/i.test(body)) f.push("stalled");
  if (/["“]?\b(haber|tener|ser)\b["”]? en diferentes tenses/i.test(body)) f.push("mixed:tenses");
  return f;
}

(async () => {
  const b = await chromium.launch();
  const mine = SC.filter((_, i) => i % N === SHARD);
  const results = [];
  for (const sc of mine) {
    const ctx = await b.newContext({ ...devices["Galaxy S9+"], serviceWorkers: "block" });
    const p = await ctx.newPage(); const errs = []; p.on("pageerror", (e) => errs.push(e.message));
    await p.addInitScript((model) => {
      localStorage.setItem("ruta-dele-tutor-v1", JSON.stringify({ noEnLine: true, engine: "native" }));
      const emit = (id, txt) => { const parts = txt.match(/[\s\S]{1,10}/g) || [""]; let i = 0; const t = setInterval(() => { if (i < parts.length) { window.__allm.ev("part", id, parts[i]); i++; } else { clearInterval(t); window.__allm.ev("done", id, ""); } }, 3); };
      const call = (path, body, id) => fetch("http://127.0.0.1:8800" + path, { method: "POST", body: JSON.stringify(body) }).then((r) => r.json()).then((j) => { (window.__raw = window.__raw || []).push({ path, out: j.text, s: j.s }); emit(id, j.text || ""); }).catch((e) => window.__allm.ev("err", id, String(e)));
      window.AndroidLLM = {
        status: () => JSON.stringify({ state: "loaded", model }),
        hasChat: () => true, preload: () => {}, tokens: () => -1, resetChat: () => {},
        chat: (id, key, sys, user, max, temp) => { (window.__sys = window.__sys || []).push(sys); call("/chat", { key, sys, user, max, temp }, id); },
        generate: (id, prompt, max, temp) => call("/gen", { prompt, max, temp }, id),
        cancel: () => {},
      };
    }, MODEL);
    await p.goto("http://127.0.0.1:8766/#" + sc.lvl); await p.waitForTimeout(1500);
    await p.click("#tutor-fab"); await p.waitForTimeout(500);
    const conv = []; let prev = "";
    for (const turn of sc.turns) {
      const nBefore = await p.evaluate(() => document.querySelectorAll("#tutor .tm.a").length);
      const t0 = Date.now();
      await p.evaluate((q) => { const t = document.querySelector("#tutor textarea"); t.value = q; const f = document.querySelector("#tutor form"); if (f) f.requestSubmit(); else document.querySelector("#tutor button[type=submit]").click(); }, turn.u);
      // wait for the reply to finish, then for the corrections check
      await p.waitForFunction((n) => { const a = document.querySelectorAll("#tutor .tm.a"); const l = a[a.length - 1]; return a.length > n && l && (l.querySelector('[data-act="t-say"]') || l.querySelector(".terr")); }, nBefore, { timeout: 240000 }).catch(() => {});
      const secs = (Date.now() - t0) / 1000;
      await p.waitForFunction(() => !/Checking your Spanish/.test(document.querySelector("#tutor").innerText), null, { timeout: 120000 }).catch(() => {});
      const got = await p.evaluate(() => {
        const a = [...document.querySelectorAll("#tutor .tm.a")].pop(), u = [...document.querySelectorAll("#tutor .tm.u")].pop();
        const fx = u && u.nextElementSibling && u.nextElementSibling.classList.contains("fx") ? u.nextElementSibling.innerText : "";
        const tb = a ? a.querySelector(".tb").cloneNode(true) : null; if (tb) tb.querySelectorAll("button,.t-en").forEach((x) => x.remove());
        return { reply: tb ? tb.innerText.trim() : "", fix: fx.trim() };
      });
      const flags = score(turn, got.reply, prev, got.fix, turn.en);
      conv.push({ u: turn.u, reply: got.reply, fix: got.fix, secs: Math.round(secs), flags });
      prev = got.reply;
    }
    const raw = await p.evaluate(() => window.__raw || []);
    const sys = await p.evaluate(() => (window.__sys || [])[0] || "");
    results.push({ id: sc.id, lvl: sc.lvl, note: sc.note || "", conv, raw, sys, errs });
    console.log(sc.id, conv.map((c) => (c.flags.length ? "✗" : "✓") + c.secs + "s").join(" "));
    fs.writeFileSync(OUT + "/results-" + SHARD + ".json", JSON.stringify(results, null, 1));
    await ctx.close();
  }
  fs.writeFileSync(OUT + "/results-" + SHARD + ".json", JSON.stringify(results, null, 1));
  await b.close();
})();
