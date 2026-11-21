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
  rec("Topics: face, body, hand, kitchen, living room, bedroom, bathroom, dining room, outside, clothes, accessories", ["cara", "cuerpo", "mano", "cocina", "sala", "dormitorio", "bano", "comedor", "casa", "ropa", "accesorios"].every((x) => ids.includes(x)), ids.join(","));
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
      if (document.querySelectorAll(".vd-list button").length !== t.n) out.push("list"); return out; }, t);
    if (r.length) bad.push(t.id + ": " + r.join("; "));
  }
  rec("Every label is inside the picture, none overlap, each word also in the list", !bad.length, bad.join(" | "));
  await p.goto(URL + "#visual/cocina"); await p.waitForTimeout(600);
  const setReg = async (lat) => { if ((await p.evaluate(() => window.__vd.lat())) !== lat) await p.evaluate(() => document.querySelector('[data-act="region"]').click()); await p.goto(URL + "#visual/sala"); await p.goto(URL + "#visual/cocina"); await p.waitForTimeout(500); };
  await setReg(false);
  await p.evaluate(() => document.querySelector('.vd-lab[data-i="2"]').dispatchEvent(new MouseEvent("click", { bubbles: true }))); await p.waitForTimeout(150);
  const said = await p.evaluate(() => ({ s: window.__said.slice(-1)[0], en: document.getElementById("vd-en").textContent, on: !!document.querySelector('.vd-lab.on[data-i="2"]') }));
  rec("Tapping a label says the word, shows the English and lights the label", said.s === "la nevera" && /fridge/.test(said.en) && said.on, JSON.stringify(said));
  await setReg(true);
  rec("Latin American words when the variety is Latin America (la nevera → el refrigerador)", await p.evaluate(() => [...document.querySelectorAll(".vd-t")].some((x) => x.textContent === "el refrigerador")));
  await p.evaluate(() => document.querySelector('[data-act="vd-deck"]').click()); await p.waitForTimeout(300);
  rec("«Add all to a deck» makes a deck with every word", await p.evaluate(() => window.__vd.deck("La cocina") >= 12));
  await p.evaluate(() => document.querySelector('[data-act="vd-all"]').click()); await p.waitForTimeout(1500);
  rec("«Hear them all» reads the words one after another", await p.evaluate(() => window.__said.length >= 5));
  rec("No sideways scroll at 360 px; no page errors", (await p.evaluate(() => document.documentElement.scrollWidth <= 361)) && !er.length, er.join(" | "));
  await b.close(); const f = R.filter((x) => !x).length; console.log(f ? f + " FAILED of " + R.length : "ALL " + R.length + " PASS"); process.exit(f ? 1 : 0);
})();
