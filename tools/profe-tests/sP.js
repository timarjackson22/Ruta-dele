// P. Hands-free page awareness: arriving on a page says where you are, and every phrase it suggests really works there (round 4, 15 Nov 2026)
const { open } = require("./h.js");
const R = []; const rec = (n, ok, info) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (!ok && info != null ? "  " + String(info).slice(0, 400) : "")); };
const PAGES = ["#hoy", "#curso", "#a1", "#a1-u1", "#a1-examenes", "#a1-examen-1", "#a1-examen-1-lectura", "#examenes", "#drill", "#practicar", "#repaso", "#errores", "#biblioteca", "#escuchar", "#leer", "#escritura", "#videos", "#verbos", "#palabras", "#gramatica", "#guias", "#nivel", "#progreso", "#ajustes", "#costes"];
(async () => {
  const H = await open({ hash: "#hoy", noOpen: true }); const p = H.p;
  for (const h of PAGES) {
    await p.evaluate((h) => { location.hash = h; }, h); await H.wait(900);
    const r0 = await p.evaluate(() => { const intro = window.__pv.intro(); return { intro, says: [...intro.matchAll(/“([^”]+)”/g)].map((m) => m[1]) }; });
    const bad = [];
    for (const t of r0.says) { // really say it: a registry command, a button on the page or a name all count, as long as it's carried out
      await p.evaluate((h) => { if (location.hash !== h) location.hash = h; window.__pvLast = null; }, h); await H.wait(700);
      if (h === "#a1-examen-1-lectura" && /question|submit/.test(t)) { await p.evaluate(() => { const b = document.querySelector('[data-act="ex-start"]'); b && b.click(); }); await H.wait(500); }
      const ok = await p.evaluate(async (t) => { const h0 = location.hash, m = window.__pv.match(t); const handled = window.__pv.route(t, "chat"); await new Promise((r) => setTimeout(r, 1200)); const L = window.__pvLast; return !!m || (handled && ((L && L.ok) || location.hash !== h0)); }, t);
      if (!ok) bad.push(t);
    }
    const r = { intro: r0.intro, says: r0.says, bad };
    rec(h + ": “" + r.intro.slice(0, 70) + "…” — suggested phrases all understood", /^You're now on /.test(r.intro) && r.says.length >= 1 && !r.bad.length, "not understood: " + JSON.stringify(r.bad));
  }
  // second visit is short
  const again = await p.evaluate(() => window.__pv.intro());
  rec("Coming back to a page: a short confirmation", /^You're on .*What would you like to do\?$/.test(again), again);
  rec("No page errors", !H.errs.length, H.errs.join(" | "));
  await H.close();
  console.log(R.every(Boolean) ? "ALL " + R.length + " PASS" : R.filter((x) => !x).length + " FAILED of " + R.length);
})();
