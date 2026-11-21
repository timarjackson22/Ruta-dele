// Live evaluation of Profe with REAL Claude (the learner's API key path). Runs the «upgrade Profe» scenarios as video calls
// in the test phone (speech is simulated: what the learner «says» is typed into the recogniser; Profe's voice is recorded
// as text), and writes full transcripts for review. Costs real API usage on the key given.
//   ANTHROPIC_API_KEY=sk-ant-… node tools/profe-tests/liveClaude.js [model] [scenario numbers…]
// Output: /tmp/live/<n>.md and /tmp/live/all.md. Nothing is graded automatically except hard checks (no crash, a reply came,
// the exercise item is kept); quality is judged by reading the transcripts.
const fs = require("fs");
const { open } = require("./h.js");
const KEY = process.env.ANTHROPIC_API_KEY, MODEL = process.argv[2] && /^claude-/.test(process.argv[2]) ? process.argv[2] : "claude-sonnet-5-5";
const ONLY = process.argv.slice(2).filter((x) => /^\d+$/.test(x)).map(Number);
if (!KEY) { console.log("Set ANTHROPIC_API_KEY"); process.exit(2); }
const S = [
  [1, "«Profe, let's practise» with no topic", ["vamos a practicar", "tú eliges", "tengo un coche nuevo", "terminamos"]],
  [2, "Very short answers", ["hola", "bien", "sí", "no sé", "pollo", "sí", "no"]],
  [3, "Translation interrupted by a grammar question", ["quiero practicar traduciendo oraciones", "por qué se dice así", "no sé", "terminamos"]],
  [4, "A correct answer phrased differently", ["quiero practicar traduciendo oraciones", "@ALT", "terminamos"]],
  [5, "A recurring error (needs explanation and retry)", ["ayer yo tiene mucho trabajo", "mi hermana tengo dos hijos", "y yo tiene un perro grande", "ah vale, yo tengo un perro grande"]],
  [6, "Ambiguous transcription", ["ayer fui al banco de la playa con mi perro gato", "no, fui a la playa con mi perro"]],
  [7, "An English request during Spanish practice", ["can you explain the preterite in English please", "vale, ayer comí arroz con pollo"]],
  [8, "Open and use an existing resource", ["abre la guía de ser y estar"]],
  [9, "A failed resource action", ["abre la lección de astronomía cuántica"]],
  [10, "A topic change that keeps the learning goal", ["quiero practicar el pasado", "ayer fui al mercado", "podemos hablar de otra cosa", "el fin de semana pasado vi una película"]],
  [11, "Role-play with a teaching interruption", ["vamos a hacer un role play, tú eres el camarero en un restaurante", "hola, quiero una mesa para dos", "how do I say the bill in Spanish", "la cuenta por favor"]],
  [12, "Session reset in the middle of an exercise", ["quiero practicar traduciendo oraciones", "@RELOAD", "repite"]],
  [13, "Frustration, then stop", ["esto es muy difícil, no entiendo nada", "estoy cansado", "termina la llamada"]],
  [14, "A longer session (continuity, repetition, adaptation)", ["hola profe", "hoy trabajé mucho en la oficina", "soy profesor de inglés", "mis estudiantes son niños", "a veces son difíciles", "me gusta mi trabajo porque es creativo", "el sábado voy a la playa con mi familia", "vamos a Coronado", "nos gusta nadar y comer pescado", "termina la llamada"]],
];
(async () => {
  fs.mkdirSync("/tmp/live", { recursive: true }); const all = [];
  for (const [n, title, lines] of S) {
    if (ONLY.length && !ONLY.includes(n)) continue;
    const H = await open(); const p = H.p; const T = []; let fails = [];
    await p.evaluate(([k, m]) => { window.__useApi(k, m); window.__setName("Timar", true); }, [KEY, MODEL]);
    const said = async (fn, ms) => { const k = (await H.tts()).length; await fn(); await H.wait(ms); await H.idle(25000); return (await H.tts()).slice(k).map((e) => e.text).join(" "); };
    const listening = () => p.waitForFunction(() => window.__vc.state() === "listening" && window.__R.on, null, { timeout: 60000 }).catch(() => fails.push("never back to listening"));
    T.push("**Profe:** " + (await said(() => p.evaluate(() => document.querySelector('[data-act="vc-open"]').click()), 6000)));
    for (let line of lines) {
      await listening();
      if (line === "@RELOAD") { await p.reload(); await H.wait(4000); await p.evaluate(([k, m]) => { window.__useApi(k, m); }, [KEY, MODEL]); T.push("*(app reloaded mid-exercise; call reopened)*"); T.push("**Profe:** " + (await said(() => p.evaluate(() => { if (window.tOpen) tOpen(); document.querySelector('[data-act="vc-open"]').click(); }), 6000))); continue; }
      if (line === "@ALT") line = await p.evaluate(() => { const a = window.__trd() && window.__trd().it.ans[0]; return a ? (/^(yo|tú|él|ella|nosotros|ellos) /i.test(a) ? a.replace(/^\S+\s+/, "") : "yo " + a.charAt(0).toLowerCase() + a.slice(1)) : "no sé"; });
      const item0 = await p.evaluate(() => (window.__trd() && !window.__trd().done && window.__trd().it) ? window.__trd().it.src : "");
      T.push("**Learner:** " + line);
      const r = await said(() => H.say(line), 4000);
      T.push("**Profe:** " + (r || "*(nothing said)*")); if (!r) fails.push("no reply to «" + line + "»");
      if (/por qué/.test(line) && item0) { const item1 = await p.evaluate(() => window.__trd() && window.__trd().it.src); if (item1 !== item0) fails.push("exercise item changed after a side question"); }
    }
    const md = "## " + n + ". " + title + " (" + MODEL + ")\n\n" + T.join("\n\n") + (fails.length ? "\n\n**Hard-check failures:** " + fails.join("; ") : "") + "\n";
    fs.writeFileSync("/tmp/live/" + n + ".md", md); all.push(md); console.log(n + ". " + title + (fails.length ? " — FAIL: " + fails.join("; ") : " — done"));
    await H.close();
  }
  fs.writeFileSync("/tmp/live/all.md", "# Profe with Claude — live scenarios\n\n" + all.join("\n---\n\n"));
  process.exit(0);
})().catch((e) => { console.log("CRASH", e.message); process.exit(1); });
