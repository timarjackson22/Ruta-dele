// v280 — what the learner asks for decides Profe's turn: meanings (many phrasings, Spanish and English), «how do you say…»,
// «what did you say? / no entiendo / en inglés» about Profe's last line or the exercise item, topic changes that stick,
// how the learner wants Profe to talk (kept for the session), and questions answered without practice prompts on top.
// Runs on the phone-AI mock (h.js), then with Claude (Anthropic stubbed) and in a call.
const { open } = require("./h.js");
(async () => {
  const R = []; const rec = (n, ok, i) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (ok ? "" : "  " + String(i || "").slice(0, 300))); };
  const H = await open(); const p = H.p;
  const last = async () => (await H.msgs()).filter((x) => /^P:/.test(x)).pop() || "";
  const send = async (t, ms) => { const n = (await H.reqs()).length; await H.type(t); await H.wait(ms || 900); await H.idle(6000); return { reply: await last(), req: (await H.reqs()).slice(n).map((r) => r.user || "").filter((u) => /Learner: /.test(u)).join("\n") }; };
  const profeSaid = (t) => p.evaluate((t) => window.__tPush("a", t), t);

  // 1. meanings — every common way of asking, all answered from the dictionary, English only
  const MEAN = ["¿Qué significa madrugar?", "Qué significa «madrugar»", "¿Qué quiere decir madrugar?", "What does madrugar mean?", "what does «madrugar» mean", "What's the meaning of madrugar?",
    "¿Qué significa la palabra madrugar?", "madrugar, ¿qué significa?", "¿Qué es madrugar?", "¿Cómo se dice madrugar en inglés?", "What is madrugar in English?", "Meaning of madrugar", "Define madrugar",
    "Ok Profe, ¿qué significa madrugar?", "Profe, ¿me puedes decir qué significa madrugar, por favor?", "translate madrugar", "Madrugar en inglés", "What does the word madrugar mean?", "Tradúceme madrugar"];
  const bad = [];
  for (const q of MEAN) { const r = await send(q); if (!/to get up early/.test(r.reply) || /mañanear|tempranear/.test(r.reply)) bad.push(q + " → " + r.reply.slice(0, 80)); }
  rec("Meaning questions in " + MEAN.length + " phrasings are answered from the dictionary (English only)", !bad.length, bad.join(" | "));
  let r = await send("qué significa socavan");
  rec("A conjugated form gets its verb («socavan» → socavar)", /undermine/.test(r.reply) && /socavar/.test(r.reply), r.reply);
  r = await send("¿Qué significa la frase «más vale tarde que nunca»?");
  rec("A set phrase is answered (más vale tarde que nunca)", /better late than never/i.test(r.reply), r.reply);
  r = await send("¿Qué es «el madrugón»?");
  rec("«¿Qué es X?» for a dictionary word is a meaning question", /early/.test(r.reply), r.reply);
  r = await send("Traduce: me levanto temprano todos los días");
  rec("A whole sentence to translate goes to the AI with that instruction", /asks what this means: «me levanto temprano todos los días»/.test(r.req), r.req.slice(0, 200));

  // 2. how to say it in Spanish
  r = await send("¿Cómo se dice to get up early?");
  rec("«¿Cómo se dice to get up early?» gives the Spanish (madrugar)", /madrugar/i.test(r.reply), r.reply);
  r = await send("How do you say house in Spanish?");
  rec("«How do you say house in Spanish?» → casa", /casa/i.test(r.reply), r.reply);

  // 3. «what did you say?» about Profe's last line
  for (const q of ["¿Qué significa eso?", "No entiendo", "En inglés, por favor", "What does that mean?", "Tradúcelo"]) {
    await profeSaid("Mañana vamos a repasar los verbos irregulares del pretérito.");
    r = await send(q);
    rec("«" + q + "» asks the AI to say Profe's last line in English", (/did not understand what you just said: «[^»]*repasar los verbos irregulares/.test(r.req) || /asks what this means: «[^»]*repasar los verbos irregulares/i.test(r.req)) && !/Useful word|Vamos a practicar|Buen tema|Sigamos/.test(r.reply), r.req.slice(0, 220) + " || " + r.reply);
  }
  await profeSaid("¡Qué bien! ¿Y qué comiste?\n*Great! And what did you eat?*");
  r = await send("¿Qué significa eso?");
  rec("…when Profe already gave the English line, it is shown at once", /In English:.*what did you eat/i.test(r.reply), r.reply);

  // 4. inside an exercise: a meaning question returns to the item; «no entiendo» explains the item in English
  r = await send("quiero practicar el verbo cambiar", 1500);
  const inDrill = await p.evaluate(() => window.__drillOn());
  rec("(a verb drill is running)", inDrill, r.reply);
  r = await send("¿Qué significa madrugar?");
  rec("A meaning question during a drill is answered, then back to the exercise", /to get up early/.test(r.reply) && /Back to the exercise/.test(r.reply) && (await p.evaluate(() => window.__drillOn())), r.reply);
  r = await send("no entiendo");
  rec("«no entiendo» during a drill explains the question in English (not the answer)", /I'm asking for the .* form of .*cambiar/.test(r.reply), r.reply);

  // 5. change the topic
  r = await send("Cambiemos de tema");
  rec("«Cambiemos de tema» offers topics and ends the drill", /De qué te gustaría hablar/.test(r.reply) && !(await p.evaluate(() => window.__drillOn())), r.reply);
  r = await send("de música");
  rec("…the next short answer is the new topic, sent to the AI with a switch instruction", /wants to talk about «música» now/.test(r.req), r.req.slice(0, 200));
  r = await send("ayer trabajé mucho en la oficina");
  rec("…and the chosen topic is held next turn (not replaced by «work»)", /chose the topic «música»/.test(r.req) && (await p.evaluate(() => window.__ss().topic)) === "música", r.req.slice(0, 300));
  r = await send("Hablemos de fútbol");
  rec("«Hablemos de fútbol» switches at once", /wants to talk about «fútbol» now/.test(r.req) && !/música/.test((await p.evaluate(() => window.__aiNote()))), r.req.slice(0, 200));
  r = await send("Let's talk about cooking");
  rec("«Let's talk about cooking» switches at once", /wants to talk about «cooking» now/.test(r.req), r.req.slice(0, 200));

  // 6. how the learner wants Profe to talk — kept for the session
  r = await send("Hazme preguntas");
  rec("«Hazme preguntas» is done at once and kept", /how they want this conversation/.test(r.req) && /ask them the first question now/.test(r.req), r.req.slice(0, 200));
  r = await send("me gusta cocinar pasta");
  rec("…and it rides along on later turns", /Ask the learner questions/.test(r.req), r.req.slice(0, 400));
  await send("Solo en español, por favor"); await send("Explain more in English");
  const note = await p.evaluate(() => window.__aiNote());
  rec("A later opposite request replaces the earlier one (Spanish only → more English)", /Explain more in English/.test(note) && !/only Spanish/.test(note), note);

  // 7. a question gets an answer, no practice prompts on top
  r = await send("¿Cuál es la diferencia entre ser y estar?");
  rec("A question goes to the AI with «answer it directly»", /asked you a question/.test(r.req) || /ser|estar/i.test(r.reply), r.req.slice(0, 200));
  r = await send("¿Te gusta la comida panameña?");
  rec("…and gets no «Useful word», praise or «¡Vamos a practicar!» added", !/Useful word|Vamos a practicar|Buen tema|Sigamos|Good reflexive|Nice use/.test(r.reply), r.reply);
  rec("No page errors", !H.errs.length, H.errs.join(" | "));
  await H.close();

  // 8. with Claude: meanings never reach the API; a topic change reaches it as THIS TURN
  const H2 = await open(); const p2 = H2.p; const seen = [];
  await p2.route("https://api.anthropic.com/**", async (route) => { const body = JSON.parse(route.request().postData() || "{}"); seen.push(body);
    const ev = (o) => "event: " + o.type + "\ndata: " + JSON.stringify(o) + "\n\n", txt = "¡Qué bien! ¿Qué música escuchas?";
    await route.fulfill({ status: 200, headers: { "content-type": "text/event-stream" }, body: ev({ type: "message_start", message: { id: "m", content: [] } }) + ev({ type: "content_block_delta", index: 0, delta: { type: "text_delta", text: txt } }) + ev({ type: "message_stop" }) }); });
  await p2.evaluate(() => window.__useApi("sk-ant-test-1", "claude-sonnet-5-5"));
  const lastP = async () => (await H2.msgs()).filter((x) => /^P:/.test(x)).pop() || "";
  await H2.type("¿Qué quiere decir madrugar?"); await H2.wait(1500);
  const chatCalls = () => seen.filter((b) => !/precise Spanish teacher|short notes about a Spanish learner/.test(String(b.system || "")));
  rec("Claude: a meaning question is answered from the dictionary, no chat call to the API", /to get up early/.test(await lastP()) && chatCalls().length === 0, (await lastP()) + " calls=" + chatCalls().length);
  await H2.type("Hablemos de música"); await H2.wait(2500);
  const cc = chatCalls(), sys = cc.length ? String(cc[cc.length - 1].system || "") : "";
  rec("Claude: «Hablemos de música» reaches Claude as THIS TURN: switch to música", /THIS TURN: \(The learner wants to talk about «música» now/.test(sys), sys.slice(-300));
  await H2.close();

  // 9. in a call: the meaning is said («… en inglés es: …»)
  const H3 = await open(); const p3 = H3.p;
  await p3.evaluate(() => window.__setName("Timar", true));
  await p3.evaluate(() => document.querySelector('[data-act="vc-open"]').click()); await H3.wait(7000);
  await p3.waitForFunction(() => window.__vc.state() === "listening" && window.__R.on, null, { timeout: 25000 }).catch(() => {});
  const n0 = (await H3.tts()).length; await H3.say("qué significa madrugar"); await H3.wait(7000);
  const said = (await H3.tts()).slice(n0).map((e) => e.text).join(" ");
  rec("In a call, «qué significa madrugar» is said: «madrugar» en inglés es: to get up early", /en inglés es/.test(said) && /to get up early/.test(said) && !/\*\*|Want an example/.test(said), said);
  await H3.close();

  const ok = R.filter(Boolean).length; console.log(ok === R.length ? "ALL " + R.length + " PASS" : (R.length - ok) + " FAILED of " + R.length);
  process.exit(ok === R.length ? 0 : 1);
})().catch((e) => { console.log("CRASH", e.message); process.exit(1); });
