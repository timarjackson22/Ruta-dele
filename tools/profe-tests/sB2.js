const { open } = require("./h.js");
(async () => {
  const H = await open({ init: () => { setTimeout(() => { window.__T.missingEs = true; }, 0); } });
  await H.replies([{ text: "Use «fui» instead of «voy» because you're talking about yesterday. [[✗]]", delay: 100, wordMs: 25 }]);
  await H.type("Ayer fui al supermercado con mi madre"); await H.idle(12000);
  const tts = await H.tts();
  console.log("played:", tts.filter((e) => e.t0).map((e) => "[" + e.vl.slice(0, 2) + "] " + e.text).join(" | "));
  console.log("failed (not spoken):", tts.filter((e) => e.failed).map((e) => e.text).join(" | "));
  console.log("Spanish text in English voice:", tts.filter((e) => e.t0 && /^es/.test(e.lang) && !/^es/.test(e.vl)).length, "| notice:", await H.p.evaluate(() => (document.getElementById("coach-toast") || {}).textContent));
  console.log(H.errs); await H.close();
})();
