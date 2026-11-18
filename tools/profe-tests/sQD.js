// v223 Quick drill: on the Practice tab; level (A1–C2) and focus at the top; skill questions merged in; the old Skill drills page redirects.
const { chromium, devices } = require("playwright");
const URL = process.env.URL || "http://localhost:8766/";
(async () => {
  const b = await chromium.launch(); const c = await b.newContext({ ...devices["Pixel 7"], viewport: { width: 360, height: 740 }, serviceWorkers: "block" });
  const p = await c.newPage(); const er = []; p.on("pageerror", (x) => er.push(x.message));
  const R = []; const rec = (n, ok, i) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (ok || !i ? "" : "  " + i)); };
  await p.goto(URL + "#inicio"); await p.waitForTimeout(1200);
  rec("Home: no separate Skill drills tile", await p.evaluate(() => !document.querySelector('a[href="#ejercicios"]') && !!document.querySelector('a[href="#drill"]')));
  await p.goto(URL + "#practicar"); await p.waitForTimeout(800);
  rec("Practice tab: Quick drill at the top", await p.evaluate(() => { const q = document.querySelector("#app .qdhero"); return q && q.getAttribute("href") === "#drill" && q.getBoundingClientRect().top < 400; }));
  await p.click("#app .qdhero"); await p.waitForTimeout(900);
  let st = await p.evaluate(() => ({ lv: [...document.querySelectorAll('[data-act="qd-lv"]')].map((x) => x.textContent + (x.getAttribute("aria-pressed") === "true" ? "*" : "")).join(" "), f: [...document.querySelectorAll('[data-act="qd-f"]')].map((x) => x.textContent).join(","), n: window.__qd().ex.length, sk: window.__qd().ex.filter((e) => e.t === "sk").length, top: document.querySelector(".qdctl").getBoundingClientRect().top }));
  rec("Level picker A1–C2 at the top of the drill", /A1.*A2.*B1.*B2.*C1.*C2/.test(st.lv) && st.top < 200, JSON.stringify(st));
  rec("Focus chips: Mixed + the seven skills", st.f === "Mixed,Listening,Speaking,Pronunciation,Spelling,Grammar,Vocabulary,Reading", st.f);
  rec("Mixed drill includes skill questions", st.sk >= 3 && st.n >= 11, JSON.stringify(st));
  // pick a level: the drill restarts at that level, and the words come from it
  await p.click('[data-act="qd-lv"][data-v="b1"]'); await p.waitForTimeout(700);
  st = await p.evaluate(() => ({ on: document.querySelector('[data-act="qd-lv"][aria-pressed="true"]').dataset.v, i: window.__qd().i, lv: window.__qd().ex.filter((e) => e.t === "sk").map((e) => e.d.lvl) }));
  rec("Level B1 chosen: drill restarts at B1 (skill questions from B1 lessons)", st.on === "b1" && st.i === 0 && st.lv.length && st.lv.every((l) => l === "b1"), JSON.stringify(st));
  // walk the whole session: classic exercises and skill questions in one frame
  const seen = new Set(); let guard = 0;
  while (guard++ < 40) {
    const s = await p.evaluate(() => { const Q = window.__qd(); if (!Q || Q.i >= Q.ex.length) return { end: true }; const e = Q.ex[Q.i]; return { t: e.t, sk: e.t === "sk" ? e.d.type : "", head: !!document.querySelector(".drill .qdctl"), i: Q.i }; });
    if (s.end) break; seen.add(s.t === "sk" ? "sk:" + s.sk : s.t);
    if (!s.head) { rec("Every screen keeps the level/focus header", false, JSON.stringify(s)); break; }
    await p.evaluate(() => { const Q = window.__qd(), e = Q.ex[Q.i];
      const click = (sel) => { const x = document.querySelector(sel); if (x) { x.click(); return true; } return false; };
      if (click('[data-act="dr-next"]') || click('[data-act="sk-next"]')) return;
      if (e.t === "match") { const st = Q.state; for (const i of e.pairs.map((_, k) => k)) { if ((st.done || []).includes(i)) continue; document.querySelector('[data-act="dr-m"][data-side="l"][data-i="' + i + '"]').click(); document.querySelector('[data-act="dr-m"][data-side="r"][data-i="' + i + '"]').click(); return; } }
      if (e.t === "sk" && document.querySelector('[data-act="sk-m"]')) { const L = [...document.querySelectorAll('[data-act="sk-m"][data-side="l"]:not([disabled])')][0]; if (L) { L.click(); document.querySelector('[data-act="sk-m"][data-side="r"][data-i="' + L.dataset.i + '"]').click(); return; } }
      click('[data-act="dr-skip"]') || click('[data-act="sk-skip"]') || click('[data-act="sk-nomic"]') || click('[data-act="dr-nomic"]') || click('[data-act="dr-check"]'); });
    await p.waitForTimeout(120);
  }
  const fin = await p.evaluate(() => ({ end: window.__qd().i >= window.__qd().ex.length, txt: (document.querySelector(".drend") || {}).innerText || "" }));
  rec("The whole mixed drill runs to the end screen", fin.end && /of \d+ right/.test(fin.txt), JSON.stringify([...seen]) + " " + fin.txt.slice(0, 60));
  rec("…through classic exercises and skill questions", [...seen].some((x) => x.startsWith("sk:")) && [...seen].some((x) => !x.startsWith("sk:")), [...seen].join(","));
  // one skill
  rec("End screen keeps the level/focus controls", await p.evaluate(() => !!document.querySelector(".drend") && !!document.querySelector(".drill .qdctl")));
  await p.click('[data-act="qd-f"][data-v="pro"]'); await p.waitForTimeout(700);
  st = await p.evaluate(() => ({ on: document.querySelector('[data-act="qd-f"][aria-pressed="true"]').dataset.v, all: window.__qd().ex.every((e) => e.t === "sk"), n: window.__qd().ex.length, types: [...new Set(window.__qd().ex.map((e) => e.d && e.d.type))] }));
  rec("Focus Pronunciation: only pronunciation questions", st.on === "pro" && st.all && st.n > 0 && st.types.every((t) => /whichsound|syll|stress|say/.test(t)), JSON.stringify(st));
  // old addresses
  await p.goto(URL + "#ejercicios"); await p.waitForTimeout(800);
  rec("Old Skill drills page opens the Quick drill", await p.evaluate(() => location.hash === "#drill" && !!document.querySelector(".drill .qdctl")));
  await p.goto(URL + "#ejercicios/skill/gra/a2"); await p.waitForTimeout(800);
  st = await p.evaluate(() => ({ h: location.hash, f: (document.querySelector('[data-act="qd-f"][aria-pressed="true"]') || {}).dataset, lv: (document.querySelector('[data-act="qd-lv"][aria-pressed="true"]') || {}).dataset }));
  rec("Old 'practise one skill' link opens the drill with that skill and level", st.h === "#drill" && st.f.v === "gra" && st.lv.v === "a2", JSON.stringify(st));
  await p.goto(URL + "#ejercicios/a1-u1/0"); await p.waitForTimeout(900);
  rec("Lesson 'Check yourself' drills still open", await p.evaluate(() => /^#ejercicios\/a1-u1\/0$/.test(location.hash) && !!document.querySelector(".drill, .sk-tag, .drq")));
  // fits a phone
  await p.goto(URL + "#drill"); await p.waitForTimeout(700);
  rec("Drill header fits 360px (no sideways scroll)", await p.evaluate(() => document.documentElement.scrollWidth <= 361));
  await p.screenshot({ path: "/tmp/qd1.png", scale: "css" });
  rec("No page errors", !er.length, er.join(" | "));
  await b.close(); const f = R.filter((x) => !x).length; console.log(f ? f + " FAILED of " + R.length : "ALL " + R.length + " PASS"); process.exit(f ? 1 : 0);
})();
