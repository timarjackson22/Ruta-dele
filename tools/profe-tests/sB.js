// B. voice coordination
const { open, labels, wrongVoice } = require("./h.js");
const CASES = [
  ["all Spanish", "¡Muy bien! Ayer fui al mercado con mi hermana. ¿Y tú qué hiciste? [[✓]]"],
  ["all English", "That's right. You used the past tense correctly, which is the key point here. [[✓]]"],
  ["English with Spanish words", "Use «fui» instead of «voy» because you're talking about yesterday. [[✗]]"],
  ["Spanish then English", "Tengo treinta años. *In Spanish you express age with tener, not with old.* [[✗]]"],
  ["many switches", "Say «Tengo hambre», which means I'm hungry, and «Tengo sed», which means I'm thirsty. Now try: «Tengo frío». [[·]]"],
  ["unwrapped Spanish in English", "Use fui instead of voy because you're talking about yesterday. Try again. [[✗]]"],
  ["Spanish word ir in English", "Fui is the past form of ir for I. Say: Ayer fui al supermercado. [[✗]]"],
  ["bold + label noise", "**Correct:** «Ayer **fui** al supermercado». EN: the past of ir. [[✗]]"],
];
(async () => {
  let fails = 0;
  for (const [name, reply] of CASES) {
    const H = await open();
    await H.replies([{ text: reply, delay: 100, wordMs: 25 }]);
    await H.type("Ayer fui al supermercado con mi madre"); await H.idle(15000);
    const tts = await H.tts(), played = tts.filter((e) => e.t0);
    const order = played.map((e) => e.text).join(" | ");
    const dup = played.length !== new Set(played.map((e) => e.text + e.tq)).size;
    const lab = labels(played), wv = wrongVoice(played), unplayed = tts.filter((e) => !e.t0 && !e.failed).map((e) => e.text);
    const ok = !lab.length && !wv.length && !dup && !unplayed.length && played.length > 0;
    if (!ok) fails++;
    console.log((ok ? "PASS " : "FAIL ") + name + "\n   played: " + played.map((e) => "[" + e.vl.slice(0, 2) + "] " + e.text).join(" | ") + (lab.length ? "\n   LABELS: " + lab.join(" | ") : "") + (wv.length ? "\n   WRONG VOICE: " + wv.join(" | ") : "") + (unplayed.length ? "\n   NOT PLAYED: " + unplayed.join(" | ") : "") + (H.errs.length ? "\n   ERR " + H.errs : ""));
    await H.close();
  }
  console.log(fails ? fails + " FAILED" : "ALL PASS");
})();
