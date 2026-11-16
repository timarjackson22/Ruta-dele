// CR. DELE curriculum coverage dashboard (admin, #cobertura; tools/curric). 15 Nov 2026.
// Checks: admin gate, every tab draws, figures are derived from the content records, scenarios (missing mapping, partial outcome,
// invalid exercise, outdated source, new unmapped lesson), remediation + revalidation, exports, learner data untouched, no page errors.
const { open } = require("./h.js");
const fs = require("fs");
const R = []; const rec = (n, ok, info) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (!ok && info != null ? "  " + String(info).slice(0, 600) : "")); };
const PASS = (() => { try { return fs.readFileSync("/tmp/crpass", "utf8").trim(); } catch (e) { return process.env.CR_PASS || ""; } })();
(async () => {
  const H = await open({ hash: "#inicio", noOpen: true, init: () => { localStorage.setItem("ruta-v3", localStorage.getItem("ruta-v3") || ""); } }); const p = H.p; await H.wait(1200);
  p.on("dialog", (d) => d.accept("test note").catch(() => {}));
  const learnerBefore = await p.evaluate(() => JSON.stringify(Object.keys(localStorage).filter((k) => k !== "ruta-curric-admin" && k !== "rd-live").map((k) => [k, (localStorage.getItem(k) || "").length])));
  // 1. gate
  const row = await p.evaluate(() => { location.hash = "#ajustes"; return new Promise((r) => setTimeout(() => r(!!document.querySelector('#app a[href="#cobertura"]')), 600)); });
  await p.evaluate(() => { location.hash = "#cobertura"; }); await H.wait(700);
  const locked = await p.evaluate(() => !!document.querySelector('form[data-crform="login"]') && !document.querySelector(".cr-tabs"));
  await p.evaluate(() => { const f = document.querySelector('form[data-crform="login"]'); f.code.value = "wrong-code"; f.who.value = "Tester"; f.requestSubmit(); }); await H.wait(500);
  const wrong = await p.evaluate(() => /isn't right/.test((document.getElementById("cr-lmsg") || {}).textContent || "") && !document.querySelector(".cr-tabs"));
  await p.evaluate((code) => { const f = document.querySelector('form[data-crform="login"]'); f.code.value = code; f.who.value = "Tester"; f.requestSubmit(); }, PASS); await H.wait(4500);
  const opened = await p.evaluate(() => !!document.querySelector(".cr-tabs") && JSON.parse(localStorage.getItem("ruta-curric-admin")).who === "Tester");
  rec("Admin gate: Settings row; locked for learners; wrong passcode refused; right passcode opens it", row && locked && wrong && opened, JSON.stringify({ row, locked, wrong, opened }));
  // 2. every tab draws
  const tabs = ["overview", "heatmap", "register", "balance", "gaps", "dele", "score", "actions", "reports"], drawn = [];
  for (const t of tabs) { await p.evaluate((t) => { location.hash = "#cobertura/" + t; }, t); await H.wait(500); drawn.push(await p.evaluate((t) => document.querySelector('.cr-tabs [aria-selected="true"]').getAttribute("href") === "#cobertura/" + t && document.querySelector(".cr-body").innerText.length > 150, t)); }
  rec("All nine views draw (overview, heatmap, traceability, mix, gaps, DELE, scorecard, remediation, reports)", drawn.every(Boolean), JSON.stringify(drawn));
  // 3. figures come from the records
  const calc = await p.evaluate(async () => { const C = window.__curric, M = await C.model(), Rg = C.reg();
    const units = COURSE.filter((c) => ["a1", "a2", "b1", "b2", "c1", "c2"].includes(c.id)).reduce((n, c) => n + c.units.length, 0);
    const b1 = Rg.outcomes.filter((o) => o.lvl === "b1"), t = Math.round((b1.filter((o) => M.EV[o.id].t).length / b1.length) * 100);
    location.hash = "#cobertura/overview"; await new Promise((r) => setTimeout(r, 600));
    const row = [...document.querySelectorAll(".cr-tbl tbody tr")].find((tr) => tr.cells[0].textContent === "B1");
    // evidence ids point at real content
    const o = Rg.outcomes.find((x) => x.id === "g-subj-pres"), e = M.EV[o.id], tr = e.T.map((id) => M.inv.byId[id]);
    const items = M.inv.recs.filter((r) => r.role === "practice" && r.item).length, pxCount = COURSE.reduce((n, c) => n + c.units.reduce((m, u) => m + u.x.length + (u.mc || []).length + (u.tr || []).length + (u.fix || []).length, 0), 0);
    return { topics: M.inv.topics.length, units, b1T: t, shown: row && parseInt(row.cells[2].textContent, 10), outcomes: Rg.outcomes.length, subjTaught: e.t && tr.every((r) => r && r.link && /^#/.test(r.link)), subjTopics: e.topics.slice(0, 4), items, pxCount };
  });
  rec("Figures are derived from the content: topics = lessons + guides, B1 taught % matches the evidence, evidence links to real pages", calc.topics === calc.units + 23 && calc.shown === calc.b1T && calc.subjTaught && calc.items >= calc.pxCount && calc.outcomes > 200, JSON.stringify(calc));
  // 4. scenarios: outdated source, partial outcome, missing mapping, invalid exercise, unmapped new lesson
  const sc = await p.evaluate(async () => { const C = window.__curric, Rg = C.reg(); let M = await C.model();
    const superseded = (M.G.find((g) => g.rule === "source-superseded") || { oids: [] }).oids.length, c2 = Rg.outcomes.filter((o) => o.lvl === "c2" && o.kind === "dele").length;
    const partial = Rg.outcomes.find((o) => M.EV[o.id].cov === "partial");
    Rg.outcomes.push({ id: "test-missing", src: "pcic", lvl: "b1", ref: "test", comp: "gra", kind: "grammar", text: "TEST outcome with no content", kw: "zzqqxxnotfound", w: 3, status: "pending", rev: null, mastery: "", pre: [] });
    COURSE[0].units.push({ t: "TEST unidad", s: "test", v: [{ t: "x", w: [["a", "b"]] }], g: [{ t: "Test", r: "test rule", h: ["a"], rows: [["a"], ["b"]], n: [] }], x: [["Yo ___ (ser)", "soy", "ser"]], intro: "", e: [], pit: [], mc: [["Elige", ["uno", "dos"], 5, "bad key on purpose"]], tr: [], fix: [] });
    C.reset(); M = await C.model();
    const miss = M.EV["test-missing"], gapMiss = M.G.some((g) => g.oid === "test-missing" && g.rule === "not-taught" && g.sev === "high");
    const crit = M.G.find((g) => g.rule === "invalid-key"), unm = M.G.find((g) => g.rule === "unmapped-topic" && /TEST unidad/.test(g.detail)), S = C.score(M, "a1"), Sall = C.score(M, "all");
    COURSE[0].units.pop(); Rg.outcomes.pop(); C.reset(); const M2 = await C.model();
    return { superseded, c2, partial: partial && { id: partial.id, t: M.EV[partial.id].t, p: M.EV[partial.id].p, a: M.EV[partial.id].a }, missCov: miss.cov, gapMiss, crit: !!crit && crit.sev, unm: !!unm, capA1: S.capped && S.total === Rg.qa.critical_cap, capAll: Sall.capped, cleared: !M2.G.some((g) => g.rule === "invalid-key") && !M2.EV["test-missing"] };
  });
  rec("Outdated source: every C2 task row is flagged superseded (2014 guide vs 2024 exam)", sc.superseded === sc.c2 && sc.c2 > 0, JSON.stringify(sc));
  rec("Partially covered outcomes are reported per dimension", sc.partial && [sc.partial.t, sc.partial.p, sc.partial.a].some((x) => x === false) && [sc.partial.t, sc.partial.p].some(Boolean), JSON.stringify(sc.partial));
  rec("Missing mapping: an outcome with no content is 'missing' and becomes a high 'not taught' gap", sc.missCov === "missing" && sc.gapMiss, JSON.stringify(sc));
  rec("Invalid exercise: a bad answer key is a critical finding and caps the level and overall score; a new lesson is flagged as needing its own mapping", sc.crit === "critical" && sc.capA1 && sc.capAll && sc.unm && sc.cleared, JSON.stringify(sc));
  // 5. remediation workflow and revalidation
  const wf = await p.evaluate(async () => { const C = window.__curric, M = await C.model(), g = M.G.find((x) => x.rule === "exam-time") || M.G[0], s = C.store();
    s.issues[g.id] = { st: "fixed", t: new Date().toISOString(), hist: [{ t: new Date().toISOString(), who: "Tester", act: "fixed" }] }; s.issues["gone:example"] = { st: "fixed", t: new Date().toISOString(), hist: [] }; C.put(s);
    C.reset(); await C.model(); const s2 = C.store();
    location.hash = "#cobertura/actions"; await new Promise((r) => setTimeout(r, 600));
    const b = document.querySelector('[data-act="cr-iss"][data-v="approved"]'); if (b) b.click(); await new Promise((r) => setTimeout(r, 500));
    const s3 = C.store(); return { reopened: s2.issues[g.id].st, verified: s2.issues["gone:example"].st, approved: Object.values(s3.issues).some((x) => x.st === "approved"), log: s3.log.some((l) => /revalidate/.test(l.act)) && s3.log.some((l) => /issue approved/.test(l.act)) }; });
  rec("Remediation: 'fixed' is re-checked on revalidation (still detected → reopened, gone → verified); approval and audit log recorded", wf.reopened === "open" && wf.verified === "verified" && wf.approved && wf.log, JSON.stringify(wf));
  const val = await p.evaluate(async () => { location.hash = "#cobertura/register"; await new Promise((r) => setTimeout(r, 700)); const b = document.querySelector('[data-act="cr-val"][data-v="validated"]'), id = b.dataset.id; b.click(); await new Promise((r) => setTimeout(r, 600)); return window.__curric.store().val[id] && window.__curric.store().val[id].who === "Tester"; });
  rec("Register: an admin can mark an outcome validated (who and when kept)", val);
  // 6. exports
  const ex = await p.evaluate(async () => { const C = window.__curric, M = await C.model(), T = C.tables(M), blob = C.xlsx(T), buf = new Uint8Array(await blob.arrayBuffer()), txt = new TextDecoder().decode(buf);
    const csv = C.csv(T.find((x) => x[0] === "Register")[1]);
    document.querySelector('[data-act="cr-pack"]') || (location.hash = "#cobertura/reports"); await new Promise((r) => setTimeout(r, 600)); document.querySelector('[data-act="cr-pack"]').click(); await new Promise((r) => setTimeout(r, 600));
    const pack = document.getElementById("app").innerText;
    return { zip: buf[0] === 0x50 && buf[1] === 0x4b, sheets: (txt.match(/<sheet name=/g) || []).length, regRows: T.find((x) => x[0] === "Register")[1].length, csvLines: csv.split("\r\n").length, nOut: C.reg().outcomes.length,
      pack: /Curriculum Alignment Evidence Pack/.test(pack) && /does not imply accreditation/i.test(pack) && /Verified findings/.test(pack) && /Unvalidated claims/.test(pack) && /Internal estimates/.test(pack) }; });
  rec("Exports: .xlsx (zip, 10 sheets), register CSV (one row per outcome), evidence pack separates verified/estimates/unvalidated and disclaims accreditation", ex.zip && ex.sheets === 10 && ex.regRows === ex.nOut + 1 && ex.csvLines === ex.nOut + 1 && ex.pack, JSON.stringify(ex));
  // 7. learner data untouched, no errors
  const learnerAfter = await p.evaluate(() => JSON.stringify(Object.keys(localStorage).filter((k) => k !== "ruta-curric-admin" && k !== "rd-live").map((k) => [k, (localStorage.getItem(k) || "").length])));
  rec("Learner data untouched (the dashboard only writes its own admin key)", learnerBefore === learnerAfter, learnerBefore + " → " + learnerAfter);
  rec("No page errors", !H.errs.length, H.errs.join(" | "));
  await H.close(); console.log(R.filter(Boolean).length + "/" + R.length + " passed"); process.exit(R.every(Boolean) ? 0 : 1);
})();
