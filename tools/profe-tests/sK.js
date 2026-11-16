// K. Revision Cheat Sheets (M5, 15 Nov 2026): coverage against the Guides, filters, bookmarks, print layout (≤ 2 landscape pages), voice.
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
  rec("Coverage: a card for every Guide topic (" + cov.n + ")", cov.cards === cov.n && cov.n === 23, JSON.stringify(cov).slice(0, 200));
  rec("Coverage: every sheet has all guide rules (same titles, in order), examples, a decision diagram, exceptions, mistakes, memory aid, exam tips", !cov.bad.length && cov.extraIds, JSON.stringify(cov.bad));
  // search and filters
  await p.fill("#ch-q", "subjunt"); await H.wait(200);
  let n = await p.$$eval(".chcard", (x) => x.map((a) => a.getAttribute("href")));
  rec("Search narrows the list (and keeps focus in the box)", n.length >= 1 && n.length < 23 && n.includes("#chuleta-subjuntivo") && await p.evaluate(() => document.activeElement && document.activeElement.id === "ch-q"), JSON.stringify(n));
  await p.fill("#ch-q", ""); await p.click('[data-act="ch-lv"][data-v="b1"]'); await H.wait(150);
  n = await p.$$eval(".chcard .chlv", (x) => x.map((a) => a.textContent));
  rec("Level filter shows only that level", n.length > 0 && n.every((x) => x === "B1"), JSON.stringify(n));
  // a sheet: links, bookmark persists
  await p.evaluate(() => { location.hash = "#chuleta-por-para"; }); await H.wait(400);
  const a4 = await p.evaluate(() => { const b = document.getElementById("chpages"); return b ? { pages: +b.dataset.pages, pg: document.querySelectorAll(".chpg").length, w: getComputedStyle(document.querySelector(".chpg")).width, h: getComputedStyle(document.querySelector(".chpg")).height } : null; });
  rec("A4 landscape page view is the default: 1123×794 px pages (297×210 mm), 1–2 pages", a4 && a4.w === "1123px" && Math.abs(parseFloat(a4.h) - 794) < 1 && a4.pages >= 1 && a4.pages <= 2 && a4.pg === a4.pages, JSON.stringify(a4));
  await p.click('[data-act="ch-view"][data-v="phone"]'); await H.wait(300);
  const sh = await p.evaluate(() => ({ cols: document.querySelectorAll(".chcols > section").length, guide: !!document.querySelector('a[href="#guia-por-para"]'), flow: document.querySelectorAll(".chpath li").length, h: document.querySelector(".chsheet h1").textContent }));
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
  // print: landscape, at most two pages for every topic (A4 page view prints its pages as shown)
  await p.evaluate(() => { location.hash = "#chuleta-por-para"; }); await H.wait(300); await p.click('[data-act="ch-view"][data-v="a4"]'); await H.wait(300);
  const pages = [];
  for (const g of await p.evaluate(() => window.__ch.guides().map((x) => x.id))) {
    await p.evaluate((id) => { location.hash = "#chuleta-" + id; document.body.classList.add("ch-print-a4"); }, g); await H.wait(450);
    const pdf = await p.pdf({ landscape: true, format: "A4", printBackground: false, preferCSSPageSize: true });
    const cnt = Math.max(0, ...(pdf.toString("latin1").match(/\/Count\s+(\d+)/g) || []).map((x) => +x.replace(/\D/g, ""))); pages.push([g, cnt]);
  }
  await p.evaluate(() => document.body.classList.remove("ch-print-a4"));
  rec("Print: every sheet fits on one or two landscape A4 pages", pages.every(([, c]) => c >= 1 && c <= 2), JSON.stringify(pages.filter(([, c]) => c > 2 || c < 1)) + " " + JSON.stringify(pages.map((x) => x[1])));
  // printing from the browser menu while in phone view still prints the A4 pages, then returns to phone view; headings stay with their first item
  await p.evaluate(() => { location.hash = "#chuleta-subjuntivo"; }); await H.wait(300); await p.click('[data-act="ch-view"][data-v="phone"]'); await H.wait(300);
  await p.evaluate(() => window.dispatchEvent(new Event("beforeprint"))); await H.wait(200);
  const mp = await p.evaluate(() => ({ a4: !!document.getElementById("chpages"), cls: document.body.classList.contains("ch-print-a4"), kept: [...document.querySelectorAll(".chflowa4 .chkeep")].every((k) => k.querySelector("h2") && k.querySelector("li")) }));
  const pdf2 = await p.pdf({ landscape: true, format: "A4", preferCSSPageSize: true }); const n2 = Math.max(0, ...(pdf2.toString("latin1").match(/\/Count\s+(\d+)/g) || []).map((x) => +x.replace(/\D/g, "")));
  await p.evaluate(() => window.dispatchEvent(new Event("afterprint"))); await H.wait(200);
  const back = await p.evaluate(() => !document.getElementById("chpages") && !document.body.classList.contains("ch-print-a4"));
  rec("Browser-menu print from phone view: A4 pages printed (≤ 2), headings kept with their first item, phone view restored", mp.a4 && mp.cls && mp.kept && n2 >= 1 && n2 <= 2 && back, JSON.stringify([mp, n2, back]));
  await p.click('[data-act="ch-view"][data-v="a4"]').catch(() => {}); await H.wait(200);
  // the superlatives and diminutives guide (added 15 Nov 2026): guide page, cheat sheet and voice
  await p.evaluate(() => { location.hash = "#guia-superlativos-diminutivos"; }); await H.wait(600);
  const sg = await p.evaluate(() => { const t = document.getElementById("app").innerText; return { h: /Superlatives and diminutives/.test(t), isimo: /-ísimo/.test(t), ito: /cafecito/.test(t), azo: /golazo/.test(t) }; });
  rec("New guide: Superlatives and diminutives opens with -ísimo, -ito and -azo sections", sg.h && sg.isimo && sg.ito && sg.azo, JSON.stringify(sg));
  await p.evaluate(() => window.__pv.route("open the diminutives cheat sheet", "chat")); await H.wait(900);
  rec("Voice: 'open the diminutives cheat sheet'", await p.evaluate(() => location.hash === "#chuleta-superlativos-diminutivos"), await p.evaluate(() => location.hash));
  // Library tile and voice
  await p.evaluate(() => { location.hash = "#biblioteca"; }); await H.wait(300);
  rec("Library has a Revision Cheat Sheets tile", !!(await p.$('a.stile[href="#chuletas"]')));
  await p.evaluate(() => window.__pv.route("open the cheat sheet for ser and estar", "chat")); await H.wait(900);
  rec("Voice: 'open the cheat sheet for ser and estar'", await p.evaluate(() => location.hash === "#chuleta-ser-estar"), await p.evaluate(() => location.hash));
  rec("No page errors", !H.errs.length, H.errs.join(" | "));
  await H.close(); console.log(R.filter(Boolean).length + "/" + R.length + " passed"); process.exit(R.every(Boolean) ? 0 : 1);
})();
