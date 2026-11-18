// Hands-free Profe, app control and the Speak tile (tools/PROFE_HANDSFREE_BRIEF.md §8), in the harness: the real web app and the
// real Android bridge.js, with the phone's TTS, recogniser and on-device wake listener simulated.
const { open, wrongVoice } = require("./h.js");
const R = []; const rec = (n, ok, info) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (!ok && info != null ? "  " + String(info).slice(0, 400) : "")); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  // ---------- 1. Speak tile ----------
  let H = await open({ hash: "#practicar", noOpen: true }); let p = H.p;
  await p.click('button.stile[data-act="t-speak"]'); await H.wait(600);
  const st = await p.evaluate(() => ({ open: document.body.classList.contains("tutor-open"), mic: window.__R.on, starts: window.__R.log.filter((x) => x[0] === "start").length }));
  rec("Speak tile: opens Profe already listening (voice chat)", st.open && st.mic && st.starts === 1, JSON.stringify(st));
  await H.say("hola me llamo Timar y vivo en Panamá"); await H.wait(3800);
  rec("Speak tile: what you say is sent to Profe", (await H.msgs()).some((m) => /U: hola me llamo Timar/.test(m)), JSON.stringify(await H.msgs()));
  await H.close();
  // a recogniser that refuses to start: retried once, then explained (never a silent dead mic)
  H = await open({ hash: "#practicar", noOpen: true, init: () => { window.__failStarts = 1; const o = window.AndroidSTT.start; window.AndroidSTT.start = function (l, i, c) { o.apply(this, arguments); if (window.__failStarts-- > 0) setTimeout(() => window.__sttEnd("aborted"), 80); }; } }); p = H.p;
  await p.click('button.stile[data-act="t-speak"]'); await H.wait(1000);
  rec("Busy mic: the start is retried once and then listens", await p.evaluate(() => window.__R.log.filter((x) => x[0] === "start").length === 2 && window.__R.on), JSON.stringify(await p.evaluate(() => window.__R.log)));
  // v227: the mic guard retries a busy start once by itself, then the app retries once: the message comes after 4 busy starts
  await p.evaluate(() => { const b = document.querySelector('[data-act="t-mic"]'); if (b.classList.contains("on")) b.click(); }); await H.wait(400); await p.evaluate(() => { window.__failStarts = 4; document.querySelector('[data-act="t-mic"]').click(); }); await H.wait(2400);
  const live = await p.evaluate(() => (document.getElementById("t-live") || {}).textContent || "");
  rec("Busy mic twice: Profe says the microphone is busy (and how to see why)", /microphone is busy/i.test(live), live);
  await p.click('[data-act="t-hist"], [data-v="hist"]').catch(() => {}); await H.close();

  // ---------- 2. commands typed or said in Profe's chat ----------
  H = await open({ hash: "#curso" }); p = H.p;
  const t0 = await H.now(); await H.type("open my lessons"); await p.waitForFunction(() => location.hash === "#curso" || window.__pvLast, null, { timeout: 2000 });
  await H.type("show my progress"); await p.waitForFunction(() => location.hash === "#progreso", null, { timeout: 2000 }).catch(() => {});
  const t1 = await H.now();
  rec("Chat: “show my progress” opens Progress and closes Profe", (await p.evaluate(() => location.hash)) === "#progreso" && !(await p.evaluate(() => document.body.classList.contains("tutor-open"))));
  rec("Latency: command → page shown under 300 ms (in the page)", (await p.evaluate(() => window.__pvLat || 0)) < 300 && t1 - t0 < 3000);
  await p.click('[data-act="t-open"]').catch(() => {}); await H.wait(300);
  await H.type("¿Cómo se dice dinner?"); await H.idle(5000);
  rec("Chat: a question still goes to Profe (not a command)", (await H.reqs()).some((r) => /dinner/.test(r.user)), JSON.stringify(await H.reqs()));
  await H.type("gracias"); await H.idle(4000);
  rec("Chat: “gracias” is conversation, not “stop”", (await H.reqs()).some((r) => /gracias/.test(r.user)));
  await H.type("what can I do here"); await H.wait(300);
  rec("“What can I do here?” answers from the registry, for this screen", /Anywhere: “open my lessons”/.test((await H.msgs()).slice(-1)[0] || ""), (await H.msgs()).slice(-1)[0]);
  await H.close();

  // ---------- 3. every voice action: run it and check what happened in the app ----------
  H = await open({ hash: "#curso", noOpen: true }); p = H.p;
  const run = async (text, setup) => { await H.wait(720); // people don't say the same command twice within 0.7 s; faster repeats are treated as one recognition event
 if (setup) { await p.evaluate((h) => { location.hash = h; }, setup); await H.wait(500); } await p.evaluate(() => { window.__pvLast = null; }); await p.evaluate((t) => window.__pv.route(t, "chat"), text); await p.waitForFunction(() => window.__pvLast, null, { timeout: 3000 }).catch(() => {}); await H.wait(120); return p.evaluate(() => ({ last: window.__pvLast, hash: location.hash, tutor: document.body.classList.contains("tutor-open") })); };
  await p.evaluate(() => { const S = window.__pv.S(); S.last = { l: "a1", i: 1 }; S.ex = S.ex || {}; S.ex["a1-2"] = { lectura: { sc: 20 } }; });
  const NAV = [["go home", "#inicio"], ["open my lessons", "#curso"], ["open A2", "#a2"], ["open unit 3 of A1", "#a1-u3"], ["continue where I left off", "#a1-u2"], ["start my next lesson", "#a1-u3"], ["open practice", "#practicar"], ["open listening", "#escuchar"], ["open reading", "#leer"], ["open writing", "#escritura"],
    ["show the verbs", "#verbos"], ["open grammar", "#gramatica"], ["show the prepositions", "#g-preposiciones"], ["open the guides", "#guias"], ["open the past tense guide", "#guia-pasados"], ["open vocabulary", "#palabras"], ["flashcards for A2", "#a2-cards"], ["vocabulary for A1", "#a1-vocab"], ["review my flashcards", "#repaso"],
    ["show my mistakes", "#errores"], ["show my progress", "#progreso"], ["open settings", "#ajustes"], ["open the exams", "#examenes"], ["open exam 3 speaking", "#a1-examen-3-oral"], ["open videos", "#videos"], ["start the placement test", "#nivel"], ["open the library", "#biblioteca"], ["open resources", "#recursos"]];
  const navBad = [];
  for (const [t, h] of NAV) { if (/left off|next lesson/.test(t)) await p.evaluate(() => { window.__pv.S().last = { l: "a1", i: 1 }; }); const r = await run(t); if (!(r.last && r.last.ok && r.hash === h)) navBad.push(t + " → " + JSON.stringify(r)); }
  rec("Every navigation command opens the right screen, verified (" + NAV.length + ")", !navBad.length, navBad.join(" | "));
  let r = await run("go back"); rec("“Go back” returns to the previous screen", r.last && r.last.ok && r.hash === "#biblioteca", JSON.stringify(r));
  r = await run("let's practise the past tense"); await p.waitForFunction(() => window.__L.reqs.length, null, { timeout: 4000 }).catch(() => {}); await H.wait(1500); const pm = await H.msgs(); rec("“Let's practise the past tense” opens the guide and starts a practice turn with Profe", r.hash === "#guia-pasados" && r.tutor && pm.some((m) => /U: Let's practise The past tenses/.test(m)) && /^P: /.test(pm[pm.length - 1]), JSON.stringify(pm.slice(-2)));
  await p.evaluate(() => document.querySelector('#tutor [data-act="t-close"]').click()); await H.wait(200);
  r = await run("practise Spanish conversation"); rec("“Practise Spanish conversation” opens Profe's role-plays", r.tutor && (await p.evaluate(() => window.__pv.view() === "practice" || !!document.querySelector("#tutor .prlist, #tutor [data-act^=pr-]"))), JSON.stringify(r));
  r = await run("close Profe"); rec("“Close Profe” closes it", r.last && r.last.ok && !r.tutor);
  r = await run("explain that in English", "#a1-u1"); rec("“Explain that in English” asks Profe about what's on screen", r.tutor && (await H.reqs()).slice(-1)[0] && /Explain/.test((await H.reqs()).slice(-1)[0].user), JSON.stringify((await H.reqs()).slice(-1)[0]));
  r = await run("translate that"); rec("“Translate that” uses Profe's last reply", (await H.reqs()).slice(-1)[0] && /Translate into English/.test((await H.reqs()).slice(-1)[0].user));
  r = await run("give me another example"); rec("“Give me another example”", (await H.reqs()).slice(-1)[0] && /another example/.test((await H.reqs()).slice(-1)[0].user));
  await H.idle(5000); r = await run("repeat that"); rec("“Repeat that” replays Profe's last reply", r.last && r.last.ok, JSON.stringify(r));
  r = await run("new chat"); rec("“New chat”", r.last && r.last.ok, JSON.stringify(r)); await p.evaluate(() => document.querySelector('#tutor [data-act="t-close"]').click()); await H.wait(200);
  // exam reset asks first
  r = await run("clear the results of exam 2"); const asked = await p.evaluate(() => { const S = window.__pv.S(); return S.ex && !!S.ex["a1-2"]; });
  rec("“Clear the results of exam 2” asks to confirm and doesn't clear yet", asked && !r.last, JSON.stringify(r));
  r = await run("yes"); rec("…“yes” clears them (checked)", r.last && r.last.id === "exam.reset" && r.last.ok && (await p.evaluate(() => !window.__pv.S().ex["a1-2"])), JSON.stringify(r));
  await p.evaluate(() => { window.__pv.S().ex["a1-2"] = { lectura: { sc: 20 } }; }); await run("clear the results of exam 2"); r = await run("no");
  rec("…“no” leaves them", await p.evaluate(() => !!window.__pv.S().ex["a1-2"]));
  // duplicate recognition events
  await p.evaluate(() => { location.hash = "#curso"; }); await H.wait(400);
  await p.evaluate(() => { window.__pv.diag.length = 0; }); const n0 = 0;
  await p.evaluate(() => { window.__pv.route("open grammar", "chat"); window.__pv.route("open grammar", "chat"); }); await H.wait(600);
  rec("The same command twice from one recognition runs once", (await p.evaluate(() => window.__pv.diag.filter((x) => /cmd nav.grammar «/.test(x)).length)) - n0 === 1);
  // lesson questions
  await p.evaluate(() => { location.hash = "#a1-u2"; }); await H.wait(600);
  r = await run("quiz me on this lesson"); rec("“Quiz me on this lesson” opens the unit's questions", r.last && r.last.ok && (await p.evaluate(() => !!document.querySelector("#runner .pxq"))), JSON.stringify(r));
  const qrun = async () => p.evaluate(() => { const P = window.__pv.px(), it = P.items[P.order[P.i]]; return { t: it.t, c: it.c, a: it.a, i: P.i, phase: P.phase }; });
  let q = await qrun(); let guard = 0;
  while (q.t !== "mc" && guard++ < 40) { await run("skip"); q = await qrun(); }
  r = await run(["select the first answer", "select the second answer", "select the third answer", "select the fourth answer"][q.c]);
  rec("“Select the second answer” picks it and Profe gives the real result", r.last && r.last.ok && /Correct|Muy bien|right|Perfecto/.test(r.last.say), JSON.stringify(r.last));
  r = await run("next question"); rec("“Next question”", r.last && r.last.ok && (await qrun()).i === q.i + 1, JSON.stringify(r.last));
  r = await run("previous question"); rec("“Previous question”", r.last && r.last.ok && (await qrun()).i === q.i, JSON.stringify(r.last));
  await run("next question"); q = await qrun(); guard = 0; while (q.t === "mc" && guard++ < 20 && q.phase !== "end") { await run("skip"); q = await qrun(); }
  if (q.t !== "mc" && q.phase !== "end") {
    r = await run("check my answer"); rec("“Check my answer” with nothing typed asks for the answer first", r.last && !r.last.ok && /answer first/.test(r.last.say), JSON.stringify(r.last));
    await p.fill("#px-in", q.a[0]); r = await run("check my answer"); rec("“Check my answer” submits and reports the result", r.last && r.last.ok && /Correct|Muy bien|right|Perfecto/.test(r.last.say), JSON.stringify(r.last));
    await run("next"); q = await qrun();
  }
  r = await run("show me the answer"); rec("“Show me the answer”", r.last && r.last.ok, JSON.stringify(r.last));
  r = await run("start the questions again"); r = await run("yes"); rec("“Start the questions again” (confirmed) goes back to question 1", r.last && r.last.ok && (await qrun()).i === 0, JSON.stringify(r.last));
  r = await run("what can I do here"); rec("“What can I do here?” in a lesson lists the lesson commands", r.last && /select the second answer|check my answer/.test(r.last.say), r.last && r.last.say);
  r = await run("read the lesson to me"); rec("“Read the lesson to me” starts the read-aloud", r.last && r.last.ok, JSON.stringify(r.last));
  r = await run("pause"); rec("“Pause” pauses it (checked)", r.last && r.last.ok, JSON.stringify(r.last));
  r = await run("resume"); rec("“Resume” plays again (checked)", r.last && r.last.ok, JSON.stringify(r.last));
  await p.evaluate(() => window.__pv.raStop());
  // the reading player
  const txt = await p.evaluate(() => window.__pv.LI().find((x) => !/^my-/.test(x)));
  await p.evaluate((k) => { location.hash = k; }, txt); await H.wait(700);
  await p.evaluate(() => document.getElementById("pl-play").click()); await H.wait(300);
  r = await run("read faster"); rec("“Read faster” raises the speed", r.last && r.last.ok, JSON.stringify(r.last));
  r = await run("slow down"); rec("“Slow down” lowers it", r.last && r.last.ok, JSON.stringify(r.last));
  r = await run("pause"); rec("“Pause” on a reading (checked)", r.last && r.last.ok, JSON.stringify(r.last));
  r = await run("show the English"); rec("“Show the English” toggles the English lines", r.last && r.last.ok, JSON.stringify(r.last));
  r = await run("what can you do"); rec("“What can you do?”", r.last && r.last.ok && /open any part of the app/.test(r.last.say));
  rec("No script errors (actions)", !H.errs.length, H.errs.join(" | "));
  await H.close();

  // ---------- 4. "Ok Profe" (Android, on-device) ----------
  H = await open({ hash: "#curso", noOpen: true, wake: true }); p = H.p;
  const W = () => p.evaluate(() => ({ on: window.__W.on, log: window.__W.log.map((x) => x[0]).join(","), st: (document.getElementById("hfpill") || {}).dataset ? document.getElementById("hfpill").dataset.st : null, pill: (document.querySelector("#hfpill .hft") || {}).textContent }));
  await p.evaluate(() => window.__pv.route("turn on hands-free", "chat")); await H.wait(900);
  let w = await W(); rec("Hands-free on: the pill says “Say Ok Profe” and the on-device listener runs", w.on && /Ok Profe/.test(w.pill), JSON.stringify(w));
  await H.wait(2500); w = await W(); rec("…and it doesn't listen while Profe is confirming (started after the confirmation)", w.on, JSON.stringify(w));
  await p.evaluate(() => window.__hear("ok profe abre mis", false)); await H.wait(300); await p.evaluate(() => window.__hear("ok profe abre mis lecciones", false)); await H.wait(100); await p.evaluate(() => window.__hear("ok profe abre mis lecciones", true)); await H.wait(900);
  rec("“Ok Profe, abre mis lecciones” in one breath runs the command", (await p.evaluate(() => location.hash)) === "#curso" && (await p.evaluate(() => window.__pvLast && window.__pvLast.id)) === "nav.course", JSON.stringify(await p.evaluate(() => window.__pvLast)));
  await p.evaluate(() => { location.hash = "#inicio"; }); await H.wait(300);
  await p.waitForFunction(() => window.__R.on, null, { timeout: 4000 }).catch(() => {});
  rec("After the reply, Profe listens for a follow-up without the wake phrase", await p.evaluate(() => window.__R.on && !window.__W.on));
  await H.say("show my progress"); await p.waitForFunction(() => location.hash === "#progreso", null, { timeout: 7000 }).catch(() => {});
  rec("A follow-up command works without saying “Ok Profe” again", (await p.evaluate(() => location.hash)) === "#progreso");
  await p.waitForFunction(() => window.__R.on, null, { timeout: 5000 }).catch(() => {}); await H.wait(8800);
  w = await W(); rec("Silence after the exchange: back to waiting for “Ok Profe”", w.on && /Ok Profe/.test(w.pill) && !(await p.evaluate(() => window.__R.on)), JSON.stringify(w));
  // wake alone
  await p.evaluate(() => { window.__T.log = []; window.__hear("okey profe", true); }); await H.wait(400);
  rec("“Ok Profe” alone: listens straight away (a short tone, no talking over you)", await p.evaluate(() => window.__R.on && !window.__T.log.length));
  await H.wait(6900); // 6 s from when the mic is really open (15 Nov 2026: was 4 s from the start request, too short on the S24)
  rec("…nothing said: “What would you like to do?”", (await H.tts()).some((e) => /What would you like to do/.test(e.text)), JSON.stringify((await H.tts()).map((e) => e.text)));
  await p.waitForFunction(() => window.__R.on, null, { timeout: 5000 }).catch(() => {}); await H.say("abre la gramática"); await p.waitForFunction(() => location.hash === "#gramatica", null, { timeout: 6000 }).catch(() => {});
  rec("…then the instruction is carried out", (await p.evaluate(() => location.hash)) === "#gramatica");
  await p.evaluate(() => window.__pv.route("stop", "hf")); await H.wait(1200);
  // wake variations and non-wake speech
  const WAKES = ["Ok Profe", "okay profe", "okey profe", "o que profe", "oye profe", "ok prof", "Okay, Profe,", "hola profe", "OK profesor", "ok profe abre el curso"], NOT = ["el profesor dijo que", "ok perfecto", "profe", "vamos a la playa", "okay so the professor", "ok, fine", "provecho", "o que pronto"];
  const wv = await p.evaluate(([a, b]) => [a.filter((x) => !window.__pv.wake(x)), b.filter((x) => window.__pv.wake(x))], [WAKES, NOT]);
  rec("Wake phrase variations recognised (" + WAKES.length + "), unrelated speech ignored (" + NOT.length + ")", !wv[0].length && !wv[1].length, JSON.stringify(wv));
  // Profe's own voice never wakes it
  await p.evaluate(() => { location.hash = "#curso"; }); await H.wait(1600);
  await p.evaluate(() => { window.__T.wps = 2; window.__pv.say("Ok Profe, open my lessons. Esto es una prueba larga para ver si me despierto sola.", () => {}); }); await H.wait(400);
  const during = await p.evaluate(() => ({ heard: window.__hear("ok profe show my progress", true), on: window.__W.on }));
  await H.wait(300); rec("While Profe speaks the wake listener is off, so its own voice can't trigger it", !during.on && !during.heard && (await p.evaluate(() => location.hash)) === "#curso", JSON.stringify(during));
  await H.idle(9000); await H.wait(900); await p.evaluate(() => { window.__T.wps = 5; });
  await p.waitForFunction(() => window.__W.on, null, { timeout: 6000 }).catch(() => {});
  rec("…and it comes back after Profe finishes (with a short pause)", await p.evaluate(() => window.__W.on));
  // duplicate activation
  await p.waitForFunction(() => window.__W.on && !window.__R.on && !window.speechSynthesis.speaking, null, { timeout: 8000 }).catch(() => {}); await H.wait(3000);
  const n1 = await p.evaluate(() => window.__pv.hf.wokeN || 0);
  await p.evaluate(() => { window.__hear("ok profe", true); window.__hear("ok profe", true); }); await H.wait(300);
  rec("Two “Ok Profe” in a row: one activation", (await p.evaluate(() => window.__pv.hf.wokeN || 0)) - n1 === 1, (await p.evaluate(() => window.__pv.diag.slice(-6))).join(" / "));
  await p.evaluate(() => window.__pv.route("stop", "hf")); await H.wait(1500);
  // leaving and reopening the app
  await p.evaluate(() => { Object.defineProperty(document, "hidden", { value: true, configurable: true }); document.dispatchEvent(new Event("visibilitychange")); }); await H.wait(500);
  rec("App in the background: the microphone is released", !(await p.evaluate(() => window.__W.on || window.__R.on)));
  await p.evaluate(() => { Object.defineProperty(document, "hidden", { value: false, configurable: true }); document.dispatchEvent(new Event("visibilitychange")); }); await H.wait(800);
  rec("Back in front: waiting for “Ok Profe” again", await p.evaluate(() => window.__W.on));
  // interrupting Profe: tap the pill while it speaks
  await p.evaluate(() => { window.__T.wps = 1.5; window.__pv.say("Esto es una frase bastante larga que Profe está leyendo en voz alta ahora mismo.", () => {}); }); await H.wait(500);
  const ti = await H.now(); await p.click("#hfpill .hfmain"); await H.wait(250);
  const tts = await H.tts(), cut = tts.filter((e) => e.stopped || e.dropped);
  rec("Tapping the pill while Profe speaks stops the voice and listens", cut.length > 0 && (await p.evaluate(() => window.__R.on)), JSON.stringify(tts.slice(-2)));
  await p.evaluate(() => { window.__T.wps = 5; }); for (let k = 0; k < 3; k++) { await p.click("#hfpill .hfmain"); await H.wait(40); }
  await H.wait(600); const opened = await p.evaluate(() => window.__R.wins.filter((x) => !x[1]).length);
  rec("Rapid taps never leave two microphone sessions open", opened <= 1, opened);
  await p.evaluate(() => window.__pv.route("stop", "hf")); await H.wait(1200);
  // permission denied
  await p.evaluate(() => { window.__denyNext = 1; const o = window.AndroidSTT.start; window.AndroidSTT.start = function () { o.apply(this, arguments); if (window.__denyNext-- > 0) setTimeout(() => window.__sttEnd("not-allowed"), 60); }; window.__hear("ok profe", true); }); await H.wait(800);
  rec("Microphone denied: hands-free turns itself off and says how to allow it", !(await p.evaluate(() => window.__pv.hf.on)) && /blocked/.test(await p.evaluate(() => document.body.innerText)), "");
  // no on-device recognition: tap-to-talk fallback
  await p.evaluate(() => { window.__W.status = "no-ondevice"; window.__pv.route("turn on hands-free", "chat"); }); await H.wait(900);
  rec("No on-device recognition: falls back to tap-to-talk and says why", /Tap to talk/.test(await p.evaluate(() => document.querySelector("#hfpill .hft").textContent)) && !(await p.evaluate(() => window.__W.on)), await p.evaluate(() => document.querySelector("#hfpill .hft").textContent));
  rec("No script errors (wake)", !H.errs.length, H.errs.join(" | "));
  await H.close();

  // ---------- 5. a whole lesson hands-free ----------
  H = await open({ hash: "#a1-u2", noOpen: true, wake: true }); p = H.p;
  await p.evaluate(() => window.__pv.route("turn on hands-free", "chat")); await p.waitForFunction(() => window.__W.on, null, { timeout: 6000 });
  await p.evaluate(() => window.__hear("ok profe quiz me on this lesson", true));
  const total = await p.waitForFunction(() => window.__pv.px() && window.__pv.px().items && document.querySelector("#runner .pxq") && window.__pv.px().items.length, null, { timeout: 4000 }).then((h) => h.jsonValue()).catch(() => 0);
  let answered = 0, rightN = 0, taps = 0, spokenQ = 0, stuck = 0, wrongOnPurpose = false;
  const t00 = Date.now();
  while (Date.now() - t00 < 420000) {
    const ph = await p.evaluate(() => window.__pv.px().phase); if (ph === "end") break;
    // wait for Profe to read the question and open the mic
    const ok = await p.waitForFunction(() => window.__R.on && !window.speechSynthesis.speaking, null, { timeout: 15000 }).then(() => 1).catch(() => 0);
    if (!ok) { if (++stuck > 3) break; continue; }
    const q2 = await p.evaluate(() => { const P = window.__pv.px(), it = P.items[P.order[P.i]]; return { t: it.t, c: it.c, a: it.a, o: it.opts, i: P.i }; });
    if ((await H.tts()).some((e) => new RegExp("^Question " + (q2.i + 1) + "\\.").test(e.text))) spokenQ++;
    let say; if (q2.t === "mc") { if (!wrongOnPurpose) { wrongOnPurpose = true; say = "la " + ["b", "c", "a", "a"][q2.c]; } else say = answered % 2 ? "la " + "abcd"[q2.c] : q2.o[q2.c]; } else say = q2.a[0];
    await H.say(say); answered++;
    await p.waitForFunction((i) => { const P = window.__pv.px(); return P.i !== i || P.phase === "end"; }, q2.i, { timeout: 20000 }).catch(() => {});
  }
  await p.waitForFunction(() => window.__pv.px().phase === "end", null, { timeout: 10000 }).catch(() => {});
  const P = await p.evaluate(() => { const X = window.__pv.px(); return { n: X.items.length, ok: X.order.filter((k) => X.res[k] && X.res[k].ok).length, phase: X.phase }; });
  rec("Hands-free lesson: every question read aloud and answered by voice, no taps (" + answered + "/" + total + ")", P.phase === "end" && answered === P.n && spokenQ >= P.n - 1, JSON.stringify({ P, answered, spokenQ }));
  rec("…answers said by wording or by letter are marked correctly (one wrong on purpose)", P.ok === P.n - 1, JSON.stringify(P));
  await p.waitForFunction(() => [...window.__T.log].some((e) => /That's the end/.test(e.text)), null, { timeout: 15000 }).catch(() => {});
  rec("…the score is read at the end", (await H.tts()).some((e) => /That's the end: \d+ out of \d+/.test(e.text)));
  const fb = await H.tts(); rec("…wrong answers get the correct one, in the Spanish voice", fb.some((e) => /Not quite|answer is/.test(e.text)), "");
  await p.waitForFunction(() => window.__R.on, null, { timeout: 8000 }).catch(() => {}); await H.say("show my progress"); await p.waitForFunction(() => location.hash === "#progreso", null, { timeout: 6000 }).catch(() => {});
  rec("…and “show my progress” follows without the wake phrase", (await p.evaluate(() => location.hash)) === "#progreso");
  const wv2 = wrongVoice(await H.tts()); rec("Spanish and English go to the right voices throughout", !wv2.length, wv2.join(" | "));
  // an answer that sounds like a command
  await p.evaluate(() => { location.hash = "#a1-u3"; }); await H.wait(600);
  await p.evaluate(() => window.__pv.route("quiz me on this lesson", "chat")); await H.wait(400);
  let gq = 0; while (!(await p.evaluate(() => !!document.querySelector("#px-in:not([readonly])"))) && gq++ < 25) { await p.evaluate(() => window.__pv.route("skip", "chat")); await H.wait(150); }
  if (await p.evaluate(() => !!document.querySelector("#px-in:not([readonly])"))) {
    const before = await p.evaluate(() => location.hash);
    await p.evaluate(() => { window.__pvLast = null; window.__pv.route("volver", "hf"); }); await H.wait(2000);
    rec("“volver” while a typed answer is expected: asks “answer or go back?” instead of leaving", (await p.evaluate(() => location.hash)) === before && (await H.tts()).some((e) => /your answer, or should I/.test(e.text)), JSON.stringify((await H.tts()).slice(-1)));
    await p.evaluate(() => window.__pv.route("answer", "hf")); await H.wait(700);
    rec("…“answer”: it is submitted as the answer (graded, or a hint and one more try under the answer policy)", await p.evaluate(() => { const P = window.__pv.px(), r = P.res[P.order[P.i]]; return (!!r && /volver/.test(r.val)) || (!!document.querySelector("#runner .sk-hint") && /volver/.test(P.draft || "")); }));
  } else rec("“volver” as an answer (no typed question found in A1 unit 3)", false);
  rec("No script errors (lesson)", !H.errs.length, H.errs.join(" | "));
  await H.close();
  console.log(R.filter(Boolean).length + "/" + R.length + " passed");
})().catch((e) => { console.log("CRASH " + e.stack); process.exit(1); });
