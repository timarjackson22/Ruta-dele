// LF. Lesson flow (16 Nov 2026): Mastery exercises then Chapter challenge, type icons, tap-any-word meanings (not when it gives the
// answer away, not in exam mode), page mode with swipe/indicator/read-aloud page turns, Mastery full screen, Profe's button tucked away.
const { open } = require("./h.js");
const R = []; const rec = (n, ok, info) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (!ok && info != null ? "  " + String(info).slice(0, 500) : "")); };
(async () => {
  const H = await open({ hash: "#a2-u2", noOpen: true }); const p = H.p; await H.wait(1500);
  const o = await p.evaluate(() => { const a = document.getElementById("s-pra"), b = document.getElementById("s-chal");
    return { order: !!(a && b && a.compareDocumentPosition(b) & 4), title: /Mastery exercises/.test(a.querySelector("h2").textContent), lock: !!b.querySelector(".sk-lock .sk-locked"), anyway: !!b.querySelector(".sk-anyway"), jump: [...document.querySelectorAll("#app a, #app button")].some((x) => x.textContent.trim() === "Mastery") }; });
  rec("Lesson ends with 🎯 Mastery exercises, then the 🏆 Chapter challenge (locked until Mastery is done, 'Start anyway' available)", o.order && o.title && o.lock && o.anyway, JSON.stringify(o));
  // tap a Spanish word in the lesson (real mouse click)
  const pt = await p.evaluate(() => { const el = [...document.querySelectorAll("#app .es-w, #app td")].find((x) => /[a-záéíóúñ]{4,}/i.test(x.textContent) && x.getBoundingClientRect().height); el.scrollIntoView({ block: "center" });
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let tn; while ((tn = w.nextNode()) && !/[a-záéíóúñ]{4,}/i.test(tn.nodeValue)); const i = tn.nodeValue.search(/[a-záéíóúñ]{4,}/i), rg = document.createRange(); rg.setStart(tn, i); rg.setEnd(tn, i + 2); const rc = rg.getBoundingClientRect(); return { x: rc.left + 2, y: rc.top + rc.height / 2, word: tn.nodeValue.slice(i).match(/[a-záéíóúñ]+/i)[0] }; });
  await p.mouse.click(pt.x, pt.y); await H.wait(200);
  const pop = await p.evaluate(() => { const e = document.getElementById("lf-pop"); return e ? e.innerText : null; });
  const en = await p.evaluate(() => { const e = [...document.querySelectorAll("#app .lead2, #app p")].find((x) => /\b(the|when|with)\b/.test(x.textContent) && !x.closest("[data-act]") && x.getBoundingClientRect().height); if (!e) return null; e.scrollIntoView({ block: "center" });
    const w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT); let tn; while ((tn = w.nextNode()) && !/\bthe\b/.test(tn.nodeValue)); if (!tn) return null; const i = tn.nodeValue.search(/\bthe\b/), rg = document.createRange(); rg.setStart(tn, i); rg.setEnd(tn, i + 2); const rc = rg.getBoundingClientRect(); return { x: rc.left + 2, y: rc.top + rc.height / 2 }; });
  let enPop = "skip"; if (en) { await p.evaluate(() => { const e = document.getElementById("lf-pop"); if (e) e.remove(); }); await p.mouse.click(en.x, en.y); await H.wait(200); enPop = await p.evaluate(() => !!document.getElementById("lf-pop")); }
  rec("Tap a Spanish word in the lesson: its meaning pops up (🔊, More, + Save); English words don't", pop && pop.toLowerCase().includes(pt.word.toLowerCase().slice(0, 3)) && /Save/.test(pop) && enPop !== true, JSON.stringify({ pt, pop, enPop }));
  // runner type icons + Mastery full screen
  await p.evaluate(() => { const e = document.getElementById("lf-pop"); if (e) e.remove(); document.getElementById("s-pra").scrollIntoView(); }); await H.wait(200);
  const before = await p.evaluate(() => scrollY);
  await p.evaluate(() => { const b = document.querySelector('#s-pra [data-act="px-go"], #s-pra [data-act="px-restart"], #s-pra [data-act="px-dunno"]'); b.click(); }); await H.wait(400);
  const mf = await p.evaluate(() => ({ full: document.getElementById("s-pra").classList.contains("m-full"), bar: !!document.querySelector(".m-bar .sk-back"), icon: !!document.querySelector("#runner .pxi"), hdr: getComputedStyle(document.querySelector("header.top")).display }));
  await p.evaluate(() => document.querySelector('[data-act="m-close"]').click()); await H.wait(400);
  const back = await p.evaluate(() => ({ full: document.getElementById("s-pra").classList.contains("m-full"), y: scrollY }));
  rec("Mastery exercises open full screen (with ‹ Lesson and question-type icons) and ‹ Lesson returns to the same spot", mf.full && mf.bar && mf.icon && mf.hdr === "none" && !back.full && Math.abs(back.y - before) < 40, JSON.stringify({ mf, back, before }));
  // Profe's button tucked away; Profe in the top bar
  const pf = await p.evaluate(async () => { const r = { fab: getComputedStyle(document.getElementById("tutor-fab")).display, top: !!document.querySelector('#nb-tools [data-act="t-open"]'), mode: !!document.querySelector('#nb-tools [data-act="pg-mode"]') };
    document.getElementById("tutor-fab").hidden = false; document.getElementById("tabpeek").click(); await new Promise((x) => setTimeout(x, 100)); r.peek = getComputedStyle(document.getElementById("tutor-fab")).display; document.getElementById("tabpeek").click(); return r; });
  rec("During a lesson Profe is tucked away with the bottom menu (no P in the top bar); the ^ handle brings both back; page-mode switch in the top bar", pf.fab === "none" && !pf.top && pf.mode && pf.peek !== "none", JSON.stringify(pf));
  // page mode
  await p.evaluate(() => { scrollTo(0, 0); document.querySelector('[data-act="pg-mode"]').click(); }); await H.wait(700);
  const pm = await p.evaluate(() => ({ st: window.__lf.state(), nav: !!document.getElementById("lf-nav"), hint: /Swipe/.test((document.getElementById("lf-nav") || {}).innerText || ""), docH: document.documentElement.scrollHeight <= innerHeight + 40, fixed: getComputedStyle(document.querySelector(".pg-wrap")).position === "fixed", y0: scrollY }));
  await p.mouse.wheel(0, 600); await H.wait(200); const y1 = await p.evaluate(() => scrollY);
  const box = await p.evaluate(() => { const r = document.querySelector(".pg-wrap").getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + 200 }; });
  const swipe = async (dx) => { await p.evaluate(([x, y, dx]) => { const w = document.querySelector(".pg-wrap"), t0 = new Touch({ identifier: 1, target: w, clientX: x, clientY: y }), t1 = new Touch({ identifier: 1, target: w, clientX: x + dx, clientY: y + 4 }); w.dispatchEvent(new TouchEvent("touchstart", { bubbles: true, touches: [t0], changedTouches: [t0] })); w.dispatchEvent(new TouchEvent("touchend", { bubbles: true, touches: [], changedTouches: [t1] })); }, [box.x, box.y, dx]); await H.wait(450); };
  await swipe(-160); const s1 = await p.evaluate(() => window.__lf.state().i); await swipe(-160); const s2 = await p.evaluate(() => window.__lf.state().i); await swipe(160); const s3 = await p.evaluate(() => window.__lf.state().i);
  rec("Page mode: a fixed slide frame (the page never scrolls), one screen per page, swipe left/right turns pages, a small translucent '‹ n / N ›' indicator with a 'Swipe' hint", pm.st.on && pm.st.n > 3 && pm.nav && pm.hint && pm.fixed && y1 === pm.y0 && s1 === 1 && s2 === 2 && s3 === 1, JSON.stringify({ pm, y1, s1, s2, s3 }));
  // read-aloud turns the page
  const ra = await p.evaluate(async () => { const C = document.querySelector(".pg-cols"), els = [...C.querySelectorAll("p, li, td")]; const far = els.find((e) => window.__lf.state() && e.getBoundingClientRect().left - C.getBoundingClientRect().left > 4 * (C.parentElement.clientWidth + 40)); if (!far) return "no far element";
    far.classList.add("ra-now"); await new Promise((r) => setTimeout(r, 300)); const i = window.__lf.state().i; far.classList.remove("ra-now"); return i; });
  rec("While reading aloud, the page turns by itself to the line being read", typeof ra === "number" && ra >= 4, JSON.stringify(ra));
  await p.evaluate(() => document.querySelector('[data-act="pg-mode"]').click()); await H.wait(300);
  rec("Switching back to scroll view restores the normal lesson", await p.evaluate(() => !document.body.classList.contains("paged") && !document.querySelector(".pg-wrap")));
  // drills: no meanings where they'd give the answer away; allowed on grammar prompts
  await p.evaluate(() => { location.hash = "#ejercicios/a2-u2/1"; }); await H.wait(500);
  const dr = await p.evaluate(() => { const K = window.__sk, S = K.state(); S.list = [{ type: "meaning", show: "Leía cuando llegó mi hermano", say: "x", ans: "a", opts: ["a", "b", "c"], lvl: "a2" }, { type: "acad", it: { t: "x", q: "De niño (yo) ___ en Bogotá. (vivir)", a: ["vivía"], why: "" }, lvl: "a2" }]; S.i = 0; S.st = {}; K.render();
    const off1 = !!document.querySelector('.drbody[data-gloss="off"]'); S.i = 1; S.st = {}; K.render(); const off2 = !!document.querySelector('.drbody[data-gloss="off"]'); return { off1, off2, fab: getComputedStyle(document.getElementById("tutor-fab")).display }; });
  rec("Drills: meanings are off where they'd give the answer away (e.g. 'what does this mean?'), on for grammar prompts; Profe's button hidden", dr.off1 && !dr.off2 && dr.fab === "none", JSON.stringify(dr));
  // exams: exam mode locked
  await p.evaluate(() => { location.hash = "#a1-examen-1-lectura"; }); await H.wait(800);
  const ex = await p.evaluate(() => window.__lf.locked());
  rec("Mock exams (exam conditions): no word meanings", ex === true, JSON.stringify(ex));
  rec("No page errors", !H.errs.length, H.errs.join(" | "));
  await H.close(); console.log(R.filter(Boolean).length + "/" + R.length + " passed"); process.exit(R.every(Boolean) ? 0 : 1);
})();
