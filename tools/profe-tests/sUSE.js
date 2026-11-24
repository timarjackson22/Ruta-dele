// v296 — Profe knows how words are really used. A synonym that fits is right (with a note), one that fits only part of the
// prompt is right with what it doesn't cover, one that doesn't fit is explained; regional words are flagged for the learner's
// variety; inside a translated sentence a swapped word is judged the same way; and, with an AI brain, a rejected answer gets a
// second look and an accepted one a naturalness note. Claude is replaced by a local stand-in (no key, no cost).
const { open } = require("./h.js");
(async () => {
  const R = []; const rec = (n, ok, i) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (ok ? "" : "  " + String(i || "").slice(0, 400))); };
  const H = await open({ home: true }); const p = H.p;
  const J = (said, t, en) => p.evaluate(([s, t, e]) => window.__us.judge(s, t, e), [said, t, en]);
  let j = await J("permiso", ["Perdón"], "Sorry / Excuse me");
  rec("«permiso» for «Sorry / Excuse me»: right for excuse-me-to-get-past, with what it doesn't cover", j && j.v === "part" && /get past/.test(j.note) && /not an apology/.test(j.note), JSON.stringify(j));
  j = await J("disculpe", ["Perdón"], "Sorry / Excuse me"); rec("«disculpe» for «Sorry / Excuse me»: right", j && j.v === "ok", JSON.stringify(j));
  j = await J("lo siento", ["Disculpe"], "Excuse me (to get attention)"); rec("«lo siento» to get attention: explained as wrong", j && j.v === "no" && /attention/.test(j.note), JSON.stringify(j));
  j = await J("conocer", ["saber"], "to know (a fact)"); rec("saber / conocer: the qualifier decides", j && j.v === "no" && /person or a place/.test(j.note), JSON.stringify(j));
  j = await J("jugar", ["tocar"], "to play (the guitar)"); rec("jugar / tocar: an instrument needs tocar", j && j.v === "no", JSON.stringify(j));
  j = await J("largo", ["grande"], "big"); rec("False friend «largo» explained", j && j.v === "no" && /false friend/.test(j.note), JSON.stringify(j));
  await p.evaluate(() => { window.__usLat = true; }); j = await J("coche", ["carro"], "car");
  rec("Regional word: «coche» is right, and the learner is told it is mainly Spain", j && j.v === "ok" && /mainly said in Spain/.test(j.note), JSON.stringify(j)); await p.evaluate(() => { window.__usLat = null; });
  j = await J("casa", ["perro"], "dog"); rec("A word from the dictionary that means something else: what it means", j && j.v === "no" && /house/.test(j.note), JSON.stringify(j));
  // sentences: a swapped word judged in context
  let c = await p.evaluate(() => window.__ad.checkEs("No conozco dónde está la estación.", { q: "I don't know where the station is.", ans: ["No sé dónde está la estación."] }));
  rec("Sentence: «conozco» for «sé» is a mistake with the reason (saber vs conocer)", !c.ok && c.issues.some((x) => x.type === "usage" && /saber/.test(x.note)), JSON.stringify(c.issues));
  c = await p.evaluate(() => window.__ad.checkEs("Voy a regresar mañana.", { q: "I'm going to come back tomorrow.", ans: ["Voy a volver mañana."] }));
  rec("Sentence: «regresar» for «volver» is accepted, with a note", c.ok && c.usage.length && /regresar/.test(c.usage[0]), JSON.stringify(c));
  // the Vocabulary practice end to end: «Sorry / Excuse me» answered «permiso»
  await p.click('[data-act="pr-vocab"]').catch(() => {}); await H.wait(700);
  const st0 = await p.evaluate(() => { const P = window.__prState(); if (!P || P.kind !== "vo") return null; P.items[P.i] = ["Perdón", "Sorry / Excuse me"]; P.fb = null; window.__prTyped = true; window.__prAnswer("permiso"); const f = P.fb; return { ok: f && f.ok, note: f && f.note, score: P.score }; });
  await H.wait(300); const box = await p.evaluate(() => (document.querySelector("#tutor .prbox.ok, #tutor .prbox.bad") || {}).textContent || "");
  rec("Vocabulary practice: «permiso» for «Sorry / Excuse me» counts, and Profe says what it does and doesn't mean", st0 && st0.ok && /get past/.test(st0.note || "") && /permiso/.test(box) && /perdón/i.test(box), JSON.stringify([st0, box.slice(0, 300)]));
  // the AI second look (Claude stand-in): a rejected word it judges acceptable counts after all
  await p.route("https://api.anthropic.com/**", (route) => route.fulfill({ status: 200, headers: { "content-type": "application/json" }, body: JSON.stringify({ content: [{ type: "text", text: '{"ok":true,"natural":true,"better":"","why":"«hogar» is home in the sense of where you live."}' }] }) }));
  await p.evaluate(() => window.__useApi("sk-ant-test-123", "claude-haiku-5-5"));
  await p.evaluate(() => { const P = window.__prState(); window.__prNext && 0; P.i = 0; P.items[0] = ["la casa", "dog kennel"]; P.fb = null; window.__prAnswer("zzzz"); window.__prAnswer("hogar"); });
  await H.wait(1500);
  const sl = await p.evaluate(() => { const f = window.__prState().fb; return { ok: f.ok, second: f.second, note: f.note }; });
  rec("Second look: the AI's verdict can accept an answer the checker missed, with its reason", sl.ok && sl.second && /Second look/.test(sl.note), JSON.stringify(sl));
  rec("No page errors", !H.errs.length, H.errs.join(" | "));
  await H.close(); const f = R.filter((x) => !x).length; console.log(f ? f + " FAILED of " + R.length : "ALL " + R.length + " PASS"); process.exit(f ? 1 : 0);
})().catch((e) => { console.log("CRASH", e.message); process.exit(1); });
