// regression scan: pictographs and decorative symbols in visible interface text (static pages + dynamic states)
const { chromium, devices } = require("playwright");
const fs = require("fs"); const BRIDGE = fs.readFileSync("/home/claude/ruta-dele/android/app/src/main/assets/bridge.js", "utf8");
const RE = "[\\u{1F000}-\\u{1FAFF}\\u{2600}-\\u{27BF}\\u{2B00}-\\u{2BFF}\\u{2300}-\\u{23FF}\\u{25A0}-\\u{25FF}\\u{2190}-\\u{21FF}\\u{2700}-\\u{27BF}\\u{27C0}-\\u{27FF}\\u{2900}-\\u{297F}\\u{3030}\\u{303D}\\u{3297}\\u{3299}\\u{00A9}\\u{00AE}\\u{2122}\\u{2139}]";
const OK = new Set(["→", "←", "↗", "✓", "✕", "×", "·", "›", "‹", "≈", "≠", "–", "—", "…"]); // typographic marks we keep
(async () => {
  const b = await chromium.launch(); const c = await b.newContext({ ...devices["Pixel 7"], serviceWorkers: "block" });
  await c.addInitScript((u) => { const dk = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
    if (!localStorage.getItem("ruta-dele-v1")) localStorage.setItem("ruta-dele-v1", JSON.stringify({ act: { [dk(0)]: 25, [dk(1)]: 25, [dk(2)]: 20 }, frz: 1, bestSt: 7, badges: ["st3", "st7", "dr1", "perf", "w50"], tot: { drills: 3, perfect: 1, listen: 2 }, mist: [], goal: 20 })); });
  const p = await c.newPage(); const all = {};
  const scan = async (label) => { const r = await p.evaluate(([re]) => { const R = new RegExp(re, "gu"); const out = []; const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) { const t = n.nodeValue; const el = n.parentElement; if (!el || el.closest("#ltext,script,style,.fc .face,.verse,input,textarea,option")) continue; const s = getComputedStyle(el); if (s.display === "none" || s.visibility === "hidden") continue; const m = t.match(R); if (m) out.push([m.join(""), t.trim().slice(0, 50)]); } return out; }, [RE]);
    r.forEach(([e, t]) => [...e].forEach((ch) => { if (OK.has(ch)) return; (all[ch] = all[ch] || new Set()).add(label + ": " + t); })); };
  const go = async (h) => { await p.goto("http://localhost:8766/#" + h); await p.waitForTimeout(800); await scan("#" + h); };
  for (const h of ["", "hoy", "progreso", "ajustes", "drill", "curso", "a1", "a1-u1", "a1-u2", "a1-cards", "a1-vocab", "a1-mock", "a1-exam", "a1-examenes", "a1-examen-1", "a1-examen-1-lectura", "a1-examen-1-auditiva", "a1-examen-1-escritura", "a1-examen-1-oral", "nivel", "errores", "practicar", "repaso", "repaso-a1", "repaso-bizfin", "escuchar", "leer", "leer-add", "historia-a1-1", "reading-b1-01", "podcast-a1-1", "escritura", "escritura-a1-1", "examenes", "biblioteca", "verbos", "verbo-1", "verbos-reflexivos", "gramatica", "g-presente", "guias", "guia-ser-estar", "guia-por-para", "palabras", "palabra-casa", "palabra-tener", "recursos", "esc"]) await go(h);
  // dynamic states
  await p.goto("http://localhost:8766/#a1-u2"); await p.waitForTimeout(800); const st = await p.$('#runner [data-act="px-restart"]'); if (st) { await st.click(); await p.waitForTimeout(400); }
  for (let i = 0; i < 3; i++) { const o = await p.$('#runner [data-act="px-pick"]'); if (!o) break; await o.click(); await p.waitForTimeout(400); await scan("practice feedback"); const nx = await p.$('#runner [data-act="px-next"]'); if (nx) { await nx.click(); await p.waitForTimeout(300); } }
  await p.goto("http://localhost:8766/#drill"); await p.waitForTimeout(700); for (let i = 0; i < 9; i++) { const sk = await p.$('[data-act="dr-skip"]'); if (sk) { await sk.click(); await p.waitForTimeout(250); await scan("drill feedback"); } const nx = await p.$('[data-act="dr-next"]'); if (nx) { await nx.click(); await p.waitForTimeout(250); } else { const m = await p.$('[data-act="dr-m"]'); if (m) { await p.evaluate(() => { const D = window.__qdr; D.state.res = "no"; D.miss++; }); await p.evaluate(() => document.querySelector('[data-act="dr-m"]') && 0); } } }
  await scan("drill end");
  await p.goto("http://localhost:8766/#repaso-a1"); await p.waitForTimeout(800); const card = await p.$(".fc"); if (card) { await card.click(); await p.waitForTimeout(400); await scan("flashcard flipped"); const rate = await p.$('[data-act="sr-rate"]'); if (rate) { await rate.click(); await p.waitForTimeout(400); await scan("flashcard rated"); } }
  await p.goto("http://localhost:8766/#reading-b1-01"); await p.waitForTimeout(800); await p.click('.mc[data-scope="lq"] [data-q="0"][data-o="0"]'); await p.waitForTimeout(300); await scan("comprehension answered"); await p.click(".lq-where"); await p.waitForTimeout(600); await scan("find answer + back button");
  await p.goto("http://localhost:8766/#curso"); await p.waitForTimeout(700); await p.evaluate(() => document.getElementById("tutor-fab").click()); await p.waitForTimeout(600); await scan("Profe chat");
  for (const tab of ["practice", "hist"]) { await p.click('[data-act="t-tab"][data-v="' + tab + '"]'); await p.waitForTimeout(500); await scan("Profe " + tab); }
  await p.click('#tutor [data-act="t-close"]'); await p.waitForTimeout(300);
  // toasts
  for (const msg of ["toast"]) { await p.goto("http://localhost:8766/#reading-b1-01"); await p.waitForTimeout(800); await p.click('[data-act="l-play"]').catch(() => {}); await p.waitForTimeout(500); await p.evaluate(() => document.getElementById("tutor-fab").click()); await p.waitForTimeout(400); await scan("paused toast"); }
  await p.goto("http://localhost:8766/#ajustes"); await p.waitForTimeout(700); await p.click('[data-act="ui-sfx"][data-v="off"]').catch(() => {}); await p.waitForTimeout(300); await scan("settings toggled");
  const list = Object.entries(all);
  console.log(list.length ? list.length + " decorative symbols found:" : "CLEAN: no decorative symbols in the interface");
  list.forEach(([ch, w]) => console.log("  " + ch + " U+" + ch.codePointAt(0).toString(16).toUpperCase() + "  ×" + w.size + "  " + [...w].slice(0, 3).join(" | ")));
  await b.close();
})();
