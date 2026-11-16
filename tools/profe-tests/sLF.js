// LF. Lesson flow (16 Nov 2026): Mastery exercises then Chapter challenge, type icons, tap-any-word meanings (not when it gives the
// answer away, not in exam mode), page mode with swipe/indicator/read-aloud page turns, Mastery full screen, Profe's button tucked away.
const { open } = require("./h.js");
const R = []; const rec = (n, ok, info) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (!ok && info != null ? "  " + String(info).slice(0, 500) : "")); };
(async () => {
  const H = await open({ hash: "#a2-u2", noOpen: true }); const p = H.p; await H.wait(1500);
  const o = await p.evaluate(() => { const a = document.getElementById("s-pra"), b = document.getElementById("s-chal");
    return { order: !!(a && b && a.compareDocumentPosition(b) & 4), title: /Mastery exercises/.test(a.querySelector("h2").textContent), lock: !!b.querySelector(".sk-chal.sk-lock"), anyway: !!b.querySelector(".sk-anyway"), jump: [...document.querySelectorAll("#app a, #app button")].some((x) => x.textContent.trim() === "Mastery") }; });
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
  // page mode: pages follow the lesson's structure; switching keeps your place both ways
  const navTop = () => p.evaluate(() => document.getElementById("lf-nav").getBoundingClientRect().top);
  const raScroll = await p.evaluate(() => window.__raCollect().length);
  await p.evaluate(() => { const g = document.querySelector("#s-gra .gblock h3") || document.querySelector("#s-gra"); const hdr = document.querySelector("header.top").getBoundingClientRect().bottom; scrollTo(0, g.getBoundingClientRect().top + scrollY - hdr - 4); window.__anc = g; }); await H.wait(300);
  await p.evaluate(() => document.querySelector('[data-act="pg-mode"]').click()); await H.wait(1500);
  const pm = await p.evaluate(() => { const st = window.__lf.state(), N = document.getElementById("lf-nav"); const vis = [...document.querySelectorAll("#app .stack *")].filter((e) => e.offsetParent !== null && e.offsetHeight > 0);
    return { st, here: window.__lf.pageOf(window.__anc) === st.i, ancVis: window.__anc.offsetParent !== null, nav: !!N, lab: N && N.querySelector(".lf-lab").textContent, num: N && N.querySelector(".lf-num").textContent, hint: /Swipe/.test(N.innerText), bot: Math.max(...vis.map((e) => e.getBoundingClientRect().bottom)), navTop: N.getBoundingClientRect().top, cut: [...document.querySelectorAll("#app .pg-wrap, #app .pg-cols")].length }; });
  rec("Page view keeps your place: the block at the top of the screen opens on its page; a page bar shows the section, 'Page n of N' and a hint", pm.st.on && pm.st.n > 5 && pm.here && pm.ancVis && pm.nav && /Grammar/.test(pm.lab) && /^Page \d+ of \d+$/.test(pm.num) && pm.hint && !pm.cut, JSON.stringify(pm));
  rec("Nothing on the page sits under the page bar", pm.bot <= pm.navTop + 1, JSON.stringify({ bot: pm.bot, navTop: pm.navTop }));
  const swipe = async (dx) => { await p.evaluate((dx) => { const w = document.querySelector("#app .stack"), x = 200, y = 300, t0 = new Touch({ identifier: 1, target: w, clientX: x, clientY: y }), t1 = new Touch({ identifier: 1, target: w, clientX: x + dx, clientY: y + 4 });
    w.dispatchEvent(new TouchEvent("touchstart", { bubbles: true, touches: [t0], changedTouches: [t0] })); w.dispatchEvent(new TouchEvent("touchend", { bubbles: true, touches: [], changedTouches: [t1] })); }, dx); await H.wait(350); return p.evaluate(() => window.__lf.state().i); };
  const i0 = pm.st.i, s1 = await swipe(-160), s2 = await swipe(160);
  await p.keyboard.press("ArrowRight"); await H.wait(300); const k1 = await p.evaluate(() => window.__lf.state().i); await p.keyboard.press("ArrowLeft"); await H.wait(300); const k2 = await p.evaluate(() => window.__lf.state().i);
  rec("Swipe left/right and the arrow keys turn the page", s1 === i0 + 1 && s2 === i0 && k1 === i0 + 1 && k2 === i0, JSON.stringify({ i0, s1, s2, k1, k2 }));
  // every page: nothing under the bar, nothing missing, no heading left at the foot of a page
  const all = await p.evaluate(() => { const st = window.__lf.state(), root = document.querySelector("#app > .stack"), seen = new Set(), bad = [], cur = st.i;
    const T = [...root.querySelectorAll("*")].filter((e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.nodeValue.trim().length > 1) && !e.closest(".crumbs, .jump"));
    for (let k = 0; k < st.n; k++) { window.__lf.go(k); const v = T.filter((e) => e.offsetParent !== null); v.forEach((e) => seen.add(e)); const nt = document.getElementById("lf-nav").getBoundingClientRect().top;
      if (window.__lf.state().pages[k] > 1 && Math.max(...v.map((e) => e.getBoundingClientRect().bottom)) > nt + 1) bad.push("over " + k);
      const hs = [...root.querySelectorAll("h2, h3, p.rule")].filter((e) => e.offsetParent !== null), last = hs[hs.length - 1]; if (last && k < st.n - 1 && !v.some((e) => e.getBoundingClientRect().top > last.getBoundingClientRect().bottom + 2)) bad.push("heading alone " + k); }
    document.body.classList.add("pg-measure"); const miss = T.filter((e) => !seen.has(e) && e.offsetParent !== null).length; document.body.classList.remove("pg-measure"); window.__lf.go(cur); if (miss) bad.push("missing " + miss); return { n: st.n, bad }; });
  rec("Every page fits above the bar, no text is lost to pagination, no heading is left alone at the foot of a page", !all.bad.length, JSON.stringify(all));
  // read-aloud still reads the whole lesson, and turns to the page being read
  const ra = await p.evaluate(async () => { const n = window.__raCollect().length; const st = window.__lf.state(); const far = [...document.querySelectorAll("#s-eje td, #s-err td")].find((e) => window.__lf.pageOf(e) > st.i + 2);
    far.classList.add("ra-now"); await new Promise((r) => setTimeout(r, 300)); const i = window.__lf.state().i, want = window.__lf.pageOf(far), vis = far.offsetParent !== null; far.classList.remove("ra-now"); return { n, i, want, vis }; });
  rec("Read-aloud in page view reads the whole lesson (not just this page) and turns to the page being read", ra.n === raScroll && ra.i === ra.want && ra.vis, JSON.stringify({ ra, raScroll }));
  // a page that ends part-way through a topic says it continues; reading aloud starts at the top of the page you're on
  const ct = await p.evaluate(async () => { const st = window.__lf.state(); let found = null;
    for (let k = 0; k < st.n - 1 && !found; k++) { window.__lf.go(k); const c = document.getElementById("lf-cont"); if (c && getComputedStyle(c).display !== "none") { window.__lf.go(k + 1); const first = [...document.querySelectorAll("#app .pg-first")].pop(); found = { k, txt: c.textContent, nextStartsWithHeading: !!(first && first.matches("h2, h3, .shead")) }; } }
    window.__lf.go(st.i); return found; });
  rec("A page that ends part-way through a topic says '… continues on the next page'", ct && /continues on the next page/.test(ct.txt) && !ct.nextStartsWithHeading, JSON.stringify(ct));
  const rp = await p.evaluate(async () => { const st = window.__lf.state(); window.__lf.go(Math.min(st.n - 2, 8)); const k = window.__lf.state().i; document.querySelector('[data-act="pg-read"]').click(); await new Promise((r) => setTimeout(r, 500));
    const now = document.querySelector(".ra-now"); const r = { k, page: now ? window.__lf.pageOf(now) : -1, i: window.__lf.state().i }; document.querySelector('[data-act="ra-stop"]') ? document.querySelector('[data-act="ra-stop"]').click() : null; try { speechSynthesis.cancel(); } catch (e) {} return r; });
  rec("Read aloud in page view starts at the top of the page you're on and stays in step with the pages", rp.page === rp.k && rp.i === rp.k, JSON.stringify(rp));
  const sk = await p.evaluate(async () => { const w = (ms) => new Promise((r) => setTimeout(r, ms)); const st = window.__lf.state(); window.__lf.go(Math.min(st.n - 4, 6)); document.querySelector('[data-act="pg-read"]').click(); await w(500);
    const k0 = window.__lf.state().i; document.querySelector('[data-act="pg-next"]').click(); await w(500); const a = document.querySelector(".ra-now"), r1 = { i: window.__lf.state().i, on: document.body.classList.contains("ra-on"), page: a ? window.__lf.pageOf(a) : -1 };
    document.querySelector('[data-act="pg-next"]').click(); await w(500); const b = document.querySelector(".ra-now"), r2 = { i: window.__lf.state().i, page: b ? window.__lf.pageOf(b) : -1 };
    const s2 = document.querySelector('[data-act="ra-stop"]'); if (s2) s2.click(); try { speechSynthesis.cancel(); } catch (e) {} return { k0, r1, r2 }; });
  rec("Turning the page while it reads aloud: the voice jumps to the top of the page you turned to and keeps reading", sk.r1.on && sk.r1.i === sk.k0 + 1 && sk.r1.page === sk.r1.i && sk.r2.i === sk.k0 + 2 && sk.r2.page === sk.r2.i, JSON.stringify(sk));
  // a returning learner comes back to the same page
  await p.evaluate(() => window.__lf.go(window.__lf.state().i + 1)); await H.wait(200); const bef = await p.evaluate(() => ({ i: window.__lf.state().i }));
  await p.reload(); await H.wait(2600); const after = await p.evaluate(() => window.__lf.state());
  rec("Returning learner: page view is remembered and the lesson reopens on the same page", after.on && after.i === bef.i, JSON.stringify({ bef, after }));
  // switching back and forth keeps the same block on screen
  const sw = await p.evaluate(async () => { const w = (ms) => new Promise((r) => setTimeout(r, ms)), out = [];
    for (let r = 0; r < 3; r++) { const anc = [...document.querySelectorAll("#app .pg-first")].filter((e) => e.offsetHeight > 0).pop();
      document.querySelector('[data-act="pg-mode"]').click(); await w(600); const hdr = document.querySelector("header.top").getBoundingClientRect().bottom, top = anc.getBoundingClientRect().top; const scrollOk = !document.body.classList.contains("paged") && top >= hdr - 4 && top < hdr + 220;
      document.querySelector('[data-act="pg-mode"]').click(); await w(1500); const pageOk = document.body.classList.contains("paged") && anc.offsetParent !== null; out.push([scrollOk, pageOk, Math.round(top - hdr)]); }
    return out; });
  rec("Switching to scroll view and back, three times: the same block stays on screen each way", sw.every((x) => x[0] && x[1]), JSON.stringify(sw));
  await p.evaluate(() => document.querySelector('[data-act="pg-mode"]').click()); await H.wait(400);
  rec("Scroll view restores the whole lesson (nothing left hidden, no page bar)", await p.evaluate(() => !document.body.classList.contains("paged") && !document.querySelector("#app .pg-off") && !document.getElementById("lf-nav")));
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
