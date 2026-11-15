// Keeps Profe's capabilities in step with the app (tools/PROFE_HANDSFREE_BRIEF.md §7). Run: node tools/profe_check.js [index.html]
// Fails (exit 1) when: a route or an on-screen action has no voice status; the registry points at a route or action that no longer
// exists; an action lacks examples, a handler, a check or a test; a handler has no registry entry; a pattern doesn't compile.
const fs = require("fs"), path = require("path");
const file = process.argv[2] || path.join(__dirname, "..", "index.html");
const s = fs.readFileSync(file, "utf8");
const bad = [], warn = [];
const m = s.match(/<script type="application\/json" id="pv-registry">([\s\S]*?)<\/script>/);
if (!m) { console.log("FAIL no pv-registry in " + file); process.exit(1); }
const R = JSON.parse(m[1].replace(/<\\\//g, "</"));
// ---- the app's routes: conditions in route() ----
const rs = s.indexOf("function route() {"), re2 = s.indexOf("window.scrollTo(0, 0);\n  }", rs), body = s.slice(rs, re2);
const conds = [];
for (const x of body.matchAll(/h === "([^"]+)"/g)) conds.push({ src: x[0], test: (h) => h === x[1] });
for (const x of body.matchAll(/(\/\^[^\n]*?\/)\.test\(h\)/g)) { const src = x[1]; try { const rx = eval(src); conds.push({ src, test: (h) => rx.test(h) }); } catch (e) { bad.push("can't read route pattern " + src); } }
const lvRe = /^(a1|a2|b1|b2|c1|c2|esc)(?:-(?:u(\d+)|(exam|cards|mock|vocab)))?$/; conds.push({ src: "level routes", test: (h) => lvRe.test(h) });
const handled = (h) => h === "inicio" || conds.some((c) => c.test(h));
const EX = { lv: "a1", n: "1", cat: "sustantivos", topic: "por-para", paper: "oral", task: "a1-1", w: "casa", deck: "mine", id: "WLXiu-qp8Lw" };
const inst = (k) => [k.replace(/\[-\{paper\}\]/, ""), k.replace(/\[-\{paper\}\]/, "-{paper}")].map((x) => x.replace(/\{(\w+)\}/g, (a, v) => EX[v] || "x"));
// ---- the app's on-screen actions ----
const appActs = new Set([...s.matchAll(/data-act="([a-z0-9-]+)"/g)].map((x) => x[1]).concat([...s.matchAll(/dataset\.act = "([a-z0-9-]+)"/g)].map((x) => x[1]))
  .concat([...s.matchAll(/\b(?:a|act) === "([a-z][a-z0-9]*-[a-z0-9-]+)"/g)].map((x) => x[1])));
// ---- handlers ----
const hs = s.indexOf("const PVH = {"), he = s.indexOf("\n  };", hs), hsrc = s.slice(hs, he);
let hsrc2 = hsrc; { let i = 0; while ((i = s.indexOf("Object.assign(PVH, {", i)) >= 0) { const e = s.indexOf("\n  });", i); hsrc2 += s.slice(i, e); i = e; } } // handlers added later in blocks
const handlers = new Set([...hsrc2.matchAll(/^\s{4}"([a-z]+\.[a-z]+)":|, "([a-z]+\.[a-z]+)":/gm)].map((x) => x[1] || x[2]));
const TPL = { OPEN: "x?", LV: "a1", ORD: "a", TOPIC: "x", GCAT: "x", PAPER: "x" };
const tests = new Set(fs.readdirSync(path.join(__dirname, "profe-tests")).map((f) => f.replace(/\.js$/, "")));
const ids = new Set();
for (const a of R.actions) {
  const w = (t) => bad.push("action " + a.id + ": " + t);
  if (ids.has(a.id)) w("duplicate id"); ids.add(a.id);
  for (const k of ["feature", "purpose", "verify", "test"]) if (!a[k]) w("missing " + k);
  if (!["complete", "pending", "unsuitable"].includes(a.voice)) w("voice status must be complete, pending or unsuitable");
  if (!(a.en && a.en.length) || !(a.es && a.es.length)) w("needs English and Spanish example commands");
  if (!(a.match && a.match.length)) w("needs patterns");
  (a.match || []).forEach((p) => { try { new RegExp(p.replace(/\{(\w+)\}/g, (x, k) => TPL[k] || "x")); } catch (e) { w("pattern doesn't compile: " + p); } });
  if (a.voice === "complete" && !handlers.has(a.id)) w("no handler PVH[\"" + a.id + "\"]");
  if (a.act && !appActs.has(a.act)) w("its on-screen action «" + a.act + "» no longer exists in the app");
  if (a.route && !/\{(last|next)\}/.test(a.route)) inst(a.route).forEach((h) => { if (!/\{|\[/.test(h) && !handled(h)) w("route «" + h + "» isn't handled by route()"); });
  if (a.test && !tests.has(a.test)) w("test «" + a.test + "» not found in tools/profe-tests");
}
handlers.forEach((h) => { if (!ids.has(h)) bad.push("handler PVH[\"" + h + "\"] has no registry entry"); });
// every route condition is covered by a registry route (an action or a declared status)
const keys = Object.keys(R.routes), keyH = keys.flatMap((k) => inst(k).map((h) => [k, h]));
for (const [k, v] of Object.entries(R.routes)) { if (typeof v === "string") { if (!ids.has(v)) bad.push("route «" + k + "» points to unknown action " + v); } else if (!v || !["complete", "pending", "unsuitable"].includes(v.voice) || !v.why) bad.push("route «" + k + "» needs {voice, why}"); }
for (const c of conds) { if (!keyH.some(([k, h]) => c.test(h))) bad.push("route " + c.src + " has no voice status in the registry (add it to ROUTES in tools/profe_registry.py)"); }
// every on-screen action is declared; no obsolete declarations
for (const a of appActs) if (!(a in R.acts)) bad.push("on-screen action «" + a + "» has no voice status (add it to tools/profe_acts.json or ACTS in tools/profe_registry.py)");
for (const [a, v] of Object.entries(R.acts)) {
  if (!appActs.has(a)) bad.push("«" + a + "» is declared but no longer exists in the app (remove it)");
  if (typeof v === "string") { if (!ids.has(v)) bad.push("«" + a + "» points to unknown action " + v); } else if (!v || !["complete", "pending", "unsuitable"].includes(v.voice) || !v.why) bad.push("«" + a + "» needs {voice, why}");
}
const n = R.actions.filter((a) => a.voice === "complete").length, pend = Object.values(R.acts).filter((v) => v && v.voice === "pending").length + Object.values(R.routes).filter((v) => v && v.voice === "pending").length;
console.log("Profe registry: " + n + " voice actions · " + appActs.size + " on-screen actions declared · " + conds.length + " route rules covered · " + pend + " marked pending");
if (bad.length) { bad.forEach((b) => console.log("FAIL " + b)); process.exit(1); }
console.log("OK");
