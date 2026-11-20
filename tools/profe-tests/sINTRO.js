// v245 first call ever: Profe introduces himself and asks the learner's name, answers «¡Mucho gusto, NAME!», remembers it,
// and later calls greet by name. Also: the name parser, the call brief's teaching practices, and the thinking pose
// (head and eyes to one side, the hand on that same side).
const { open } = require("./h.js");
(async () => {
  const R = []; const rec = (n, ok, i) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (ok ? "" : "  " + (i || ""))); };
  const H = await open(); const p = H.p;
  await p.evaluate(() => { window.__setName(""); });
  const cases = await p.evaluate(() => [["me llamo timar", "Timar"], ["Soy Ana", "Ana"], ["I'm Carlos", "Carlos"], ["Timar", "Timar"], ["hola", ""], ["mi nombre es lucía", "Lucía"], ["sí", ""], ["Yo soy cansado hoy", ""], ["I'm tired", ""]].map(([s, w]) => [s, w, window.__vcNameFrom(s)]));
  rec("Names are picked out of «me llamo…», «soy…», «I'm…», a bare name; not from «hola»/«sí»", cases.every(([, w, g]) => w === g), JSON.stringify(cases));
  const n0 = (await H.tts()).length;
  await p.evaluate(() => document.querySelector('[data-act="vc-open"]').click()); await H.wait(6000);
  const g1 = (await H.tts()).slice(n0).map((e) => e.text).join(" ");
  rec("First call: Profe introduces himself and asks the name", /Soy .+profes?or|Soy .+profesora/.test(g1) && /¿Cómo te llamas\?/.test(g1), g1);
  const n0b = (await H.tts()).length; await H.say("Hola profe"); await H.wait(5000);
  const g1b = (await H.tts()).slice(n0b).map((e) => e.text).join(" ");
  rec("«Hola profe» instead of a name: a friendly «¡Hola! ¿Y cómo te llamas?»", /¿Y cómo te llamas\?/.test(g1b) && !/no te he oído/.test(g1b), g1b);
  const guess = await p.evaluate(() => { const n = window.__vcNameFrom("number Smart"); return [n, window.__vcNameFrom.sure]; });
  rec("A name guessed from a bare word («number Smart») is marked as unsure (Profe offers to fix it)", guess[0] === "Smart" && guess[1] === false, JSON.stringify(guess));
  const n1 = (await H.tts()).length; await H.say("me llamo Timar"); await H.wait(7000);
  const g2 = (await H.tts()).slice(n1).map((e) => e.text).join(" ");
  rec("…then «¡Mucho gusto, Timar!» and asks what to talk about", /Mucho gusto, Timar/.test(g2) && /hablar/.test(g2), g2);
  rec("…and remembers the name", (await p.evaluate(() => window.__pvTS ? window.__pvTS().lname : null)) === "Timar" || /Timar/.test(await p.evaluate(() => localStorage.getItem("ruta-dele-tutor-v1") || "")));
  await p.evaluate(() => document.querySelector('[data-act="vc-end"]').click()); await H.wait(2500);
  const n2 = (await H.tts()).length; await p.evaluate(() => document.querySelector('[data-act="vc-open"]').click()); await H.wait(6000);
  const g3 = (await H.tts()).slice(n2).map((e) => e.text).join(" ");
  rec("Next call: greets by name, doesn't ask again", /Hola, Timar/.test(g3) && !/llamas/.test(g3), g3);
  const note = await p.evaluate(() => window.__vc.note());
  rec("Call brief carries the tutoring practices (recasts, short turns, open questions, level)", /recasting/.test(note) && /under about 25 words/.test(note) && /open questions/.test(note) && /learner's level/.test(note));
  for (const side of [1, -1]) {
    await p.evaluate((sd) => { speechSynthesis.cancel(); window.__vc.pose("thinking", sd); }, side); await H.wait(2600);
    const r = await p.evaluate(() => { const hd = document.querySelector(".vc-head").getAttribute("transform"), rot = +(/rotate\(([-\d.]+)/.exec(hd) || [0, 0])[1], ir = document.querySelector(".vc-iris").getAttribute("transform"), gx = +(/translate\(([-\d.]+)/.exec(ir) || [0, 0])[1];
      const h = document.querySelector(".vc-hand"), m = document.querySelector(".vc-hand-m").getAttribute("transform") || "", hb = h.getBoundingClientRect(), fb = document.querySelector(".vc-face-shape").getBoundingClientRect();
      return { rot, gx, op: +h.getAttribute("opacity"), mirrored: /matrix\(-1/.test(m), handRight: hb.left + hb.width / 2 > fb.left + fb.width / 2 }; });
    const ok = r.op > 0.9 && Math.sign(r.rot) === side && Math.sign(r.gx) === side && r.handRight === (side > 0);
    rec("Thinking to the " + (side > 0 ? "right" : "left") + ": head tilts, eyes look and the hand rests on that same side", ok, JSON.stringify(r));
  }
  rec("No page errors", !H.errs.length, H.errs.join(" | "));
  await H.close(); const bad = R.filter((x) => !x).length; console.log(bad ? bad + " FAILED of " + R.length : "ALL " + R.length + " PASS"); process.exit(bad ? 1 : 0);
})();
