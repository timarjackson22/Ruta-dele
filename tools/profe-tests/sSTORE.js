// v242 storage guard: Profe's history can no longer fill the browser store and silently block progress saves.
// Seeds a store that is already full (huge Profe history + caches), then checks progress still saves, Profe trims its
// history to the budget (recent conversations kept, notes kept), and a genuinely full store warns the learner once.
const { open } = require("./h.js");
(async () => {
  const R = []; const rec = (n, ok, i) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (ok ? "" : "  " + (i || ""))); };
  const H = await open({ noOpen: true, init: () => { if (localStorage.getItem("seeded")) return; localStorage.setItem("seeded", 1);
    const msg = (i) => ({ r: i % 2 ? "a" : "u", c: "Muy bien, ayer fuiste al mercado y compraste fruta. Useful word: la fruta — fruit. ¿Qué más hiciste? ".repeat(3), t: Date.now() - i * 1000 });
    const ses = []; for (let s = 0; s < 160; s++) ses.push({ id: "s" + s, title: "Chat " + s, updated: Date.now() - s * 1e6, msgs: Array.from({ length: 80 }, (_, i) => msg(i)) });
    localStorage.setItem("vcap:x", "c".repeat(300000)); localStorage.setItem("lrc:y", "l".repeat(300000));
    for (let n = ses.length; n > 0; n--) { try { localStorage.setItem("ruta-dele-tutor-v1", JSON.stringify({ sessions: ses.slice(0, n), memory: "Learner: Timar, Panama" })); break; } catch (e) {} }
    // top the store up to the brim
    let pad = "p".repeat(100000), i = 0; for (;;) { try { localStorage.setItem("zz-fill" + i++, pad); } catch (e) { if (pad.length < 100) break; pad = pad.slice(pad.length / 2); } }
    window.__startFull = (() => { try { localStorage.setItem("probe", "x".repeat(5000)); localStorage.removeItem("probe"); return false; } catch (e) { return true; } })(); } });
  const p = H.p; await H.wait(800);
  rec("Store starts full", await p.evaluate(() => window.__startFull));
  const r = await p.evaluate(() => { localStorage.removeItem("zz-fill0"); localStorage.removeItem("zz-fill1"); /* a little room, as on a real phone */
    const before = JSON.parse(localStorage.getItem("ruta-dele-v1") || "{}"); window.__S_test = Date.now();
    const ok = window.lsSet("ruta-dele-v1", JSON.stringify(Object.assign(before, { probe: window.__S_test, big: "b".repeat(400000) })));
    const back = JSON.parse(localStorage.getItem("ruta-dele-v1") || "{}"); const T = JSON.parse(localStorage.getItem("ruta-dele-tutor-v1") || "{}");
    return { ok, saved: back.probe === window.__S_test, tutorLen: (localStorage.getItem("ruta-dele-tutor-v1") || "").length, sessions: (T.sessions || []).length, newest: T.sessions && T.sessions[0] && T.sessions[0].id, memory: T.memory, caches: Object.keys(localStorage).filter((k) => /^(vcap|lrc):/.test(k)).length }; });
  rec("A progress save that doesn't fit makes room and is kept", r.ok && r.saved, JSON.stringify(r));
  rec("Caches were cleared first", r.caches === 0, r.caches);
  rec("Profe history trimmed to the budget, newest conversation and notes kept", r.tutorLen <= 1000000 && r.sessions >= 5 && r.newest === "s0" && /Timar/.test(r.memory || ""), JSON.stringify({ len: r.tutorLen, n: r.sessions, newest: r.newest }));
  // Profe still works and its own save respects the budget
  await p.evaluate(() => document.body.classList.add("tabs-peek")); await p.click('[data-act="t-open"]'); await H.wait(400); await p.evaluate(() => document.querySelector("#tutor .pchat-in").click()); await H.wait(200);
  await H.type("hola, ¿qué tal?"); await H.idle(8000);
  rec("Profe answers on a nearly full store", (await H.reqs()).length >= 1);
  // impossible save: warns once, doesn't throw
  const w = await p.evaluate(() => { const ok = window.lsSet("ruta-test-huge", "h".repeat(6000000)); return { ok, banner: document.querySelectorAll("#ls-full").length }; });
  rec("A save that can never fit: the learner is told once", !w.ok && w.banner === 1, JSON.stringify(w));
  rec("No page errors", !H.errs.length, H.errs.join(" | "));
  await H.close(); const bad = R.filter((x) => !x).length; console.log(bad ? bad + " FAILED of " + R.length : "ALL " + R.length + " PASS"); process.exit(bad ? 1 : 0);
})();
