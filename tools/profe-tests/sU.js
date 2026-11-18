// U. Profe panel UI and level-appropriate practice (round 4, 15 Nov 2026)
const { open } = require("./h.js");
const R = []; const rec = (n, ok, info) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (!ok && info != null ? "  " + String(info).slice(0, 300) : "")); };
(async () => {
  const H = await open({ hash: "#a1-u3" }); const p = H.p;
  const hd = await p.evaluate(() => { const t = document.getElementById("tutor"); return { head: t.querySelector(".th").innerText, html: t.innerHTML, chips: !!t.querySelector(".tchips"), gear: (t.querySelector('[data-act="t-tab"][data-v="hist"]') || {}).textContent, gearL: (t.querySelector('[data-act="t-tab"][data-v="hist"]') || { getAttribute: () => "" }).getAttribute("aria-label"), en: (t.querySelector('[data-act="t-en"]') || {}).textContent, hf: (t.querySelector('[data-act="hf-toggle"]') || {}).textContent }; });
  rec("No “AI on this phone” or “Looking at” text in the header", !/Looking at|on this phone|AI on/i.test(hd.head), hd.head);
  rec("Suggestion chips row (Voice chat, Explain, Quiz me…) removed", !hd.chips && !/Quiz me|Check my answers/.test(hd.html));
  rec("Settings tab is a gear with an accessible name", /⚙/.test(hd.gear || "") && /settings/i.test(hd.gearL || ""), hd.gear + " / " + hd.gearL);
  rec("English toggle is a flag", /🇬🇧/.test(hd.en || ""), hd.en);
  rec("Hands-free toggle is a hand", hd.hf == null || /✋/.test(hd.hf), hd.hf);
  await p.click('[data-act="t-tab"][data-v="practice"]'); await H.wait(300);
  const pr = await p.evaluate(() => { return { opts: [...document.querySelectorAll("#tutor .papp span")].map((o) => o.textContent), lv: (document.querySelector('.prlv [aria-pressed="true"]') || {}).textContent }; });
  rec("Practice home: six app icons (Vocabulary, Translate, Survival Kit, Verbs, Role-play, DELE oral)", pr.opts.length === 6 && /Vocabulary/.test(pr.opts.join()) && /Verbs/.test(pr.opts.join()) && /Role-play/.test(pr.opts.join()) && /DELE/.test(pr.opts.join()), JSON.stringify(pr.opts));
  rec("Practice level follows the page (A1 unit → A1)", pr.lv === "A1", pr.lv);
  await p.click('#tutor [data-act="pr-type"][data-v="rp"]'); await H.wait(300);
  const rp = await p.evaluate(() => [...document.querySelectorAll('#tutor [data-act="pr-rp"]')].length);
  rec("Choosing Role-plays shows that level's role-plays straight away", rp > 0, rp);
  // vocabulary: A1 words come from the A1 course and are short and basic
  const pool = await p.evaluate(() => { try { return window.__prPool("a1"); } catch (e) { return null; } });
  rec("A1 vocabulary pool: only A1 course words, nothing long or advanced", pool && pool.n > 100 && pool.maxWords <= 3 && pool.notA1 === 0, JSON.stringify(pool));
  const c1 = await p.evaluate(() => window.__prPool("c1"));
  rec("C1 vocabulary pool is a different (C1) set", c1 && c1.n > 100 && c1.sample.join() !== (pool || {}).sample.join(), JSON.stringify(c1 && c1.sample));
  // conjugation: A1 present tense, common verbs only
  await p.evaluate(() => { const b = document.querySelector("#tutor .prback"); if (b) b.click(); }); await H.wait(200); await p.click('#tutor [data-act="pr-conj"]'); await p.waitForFunction(() => window.__ad && window.__ad.pr() && window.__ad.pr().it, null, { timeout: 8000 }).catch(() => {});
  const cj = await p.evaluate(() => { const top = new Set(window.__ad.pool("a1")); return { n: top.size, items: Array.from({ length: 20 }, () => window.__ad.pickCj("a1")).map((x) => ({ v: x.v, t: x.t, top: top.has(x.v) })) }; });
  rec("A1 conjugation: present tense only, from the 40 most common verbs", cj.n <= 40 && cj.items.every((x) => x.t === "pres" && x.top), JSON.stringify(cj));
  rec("No page errors", !H.errs.length, H.errs.join(" | "));
  await H.close();
  console.log(R.every(Boolean) ? "ALL " + R.length + " PASS" : R.filter((x) => !x).length + " FAILED of " + R.length);
})();
