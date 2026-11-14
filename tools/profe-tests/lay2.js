// dynamic screens: Profe open, a practice set running, flashcard study, an exam paper, drill steps
const { chromium, devices } = require("playwright");
const fs=require("fs");const body=fs.readFileSync("lay.js","utf8");const audit=body.slice(body.indexOf("const r=await p.evaluate(()=>{")+"const r=await p.evaluate(".length, body.indexOf("return out;});")+"return out;}".length);
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({...devices["Pixel 7"],serviceWorkers:"block"})).newPage();
const run=async(label,fn)=>{await fn();await p.waitForTimeout(900);const r=await p.evaluate(eval(audit.replace(/document.getElementById\("app"\)/,'(document.querySelector(".tutor:not([hidden])")||document.getElementById("app"))')));const n=r.touch.length+r.wrap.length+r.overlap.length+r.overflow.length;console.log((n?"ISSUES ":"ok ")+label+(n?"\n  "+[...r.touch,...r.wrap,...r.overlap,...r.overflow].slice(0,6).join("\n  "):""));};
await run("Profe chat",async()=>{await p.goto("http://localhost:8766/#curso");await p.waitForTimeout(1200);await p.click('[data-act="t-open"]');});
await run("Profe practice tab",async()=>{await p.click('[data-act="t-tab"][data-v="practice"]');});
await run("Profe settings tab",async()=>{await p.click('[data-act="t-tab"][data-v="hist"]');});
await p.click('[data-act="t-close"]');
await run("practice set in a unit",async()=>{await p.goto("http://localhost:8766/#a1-u2");await p.waitForTimeout(1200);const b2=await p.$('[data-act="px-start"], [data-act^="px-"]');if(b2)await b2.click();});
await run("flashcard study flipped",async()=>{await p.goto("http://localhost:8766/#repaso-a1");await p.waitForTimeout(1200);const c=await p.$('[data-act="sr-new"], [data-act="sr-start"], .fc');if(c)await c.click();await p.waitForTimeout(400);const f=await p.$(".fc");if(f)await f.click();});
await run("exam paper reading",async()=>{await p.goto("http://localhost:8766/#a1-examen-1-lectura");});
await run("drill",async()=>{await p.goto("http://localhost:8766/#drill");});
await run("writing task",async()=>{await p.goto("http://localhost:8766/#escritura-a1-1");});
await run("word page",async()=>{await p.goto("http://localhost:8766/#palabra-tener");});
await b.close();})();
