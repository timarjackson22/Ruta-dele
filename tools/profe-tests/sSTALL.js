// v241: Profe must never stay stuck when the phone's on-device AI hangs or stalls.
// - no first word: gives up (60 s with the model loaded) with a clear message or the app's own answer, and Profe takes new messages
// - a new message while the AI hangs replaces the old one at once (no waiting for the phone to confirm), no "Thinking…" left behind
// - a reply that stops mid-way keeps what was written (15 s without a word)
const { open } = require("./h.js");
(async () => {
  const H = await open(); const p = H.p; const R = []; const rec = (n, ok, i) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (ok ? "" : "  " + (i || ""))); };
  const hangNext = () => p.evaluate(() => { const o = AndroidLLM.chat; AndroidLLM.chat = function (id) { AndroidLLM.chat = o; __L.cur = { id }; }; });
  const canTalk = async (tag) => { await H.replies([{ text: "Te escucho. [[·]]", delay: 50 }]); const n = (await H.reqs()).length; await H.type("prueba " + tag); await H.idle(8000); return (await H.reqs()).length > n; };
  // 1. hang without a word
  await hangNext(); await H.type("¿qué hiciste ayer?"); await H.wait(64000); await p.evaluate(() => (__L.cur = null));
  const m1 = (await H.msgs()).slice(-1)[0] || "";
  rec("AI hangs: Profe gives up within ~60 s and says so (or answers from the app)", !/Thinking…/.test(m1), m1.slice(0, 120));
  rec("AI hangs: Profe takes the next message", await canTalk("1"));
  // 2. a new message while it hangs
  await hangNext(); await H.type("primera pregunta"); await H.wait(2500); const t0 = Date.now(); await p.evaluate(() => (__L.cur = null));
  await H.replies([{ text: "Claro, dime. [[·]]", delay: 50 }]); const n2 = (await H.reqs()).length; await H.type("segunda pregunta"); await H.idle(8000);
  rec("New message while the AI hangs: answered at once", (await H.reqs()).length > n2 && Date.now() - t0 < 12000);
  const ms = await H.msgs(); rec("No «Thinking…» bubble left behind", !ms.some((m) => /^P: .*Thinking… \d/.test(m)), ms.slice(-4).join(" | "));
  // 3. stalls mid-reply
  await p.evaluate(() => { const o = AndroidLLM.chat; AndroidLLM.chat = function (id) { AndroidLLM.chat = o; __L.cur = { id }; ["Bueno, ", "ayer ", "fuiste ", "al ", "mercado ", "y "].forEach((w, i) => setTimeout(() => __allm.ev("part", id, w), 200 + i * 100)); }; });
  await H.type("ayer fui al mercado"); await H.wait(19000); await p.evaluate(() => (__L.cur = null));
  const m3 = (await H.msgs()).slice(-1)[0] || ""; rec("Reply that stalls mid-way keeps what was written", /fuiste al mercado/.test(m3), m3.slice(0, 140));
  rec("…and Profe takes the next message", await canTalk("3"));
  rec("No page errors", !H.errs.length, H.errs.join(" | "));
  await H.close(); const bad = R.filter((x) => !x).length; console.log(bad ? bad + " FAILED of " + R.length : "ALL " + R.length + " PASS"); process.exit(bad ? 1 : 0);
})();
