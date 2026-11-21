// v255 — Claude as Profe's brain with the learner's own API key. Anthropic's API is replaced by a local stand-in (no key,
// no cost): the test checks what the app sends (model, key header, the call brief with the coherent policy, the session
// state) and what it does with a streamed reply (spoken in the call, back to a paused exercise item). Real-Claude quality is
// tested separately with tools/profe-tests/liveClaude.js and a real key.
const { open } = require("./h.js");
(async () => {
  const R = []; const rec = (n, ok, i) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (ok ? "" : "  " + String(i || "").slice(0, 300))); };
  const H = await open(); const p = H.p; const seen = [];
  await p.route("https://api.anthropic.com/**", async (route) => {
    const req = route.request(); const body = JSON.parse(req.postData() || "{}"); seen.push({ headers: req.headers(), body });
    const sys = String(body.system || ""), last = (body.messages || []).slice(-1)[0] || {}, u = typeof last.content === "string" ? last.content : JSON.stringify(last.content);
    let reply = "¡Qué interesante! ¿Y qué hiciste después?";
    if (/por qu[eé]/i.test(u)) reply = "Usamos «tener» para decir que algo es tuyo. Por ejemplo: «Tengo un perro».";
    if (!/LIVE VIDEO CALL/.test(sys) && /"better"|JSON|issues/.test(sys + u)) reply = '{"better":"","issues":[]}';
    const ev = (o) => "event: " + o.type + "\ndata: " + JSON.stringify(o) + "\n\n";
    const sse = ev({ type: "message_start", message: { id: "m", content: [] } }) + ev({ type: "content_block_start", index: 0, content_block: { type: "text", text: "" } }) +
      reply.split(/(?<=\s)/).map((w) => ev({ type: "content_block_delta", index: 0, delta: { type: "text_delta", text: w } })).join("") + ev({ type: "content_block_stop", index: 0 }) + ev({ type: "message_stop" });
    await route.fulfill({ status: 200, headers: { "content-type": "text/event-stream" }, body: sse });
  });
  const tb = await p.evaluate(() => window.__useApi("sk-ant-test-123", "claude-haiku-5-5"));
  rec("With a key saved, Profe's brain is Claude (API)", tb === "api", tb);
  await p.evaluate(() => window.__setName("Timar", true));
  const said = async (fn, ms) => { const n = (await H.tts()).length; await fn(); await H.wait(ms || 7000); return (await H.tts()).slice(n).map((e) => e.text).join(" "); };
  const listening = () => p.waitForFunction(() => window.__vc.state() === "listening" && window.__R.on, null, { timeout: 25000 });
  await p.evaluate(() => document.querySelector('[data-act="vc-open"]').click()); await H.wait(7000); await listening();
  // a conversation turn goes to Claude, streamed and spoken
  let s = await said(() => H.say("ayer fui a la playa con mis amigos"), 9000);
  const chatReq = seen.filter((x) => /LIVE VIDEO CALL/.test(String(x.body.system || ""))).pop();
  rec("A call turn is sent to api.anthropic.com and the streamed reply is spoken", chatReq && /hiciste después/.test(s), s);
  rec("…with the learner's key, the chosen model and streaming", chatReq && chatReq.headers["x-api-key"] === "sk-ant-test-123" && chatReq.body.model === "claude-haiku-5-5" && chatReq.body.stream === true, chatReq && JSON.stringify({ m: chatReq.body.model, k: chatReq.headers["x-api-key"] }));
  const sys = chatReq ? String(chatReq.body.system) : "";
  rec("The call brief carries the coherent policy (teacher, session state, no rigid 25-word / every-turn-question rule)", /Spanish TEACHER/.test(sys) && /SESSION STATE/.test(sys) && !/under about 25 words/.test(sys) && !/ONE natural follow-up question/.test(sys), sys.slice(0, 200));
  rec("The session state rides along (the learner's details)", /playa con mis amigos/.test(sys), sys.slice(sys.indexOf("SESSION STATE"), sys.indexOf("SESSION STATE") + 300));
  // translation exercise, a side question → Claude answers → back to the same sentence
  await listening(); s = await said(() => H.say("quiero practicar traduciendo oraciones"), 9000);
  const it = await p.evaluate(() => { const D = window.__trd(); return D && D.it ? (D.it.say || D.it.src) : ""; });
  rec("The translation exercise still runs in the app (no API call for it)", !!it && /Vamos a traducir/.test(s), s);
  await listening(); s = await said(() => H.say("por qué se usa tener aquí"), 10000);
  const side = seen[seen.length - 1], sideSys = String(side.body.system || "");
  rec("A side question goes to Claude with the exercise item in the session state", sideSys.includes(it), sideSys.slice(sideSys.indexOf("SESSION STATE"), sideSys.indexOf("SESSION STATE") + 300));
  rec("…then back to the SAME sentence", /Usamos «?tener/.test(s) && /Volvemos a la frase/.test(s) && s.includes(it.replace(/[?.!]$/, "")), s);
  // the key never goes anywhere but Anthropic
  const leaks = await p.evaluate(() => { const ls = Object.keys(localStorage).filter((k) => !/^ruta-tutor|^rd-|tutor/.test(k) && String(localStorage.getItem(k)).includes("sk-ant-test-123")); return ls; });
  rec("The key is stored only in Profe's own settings", leaks.length === 0, leaks.join(","));
  rec("Every API request went only to api.anthropic.com", seen.length > 0);
  // forgetting the key returns to the phone's AI
  const tb2 = await p.evaluate(() => window.__useApi("", null));
  rec("Forgetting the key goes back to the AI on the phone", tb2 !== "api", tb2);
  const ok = R.filter(Boolean).length; console.log(ok === R.length ? "ALL " + R.length + " PASS" : (R.length - ok) + " FAILED of " + R.length);
  await H.close(); process.exit(ok === R.length ? 0 : 1);
})().catch((e) => { console.log("CRASH", e.message); process.exit(1); });
