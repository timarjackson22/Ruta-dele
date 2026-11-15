// C. Revision Cheat Sheets (M5, 15 Nov 2026): coverage against the Guides, filters, bookmarks, print layout (≤ 2 landscape pages), voice.
const { open } = require("./h.js");
const R = []; const rec = (n, ok, info) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (!ok && info != null ? "  " + String(info).slice(0, 600) : "")); };
(async () => {
  const H = await open({ hash: "#chuletas", noOpen: true }); const p = H.p;
  await p.waitForFunction(() => !!window.__ch, null, { timeout: 8000 });
  // coverage checklist: every Guide topic has a complete sheet that matches the guide
  const cov = await p.evaluate(() => { const out = [];
    document.querySelectorAll(".chcard").length;
    const GUIDES = window.__ch.guides(); for (const g of GUIDES) { const d = window.__ch.data(g), miss = [];
      if (d.rules.length !== g.sec.length || d.rules.some((r, i) => r.t !== g.sec[i].t)) miss.push("rules≠guide");
      if (d.rules.filter((r) => r.e).length < g.sec.length * 0.8) miss.push("examples");
      if (d.decide.length < 3) miss.push("decide"); if (d.exc.length < 2) miss.push("exceptions"); if (d.fix.length < 3) miss.push("mistakes");
      if (!d.mem || d.mem.length < 40) miss.push("memory aid"); if (d.tips.length < 2) miss.push("exam tips");
      out.push([g.id, miss]); }
    return { n: GUIDES.length, cards: document.querySelectorAll(".chcard").length, bad: out.filter((x) => x[1].length), extraIds: Object.keys(window.__ch.extra).sort().join() === GUIDES.map((g) => g.id).sort().join() }; });
  rec("Coverage: a card for every Guide topic (" + cov.n + ")", cov.cards === cov.n && cov.n === 22, JSON.stringify(cov).slice(0, 200));
  rec("Coverage: every sheet has all guide rules (same titles, in order), examples, a decision diagram, exceptions, mistakes, memory aid, exam tips", !cov.bad.length && cov.extraIds, JSON.stringify(cov.bad));
  // search and filters
  await p.fill("#ch-q", "subjunt"); await H.wait(200);
  let n = await p.$$eval(".chcard", (x) => x.map((a) => a.getAttribute("href")));
  rec("Search narrows the list (and keeps focus in the box)", n.length >= 1 && n.length < 22 && n.includes("#chuleta-subjuntivo") && await p.evaluate(() => document.activeElement && document.activeElement.id === "ch-q"), JSON.stringify(n));
  await p.fill("#ch-q", ""); await p.click('[data-act="ch-lv"][data-v="b1"]'); await H.wait(150);
  n = await p.$$eval(".chcard .chlv", (x) => x.map((a) => a.textContent));
  rec("Level filter shows only that level", n.length > 0 && n.every((x) => x === "B1"), JSON.stringify(n));
  // a sheet: links, bookmark persists
  await p.evaluate(() => { location.hash = "#chuleta-por-para"; }); await H.wait(400);
  const sh = await p.evaluate(() => ({ cols: document.querySelectorAll(".chcols > section").length, guide: !!document.querySelector('a[href="#guia-por-para"]'), flow: document.querySelectorAll(".chflow li").length, h: document.querySelector(".chsheet h1").textContent }));
  rec("Sheet: three columns, decision diagram, link to the full guide", sh.cols === 3 && sh.flow >= 3 && sh.guide && /Por vs/.test(sh.h), JSON.stringify(sh));
  await p.click('[data-act="ch-bm"]'); await H.wait(200);
  await p.reload(); await p.waitForTimeout(1500); await p.evaluate(() => { location.hash = "#chuletas"; }); await H.wait(400);
  await p.click('[data-act="ch-bmf"]'); await H.wait(150);
  n = await p.$$eval(".chcard", (x) => x.map((a) => a.getAttribute("href")));
  rec("Bookmark saved across reloads and the Saved filter shows it", n.length === 1 && n[0] === "#chuleta-por-para", JSON.stringify(n));
  // readable on mobile: no horizontal overflow
  await p.evaluate(() => { location.hash = "#chuleta-subjuntivo"; }); await H.wait(400);
  const ov = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  rec("Mobile: the sheet doesn't scroll sideways", ov <= 1, ov);
  // print: landscape, at most two pages for every topic
  const pages = [];
  for (const g of await p.evaluate(() => window.__ch.guides().map((x) => x.id))) {
    await p.evaluate((id) => { location.hash = "#chuleta-" + id; document.body.classList.add("ch-printing"); }, g); await H.wait(350);
    const pdf = await p.pdf({ landscape: true, format: "A4", printBackground: false, preferCSSPageSize: true });
    const cnt = Math.max(0, ...(pdf.toString("latin1").match(/\/Count\s+(\d+)/g) || []).map((x) => +x.replace(/\D/g, ""))); pages.push([g, cnt]);
  }
  await p.evaluate(() => document.body.classList.remove("ch-printing"));
  rec("Print: every sheet fits on one or two landscape A4 pages", pages.every(([, c]) => c >= 1 && c <= 2), JSON.stringify(pages.filter(([, c]) => c > 2 || c < 1)) + " " + JSON.stringify(pages.map((x) => x[1])));
  // Library tile and voice
  await p.evaluate(() => { location.hash = "#biblioteca"; }); await H.wait(300);
  rec("Library has a Revision Cheat Sheets tile", !!(await p.$('a.stile[href="#chuletas"]')));
  await p.evaluate(() => window.__pv.route("open the cheat sheet for ser and estar", "chat")); await H.wait(900);
  rec("Voice: 'open the cheat sheet for ser and estar'", await p.evaluate(() => location.hash === "#chuleta-ser-estar"), await p.evaluate(() => location.hash));
  rec("No page errors", !H.errs.length, H.errs.join(" | "));
  await H.close(); console.log(R.filter(Boolean).length + "/" + R.length + " passed"); process.exit(R.every(Boolean) ? 0 : 1);
})();
