// v268: redrawn scenes, new topics, labels laid out without crossing, «Hear them all» at the top (English once, Spanish ×3),
// the whole dictionary as a flashcard deck and Quick drill › Pictures.
// v262 Library › Picture dictionary (#visual): every topic card draws, every label is inside the picture and readable, a tap
// speaks the word, «Add all to a deck» saves them, and the words follow the Spanish variety (Spain / Latin America).
const { chromium, devices } = require("playwright");
const URL = process.env.URL || "http://localhost:8766/";
(async () => {
  const b = await chromium.launch(); const c = await b.newContext({ ...devices["Pixel 7"], viewport: { width: 360, height: 740 }, serviceWorkers: "block" });
  await c.addInitScript(() => { window.__said = []; const ss = { speaking: false, pending: false, getVoices: () => [{ name: "es", lang: "es-ES", localService: true, voiceURI: "es" }], cancel() {}, speak(u) { window.__said.push(u.text); setTimeout(() => u.onend && u.onend({}), 20); } };
    Object.defineProperty(window, "speechSynthesis", { value: ss }); window.SpeechSynthesisUtterance = class { constructor(t) { this.text = t; } }; });
  const p = await c.newPage(); const er = []; p.on("pageerror", (e) => er.push(e.message));
  const R = []; const rec = (n, ok, i) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (ok ? "" : "  " + (i || ""))); };
  await p.goto(URL + "#biblioteca"); await p.waitForTimeout(900);
  rec("Library has a Picture dictionary tile", await p.evaluate(() => !!document.querySelector('a.stile[href="#visual"]')));
  await p.goto(URL + "#visual"); await p.waitForTimeout(800);
  const topics = await p.evaluate(() => window.__vd.topics());
  const ids = topics.map((t) => t.id);
  rec("Topics: face, body, hand, kitchen, living room, bedroom, bathroom, dining room, outside, clothes, accessories", ["cara", "cuerpo", "mano", "cocina", "sala", "dormitorio", "bano", "comedor", "casa", "ropa", "accesorios", "frutas", "verduras", "menaje", "vajilla", "lavadero", "herramientas", "aparatos", "vehiculos", "bici", "coche"].every((x) => ids.includes(x)), ids.join(","));
  rec("One card per topic on the hub", await p.evaluate((n) => document.querySelectorAll(".vd-card").length === n, topics.length));
  const bad = [];
  for (const t of topics) {
    await p.goto(URL + "#visual/" + t.id); await p.waitForTimeout(500);
    const r = await p.evaluate((t) => { const sv = document.querySelector(".vd-pic svg"), out = [];
      if (t.kind === "grid") { const n = document.querySelectorAll(".vd-it").length; if (n !== t.n) out.push("grid items " + n); return out; }
      const labs = [...document.querySelectorAll(".vd-lab")]; if (labs.length !== t.n) out.push("labels " + labs.length);
      const vb = sv.viewBox.baseVal, box = sv.getBoundingClientRect(); const texts = labs.map((g) => g.querySelector("text").getBBox());
      texts.forEach((bb, i) => { if (bb.x < vb.x - 1 || bb.x + bb.width > vb.x + vb.width + 1) out.push("cut: " + labs[i].querySelector("text").textContent); });
      for (let i = 0; i < texts.length; i++) for (let j = i + 1; j < texts.length; j++) { const a = texts[i], b2 = texts[j]; if (a.x < b2.x + b2.width && b2.x < a.x + a.width && a.y < b2.y + b2.height - 2 && b2.y < a.y + a.height - 2) out.push("overlap: " + labs[i].textContent + " / " + labs[j].textContent); }
      const px = (labs[0] && labs[0].querySelector("text").getBoundingClientRect().height) || 0; if (px < 8) out.push("labels too small " + px);
      if (document.querySelectorAll(".vd-list button").length !== t.n) out.push("list");
      // leader lines: on each side no two cross, and every point is on the drawing (x 88–312)
      const seg = labs.map((g) => { const n = g.querySelector("path").getAttribute("d").match(/-?[\d.]+/g).map(Number); return { x1: n[2], y1: n[3], x2: n[4], y2: n[5], l: n[0] < 200 }; });
      const cr = (a, b) => { const d = (p, q, r) => (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x); const A = { x: a.x1, y: a.y1 }, B = { x: a.x2, y: a.y2 }, C = { x: b.x1, y: b.y1 }, D = { x: b.x2, y: b.y2 }; return d(A, B, C) * d(A, B, D) < 0 && d(C, D, A) * d(C, D, B) < 0; };
      for (let i = 0; i < seg.length; i++) { if (seg[i].x2 < 88 || seg[i].x2 > 312) out.push("point off the drawing: " + labs[i].textContent); for (let j = i + 1; j < seg.length; j++) if (seg[i].l === seg[j].l && cr(seg[i], seg[j])) out.push("lines cross: " + labs[i].textContent + " / " + labs[j].textContent); }
      return out; }, t);
    if (r.length) bad.push(t.id + ": " + r.join("; "));
  }
  rec("Every label is inside the picture, none overlap, each word also in the list", !bad.length, bad.join(" | "));
  await p.goto(URL + "#visual/cocina"); await p.waitForTimeout(600);
  const setReg = async (lat) => { if ((await p.evaluate(() => window.__vd.lat())) !== lat) await p.evaluate(() => document.querySelector('[data-act="region"]').click()); await p.goto(URL + "#visual/sala"); await p.goto(URL + "#visual/cocina"); await p.waitForTimeout(500); };
  await setReg(false);
  const ni = await p.evaluate(() => [...document.querySelectorAll(".vd-t")].findIndex((x) => x.textContent === "la nevera"));
  await p.evaluate((ni) => document.querySelectorAll(".vd-lab")[ni].dispatchEvent(new MouseEvent("click", { bubbles: true })), ni); await p.waitForTimeout(150);
  const said = await p.evaluate((ni) => ({ s: window.__said.slice(-1)[0], en: document.getElementById("vd-en").textContent, on: document.querySelectorAll(".vd-lab")[ni].classList.contains("on") }), ni);
  rec("Tapping a label says the word, shows the English and lights the label", said.s === "la nevera" && /fridge/.test(said.en) && said.on, JSON.stringify(said));
  await setReg(true);
  rec("Latin American words when the variety is Latin America (la nevera → el refrigerador)", await p.evaluate(() => [...document.querySelectorAll(".vd-t")].some((x) => x.textContent === "el refrigerador")));
  await p.evaluate(() => document.querySelector('[data-act="vd-deck"]').click()); await p.waitForTimeout(300);
  rec("«Add all to a deck» makes a deck with every word", await p.evaluate(() => window.__vd.deck("La cocina") >= 12));
  rec("«Hear them all» sits at the top, above the picture", await p.evaluate(() => { const b = document.querySelector('[data-act="vd-all"]'), c = document.querySelector(".vd-card2"); return !!(b && c && (b.compareDocumentPosition(c) & Node.DOCUMENT_POSITION_FOLLOWING) && b.getBoundingClientRect().top < 400); }));
  await p.evaluate(() => document.querySelector('[data-act="vd-all"]').click()); await p.waitForTimeout(6500);
  const seq = await p.evaluate(() => window.__vd.seq());
  rec("«Hear them all»: English once, then Spanish three times, word after word", seq.length >= 8 && /^en:/.test(seq[0]) && seq.slice(1, 4).every((x) => x === "es:" + seq[1].slice(3)) && /^es:/.test(seq[1]) && /^en:/.test(seq[4]), seq.slice(0, 8).join(" | "));
  await p.evaluate(() => document.querySelector('[data-act="vd-all"]').click());
  // flashcards: the whole dictionary is a built-in deck
  const N = await p.evaluate(() => window.__vd.n());
  await p.goto(URL + "#repaso"); await p.waitForTimeout(900);
  rec("Flashcards list the deck «Diccionario visual» (" + N + " words)", await p.evaluate(() => /Diccionario visual|Picture dictionary/.test(document.body.textContent)) && N >= 300);
  // quick drill › Pictures
  await p.goto(URL + "#drill"); await p.waitForTimeout(900);
  await p.evaluate(() => document.querySelector('[data-act="qd-f"][data-v="pic"]').click()); await p.waitForTimeout(400);
  const types = []; let picOk = true;
  for (let k = 0; k < 10; k++) {
    const e = await p.evaluate(() => { const Q = window.__qd(); const e = Q && Q.ex[Q.i]; return e ? { t: e.t, es: e.w && e.w.es, pairs: e.pairs } : null; }); if (!e) break; types.push(e.t);
    if (e.t === "pic" || e.t === "pich") { const has = await p.evaluate((t) => t === "pic" ? !!document.querySelector(".qdpic svg") : document.querySelectorAll(".qdpicopt svg").length === 4, e.t); if (!has) picOk = false;
      await p.evaluate((es) => [...document.querySelectorAll('[data-act="dr-pp"]')].find((b) => b.dataset.v === es).click(), e.es); }
    else if (e.t === "picw") { await p.fill("#dr-in", e.es.replace(/^(el|la|los|las) /, "")); await p.evaluate(() => document.querySelector('[data-act="dr-check"]').click()); }
    else if (e.t === "match") { for (let i = 0; i < e.pairs.length; i++) { await p.evaluate((i) => document.querySelector('[data-act="dr-m"][data-side="l"][data-i="' + i + '"]').click(), i); await p.evaluate((i) => document.querySelector('[data-act="dr-m"][data-side="r"][data-i="' + i + '"]').click(), i); } }
    await p.waitForTimeout(150); await p.evaluate(() => { const n = document.querySelector('[data-act="dr-next"]'); if (n) n.click(); }); await p.waitForTimeout(150);
  }
  const fin = await p.evaluate(() => { const Q = window.__qd(); return Q ? { i: Q.i, n: Q.ex.length, ok: Q.ok } : null; });
  rec("Quick drill › Pictures: pick the word for a picture, the picture for a word, write it, match — all graded", picOk && ["pic", "pich", "picw", "match"].every((t) => types.includes(t)) && fin && fin.i >= fin.n && fin.ok >= 9, JSON.stringify({ types, fin, picOk }));
  rec("No sideways scroll at 360 px; no page errors", (await p.evaluate(() => document.documentElement.scrollWidth <= 361)) && !er.length, er.join(" | "));
  await b.close(); const f = R.filter((x) => !x).length; console.log(f ? f + " FAILED of " + R.length : "ALL " + R.length + " PASS"); process.exit(f ? 1 : 0);
})();
