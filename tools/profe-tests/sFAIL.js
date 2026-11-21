// v258 — Claude ↔ Gemma coordination in a call (Anthropic stubbed, Gemma = the test phone's on-device mock).
// Credit runs out mid-call → banner («Your Claude credit has run out…», Add credit / Use free AI), «Reconnecting…», then
// «Calling…» with a ring while Gemma loads, then «Connected · Gemma», and Gemma answers THE SAME turn. The model chip
// shows which AI is answering. When Claude's pause is over and it works again, the next turn is Claude's. A rate limit
// pauses Claude for a minute only; with no phone AI installed, the learner is told plainly.
const { open } = require("./h.js");
(async () => {
  const R = []; const rec = (n, ok, i) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (ok ? "" : "  " + String(i || "").slice(0, 300))); };
  const H = await open(); const p = H.p; let mode = "ok", calls = 0;
  await p.route("https://api.anthropic.com/**", async (route) => { calls++;
    if (mode === "credit") return route.fulfill({ status: 400, headers: { "content-type": "application/json" }, body: JSON.stringify({ type: "error", error: { type: "invalid_request_error", message: "Your credit balance is too low to access the Anthropic API. Please go to Plans & Billing to upgrade or purchase credits." } }) });
    if (mode === "rate") return route.fulfill({ status: 429, headers: { "content-type": "application/json" }, body: JSON.stringify({ type: "error", error: { type: "rate_limit_error", message: "Number of request tokens has exceeded your per-minute rate limit" } }) });
    const ev = (o) => "event: " + o.type + "\ndata: " + JSON.stringify(o) + "\n\n", reply = "¡Qué bien! Soy Claude contestando. ¿Y qué más hiciste?";
    await route.fulfill({ status: 200, headers: { "content-type": "text/event-stream" }, body: ev({ type: "message_start", message: {} }) + reply.split(/(?<=\s)/).map((w) => ev({ type: "content_block_delta", index: 0, delta: { type: "text_delta", text: w } })).join("") + ev({ type: "message_stop" }) });
  });
  await p.evaluate(() => { window.__useApi("sk-ant-test", "claude-sonnet-5-5"); window.__setName("Timar", true); window.__natState = "ready"; });
  const said = async (fn, ms) => { const n = (await H.tts()).length; await fn(); await H.wait(ms || 8000); return (await H.tts()).slice(n).map((e) => e.text).join(" "); };
  const listening = () => p.waitForFunction(() => window.__vc.state() === "listening" && window.__R.on, null, { timeout: 30000 });
  // the call starts with «Calling…» and a ring, then «Connected»
  await p.evaluate(() => document.querySelector('[data-act="vc-open"]').click()); await H.wait(400);
  const st0 = await p.evaluate(() => ({ st: document.getElementById("vcall").dataset.state, ring: window.__vcRingOn(), chip: document.getElementById("vc-model").textContent }));
  rec("The call opens on «Calling…» with a ringback tone", st0.st === "calling" && st0.ring, JSON.stringify(st0));
  rec("The top bar shows which AI is answering (Claude Sonnet 5.5)", /Claude Sonnet 5\.5/.test(st0.chip), st0.chip);
  await H.wait(7000); await listening();
  rec("…then the ring stops", !(await p.evaluate(() => window.__vcRingOn())));
  let s = await said(() => H.say("ayer fui al mercado con mi hermana"), 7000);
  rec("Claude answers while it has credit", /Soy Claude/.test(s), s);
  // credit runs out mid-call
  mode = "credit"; await listening();
  await H.replies([{ text: "¡Qué interesante! ¿Qué compraste en el mercado? [[·]]", delay: 1500 }]);
  await p.evaluate(() => { window.__states = []; const o = document.getElementById("vcall"); new MutationObserver(() => window.__states.push(o.dataset.state)).observe(o, { attributes: true, attributeFilter: ["data-state"] }); });
  s = await said(() => H.say("compré frutas y verduras"), 12000);
  const ban = await p.evaluate(() => { const b = document.querySelector("#vcall .vc-banner"); return b && !b.hidden ? b.textContent : ""; });
  rec("Credit runs out → banner: why, «Add credit», «Use free AI»", /credit has run out/.test(ban) && /Add credit/.test(ban) && /Use free AI/.test(ban), ban);
  const states = await p.evaluate(() => window.__states.join(">"));
  rec("…status «Reconnecting…» then «Calling…» while Gemma gets ready", /aiswitch/.test(states) && /calling/.test(states), states);
  rec("…and Gemma answers the SAME turn", /Qué compraste en el mercado/.test(s), s);
  rec("…the top bar now says Gemma · on this phone", /Gemma/.test(await p.evaluate(() => document.getElementById("vc-model").textContent)));
  const down = await p.evaluate(() => window.__aiDown());
  rec("Claude is paused for 30 min after a credit error", down && down.why === "credit" && down.until - Date.now() > 25 * 60e3, JSON.stringify(down));
  // the next turn stays on Gemma (no request wasted on Claude)
  await listening(); const c0 = calls; await H.replies([{ text: "¡Muy bien! ¿Y cocinaste algo? [[·]]", delay: 40 }]);
  s = await said(() => H.say("sí, fue muy divertido"), 8000);
  rec("While paused, turns go straight to Gemma (no Claude request)", calls === c0 && /cocinaste/.test(s), calls - c0 + " · " + s);
  // credit added: the pause ends and Claude is back
  mode = "ok"; await p.evaluate(() => window.__aiDownExpire()); // the 30-minute pause is over (credit was added)
  await listening(); s = await said(() => H.say("hoy quiero hablar de mi trabajo"), 8000);
  rec("When Claude works again, it answers and the chip says Claude", /Soy Claude/.test(s) && /Claude/.test(await p.evaluate(() => document.getElementById("vc-model").textContent)), s);
  // a rate limit pauses Claude for a minute only
  rec("Rate limit → 1 minute pause; overloaded → 2 minutes; no internet → 1 minute", await p.evaluate(() => { const r = []; window.__apiFail(429, "rate limit exceeded"); r.push(window.__aiDown()); window.__apiFail(529, "Overloaded"); r.push(window.__aiDown()); window.__apiFail(0, "Failed to fetch"); r.push(window.__aiDown()); window.__useApi("sk-ant-test"); const d = r.map((x) => [x.why, Math.round((x.until - Date.now()) / 1000)]); return d[0][0] === "rate" && d[0][1] <= 61 && d[1][0] === "busy" && d[1][1] > 100 && d[1][1] <= 121 && d[2][0] === "offline" ? true : JSON.stringify(d); }));
  await H.say("termina la llamada"); await H.wait(3000);
  const ok = R.filter(Boolean).length; console.log(ok === R.length ? "ALL " + R.length + " PASS" : (R.length - ok) + " FAILED of " + R.length);
  await H.close(); process.exit(ok === R.length ? 0 : 1);
})().catch((e) => { console.log("CRASH", e.message); process.exit(1); });
