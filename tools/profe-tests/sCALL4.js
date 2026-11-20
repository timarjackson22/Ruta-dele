// v251 — the 4th S24 call log (2026-11-20 16:55–17:09): Profe heard his own drill instructions as the learner's turn; «hoy»
// opened Home mid-call; the session restarted every 2–3 turns (big prompt) and Profe greeted again; English nudges; the first
// greeting failed («synthesis-failed») and the call went silent; «mi nombre estimar»; the full scene crashed the phone.
const { open, overlapMic } = require("./h.js");
(async () => {
  const R = []; const rec = (n, ok, i) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (ok ? "" : "  " + (i || ""))); };
  const H = await open(); const p = H.p; await p.evaluate(() => window.__setName("Timar", true));
  // the first greeting fails once → it is spoken again
  await p.evaluate(() => { window.__T.failEs = true; setTimeout(() => (window.__T.failEs = false), 200); });
  await p.evaluate(() => document.querySelector('[data-act="vc-open"]').click()); await H.wait(7000);
  const g = (await H.tts()).filter((e) => !e.failed).map((e) => e.text).join(" ");
  rec("A greeting that fails to start («synthesis-failed») is spoken again", /Hola, Timar/.test(g), g);
  rec("The Android app uses the lighter call scene (no blur)", await p.evaluate(() => document.getElementById("vcall").classList.contains("vc-safe")));
  await p.waitForFunction(() => window.__vc.state() === "listening" && window.__R.on, null, { timeout: 15000 });
  // «hoy» alone does not navigate
  const h0 = await p.evaluate(() => location.hash); await H.say("hoy"); await H.wait(6000);
  rec("«Hoy» in a call doesn't open Home", (await p.evaluate(() => location.hash)) === h0, await p.evaluate(() => location.hash));
  // a real sentence is a turn; Profe's own words coming back right after he spoke are not
  await p.waitForFunction(() => window.__vc.state() === "listening" && window.__R.on, null, { timeout: 20000 });
  await H.replies([{ text: "¡Qué bien! El mercado es un lugar muy bonito para comprar fruta fresca. ¿Qué compraste? [[·]]", delay: 40 }]);
  const k0 = (await H.reqs()).length; await H.say("ayer fui al mercado con mi hermana"); await H.wait(9000);
  rec("A real sentence is a turn", (await H.reqs()).length > k0);
  // the S24 echo: an instant (non-AI) reply right after «thinking» — the mic must never be open while Profe speaks
  await p.waitForFunction(() => window.__vc.state() === "listening" && window.__R.on, null, { timeout: 15000 });
  await H.say("quiero practicar cambiar"); await H.wait(9000);
  const ov = overlapMic(await H.tts(), await H.stt());
  rec("The mic is never open while Profe speaks (also around an instant drill reply)", !ov.length, ov.slice(0, 3).join(" | "));
  rec("Echo check: 5+ of Profe's words in a row are recognised as his voice", await p.evaluate(() => window.__vcIsEcho("Presente de cambiar yo te digo el tiempo") || window.__vcIsEcho("El mercado es un lugar muy bonito para comprar")));
  await H.say("stop"); await H.wait(4000);
  // the on-device call prompt is small, and says not to greet again
  const sys = await p.evaluate(() => window.__L.sys || "");
  rec("The on-device call instructions are small (≤ 3,000 characters) and say not to greet again", sys.length > 500 && sys.length <= 3000 && /never greet again/.test(sys), sys.length);
  rec("A «¡Hola, Timar!» at the start of a mid-call reply is dropped", await p.evaluate(() => window.__dropHola("¡Hola, Timar! Me gusta mucho el mercado. ¿Qué compraste?") === "Me gusta mucho el mercado. ¿Qué compraste?"));
  const nm = await p.evaluate(() => [window.__vcNameFrom("mi nombre estimar"), window.__vcNameFrom("My name is to Mark")]);
  rec("Names: «mi nombre estimar» → Timar, «my name is to Mark» → Mark", nm[0] === "Timar" && nm[1] === "Mark", JSON.stringify(nm));
  // a learner asked to repeat a sentence is not «an echo»
  await p.waitForFunction(() => window.__vc.state() === "listening" && window.__R.on, null, { timeout: 15000 });
  await H.replies([{ text: "Muy bien. Repite: quiero comprar fruta fresca en el mercado. [[·]]", delay: 40 }]);
  await H.say("puedes darme una frase para practicar"); await H.wait(9000);
  await p.waitForFunction(() => window.__vc.state() === "listening" && window.__R.on, null, { timeout: 15000 }); await H.wait(1800);
  const k1 = (await H.reqs()).length; await H.say("quiero comprar fruta fresca en el mercado"); await H.wait(8000);
  rec("Repeating a sentence Profe asked for still counts as a turn", (await H.reqs()).length > k1);
  rec("An answer that reuses Profe's words («sí, me gusta el mercado bonito») is not an echo", await p.evaluate(() => !window.__vcIsEcho("sí me gusta el mercado bonito")));
  rec("No page errors", !H.errs.length, H.errs.join(" | "));
  await H.close(); const bad = R.filter((x) => !x).length; console.log(bad ? bad + " FAILED of " + R.length : "ALL " + R.length + " PASS"); process.exit(bad ? 1 : 0);
})();
