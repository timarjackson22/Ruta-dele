// C. conversation state across turns (scripted Profe replies; checks what the app sends and does)
const { open } = require("./h.js");
const R = []; const rec = (n, ok, info) => { R.push(ok); console.log((ok ? "PASS " : "FAIL ") + n + (info ? "  " + info : "")); };
const lastUser = (H) => H.p.evaluate(() => window.__L.reqs.length ? window.__L.reqs[window.__L.reqs.length - 1].user : "");
(async () => {
  { // C1 goal + pending question survive an interruption; the app tells Profe what was actually heard
    const H = await open();
    await H.replies([{ text: "Perfecto, practicamos el pasado. Te hago una pregunta larga para practicar con calma y con muchas palabras seguidas. ¿Qué hiciste el fin de semana pasado? [[·]]", delay: 100, wordMs: 10 }]);
    await H.type("Let's practise talking about my weekend in the past"); await H.p.waitForFunction(() => !!window.__T.cur, null, { timeout: 8000 }); await H.wait(700);
    await H.mic(); await H.wait(200); await H.say("El sábado fui a la playa con mis amigos"); await H.wait(4500);
    const u = await lastUser(H);
    rec("C1 task kept after interruption", /weekend in the past/.test(u), ""); rec("C1 interruption reported with what was heard", /interrupted: the learner only heard «[^»]+»/.test(u), (u.match(/interrupted[^)]*/) || [""])[0].slice(0, 120));
    await H.close();
  }
  { // C2 a question mid-exercise is answered first, not graded; the pending question is kept
    const H = await open();
    await H.replies([{ text: "Vamos. ¿Qué comiste ayer? [[·]]", delay: 80, wordMs: 5 }]);
    await H.type("Let's practise the past tense with questions"); await H.idle(6000);
    await H.type("How do you say dinner in Spanish?"); await H.idle(6000);
    const u = await lastUser(H), task = await H.p.evaluate(() => { const b = document.querySelector(".t-task b"); return b && b.textContent; });
    const last = (await H.msgs()).slice(-1)[0] || "", viaAI = /asking a question, not answering/.test(u) && /pending question was: «¿Qué comiste ayer\?»/.test(u), viaApp = /Back to the exercise:.*(Qué comiste ayer|\d+ \/ \d+)/.test(last);
    rec("C2 question answered, then back to the pending question", viaAI || viaApp, viaApp ? "answered by the app: " + last.slice(0, 140) : viaAI ? "flagged to Profe" : last.slice(0, 160));
    rec("C2 the question did not replace the task", /past tense/.test(task || ""), "banner: " + task);
    await H.close();
  }
  { // C3 slower / repeat handled at once by the app
    const H = await open();
    await H.replies([{ text: "Muy bien. ¿Dónde vives ahora? [[·]]", delay: 80, wordMs: 5 }]);
    await H.type("Let's have a conversation about where I live"); await H.idle(6000);
    const n = await H.p.evaluate(() => window.__L.reqs.length), rate0 = await H.p.evaluate(() => JSON.parse(localStorage.getItem("ruta-dele-tutor-v1")).prate || 1);
    const t0 = Date.now(); await H.type("más despacio, por favor"); await H.p.waitForFunction(() => window.__T.log.some((e) => e.t0 && /Dónde vives/.test(e.text) && e.t0 > window.__T.log.filter((x) => /Dónde vives/.test(x.text))[0].t1), null, { timeout: 6000 }).catch(() => {});
    const lat = Date.now() - t0, tts = await H.tts(), rp = tts.filter((e) => /Dónde vives/.test(e.text));
    const rate1 = await H.p.evaluate(() => JSON.parse(localStorage.getItem("ruta-dele-tutor-v1")).prate);
    rec("C3 'más despacio' replays slower without an AI call", (await H.p.evaluate(() => window.__L.reqs.length)) === n && rp.length >= 2 && rate1 < rate0, "rate " + rate0 + "→" + rate1 + ", replayed " + rp.length + "×, first replay sound after ~" + lat + " ms");
    await H.idle(5000); await H.type("repite"); await H.idle(5000);
    rec("C3 'repite' replays without an AI call", (await H.p.evaluate(() => window.__L.reqs.length)) === n && (await H.tts()).filter((e) => /Dónde vives/.test(e.text)).length >= 3, "");
    await H.close();
  }
  { // C4 stop → closing summary requested, task ends; goal change replaces the task
    const H = await open();
    await H.type("Quiero practicar los números"); await H.idle(5000);
    await H.type("Actually, let's practise ordering food instead"); await H.idle(5000);
    const b1 = await H.p.evaluate(() => (document.querySelector(".t-task b") || {}).textContent);
    rec("C4 explicit goal change replaces the task", /ordering food/.test(b1 || ""), "banner: " + b1);
    await H.type("Let's stop here"); await H.idle(5000);
    const u = await lastUser(H), b2 = await H.p.evaluate(() => !!document.querySelector(".t-task"));
    rec("C4 stop asks for the closing summary and ends the task", /wants to stop/i.test(u) && !b2, "");
    await H.close();
  }
  { // C5 a long session: recurring mistake recorded for recall, check-in after ~6 answers, misses counted per item
    const H = await open();
    await H.p.evaluate(() => { window.__L.def = { text: "Casi: say «Ayer **fui** al mercado». Try again. [[✗]]", delay: 50, wordMs: 3 }; });
    await H.type("Let's practise the past tense, one sentence at a time"); await H.idle(5000);
    for (let i = 0; i < 6; i++) { await H.type("Ayer voy al mercado número " + i); await H.idle(5000); }
    const u = await lastUser(H);
    rec("C5 check-in, recall and clue notes after six answers", /CHECK IN NOW/.test(u) && /Corrections made earlier[^.]*fui/.test(u) && /give a clue or a model answer/.test(u), "");
    await H.close();
  }
  { // C6 empty / silent mic turn keeps state (no new request, task intact)
    const H = await open(); await H.type("Let's practise greetings"); await H.idle(5000);
    const n = await H.p.evaluate(() => window.__L.reqs.length); await H.mic(); await H.wait(300); await H.sttEnd("no-speech"); await H.wait(1500);
    rec("C6 silent turn changes nothing", (await H.p.evaluate(() => window.__L.reqs.length)) === n && !!(await H.p.evaluate(() => document.querySelector(".t-task"))), "");
    await H.close();
  }
  console.log(R.filter((x) => !x).length ? R.filter((x) => !x).length + " FAILED of " + R.length : "ALL " + R.length + " PASS");
})();
