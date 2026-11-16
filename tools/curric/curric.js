  /* ---------- DELE curriculum coverage, compliance and QA dashboard (admin; tools/curric, requested 15 Nov 2026) ----------
     Everything is computed live from the app's real content (lessons, guides, practice items, listening texts, role-plays,
     writing tasks, mock exams) against the register in <script id="curric-data"> (tools/curric/build_register.py).
     Nothing here is a learner's mastery: it measures what the course teaches, practises and assesses. */
  const CR = { tab: "overview", f: { lvl: "", comp: "", src: "", st: "", cov: "", topic: "", q: "" }, sel: null, scope: "all", R: null, EX: null, M: null, busy: false };
  const CR_LV = ["a1", "a2", "b1", "b2", "c1", "c2"], CR_KEY = "ruta-curric-admin";
  const crFold = (s) => String(s == null ? "" : s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const crPct = (a, b) => (b ? Math.round((a / b) * 100) : null), crP = (v) => (v == null ? "—" : v + "%");
  function crReg() { if (CR.R) return CR.R; try { CR.R = JSON.parse(document.getElementById("curric-data").textContent.replace(/<\\\//g, "</")); } catch (e) { CR.R = null; } return CR.R; }
  /* ---- admin role (a soft gate on this device: the app has no server, so this keeps the tool out of learners' way; it is not security) ---- */
  function crStore() { let s = null; try { s = JSON.parse(localStorage.getItem(CR_KEY) || "null"); } catch (e) {} s = s || {}; s.issues = s.issues || {}; s.log = s.log || []; s.val = s.val || {}; s.req = s.req || []; return s; }
  function crPut(s) { try { localStorage.setItem(CR_KEY, JSON.stringify(s)); } catch (e) {} }
  const crAdmin = () => !!crStore().on;
  function crLog(act, id, note) { const s = crStore(); s.log.push({ t: new Date().toISOString(), who: s.who || "admin", act, id: id || "", note: note || "" }); s.log = s.log.slice(-2000); crPut(s); }
  async function crSha(t) { const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t)); return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join(""); }
  /* ---- exam papers (examdata/*.json, the same files the Exams section uses) ---- */
  async function crExams() {
    if (CR.EX) return CR.EX; const out = {};
    await Promise.all(CR_LV.map((lv) => fetch("examdata/" + lv + ".json").then((r) => (r.ok ? r.json() : null)).then((d) => { out[lv] = d; }).catch(() => { out[lv] = null; })));
    CR.EX = out; return out;
  }
  /* ---- 1. inventory: every teaching, practice and assessment record, with its level, competencies and effort ---- */
  function crInventory(EX) {
    const R = crReg(), EF = R.effort, AC = R.act_comp, recs = [], topics = [], bad = [];
    const add = (r) => { r.id = r.id || "r" + recs.length; r.f = crFold(r.text); r.hf = r.h != null ? crFold(r.h) : r.f; recs.push(r); return r; };
    const lab = (n) => (n || []).map((x) => String(x).split("|")[0]).join(" ");
    const why = (s) => String(s || "").trim().length >= 20;
    const checkTxt = (s) => { const t = String(s || ""), e = []; if (/¿/.test(t) && (t.match(/¿/g) || []).length > (t.match(/\?/g) || []).length) e.push("¿ without ?"); if (/¡/.test(t) && (t.match(/¡/g) || []).length > (t.match(/!/g) || []).length) e.push("¡ without !"); if (/\b(\w{3,}) \1\b/i.test(t)) e.push("doubled word"); return e; };
    const val = (it) => { const e = [];
      if (!String(it.q || "").trim()) e.push("empty question");
      if (it.t === "mc") { if (!Array.isArray(it.opts) || it.opts.length < 2) e.push("fewer than 2 options"); else { if (!(Number.isInteger(it.c) && it.c >= 0 && it.c < it.opts.length)) e.push("answer key out of range"); if (new Set(it.opts.map((x) => String(x).trim().toLowerCase())).size < it.opts.length) e.push("duplicate options"); } }
      else { if (!(it.a || []).some((x) => String(x).trim())) e.push("no answer"); const raw = (x) => String(x).trim().toLowerCase().replace(/\s+/g, " "); if (it.t === "fix" && (it.a || []).some((x) => raw(x) === raw(it.q))) e.push("the correction equals the mistake"); }
      return e; };
    const pushItems = (topic, lvl, items, link, sec) => items.forEach((it, k) => { const e = val(it), m = checkTxt([it.q].concat(it.a || [], it.opts || []).join(" "));
      const r = add({ role: "practice", type: it.t, lvl, topic: topic.id, link, sec: sec ? sec[k] : null, text: [it.q, (it.a || []).join(" "), (it.opts || []).join(" "), it.why].join(" "), comp: AC[it.t], min: EF[it.t], why: why(it.why), err: e, mech: m, q: it.q, item: it });
      topic.recs.push(r.id); if (e.length) bad.push({ rec: r.id, topic: topic.id, link, errs: e, crit: e.some((x) => /answer key|no answer|correction equals/.test(x)) }); });
    // lessons
    (typeof COURSE !== "undefined" ? COURSE : []).forEach((L) => { if (!CR_LV.includes(L.id)) return;
      L.units.forEach((u, i) => { const id = L.id + "-u" + (i + 1), link = "#" + id, T = { id, kind: "unit", lvl: L.id, title: u.t, sub: u.s, link, recs: [], secs: [] }; topics.push(T);
        const secs = [{ text: JSON.stringify(u.v), name: "Vocabulary" }].concat(u.g.map((b) => ({ text: JSON.stringify(b), name: b.t }))).concat(u.e && u.e.length ? [{ text: JSON.stringify(u.e), name: "Examples" }] : []).concat(u.pit && u.pit.length ? [{ text: JSON.stringify(u.pit), name: "Common mistakes" }] : []);
        T.secs = secs.map((s) => s.name);
        T.recs.push(add({ role: "teach", type: "lesson-intro", lvl: L.id, topic: id, link, text: [u.t, u.s, u.intro, u.xi].join(" "), h: [u.t, u.s].join(" "), comp: { gra: 1 }, ex: (u.e || []).length }).id);
        (u.v || []).forEach((v) => T.recs.push(add({ role: "teach", type: "lesson-vocab", lvl: L.id, topic: id, link, sec: 0, text: v.t + " " + v.w.map((w) => w.join(" ")).join(" "), comp: { voc: 1 }, ex: v.w.length }).id));
        u.g.forEach((b, bi) => T.recs.push(add({ role: "teach", type: "lesson-grammar", lvl: L.id, topic: id, link, sec: 1 + bi, text: [u.t, b.t, b.r, (b.h || []).join(" "), (b.rows || []).map((r) => r.join(" ")).join(" "), (b.n || []).join(" ")].join(" "), h: [b.t, b.r, (b.h || []).join(" "), lab(b.n)].join(" "), comp: { gra: 1 }, ex: (b.rows || []).length + (b.n || []).length }).id));
        if (u.pit && u.pit.length) T.recs.push(add({ role: "teach", type: "lesson-pitfalls", lvl: L.id, topic: id, link, text: u.pit.join(" "), comp: { gra: 1 }, ex: u.pit.length }).id);
        if (u.acc) T.recs.push(add({ role: "teach", type: "lesson-pron", lvl: L.id, topic: id, link, text: u.acc, comp: { pro: 1 }, ex: 1 }).id);
        const items = pxItems(u); let A = []; try { A = window.__qc ? window.__qc.assign(items, secs) : []; } catch (e) {}
        const secOf = {}; A.forEach((ks, si) => ks.forEach((k) => (secOf[k] = si)));
        pushItems(T, L.id, items, link, items.map((_, k) => (secOf[k] != null ? secOf[k] : null)));
      });
      (L.exam && L.exam.tests || []).forEach((t, k) => { const n = crFold(t.n + " " + t.en), comp = {};
        if (/auditiva|listening/.test(n)) comp.lis = .5; if (/lectura|reading/.test(n)) comp.rea = .5; if (/escrit|writing/.test(n)) { comp.wex = .4; comp.wint = .4; } if (/oral|speaking/.test(n)) { comp.oex = .4; comp.oint = .4; }
        if (/uso de la lengua/.test(n)) { comp.gra = .3; comp.voc = .3; } if (/integrad|mediac/.test(n)) comp.med = .3; if (!Object.keys(comp).length) return;
        add({ role: "teach", type: "exam-guidance", lvl: L.id, topic: L.id + "-exam", link: "#" + L.id + "-exam", text: [t.n, t.en, (t.what || []).join(" "), (t.tips || []).join(" ")].join(" "), comp, ex: (t.tips || []).length }); });
    });
    // guides
    (typeof GUIDES !== "undefined" ? GUIDES : []).forEach((g) => { const id = "guia-" + g.id, link = "#" + id, T = { id, kind: "guide", gid: g.id, lvl: g.lvl, title: g.t, sub: g.en, link, recs: [], secs: g.sec.map((s) => s.t).concat(g.pit && g.pit.length ? ["Common mistakes"] : []) }; topics.push(T);
      const pro = g.id === "pronunciacion", conn = g.id === "conectores", idi = g.id === "modismos";
      const comp = pro ? { pro: 1 } : conn ? { dis: 1, gra: .3 } : idi ? { voc: .6, pra: .4 } : { gra: 1 };
      T.recs.push(add({ role: "teach", type: "guide-intro", lvl: g.lvl, topic: id, link, text: [g.t, g.en, g.intro].join(" "), h: [g.t, g.en].join(" "), comp, ex: 0 }).id);
      g.sec.forEach((s, si) => T.recs.push(add({ role: "teach", type: "guide-section", lvl: g.lvl, topic: id, link, sec: si, text: [g.t, s.t, s.r, (s.n || []).join(" "), (s.e || []).map((e) => e.join(" ")).join(" ")].join(" "), h: [g.t, g.en, s.t, s.r, lab(s.n)].join(" "), comp, ex: (s.e || []).length }).id));
      if (g.pit && g.pit.length) T.recs.push(add({ role: "teach", type: "guide-pitfalls", lvl: g.lvl, topic: id, link, text: g.pit.join(" "), comp, ex: g.pit.length }).id);
      const items = pxItems(g), secs = g.sec.map((x) => ({ text: JSON.stringify(x) })).concat(g.pit && g.pit.length ? [{ text: JSON.stringify(g.pit) }] : []); let A = []; try { A = window.__qc ? window.__qc.assign(items, secs) : []; } catch (e) {}
      const secOf = {}; A.forEach((ks, si) => ks.forEach((k) => (secOf[k] = si)));
      pushItems(T, g.lvl, items, link, items.map((_, k) => (secOf[k] != null ? secOf[k] : null)));
      if (pro) T.recs.forEach((rid) => { const r = recs.find((x) => x.id === rid); if (r && r.role === "practice") r.comp = { pro: .5, wex: .25, rea: .25 }; });
    });
    // level-wide activities
    (typeof LISTEN !== "undefined" ? LISTEN : []).forEach((x) => { const rd = x.cat === "reading", qs = (x.q || []);
      const r = add({ role: "practice", type: rd ? "read" : "listen", lvl: x.lvl, topic: null, link: "#escuchar", text: [x.t, x.s, (x.paras || []).map((p) => (typeof p === "string" ? p : p.es || p.t || JSON.stringify(p))).join(" ")].join(" "), comp: AC[rd ? "read" : "listen"], min: EF[rd ? "read" : "listen"], why: true, err: [], mech: [], title: x.t, nq: qs.length });
      qs.forEach((q) => { if (!(Array.isArray(q[1]) && Number.isInteger(q[2]) && q[2] >= 0 && q[2] < q[1].length)) { r.err.push("question key out of range"); bad.push({ rec: r.id, topic: null, link: r.link, errs: ["listening question key out of range: " + q[0]], crit: true }); } }); });
    (typeof VID_START !== "undefined" ? VID_START : []).forEach((v) => { const lv = crFold(v.lvl).slice(0, 2); if (CR_LV.includes(lv)) add({ role: "practice", type: "video", lvl: lv, topic: null, link: "#videos", text: [v.t, v.note].join(" "), comp: AC.video, min: EF.video, why: true, err: [], mech: [], title: v.t }); });
    const V = typeof VOICE !== "undefined" ? VOICE : { roleplays: [], speaking: [] };
    (V.roleplays || []).forEach((x) => add({ role: "practice", type: "roleplay", lvl: x.lvl, topic: null, link: "#practicar", text: [x.t, x.en, JSON.stringify(x.steps)].join(" "), comp: AC.roleplay, min: EF.roleplay, why: true, err: [], mech: [], title: x.t }));
    (V.speaking || []).forEach((x) => add({ role: "practice", type: "speak", lvl: x.lvl, topic: null, link: "#practicar", text: [x.task, JSON.stringify(x.prompt), JSON.stringify(x.points), x.model].join(" "), comp: AC.speak, min: EF.speak, why: !!x.model, err: [], mech: [], title: x.task }));
    (typeof WTASKS !== "undefined" ? WTASKS : []).forEach((x) => { const inter = /1/.test(x.tarea || "") || /correo|carta|mensaje|nota|postal/i.test(x.type || "");
      const r = add({ role: "practice", type: "write", lvl: x.lvl, topic: null, link: "#escritura", text: [x.type, x.es, x.en, (x.points || []).map((p) => p.es + " " + p.en).join(" "), (x.phrases || []).map((p) => p.join(" ")).join(" "), x.source].join(" "), comp: inter ? { wint: .6, wex: .2, dis: .1, pra: .1 } : { wex: .6, dis: .2, pra: .1, gra: .1 }, min: EF.write, why: true, err: [], mech: [], title: x.type + ": " + x.en, reg: x.reg });
      if (!(x.words && x.words[0] < x.words[1]) || !(x.points || []).length) { r.err.push("word range or points missing"); bad.push({ rec: r.id, topic: null, link: r.link, errs: ["writing task " + x.id + ": word range or points missing"], crit: false }); } });
    (typeof VOCAB !== "undefined" ? Object.entries(VOCAB) : []).forEach(([lv, th]) => th.forEach((t) => add({ role: "practice", type: "deck", lvl: lv, topic: null, link: "#repaso", text: t.t + " " + t.en + " " + t.w.map((w) => w.join(" ")).join(" "), comp: AC.deck, min: EF.deck, why: true, err: [], mech: [], title: t.t + " (" + t.en + ")" })));
    // assessment: mock exam papers
    const papers = {};
    CR_LV.forEach((lv) => { const D = EX && EX[lv]; if (!D) return; papers[lv] = D;
      D.exams.forEach((e, ei) => ["lectura", "auditiva", "escritura", "oral"].forEach((pr) => (e[pr] || []).forEach((t) => { const n = parseInt(String(t.t).replace(/\D+/g, ""), 10) || 0, tid = "dele-" + lv + "-" + pr + "-t" + n;
        const off = R.tasks.find((x) => x.id === tid), comp = off ? { [off.comp]: 1 } : pr === "lectura" ? { rea: 1 } : pr === "auditiva" ? { lis: 1 } : pr === "escritura" ? { wex: 1 } : { oex: 1 };
        const qs = t.q || [], txt = [t.ins, t.en, t.task, JSON.stringify(t.texts || ""), (t.audio || []).join(" "), qs.map((q) => q.q + " " + (q.o || []).join(" ")).join(" "), JSON.stringify(t.points || "")].join(" ");
        const r = add({ role: "assess", type: pr === "escritura" ? "exam-write" : pr === "oral" ? "exam-oral" : "exam-q", lvl: lv, topic: null, link: "#examenes", text: txt, comp, min: pr === "escritura" ? R.effort["exam-write"] : pr === "oral" ? R.effort["exam-oral"] : qs.length * R.effort["exam-q"], why: true, err: [], mech: [], paper: ei + 1, prueba: pr, n, task: tid, nq: qs.length, words: t.words, speak: t.speak, prep: t.prep, pts: (t.points || []).length || (t.ask || []).length || (t.form ? 1 : 0), model: !!t.model, reg: t.reg,
          ans: qs.map((q) => (q.o || t.opts || [])[q.a]).filter(Boolean).join(" ") });
        const where = lv.toUpperCase() + " paper " + (ei + 1) + " " + pr + " " + t.t;
        qs.forEach((q, qi) => { const O = Array.isArray(q.o) ? q.o : Array.isArray(t.opts) ? t.opts : null; const key = Array.isArray(q.a) ? q.a : [q.a];
          if (!O || !key.every((a) => Number.isInteger(a) && a >= 0 && a < O.length)) { r.err.push("answer key out of range"); bad.push({ rec: r.id, topic: null, link: "#examenes", errs: [where + " Q" + (qi + 1) + ": answer key out of range"], crit: true }); }
          else if (Array.isArray(q.o) && new Set(q.o.map((x) => String(x).trim().toLowerCase())).size < q.o.length) { r.err.push("duplicate options"); bad.push({ rec: r.id, topic: null, link: "#examenes", errs: [where + " Q" + (qi + 1) + ": duplicate options"], crit: false }); } });
        if (Array.isArray(t.opts) && new Set(t.opts.map((x) => String(typeof x === "string" ? x : JSON.stringify(x)).trim().toLowerCase())).size < t.opts.length) { r.err.push("duplicate options"); bad.push({ rec: r.id, topic: null, link: "#examenes", errs: [where + ": duplicate shared options"], crit: false }); }
        if ((pr === "escritura" || pr === "oral") && !(t.points || []).length && !t.form && !(t.ask || []).length) { r.err.push("no task points"); bad.push({ rec: r.id, topic: null, link: "#examenes", errs: [lv.toUpperCase() + " paper " + (ei + 1) + " " + pr + " " + t.t + ": no task points to grade against"], crit: false }); }
      }))); });
    const byId = {}; recs.forEach((r) => (byId[r.id] = r));
    return { recs, byId, topics, bad, papers };
  }
  /* ---- 2. evidence per outcome: taught / practised / assessed, each against fixed criteria ---- */
  function crEvaluate(inv) {
    const R = crReg(), Q = R.qa.thresholds, li = (l) => CR_LV.indexOf(l), out = {};
    const XC = { pra: 1, dis: 1, med: 1 }, skillCompRecs = (role, comp, lv, min) => inv.recs.filter((r) => r.role === role && r.lvl === lv && r.comp && (r.comp[comp] || 0) >= (XC[comp] ? 0.1 : min || 0.3));
    R.outcomes.forEach((o) => {
      const ev = { T: [], P: [], A: [], t: false, p: false, a: false, na: false, late: [], notes: [] };
      if (o.kind === "skill" || o.kind === "dele") {
        const c = o.comp;
        ev.T = skillCompRecs("teach", c, o.lvl, .3).map((r) => r.id);
        if (o.kind === "skill" && c === "gra") ev.T = inv.recs.filter((r) => r.role === "teach" && r.lvl === o.lvl && /grammar|guide-section/.test(r.type)).map((r) => r.id);
        if (o.kind === "skill" && c === "voc") ev.T = inv.recs.filter((r) => r.role === "teach" && r.lvl === o.lvl && r.type === "lesson-vocab").map((r) => r.id);
        if (c === "pra") ev.T = ev.T.concat(inv.recs.filter((r) => r.role === "teach" && r.lvl === o.lvl && /\b(usted|formal|informal|registro|register|cortes|polite)/.test(r.f)).map((r) => r.id));
        if (c === "dis") ev.T = ev.T.concat(inv.recs.filter((r) => r.role === "teach" && r.lvl === o.lvl && /\b(conector|connector|sin embargo|ademas|por un lado)/.test(r.f)).map((r) => r.id));
        if (c === "med") ev.T = ev.T.concat(inv.recs.filter((r) => r.role === "teach" && r.lvl === o.lvl && /\b(resum|mediac|summar|sintetiz)/.test(r.f)).map((r) => r.id));
        ev.T = [...new Set(ev.T)];
        let P = skillCompRecs("practice", c, o.lvl, .3);
        if (c === "med") P = inv.recs.filter((r) => r.role === "practice" && r.lvl === o.lvl && (r.type === "write" || r.type === "speak") && /\b(resum|sintesis|sintetiz|summar|mediac|segun (el|la) (texto|grafico|audio))/.test(r.f));
        ev.P = P.map((r) => r.id);
        const needP = (c === "gra" || c === "voc") ? Q.practice_items_grammar : Q.practice_skill_activities;
        let A = inv.recs.filter((r) => r.role === "assess" && r.lvl === o.lvl && r.comp && r.comp[c]);
        if (o.kind === "dele") A = inv.recs.filter((r) => r.role === "assess" && r.task === o.task);
        if (o.kind === "skill" && (c === "gra" || c === "voc" || c === "pra" || c === "dis")) { // language criteria are scored inside the productive tasks
          const prod = inv.recs.filter((r) => r.role === "assess" && r.lvl === o.lvl && (r.type === "exam-write" || r.type === "exam-oral") && r.pts > 0);
          if (c === "pra") A = A.concat(prod.filter((r) => r.reg));
          else if (c === "dis") A = A.concat(li(o.lvl) >= 2 ? prod : []);
          else A = A.concat(prod);
        }
        if (o.kind === "skill" && c === "pro") { A = []; ev.notes.push("The app records spoken exam answers but scores the words, not the pronunciation, so pronunciation is not assessed."); }
        if (c === "med" && li(o.lvl) < 4 && o.kind === "skill") { ev.na = true; ev.notes.push("The DELE assesses mediation only from C1 (2024 format), so assessment is not applicable at this level."); }
        ev.A = [...new Set(A.map((r) => r.id))];
        ev.t = ev.T.length >= 1 && (o.kind === "dele" || ev.T.some((id) => (inv.byId[id].ex || 0) >= 1) || c !== "gra");
        if (o.kind === "dele") ev.t = ev.T.length >= 1;
        ev.p = ev.P.length >= needP;
        if (o.kind === "dele" && ev.P.length >= 1) ev.p = true;
        ev.a = ev.na ? null : ev.A.length >= 1;
      } else { // grammar points, functions and themes: matched by their own keywords in the app's text
        let rx; try { rx = new RegExp(o.kw, "i"); } catch (e) { rx = /$^/; ev.notes.push("invalid keyword pattern"); }
        const HT = /^(lesson-grammar|lesson-intro|guide-section)$/, lvOK = (r) => li(r.lvl) <= li(o.lvl), hits = inv.recs.filter((r) => ((o.kind === "grammar" || o.kind === "function") && r.role === "teach" ? HT.test(r.type) && rx.test(r.hf) : r.f && rx.test(r.f)));
        const teach = hits.filter((r) => r.role === "teach" && (o.kind !== "grammar" || (r.comp && (r.comp.gra || r.comp.dis))));
        ev.T = teach.filter(lvOK).map((r) => r.id); ev.late = [...new Set(teach.filter((r) => !lvOK(r)).map((r) => r.lvl))];
        const tSec = {}; teach.filter(lvOK).forEach((r) => { if (r.topic != null && r.sec != null) tSec[r.topic + "|" + r.sec] = 1; });
        let P = inv.recs.filter((r) => r.role === "practice" && lvOK(r) && ((r.f && rx.test(r.f)) || (r.topic && r.sec != null && tSec[r.topic + "|" + r.sec])));
        if (o.kind === "function") P = P.filter((r) => ["roleplay", "speak", "write", "tr"].includes(r.type) || (r.comp && r.comp[o.comp]));
        if (o.kind === "theme") P = P.filter((r) => ["deck", "read", "listen", "video", "roleplay", "write"].includes(r.type));
        ev.P = P.map((r) => r.id);
        let A;
        if (o.kind === "grammar") { // direct: a grammar/vocabulary cloze item targets it; indirect: it is scored inside a writing or speaking task (grammatical accuracy / language use)
          let frx = null; try { frx = o.forms ? new RegExp(o.forms, "i") : null; } catch (e) {}
          A = inv.recs.filter((r) => r.role === "assess" && li(r.lvl) >= li(o.lvl) && r.comp && (r.comp.gra || r.comp.voc) && ((frx && frx.test(crFold(r.ans))) || rx.test(r.f)));
          if (!A.length && ev.T.length) { A = inv.recs.filter((r) => r.role === "assess" && r.lvl === o.lvl && (r.type === "exam-write" || r.type === "exam-oral") && r.pts > 0); if (A.length) { ev.ind = true; ev.notes.push("Assessed indirectly: scored within the grammatical accuracy / language-use criterion of the " + o.lvl.toUpperCase() + " writing and speaking tasks."); } }
        } else if (o.kind === "function") A = hits.filter((r) => r.role === "assess" && li(r.lvl) >= li(o.lvl) && (r.type === "exam-write" || r.type === "exam-oral"));
        else A = hits.filter((r) => r.role === "assess" && li(r.lvl) >= li(o.lvl));
        ev.A = A.map((r) => r.id);
        ev.t = o.kind === "theme" ? ev.T.length >= 1 || inv.recs.some((r) => r.type === "deck" && lvOK(r) && rx.test(r.f)) : ev.T.length >= 1 && teach.filter(lvOK).reduce((n, r) => n + (r.ex || 0), 0) >= Q.taught_examples;
        if (o.kind === "theme" && !ev.T.length) ev.T = inv.recs.filter((r) => r.type === "deck" && lvOK(r) && rx.test(r.f)).map((r) => r.id);
        ev.p = o.kind === "grammar" ? ev.P.length >= Q.practice_items_grammar : ev.P.length >= 1;
        ev.a = ev.A.length >= Q.assessed_items_grammar;
        if (ev.late.length && !ev.t) ev.notes.push("Taught only later than the PCIC level (" + ev.late.join(", ").toUpperCase() + ").");
      }
      const dims = [ev.t, ev.p].concat(ev.a === null ? [] : [ev.a]), n = dims.filter(Boolean).length;
      ev.score = n / dims.length; ev.cov = n === dims.length ? "full" : n ? "partial" : "missing";
      ev.topics = [...new Set(ev.T.concat(ev.P).map((id) => inv.byId[id].topic).filter(Boolean))];
      out[o.id] = ev;
    });
    return out;
  }
  /* ---- 3. DELE structure check: the app's mock papers against the official task families ---- */
  function crDele(inv) {
    const R = crReg(), out = {};
    const nums = (s) => (String(s || "").match(/\d+(?:[.,]\d+)?/g) || []).map((x) => parseFloat(x.replace(",", ".")));
    CR_LV.forEach((lv) => { const D = inv.papers[lv], off = R.dele[lv], rows = [], src = R.sources["dele-" + lv];
      if (!D) { out[lv] = { rows, missing: true }; return; }
      const fm = (D.format && D.format.mins) || {};
      const times = Object.keys(off.time).map((pr) => { let app = fm[pr]; if (lv === "c2" && pr === "lectura") app = (fm.lectura || 0) + (fm.auditiva || 0); return { pr, off: off.time[pr], app, ok: app === off.time[pr] }; });
      const appPrep = nums(D.format && D.format.oral)[1], prepOk = off.prep && off.prep.oral != null ? appPrep === off.prep.oral : true;
      R.tasks.filter((t) => t.lvl === lv).forEach((t) => {
        const found = inv.recs.filter((r) => r.role === "assess" && r.task === t.id), issues = [];
        if (!found.length) issues.push("No mock-exam task matches this official task.");
        if (t.items != null && found.length) { const nq = [...new Set(found.map((r) => r.nq))]; if (nq.some((n) => n !== t.items)) issues.push("Items: official " + t.items + ", app " + nq.join("/") + "."); }
        if (t.length && found.length) { const L = nums(t.length);
          if (/word/.test(t.length)) { const bad = found.filter((r) => r.words && (r.words[0] < L[0] - 1 || r.words[1] > (L[1] || L[0]) + 1)); if (bad.length) issues.push("Length: official " + t.length + ", app " + [...new Set(bad.map((r) => r.words.join("–")))].join(" / ") + " words."); }
          if (/min/.test(t.length) && L.length) { const bad = found.filter((r) => r.speak && (r.speak < L[0] - 0.01 || r.speak > (L[1] || L[0]) + 0.01)); if (bad.length) issues.push("Duration: official " + t.length + ", app " + [...new Set(bad.map((r) => r.speak + " min"))].join(" / ") + "."); }
          if (found.some((r) => (r.type === "exam-write" || r.type === "exam-oral") && !r.pts)) issues.push("Some versions have no task points to grade against."); }
        const practice = inv.recs.filter((r) => r.role === "practice" && r.lvl === lv && r.comp && r.comp[t.comp] >= .3).length;
        rows.push({ t, found: found.length, papers: [...new Set(found.map((r) => r.paper))].length, issues, practice, st: !found.length ? "missing" : issues.length ? "partial" : "aligned" });
      });
      // app tasks that the official spec does not have (e.g. an extra oral task)
      const extra = [...new Set(inv.recs.filter((r) => r.role === "assess" && r.lvl === lv && !R.tasks.some((t) => t.id === r.task)).map((r) => r.prueba + " T" + r.n))];
      out[lv] = { rows, times, prepOk, appPrep, offPrep: off.prep && off.prep.oral, extra, src, superseded: !!(src && src.superseded_by) };
    });
    return out;
  }
  /* ---- 4. exercise mix against the Master Topic-to-Skills Mapping ---- */
  function crTarget(T) { const S = crReg().skillmap, d = S.defaults; return (S.topics && S.topics[T.id]) || (T.kind === "guide" && d["guide:" + T.gid]) || d[T.kind] || {}; }
  function crBalance(inv, scope) {
    const R = crReg(), C = R.comps.map((c) => c[0]), lvScope = CR_LV.includes(scope), T = lvScope ? null : inv.topics.find((t) => t.id === scope);
    const recs = lvScope ? inv.recs.filter((r) => r.role === "practice" && r.lvl === scope) : T ? T.recs.map((id) => inv.byId[id]).filter((r) => r.role === "practice") : inv.recs.filter((r) => r.role === "practice");
    const min = {}, cnt = {}; C.forEach((c) => { min[c] = 0; cnt[c] = 0; });
    recs.forEach((r) => Object.entries(r.comp || {}).forEach(([c, w]) => { min[c] += (r.min || 0) * w; cnt[c] += w; }));
    const tot = Object.values(min).reduce((a, b) => a + b, 0) || 1;
    let target = T ? crTarget(T) : { lis: 20, rea: 20, wex: 12, wint: 8, oex: 10, oint: 10, gra: 8, voc: 7, pro: 3, pra: 1, dis: 1, med: 0 };
    if (lvScope && CR_LV.indexOf(scope) >= 4) target = { lis: 18, rea: 18, wex: 10, wint: 6, oex: 9, oint: 9, gra: 7, voc: 7, pro: 2, pra: 3, dis: 4, med: 7 };
    const mapped = T ? !!((R.skillmap.topics || {})[T.id] || (T.kind === "guide" && R.skillmap.defaults["guide:" + T.gid])) : true;
    const types = {}; recs.forEach((r) => (types[r.type] = (types[r.type] || 0) + (r.min || 0)));
    const mcShare = (types.mc || 0) / tot, prodMin = ["wex", "wint", "oex", "oint", "pro"].reduce((n, c) => n + min[c], 0);
    const rows = C.map((c) => { const act = Math.round((min[c] / tot) * 100), tg = target[c] || 0, dev = act - tg; return { c, target: tg, actual: act, n: Math.round(cnt[c] * 10) / 10, min: Math.round(min[c]), dev, flag: Math.abs(dev) >= R.qa.thresholds.deviation_flag }; });
    return { rows, recs, tot: Math.round(tot), mcShare, prodShare: prodMin / tot, types, mapped, target, T };
  }
  /* ---- 5. gap detection ---- */
  function crGaps(inv, EV, DL) {
    const R = crReg(), G = [], O = R.outcomes, oById = {}; O.forEach((o) => (oById[o.id] = o));
    const sevW = (o) => (o.w >= 3 ? "high" : o.w === 2 ? "medium" : "low"), cname = (c) => (R.comps.find((x) => x[0] === c) || [, c])[1];
    const add = (rule, id, sev, title, detail, rec, links, o) => G.push({ id: rule + ":" + id, rule, sev, title, detail, rec, links: links || [], oid: o ? o.id : null, lvl: o ? o.lvl : null, imp: o ? o.w : 1 });
    const lvlLink = (lv) => ({ h: "#" + lv, t: lv.toUpperCase() + " course" });
    O.forEach((o) => { const e = EV[o.id], L = o.lvl.toUpperCase();
      if (!e.t) add("not-taught", o.id, sevW(o), "Not taught: " + o.text, L + " · " + cname(o.comp) + " · " + o.ref + (e.notes.length ? " · " + e.notes.join(" ") : ""), o.kind === "dele" ? "Add exam guidance (what the task asks, how it is marked, tips) for " + L + " " + o.ref + "." : "Add a lesson section or guide section that explains this with at least two examples at " + L + ".", [lvlLink(o.lvl)], o);
      else if (!e.p) add("not-practised", o.id, o.w >= 3 ? "medium" : "low", "Taught but not practised enough: " + o.text, L + " · " + e.P.length + " practice activit" + (e.P.length === 1 ? "y" : "ies") + " found", "Add practice right after the teaching (at least " + (o.kind === "grammar" ? R.qa.thresholds.practice_items_grammar + " items, some typed" : R.qa.thresholds.practice_skill_activities + " activities") + ").", e.topics.slice(0, 3).map((t) => ({ h: "#" + t, t })), o);
      else if (e.a === false) add("not-assessed", o.id, o.kind === "dele" ? "high" : "low", "Practised but not assessed: " + o.text, L + " · no mock-exam evidence" + (e.notes.length ? " · " + e.notes.join(" ") : ""), o.comp === "pro" ? "Add a scored pronunciation check (for example, read-aloud items compared with the expected words and stress)." : "Add exam items or a task at " + L + " or above that directly targets this.", [{ h: "#examenes", t: "Mock exams" }], o);
      if (e.t && o.pre && o.pre.some((p) => oById[p] && !EV[p].t)) add("prereq", o.id, "high", "Missing prerequisite for: " + o.text, "Needs: " + o.pre.filter((p) => !EV[p].t).map((p) => oById[p].text).join("; "), "Teach the prerequisite first, at the same or an earlier level.", [lvlLink(o.lvl)], o);
      if (e.t && e.topics.length < 2 && o.kind === "grammar") add("weak-reinforcement", o.id, "low", "Weak reinforcement: " + o.text, "Appears in only one lesson or guide.", "Bring it back in a later lesson, guide, cheat sheet or review set.", e.topics.map((t) => ({ h: "#" + t, t })), o);
      if (e.late && e.late.length && !e.t) add("late", o.id, "medium", "Taught later than its PCIC level: " + o.text, "PCIC " + L + ", taught at " + e.late.join(", ").toUpperCase(), "Introduce it at " + L + " or confirm the PCIC level.", [], o);
    });
    Object.entries(R.sources).filter(([, s]) => s.superseded_by).forEach(([k, s]) => { const os = O.filter((o) => o.src === k); if (!os.length) return;
      G.push({ id: "source-superseded:" + k, rule: "source-superseded", sev: "high", title: "Source superseded: " + s.short + " (" + os.length + " outcomes)", detail: s.short + " → " + s.superseded_by.name + ". " + (s.superseded_by.note || "") + " Affected: " + os.map((o) => o.ref.split(",")[0]).join("; ") + ".", rec: "Re-map these outcomes against the current guide and update the mock exam where the tasks changed.", links: [{ h: s.superseded_by.url, t: "Current guide" }], oid: null, lvl: os[0].lvl, imp: 3, n: os.length, oids: os.map((o) => o.id) }); });
    // sources never checked or overdue
    Object.entries(R.sources).forEach(([k, s]) => { const due = s.checked ? (Date.now() - Date.parse(s.checked)) / 864e5 / 30.4 > (s.review_months || 12) : true;
      if (!s.checked) add("source-unchecked", k, "medium", "Source not yet checked line by line: " + s.short, (s.note || "") + " " + O.filter((o) => o.src === k).length + " outcomes depend on it.", "Open the source and compare each outcome; mark them validated in the register.", [{ h: s.url, t: s.short }]);
      else if (due) add("source-overdue", k, "medium", "Source review overdue: " + s.short, "Last checked " + s.checked + "; review every " + s.review_months + " months.", "Re-check the source for changes.", [{ h: s.url, t: s.short }]); });
    // topics: repeated findings are grouped (one finding per type, listing every topic affected)
    const grp = {}, gadd = (key, sev, title, detail, rec, T, extra) => { const g = grp[key] = grp[key] || { sev, title, detail, rec, topics: [], extra: [] }; g.topics.push(T); if (extra) g.extra.push(extra); if (sev === "high" || (sev === "medium" && g.sev === "low")) g.sev = sev; };
    inv.topics.forEach((T) => { const B = crBalance(inv, T.id), has = (t) => B.recs.some((r) => r.type === t);
      if (!B.recs.length) { add("no-practice", T.id, "high", "No practice: " + T.title, T.lvl.toUpperCase(), "Add practice items.", [{ h: T.link, t: T.title }]); return; }
      if (!has("tr") && !has("write") && !has("speak")) gadd("no-productive", "medium", "Topics with no free productive exercise", "Only gap-fill, correction and multiple choice: no translation, writing or speaking.", "Add 3+ items where the learner writes or says a full sentence.", T);
      if (B.mcShare > R.qa.thresholds.mc_share_max) gadd("mc-heavy", "medium", "Topics that rely on multiple choice", "More than " + Math.round(R.qa.thresholds.mc_share_max * 100) + "% of practice time is multiple choice.", "Replace some multiple choice with typed or spoken answers.", T, Math.round(B.mcShare * 100) + "%");
      if ((B.target.pro || 0) > 0 && !has("listen") && !has("speak") && !has("roleplay")) gadd("pron-no-audio", T.gid === "pronunciacion" ? "high" : "low", "Pronunciation targets with no audio activity in the topic", "The mapping plans pronunciation practice, but the topic has no listen-and-repeat or speaking activity.", "Add a listen-and-repeat or record-and-compare activity inside the topic.", T);
      if (!B.mapped) gadd("unmapped-topic", "medium", "Topics without their own skills mapping", "They use the default target and are not marked fully aligned until mapped.", "Add each topic to tools/curric/topics.json and set its targets in build_register.py, then rebuild.", T);
      B.rows.filter((r) => r.flag && r.target > 0).forEach((r) => gadd("imbalance:" + r.c, Math.abs(r.dev) >= 30 ? "medium" : "low", "Exercise mix off target: " + cname(r.c), (r.dev < 0 ? "Below" : "Above") + " the mapped target by " + R.qa.thresholds.deviation_flag + "+ points.", r.dev < 0 ? "Add " + cname(r.c).toLowerCase() + " practice to these topics (or link a matching activity)." : "Shift some of this practice to under-served skills.", T, r.actual + "% vs " + r.target + "%"));
    });
    Object.entries(grp).forEach(([key, g]) => { const rule = key.split(":")[0];
      add(rule, key, g.sev, g.title + " (" + g.topics.length + ")", g.detail + " " + g.topics.slice(0, 12).map((T, i) => T.lvl.toUpperCase() + " " + T.title + (g.extra[i] ? " (" + g.extra[i] + ")" : "")).join("; ") + (g.topics.length > 12 ? "; +" + (g.topics.length - 12) + " more" : "") + ".", g.rec, g.topics.slice(0, 8).map((T) => ({ h: T.link, t: T.lvl.toUpperCase() + " " + T.title }))); });
    // levels: interaction, writing, progression
    const C = R.comps.map((c) => c[0]), lvMin = {};
    CR_LV.forEach((lv) => { const B = crBalance(inv, lv); lvMin[lv] = {}; B.rows.forEach((r) => (lvMin[lv][r.c] = r.min));
      const n = (t) => B.recs.filter((r) => r.type === t).length;
      if (n("speak") && n("roleplay") < 3) add("no-interaction", lv, "medium", "Speaking without enough spoken interaction at " + lv.toUpperCase(), n("roleplay") + " role-plays.", "Add role-plays at this level.", [{ h: "#practicar", t: "Practice" }]);
      if (n("write") < 3) add("no-writing", lv, "medium", "Too little written production at " + lv.toUpperCase(), n("write") + " writing tasks.", "Add writing tasks at this level.", [{ h: "#escritura", t: "Writing" }]);
    });
    CR_LV.slice(1).forEach((lv, i) => { const prev = CR_LV[i]; C.forEach((c) => { const a = lvMin[prev][c], b = lvMin[lv][c]; if (a >= 30 && b < a * 0.7) add("progression", lv + ":" + c, "medium", "Practice drops from " + prev.toUpperCase() + " to " + lv.toUpperCase() + ": " + cname(c), Math.round(a) + " → " + Math.round(b) + " minutes of practice.", "Add " + cname(c).toLowerCase() + " practice at " + lv.toUpperCase() + " so the skill keeps growing.", [lvlLink(lv)]); }); });
    // invalid items and exam structure
    inv.bad.forEach((b, k) => add(b.crit ? "invalid-key" : "invalid-item", b.rec, b.crit ? "critical" : "medium", (b.crit ? "Invalid answer key: " : "Invalid exercise: ") + b.errs.join("; "), (inv.byId[b.rec].q || inv.byId[b.rec].title || "").toString().slice(0, 140), "Fix the item, then revalidate.", b.link ? [{ h: b.link, t: "Open" }] : []));
    Object.entries(DL).forEach(([lv, d]) => { if (!d.rows) return;
      d.rows.filter((r) => r.st !== "aligned").forEach((r) => add("exam-structure", r.t.id, r.st === "missing" ? "high" : "medium", "Mock exam differs from the official " + lv.toUpperCase() + " " + r.t.pname + " Tarea " + r.t.n, r.issues.join(" "), "Align the mock-exam task with the official format (" + r.t.format + (r.t.items ? ", " + r.t.items + " items" : r.t.length ? ", " + r.t.length : "") + ").", [{ h: "#examenes", t: "Mock exams" }]));
      (d.times || []).filter((t) => !t.ok).forEach((t) => add("exam-time", lv + ":" + t.pr, "medium", "Mock exam timing differs: " + lv.toUpperCase() + " " + t.pr, "Official " + t.off + " min, app " + (t.app == null ? "—" : t.app) + " min.", "Set the paper's time to the official value.", [{ h: "#examenes", t: "Mock exams" }]));
      (d.extra || []).forEach((x) => add("exam-extra", lv + ":" + x, "medium", "Mock exam has a task the official " + lv.toUpperCase() + " exam does not: " + x, "The official guide lists " + d.rows.filter((r) => r.t.prueba === x.split(" ")[0]).length + " tasks for this paper.", "Remove or merge the extra task, or label it as extra practice.", [{ h: "#examenes", t: "Mock exams" }]));
      if (!d.prepOk) add("exam-prep", lv, "low", "Oral preparation time differs at " + lv.toUpperCase(), "Official " + d.offPrep + " min, app " + d.appPrep + " min.", "Use the official preparation time.", [{ h: "#examenes", t: "Mock exams" }]);
    });
    const ord = { critical: 0, high: 1, medium: 2, low: 3 }; G.sort((a, b) => ord[a.sev] - ord[b.sev] || b.imp - a.imp);
    return G;
  }
  /* ---- 6. quality scorecard ---- */
  const CR_DIM = [["align", "Official curriculum alignment"], ["cover", "Learning outcome coverage"], ["variety", "Exercise variety"], ["balance", "Receptive/productive balance"], ["difficulty", "CEFR difficulty (proxy)"], ["accuracy", "Linguistic accuracy (automated checks)"],
    ["audio", "Pronunciation and listening support"], ["validity", "Assessment validity"], ["feedback", "Corrective feedback quality"], ["progress", "Skills progression"], ["retention", "Retention and reinforcement"], ["tech", "Technical reliability"]];
  function crScore(M, scope) {
    const R = crReg(), inv = M.inv, W = R.qa.weights, li = (l) => CR_LV.indexOf(l), d = {}, isLv = CR_LV.includes(scope), T = !isLv && scope !== "all" ? inv.topics.find((t) => t.id === scope) : null;
    const inS = (r) => (scope === "all" ? true : isLv ? r.lvl === scope : T ? r.topic === T.id : false);
    const recs = inv.recs.filter(inS), prac = recs.filter((r) => r.role === "practice"), items = prac.filter((r) => r.item), ass = recs.filter((r) => r.role === "assess");
    const outs = R.outcomes.filter((o) => (scope === "all" ? true : isLv ? o.lvl === scope : M.EV[o.id].topics.includes(scope)));
    const DLrows = Object.entries(M.DL).filter(([lv]) => scope === "all" || lv === scope).flatMap(([, x]) => x.rows || []);
    d.align = T ? null : DLrows.length ? crPct(DLrows.reduce((n, r) => n + (r.st === "aligned" ? 1 : r.st === "partial" ? .5 : 0), 0), DLrows.length) : null;
    const wsum = outs.reduce((n, o) => n + o.w, 0); d.cover = wsum ? Math.round((outs.reduce((n, o) => n + o.w * (M.EV[o.id].cov === "full" ? 1 : 0), 0) / wsum) * 100) : null;
    const types = new Set(prac.map((r) => r.type)), expT = T ? 7 : 10; d.variety = prac.length ? Math.min(100, crPct(types.size, expT)) : null;
    const B = crBalance(inv, T ? T.id : isLv ? scope : "all"); d.balance = prac.length ? Math.max(0, Math.round(100 - Math.abs(B.prodShare - 0.5) * 200)) : null;
    const band = { a1: [0, 10], a2: [3, 13], b1: [5, 17], b2: [7, 22], c1: [9, 28], c2: [10, 34] }, wl = (s) => String(s || "").split(/(?<=[.!?])\s+/).map((x) => x.split(/\s+/).filter(Boolean).length).filter(Boolean);
    const inBand = items.map((r) => { const L = wl(r.q), b = band[r.lvl] || [0, 40]; if (!L.length) return null; const m = L.reduce((a, c) => a + c, 0) / L.length; return m >= b[0] && m <= b[1]; }).filter((x) => x != null);
    d.difficulty = inBand.length ? crPct(inBand.filter(Boolean).length, inBand.length) : null;
    const mechAll = recs.filter((r) => r.role !== "teach"); d.accuracy = mechAll.length ? crPct(mechAll.filter((r) => !(r.mech || []).length).length, mechAll.length) : null;
    const hasLis = prac.some((r) => r.comp && r.comp.lis), hasPro = recs.some((r) => r.comp && r.comp.pro && r.role === "teach"), hasSpk = prac.some((r) => r.type === "speak" || r.type === "roleplay");
    d.audio = Math.round(([hasLis, hasPro, hasSpk].filter(Boolean).length / 3) * 100);
    const vItems = items.concat(ass), validN = vItems.filter((r) => !(r.err || []).length).length, hi = DLrows.filter((r) => r.st !== "aligned").length;
    d.validity = vItems.length ? Math.max(0, Math.round(crPct(validN, vItems.length) - (DLrows.length ? (hi / DLrows.length) * 40 : 0))) : null;
    d.feedback = items.length ? crPct(items.filter((r) => r.why).length, items.length) : null;
    if (T) d.progress = null; else { const C = R.comps.map((c) => c[0]); const L = isLv ? [CR_LV[Math.max(0, li(scope) - 1)], scope] : CR_LV; let ok = 0, n = 0;
      for (let i = 1; i < L.length; i++) { const a = crBalance(inv, L[i - 1]), b = crBalance(inv, L[i]); C.forEach((c) => { const x = a.rows.find((r) => r.c === c).min, y = b.rows.find((r) => r.c === c).min; if (x >= 30) { n++; if (y >= x * 0.7) ok++; } }); }
      d.progress = n ? crPct(ok, n) : null; }
    if (T) d.retention = Math.round(((T.secs.length >= 2 ? 1 : 0) + (T.kind === "guide" ? 1 : 0) + (outs.some((o) => M.EV[o.id].topics.length >= 2) ? 1 : 0)) / 3 * 100);
    else { const g = outs.filter((o) => M.EV[o.id].t); d.retention = g.length ? crPct(g.filter((o) => M.EV[o.id].topics.length >= 2 || M.EV[o.id].A.length).length, g.length) : null; }
    d.tech = recs.length ? crPct(recs.filter((r) => !(r.err || []).length).length, recs.length) : null;
    const crit = inv.bad.filter((b) => b.crit && inS(inv.byId[b.rec])), wk = Object.keys(d).filter((k) => d[k] != null), tw = wk.reduce((n, k) => n + W[k], 0);
    let total = tw ? Math.round(wk.reduce((n, k) => n + W[k] * d[k], 0) / tw) : null; const capped = crit.length > 0 && total != null && total > R.qa.critical_cap;
    if (capped) total = R.qa.critical_cap;
    return { d, total, capped, crit, weak: CR_DIM.filter(([k]) => d[k] != null && d[k] < 50).map(([k, n]) => n + " " + d[k]) };
  }
  /* ---- run everything (cached until revalidated) ---- */
  async function crModel(force) {
    if (CR.M && !force) return CR.M;
    const EX = await crExams(), t0 = performance.now(), inv = crInventory(EX), EV = crEvaluate(inv), DL = crDele(inv), G = crGaps(inv, EV, DL);
    CR.M = { inv, EV, DL, G, at: new Date().toISOString(), ms: Math.round(performance.now() - t0), build: (window.__BUILD || "") };
    const s = crStore(), live = new Set(G.map((g) => g.id)); let ch = 0; // revalidation: issues marked fixed are verified or reopened
    Object.entries(s.issues).forEach(([id, x]) => { if (x.st === "fixed") { x.st = live.has(id) ? "open" : "verified"; x.hist = (x.hist || []).concat([{ t: CR.M.at, who: "system", act: live.has(id) ? "revalidation failed: still detected" : "revalidation passed: no longer detected" }]); ch++; } });
    if (ch) { crPut(s); crLog("revalidate", "", ch + " issue(s) re-checked"); }
    return CR.M;
  }
  /* ---- helpers for views ---- */
  const crCN = (c) => (crReg().comps.find((x) => x[0] === c) || [, c])[1];
  const crSrc = (k) => (crReg().sources[k] || { short: k });
  function crFilterO(M) { const f = CR.f, q = crFold(f.q);
    return crReg().outcomes.filter((o) => { const e = M.EV[o.id], v = crStore().val[o.id], st = (v && v.st) || o.status;
      return (!f.lvl || o.lvl === f.lvl) && (!f.comp || o.comp === f.comp) && (!f.src || (f.src === "dele" ? /^dele/.test(o.src) : o.src === f.src)) && (!f.st || st === f.st) && (!f.cov || e.cov === f.cov) && (!f.topic || e.topics.includes(f.topic) || (f.topic.endsWith("-*") && e.topics.some((t) => t.startsWith(f.topic.slice(0, -1))))) && (!q || crFold(o.id + " " + o.text + " " + o.ref).includes(q)); }); }
  const crStat = (o) => { const v = crStore().val[o.id]; return (v && v.st) || o.status; };
  const CR_ST = { "source-checked": "Source checked", pending: "Pending validation", validated: "Validated", "needs-update": "Needs update", "needs-reassessment": "Needs reassessment", rejected: "Rejected" };
  const CR_COV = { full: "Fully covered", partial: "Partially covered", missing: "Missing", na: "Not applicable" };
  function crSel(name, val, opts, label) { return '<label class="cr-f"><span>' + label + '</span><select data-crf="' + name + '">' + opts.map(([v, t]) => '<option value="' + esc(v) + '"' + (v === val ? " selected" : "") + ">" + esc(t) + "</option>").join("") + "</select></label>"; }
  function crFilters(M, which) { const f = CR.f, R = crReg();
    const all = { lvl: crSel("lvl", f.lvl, [["", "All levels"]].concat(CR_LV.map((l) => [l, l.toUpperCase()])), "Level"),
      topic: crSel("topic", f.topic, [["", "All chapters/topics"]].concat(CR_LV.map((l) => [l + "-*", l.toUpperCase() + " lessons"])).concat(M.inv.topics.map((t) => [t.id, t.lvl.toUpperCase() + " · " + (t.kind === "guide" ? "Guide: " : "") + t.title])), "Chapter/topic"),
      comp: crSel("comp", f.comp, [["", "All competencies"]].concat(R.comps.map((c) => [c[0], c[1]])), "Competency"),
      src: crSel("src", f.src, [["", "All sources"], ["cefr", "CEFR CV 2020"], ["pcic", "PCIC"], ["dele", "DELE guides"]], "Official source"),
      cov: crSel("cov", f.cov, [["", "Any coverage"], ["full", "Fully covered"], ["partial", "Partially covered"], ["missing", "Missing"]], "Coverage status"),
      st: crSel("st", f.st, [["", "Any validation status"]].concat(Object.entries(CR_ST)), "Validation") };
    return '<div class="cr-filters">' + (which || Object.keys(all)).map((k) => all[k]).join("") + (which && which.includes("q") ? "" : "") + "</div>"; }
  function crSummaryRow(list, M, label) { const n = list.length, app = list.filter((o) => M.EV[o.id].a !== null);
    const t = list.filter((o) => M.EV[o.id].t).length, p = list.filter((o) => M.EV[o.id].p).length, a = app.filter((o) => M.EV[o.id].a).length, all = list.filter((o) => M.EV[o.id].cov === "full").length;
    return { label, n, t: crPct(t, n), p: crPct(p, n), a: crPct(a, app.length), ind: app.filter((o) => M.EV[o.id].a && M.EV[o.id].ind).length, all: crPct(all, n), pend: list.filter((o) => /pending|reassess/.test(crStat(o))).length }; }
  const crBar = (v) => '<span class="cr-bar"><i style="width:' + (v || 0) + '%"></i></span>';
  /* ---- views ---- */
  const CR_TABS = [["overview", "Overview"], ["heatmap", "Heatmap"], ["register", "Traceability"], ["balance", "Exercise mix"], ["gaps", "Gaps"], ["dele", "DELE alignment"], ["score", "Scorecard"], ["actions", "Remediation"], ["reports", "Reports"]];
  async function curricView(sub) {
    const R = crReg(); if (sub && CR_TABS.some((t) => t[0] === sub)) CR.tab = sub;
    const head = '<p class="crumbs"><a href="#ajustes">Settings</a><span aria-hidden="true">›</span><span>Curriculum coverage</span></p>' + uiTitle("Curriculum coverage", "Is the course teaching, practising and assessing what the DELE and the CEFR ask for?", "", "Admin");
    if (!R) { app.innerHTML = '<div class="ui-page cr">' + head + '<p class="callout">The curriculum register isn\'t in this build.</p></div>'; return; }
    if (!crAdmin()) { app.innerHTML = '<div class="ui-page cr">' + head + '<p>This page is for course administrators.</p><form class="cr-login" data-crform="login"><label>Admin passcode <input type="password" name="code" autocomplete="current-password" required></label><label>Your name (for the audit trail) <input name="who" autocomplete="name" required></label><button class="btn primary">Unlock</button><p class="muted small" id="cr-lmsg"></p></form><p class="muted small">There is no server: the passcode keeps this tool out of learners\' way on this device. It is not a security boundary, and the curriculum data it shows is part of the public app.</p></div>'; return; }
    app.innerHTML = '<div class="ui-page cr">' + head + '<p class="muted small">Working it out from the app\'s content…</p></div>';
    const M = await crModel(); if (!/^#cobertura/.test(location.hash)) return;
    const tabs = '<nav class="cr-tabs" role="tablist">' + CR_TABS.map(([k, n]) => '<a role="tab" href="#cobertura/' + k + '" aria-selected="' + (k === CR.tab) + '">' + n + "</a>").join("") + "</nav>";
    const meta = '<p class="muted small cr-meta">Computed ' + new Date(M.at).toLocaleString() + " from " + M.inv.recs.length.toLocaleString() + " content records (" + M.inv.topics.length + " lessons and guides, " + Object.keys(M.inv.papers).length + " exam levels) in " + M.ms + " ms · build " + esc(M.build) + ' · <button class="linkbtn" data-act="cr-reval">Revalidate now</button> · signed in as ' + esc(crStore().who || "admin") + ' · <button class="linkbtn" data-act="cr-out">Sign out</button></p>';
    const V = { overview: crOverview, heatmap: crHeat, register: crRegister, balance: crBal, gaps: crGapView, dele: crDeleView, score: crScoreView, actions: crActions, reports: crReports }[CR.tab] || crOverview;
    app.innerHTML = '<div class="ui-page cr">' + head + meta + tabs + '<div class="cr-body">' + V(M) + "</div></div>";
  }
  function crOverview(M) { const R = crReg(), list = crFilterO(M);
    const rows = CR_LV.map((lv) => crSummaryRow(list.filter((o) => o.lvl === lv), M, lv.toUpperCase())).concat([crSummaryRow(list, M, "All")]);
    const crit = M.G.filter((g) => g.sev === "critical").length, high = M.G.filter((g) => g.sev === "high").length;
    const q4 = (() => { const DLr = Object.values(M.DL).flatMap((d) => d.rows || []), al = DLr.filter((r) => r.st === "aligned").length;
      const B = CR_LV.map((lv) => crBalance(M.inv, lv)), prodOk = B.filter((b) => b.prodShare >= 0.35).length;
      return [["Are we teaching the right competencies?", rows[6].t + "% of the " + rows[6].n + " official outcomes in view are taught; " + M.G.filter((g) => g.rule === "not-taught").length + " are not."],
        ["Are learners getting the right types and amounts of practice?", rows[6].p + "% practised to the criteria; " + prodOk + " of 6 levels give productive skills at least 35% of practice time; " + M.G.filter((g) => g.rule === "imbalance" || g.rule === "mc-heavy").length + " imbalance flags."],
        ["Are we assessing in ways that show real ability?", rows[6].a + "% assessed; " + al + " of " + DLr.length + " official DELE tasks are matched exactly by a mock-exam task; " + M.inv.bad.filter((b) => b.crit).length + " invalid answer keys."],
        ["Where are the gaps?", M.G.length + " findings: " + crit + " critical, " + high + " high. See Gaps and Remediation."]]; })();
    return '<section><h2>The four questions</h2><dl class="cr-q4">' + q4.map(([q, a]) => "<dt>" + q + "</dt><dd>" + esc(a) + "</dd>").join("") + "</dl></section>" +
      '<section><h2>Coverage by level</h2>' + crFilters(M, ["lvl", "topic", "comp", "src", "cov", "st"]) +
      '<div class="cr-scroll"><table class="cr-tbl"><thead><tr><th>Level</th><th>Outcomes</th><th>Taught</th><th>Practised</th><th>Assessed</th><th>All three</th><th>Pending validation</th></tr></thead><tbody>' +
      rows.map((r) => "<tr" + (r.label === "All" ? ' class="cr-tot"' : "") + "><td>" + r.label + "</td><td>" + r.n + "</td>" + ["t", "p", "a", "all"].map((k) => "<td>" + crP(r[k]) + (k === "a" && r.ind ? ' <span class="muted small">(' + r.ind + " indirect)</span>" : "") + crBar(r[k]) + "</td>").join("") + "<td>" + r.pend + "</td></tr>").join("") + "</tbody></table></div>" +
      '<p class="muted small">Coverage % = outcomes whose evidence meets the criteria ÷ applicable outcomes in view × 100. Assessed leaves out outcomes where assessment does not apply (mediation below C1); "indirect" means a grammar point is only scored inside the accuracy criterion of writing and speaking tasks, as the DELE itself does at A1–A2, not by an item that targets it. Each dimension is counted separately; "All three" needs taught, practised and assessed. This is <b>curriculum coverage, not learner mastery</b>: a valid assessment existing does not mean anyone has passed it.</p></section>' +
      '<section><h2>Biggest issues</h2>' + crGapList(M.G.slice(0, 8), true) + '<p><a href="#cobertura/gaps">All ' + M.G.length + " findings ›</a></p></section>";
  }
  function crCell(M, comp, lv) { const R = crReg(), os = R.outcomes.filter((o) => o.comp === comp && o.lvl === lv);
    if (!os.length) return { st: "na", os, v: null, pend: false };
    const app = os.filter((o) => !(M.EV[o.id].na && !M.EV[o.id].t && !M.EV[o.id].p)), sc = app.length ? app.reduce((n, o) => n + M.EV[o.id].score, 0) / app.length : null;
    const st = sc == null ? "na" : app.every((o) => M.EV[o.id].cov === "full") ? "full" : app.every((o) => M.EV[o.id].cov === "missing") ? "missing" : "partial";
    return { st, os, v: sc == null ? null : Math.round(sc * 100), pend: os.some((o) => /pending|reassess/.test(crStat(o))) }; }
  const CR_SHORT = { lis: "Listening", rea: "Reading", wex: "Writing: expression", wint: "Writing: interaction", oex: "Speaking: expression", oint: "Speaking: interaction", pro: "Pronunciation", gra: "Grammar", voc: "Vocabulary", pra: "Pragmatic", dis: "Discourse", med: "Mediation" };
  function crHeat(M) { const R = crReg();
    const grid = '<div class="cr-scroll"><table class="cr-heat"><thead><tr><th>Competency</th>' + CR_LV.map((l) => "<th>" + l.toUpperCase() + "</th>").join("") + "</tr></thead><tbody>" +
      R.comps.map(([c, n]) => '<tr><th scope="row" title="' + esc(n) + '">' + esc(CR_SHORT[c] || n) + "</th>" + CR_LV.map((lv) => { const x = crCell(M, c, lv);
        return '<td><button class="cr-hc cr-' + x.st + (x.pend ? " cr-pend" : "") + '" data-act="cr-cell" data-c="' + c + '" data-l="' + lv + '" aria-pressed="' + (CR.sel === c + "|" + lv) + '" aria-label="' + esc(n + " " + lv.toUpperCase() + ": " + (CR_COV[x.st] || "") + (x.pend ? ", pending validation" : "")) + '">' + (x.v == null ? "n/a" : x.v + "%") + "</button></td>"; }).join("") + "</tr>").join("") + "</tbody></table></div>";
    const leg = '<p class="cr-leg small"><span class="cr-hc cr-full">Fully covered</span><span class="cr-hc cr-partial">Partially covered</span><span class="cr-hc cr-missing">Missing</span><span class="cr-hc cr-na">Not applicable</span><span class="cr-hc cr-partial cr-pend">Pending validation (hatched)</span></p>';
    let det = "";
    if (CR.sel) { const [c, lv] = CR.sel.split("|"), x = crCell(M, c, lv);
      det = '<section class="cr-det"><h2>' + esc(crCN(c)) + " · " + lv.toUpperCase() + "</h2>" + (x.os.length ? x.os.map((o) => crOutcomeCard(M, o)).join("") : '<p class="muted">No outcomes are mapped to this cell.</p>') + "</section>"; }
    return "<p>Each cell is the average share of taught/practised/assessed met by the outcomes in it. Select a cell to see the outcomes, lessons, exercises and exam evidence.</p>" + leg + grid + det;
  }
  function crEvList(M, ids, max) { const inv = M.inv, by = {}; ids.forEach((id) => { const r = inv.byId[id], k = r.topic || r.link + "|" + r.type; (by[k] = by[k] || []).push(r); });
    const ent = Object.entries(by); if (!ent.length) return '<span class="muted">none</span>';
    return ent.slice(0, max || 6).map(([k, rs]) => { const r = rs[0], T = r.topic ? inv.topics.find((t) => t.id === r.topic) : null;
      const label = T ? T.lvl.toUpperCase() + " · " + T.title : (r.type === "exam-q" || r.type === "exam-write" || r.type === "exam-oral") ? r.lvl.toUpperCase() + " mock exam · " + r.prueba + " T" + r.n + " (" + rs.length + " version" + (rs.length > 1 ? "s" : "") + ")" : r.lvl.toUpperCase() + " · " + r.type + (rs.length > 1 ? " × " + rs.length : "") + (r.title ? ": " + String(r.title).slice(0, 50) : "");
      return '<a class="cr-ev" href="' + esc(r.link) + '">' + esc(label) + (T ? ' <span class="muted">(' + rs.length + ")</span>" : "") + "</a>"; }).join("") + (ent.length > (max || 6) ? '<span class="muted small"> +' + (ent.length - (max || 6)) + " more</span>" : ""); }
  function crOutcomeCard(M, o, open) { const e = M.EV[o.id], s = crSrc(o.src), st = crStat(o), v = crStore().val[o.id];
    const dot = (b, l) => '<span class="cr-dim ' + (b === null ? "na" : b ? "ok" : "no") + '">' + (b === null ? "–" : b ? "✓" : "✗") + " " + l + "</span>";
    return '<details class="cr-oc"' + (open ? " open" : "") + '><summary><span class="cr-cov cr-' + e.cov + '">' + CR_COV[e.cov] + "</span> <b>" + o.lvl.toUpperCase() + "</b> " + esc(o.text) + ' <span class="muted small">' + esc(o.id) + "</span></summary>" +
      '<div class="cr-ocb"><p class="small">' + dot(e.t, "Taught") + dot(e.p, "Practised") + dot(e.a, "Assessed" + (e.ind ? " (indirect)" : "")) + ' <span class="cr-vst cr-v-' + st + '">' + (CR_ST[st] || st) + "</span></p>" +
      '<dl class="cr-dl"><dt>Official source</dt><dd><a href="' + esc(s.url || "#") + '" target="_blank" rel="noopener">' + esc(s.short) + "</a> · " + esc(o.ref) + (s.superseded_by ? ' <b class="cr-warn">superseded</b>' : "") + "</dd>" +
      "<dt>Competency · weight</dt><dd>" + esc(crCN(o.comp)) + " · " + o.w + " of 3</dd><dt>Chain</dt><dd class=\"small\">Outcome → Topic (" + e.topics.length + ") → Lesson/guide → Exercise (" + e.P.length + ") → Assessment (" + (e.a === null ? "n/a" : e.A.length) + ") → Evidence: " + CR_COV[e.cov] + "</dd>" +
      "<dt>Teaching</dt><dd>" + crEvList(M, e.T) + "</dd><dt>Practice</dt><dd>" + crEvList(M, e.P) + "</dd><dt>Assessment</dt><dd>" + (e.a === null ? '<span class="muted">not applicable</span>' : crEvList(M, e.A)) + "</dd>" +
      "<dt>Mastery criteria</dt><dd class=\"small\">" + esc(o.mastery) + "</dd>" + (o.pre && o.pre.length ? "<dt>Prerequisites</dt><dd class=\"small\">" + o.pre.map((p) => esc(p) + (M.EV[p] && M.EV[p].t ? " ✓" : " ✗")).join(", ") + "</dd>" : "") +
      (e.notes.length ? "<dt>Notes</dt><dd class=\"small\">" + esc(e.notes.join(" ")) + "</dd>" : "") +
      "<dt>Last review</dt><dd class=\"small\">" + esc((v && v.t ? v.t.slice(0, 10) + " by " + v.who : o.rev) || "never") + "</dd></dl>" +
      '<div class="row cr-acts"><button class="btn small" data-act="cr-val" data-id="' + esc(o.id) + '" data-v="validated">Mark validated</button><button class="btn small" data-act="cr-val" data-id="' + esc(o.id) + '" data-v="needs-update">Needs update</button>' + (e.topics[0] ? '<a class="btn small" href="#' + esc(e.topics[0]) + '">Open topic</a>' : "") + "</div></div></details>"; }
  function crRegister(M) { const list = crFilterO(M);
    return "<p>Every official outcome with its source, the content that teaches, practises and assesses it, and its validation status. A row with no supporting content is a curriculum gap.</p>" + crFilters(M) +
      '<label class="cr-f cr-q"><span>Search</span><input type="search" data-crf="q" value="' + esc(CR.f.q) + '" placeholder="e.g. subjuntivo, B1 Tarea 4, listening"></label>' +
      '<p class="small"><b>' + list.length + "</b> outcomes · " + list.filter((o) => M.EV[o.id].cov === "missing").length + " gaps · " + list.filter((o) => /pending|reassess/.test(crStat(o))).length + ' pending validation · <button class="linkbtn" data-act="cr-csv" data-what="register">Download CSV</button></p>' +
      list.slice(0, 120).map((o) => crOutcomeCard(M, o)).join("") + (list.length > 120 ? '<p class="muted small">Showing 120 of ' + list.length + "; narrow the filters or download the CSV.</p>" : ""); }
  function crBal(M) { const scope = CR.scope && CR.scope !== "all" ? CR.scope : "a1", B = crBalance(M.inv, scope), R = crReg();
    const opts = CR_LV.map((l) => [l, l.toUpperCase() + " (whole level)"]).concat(M.inv.topics.map((t) => [t.id, t.lvl.toUpperCase() + " · " + (t.kind === "guide" ? "Guide: " : "Lesson: ") + t.title]));
    const assessed = (c) => { const os = R.outcomes.filter((o) => o.comp === c && (CR_LV.includes(scope) ? o.lvl === scope : M.EV[o.id].topics.includes(scope))), ap = os.filter((o) => M.EV[o.id].a !== null); return ap.length ? crPct(ap.filter((o) => M.EV[o.id].a).length, ap.length) + "%" : "—"; };
    const recs = B.rows.filter((r) => r.flag && r.target > 0).map((r) => r.dev < 0 ? "Add " + crCN(r.c).toLowerCase() + " practice (" + r.actual + "% vs " + r.target + "% target)." : "Rebalance: " + crCN(r.c).toLowerCase() + " takes " + r.actual + "% vs " + r.target + "%.");
    if (B.mcShare > R.qa.thresholds.mc_share_max) recs.unshift("Multiple choice is " + Math.round(B.mcShare * 100) + "% of practice time: replace some with typed or spoken answers.");
    return '<p>Target weights (Master Topic-to-Skills Mapping) against what the exercises actually ask for. Each activity is weighted by the minutes it takes, so one multiple-choice item (~' + R.effort.mc + " min) never counts like a speaking task (~" + R.effort.speak + " min) or a writing task (~" + R.effort.write + " min).</p>" +
      '<label class="cr-f"><span>Scope</span><select data-crscope="1">' + opts.map(([v, t]) => '<option value="' + esc(v) + '"' + (v === scope ? " selected" : "") + ">" + esc(t) + "</option>").join("") + "</select></label>" +
      (B.T && !B.mapped ? '<p class="callout small">This topic uses the default target for a ' + B.T.kind + ' and is not marked fully aligned until it has its own mapping.</p>' : "") +
      '<div class="cr-scroll"><table class="cr-tbl"><thead><tr><th>Competency</th><th>Target</th><th>Actual (time)</th><th>Deviation</th><th>Activities</th><th>Est. minutes</th><th>Assessed</th></tr></thead><tbody>' +
      B.rows.filter((r) => r.target || r.actual).map((r) => '<tr class="' + (r.flag ? "cr-flag" : "") + '"><td>' + esc(crCN(r.c)) + "</td><td>" + r.target + "%</td><td>" + r.actual + "%" + crBar(r.actual) + "</td><td>" + (r.dev > 0 ? "+" : "") + r.dev + (r.flag ? " ⚠" : "") + "</td><td>" + r.n + "</td><td>" + r.min + "</td><td>" + assessed(r.c) + "</td></tr>").join("") + "</tbody></table></div>" +
      '<p class="small">' + B.recs.length + " activities · about " + B.tot + " minutes · productive skills " + Math.round(B.prodShare * 100) + "% of time · multiple choice " + Math.round(B.mcShare * 100) + "%. Activity types: " + Object.entries(B.types).map(([t, m]) => t + " " + Math.round(m) + " min").join(", ") + ".</p>" +
      "<h2>Recommended actions</h2>" + (recs.length ? "<ul>" + recs.map((x) => "<li>" + esc(x) + "</li>").join("") + "</ul>" : '<p class="muted">No material imbalance (all within ±' + R.qa.thresholds.deviation_flag + " points).</p>"); }
  const CR_SEV = { critical: "Critical", high: "High", medium: "Medium", low: "Low" };
  function crGapList(G, compact) { const s = crStore();
    if (!G.length) return '<p class="muted">Nothing found.</p>';
    return '<ul class="cr-gaps">' + G.map((g) => { const x = s.issues[g.id];
      return '<li class="cr-g cr-s-' + g.sev + '"><div><span class="cr-sev">' + CR_SEV[g.sev] + "</span> <b>" + esc(g.title) + "</b>" + (x ? ' <span class="cr-ist">' + esc(x.st) + "</span>" : "") + "</div>" + (compact ? "" : '<p class="small">' + esc(g.detail) + '</p><p class="small"><b>Do:</b> ' + esc(g.rec) + "</p>") +
        '<div class="row small">' + g.links.map((l) => '<a href="' + esc(l.h) + '"' + (/^https?:/.test(l.h) ? ' target="_blank" rel="noopener"' : "") + ">" + esc(l.t) + "</a>").join(" · ") + (compact ? "" : ' <button class="linkbtn" data-act="cr-iss" data-id="' + esc(g.id) + '" data-v="review">Mark for review</button>') + "</div></li>"; }).join("") + "</ul>"; }
  function crGapView(M) { const sev = CR.f.sev || "", rule = CR.f.rule || "", G = M.G.filter((g) => (!sev || g.sev === sev) && (!rule || g.rule === rule) && (!CR.f.lvl || !g.lvl || g.lvl === CR.f.lvl));
    const rules = [...new Set(M.G.map((g) => g.rule))], cnt = (k) => M.G.filter((g) => g.sev === k).length;
    return '<p>Found automatically from the content each time the page opens. Sorted by severity, then by how important the outcome is (its weight).</p><p class="small">' + Object.keys(CR_SEV).map((k) => '<span class="cr-sev cr-s-' + k + '">' + CR_SEV[k] + " " + cnt(k) + "</span>").join(" ") + "</p>" +
      '<div class="cr-filters">' + crSel("sev", sev, [["", "Any severity"]].concat(Object.entries(CR_SEV)), "Severity") + crSel("rule", rule, [["", "Any type"]].concat(rules.map((r) => [r, r.replace(/-/g, " ")])), "Finding type") + crSel("lvl", CR.f.lvl, [["", "All levels"]].concat(CR_LV.map((l) => [l, l.toUpperCase()])), "Level") + "</div>" +
      '<p class="small">' + G.length + ' findings · <button class="linkbtn" data-act="cr-csv" data-what="gaps">Download CSV</button></p>' + crGapList(G.slice(0, 150)) + (G.length > 150 ? '<p class="muted small">Showing 150 of ' + G.length + ".</p>" : ""); }
  function crDeleView(M) { const lv = CR_LV.includes(CR.f.lvl) ? CR.f.lvl : "b1", d = M.DL[lv], R = crReg(), src = R.sources["dele-" + lv];
    let ready = ""; try { const P = (M.inv.papers[lv] || { exams: [] }).exams.map((_, i) => exTotals(lv, i + 1)), done = P.filter((x) => x.done).length, pass = P.filter((x) => x.pass).length; ready = '<p class="small">On this device: ' + done + " of " + P.length + " mock papers started, " + pass + " passed on the app's internal marking.</p>"; } catch (e) { ready = ""; }
    if (!d || d.missing) return '<p class="callout">No exam data for ' + lv.toUpperCase() + ".</p>";
    const st = { aligned: "Aligned", partial: "Partly aligned", missing: "No matching task" };
    return '<p>The app\'s mock papers and practice against the official DELE task families. Three different questions:</p><ul class="small"><li><b>Curriculum alignment</b>: are the competencies taught? (Traceability, Heatmap)</li><li><b>Assessment alignment</b>: do the mock tasks match the official tasks and criteria? (this page)</li><li><b>Learner readiness</b>: does a given learner perform well on these tasks? This stays on each learner\'s device; the app has no server, so it is shown only for this device and is an internal estimate, not a DELE score or a prediction of a result.</li></ul>' +
      '<div class="cr-filters">' + crSel("lvl", lv, CR_LV.map((l) => [l, "DELE " + l.toUpperCase()]), "Level") + "</div>" +
      '<p class="small">Source: <a href="' + esc(src.url) + '" target="_blank" rel="noopener">' + esc(src.name) + "</a> (checked " + esc(src.checked || "never") + ")." + (src.superseded_by ? ' <b class="cr-warn">Superseded:</b> ' + esc(src.superseded_by.note) + ' <a href="' + esc(src.superseded_by.url) + '" target="_blank" rel="noopener">2024 guide</a>.' : "") + "</p>" +
      '<div class="cr-scroll"><table class="cr-tbl"><thead><tr><th>Paper</th><th>Official time</th><th>App</th></tr></thead><tbody>' + d.times.map((t) => "<tr" + (t.ok ? "" : ' class="cr-flag"') + "><td>" + esc(R.tasks.find((x) => x.prueba === t.pr) ? R.tasks.find((x) => x.prueba === t.pr).pname : t.pr) + "</td><td>" + t.off + " min</td><td>" + (t.app == null ? "—" : t.app + " min") + (t.ok ? "" : " ⚠") + "</td></tr>").join("") +
      (d.offPrep != null ? "<tr" + (d.prepOk ? "" : ' class="cr-flag"') + "><td>Oral preparation</td><td>" + d.offPrep + " min</td><td>" + (d.appPrep == null ? "—" : d.appPrep + " min") + "</td></tr>" : "") + "</tbody></table></div>" +
      '<div class="cr-scroll"><table class="cr-tbl cr-dele"><thead><tr><th>Task</th><th>Skill area and task family</th><th>Response</th><th>Criteria</th><th>App mock exams</th><th>Practice at level</th><th>Status</th></tr></thead><tbody>' +
      d.rows.map((r) => '<tr class="cr-' + r.st + '"><td>' + esc(r.t.pname) + " T" + r.t.n + '</td><td><b>' + esc(r.t.focus) + '</b><br><span class="small">' + esc(r.t.format) + "</span></td><td>" + esc(r.t.items ? r.t.items + " items" : r.t.length || "") + '</td><td class="small">' + esc(r.t.criteria) + "</td><td>" + (r.found ? "in " + r.papers + " paper" + (r.papers > 1 ? "s" : "") : "—") + (r.issues.length ? '<br><span class="small cr-warn">' + esc(r.issues.join(" ")) + "</span>" : "") + "</td><td>" + r.practice + (r.practice < 3 ? " ⚠" : "") + "</td><td>" + st[r.st] + "</td></tr>").join("") + "</tbody></table></div>" +
      (d.extra.length ? '<p class="small cr-warn">Mock tasks with no official counterpart: ' + esc(d.extra.join(", ")) + ".</p>" : "") +
      "<h2>Needs more practice</h2><ul class=\"small\">" + (d.rows.filter((r) => r.practice < 3 || r.st !== "aligned").map((r) => "<li>" + esc(r.t.pname + " T" + r.t.n + ": " + r.t.focus) + (r.practice < 3 ? " — only " + r.practice + " practice activities at this level" : "") + (r.st !== "aligned" ? " — mock task " + st[r.st].toLowerCase() : "") + "</li>").join("") || "<li>Nothing flagged.</li>") + "</ul>" +
      "<h2>Learner readiness (this device only)</h2>" + (ready || '<p class="muted small">No mock papers on this device.</p>') + '<p class="muted small">Internal estimate only. It is not an official DELE score or certification prediction.</p>'; }
  function crScoreView(M) { const R = crReg(), sc = CR.scope || "all", S = crScore(M, sc);
    const opts = [["all", "Whole curriculum"]].concat(CR_LV.map((l) => [l, l.toUpperCase() + " level"])).concat(M.inv.topics.map((t) => [t.id, t.lvl.toUpperCase() + " · " + (t.kind === "guide" ? "Guide: " : "Lesson: ") + t.title]));
    const lvRows = CR_LV.map((l) => [l.toUpperCase(), crScore(M, l)]);
    return '<p>A transparent score per dimension (0–100). The total is the weighted mean of the dimensions that can be measured for the scope. <b>Any critical issue (such as an invalid answer key) caps the total at ' + R.qa.critical_cap + "</b>, and every dimension under 50 is listed, so a high average cannot hide a serious problem.</p>" +
      '<label class="cr-f"><span>Scope</span><select data-crscope="1">' + opts.map(([v, t]) => '<option value="' + esc(v) + '"' + (v === sc ? " selected" : "") + ">" + esc(t) + "</option>").join("") + "</select></label>" +
      '<div class="cr-total"><span class="cr-big">' + (S.total == null ? "—" : S.total) + '</span><span class="small">' + (S.capped ? '<b class="cr-warn">Capped: ' + S.crit.length + " critical issue(s)</b><br>" : "") + (S.weak.length ? "Weak: " + esc(S.weak.join(", ")) : "No dimension under 50") + "</span></div>" +
      '<div class="cr-scroll"><table class="cr-tbl"><thead><tr><th>Dimension</th><th>Score</th><th>Weight</th><th>How it is measured</th></tr></thead><tbody>' +
      CR_DIM.map(([k, n]) => "<tr" + (S.d[k] != null && S.d[k] < 50 ? ' class="cr-flag"' : "") + "><td>" + n + "</td><td>" + (S.d[k] == null ? '<span class="muted">n/a</span>' : S.d[k] + crBar(S.d[k])) + "</td><td>" + R.qa.weights[k] + '</td><td class="small">' + esc(CR_FORM[k]) + "</td></tr>").join("") + "</tbody></table></div>" +
      "<h2>By level</h2><div class=\"cr-scroll\"><table class=\"cr-tbl\"><thead><tr><th>Level</th><th>Total</th>" + CR_DIM.map(([k, n]) => '<th title="' + esc(n) + '">' + k + "</th>").join("") + "</tr></thead><tbody>" +
      lvRows.map(([l, s]) => "<tr><td>" + l + "</td><td><b>" + (s.total == null ? "—" : s.total) + (s.capped ? "*" : "") + "</b></td>" + CR_DIM.map(([k]) => "<td" + (s.d[k] != null && s.d[k] < 50 ? ' class="cr-lo"' : "") + ">" + (s.d[k] == null ? "–" : s.d[k]) + "</td>").join("") + "</tr>").join("") + "</tbody></table></div><p class=\"muted small\">* capped by a critical issue. Linguistic accuracy here is automated checks only (punctuation pairs, doubled words); it has not been verified by a human reviewer unless an outcome or topic is marked validated.</p>"; }
  const CR_FORM = { align: "Share of official DELE tasks matched by a mock-exam task (aligned = 1, partly = ½).", cover: "Share of outcomes (weighted 1–3) taught, practised and assessed to the criteria.", variety: "Distinct activity types ÷ 7 for a topic, 10 for a level or the whole course.",
    balance: "100 − 2 × distance (in points) between the productive share of practice time and 50%.", difficulty: "Proxy: share of exercise prompts whose average sentence length sits in the level's band (A1 ≤10 words … C2 10–34).", accuracy: "Share of texts passing automated checks (¿/? and ¡/! pairs, doubled words). Not a substitute for review.",
    audio: "Has listening practice + pronunciation teaching + speaking practice (each ⅓).", validity: "Share of exercise and exam items with a valid key and structure, minus up to 40 for mock tasks that differ from the official format.", feedback: "Share of exercise items with an explanation of 20+ characters.",
    progress: "Share of competencies whose practice time does not drop more than 30% from one level to the next.", retention: "Share of taught outcomes met in 2+ places (another lesson, guide or the exams).", tech: "Share of records that pass data validation." };
  function crActions(M) { const s = crStore(), ids = Object.keys(s.issues), G = {}; M.G.forEach((g) => (G[g.id] = g));
    const ST = [["review", "Marked for review"], ["progress", "In progress"], ["fixed", "Fixed – awaiting revalidation"], ["open", "Reopened"], ["verified", "Verified"], ["approved", "Approved and closed"], ["wontfix", "Won't fix"]];
    const rows = ids.map((id) => [id, s.issues[id]]).sort((a, b) => String(b[1].t).localeCompare(String(a[1].t)));
    const prog = ST.map(([k, n]) => n + " " + rows.filter(([, x]) => x.st === k).length).join(" · ");
    return "<p>Track each finding from review to approval. Marking an issue <b>fixed</b> does not close it: the next revalidation re-runs every check and either verifies it (no longer detected) or reopens it. Content changes are made in the source files and released as a new build; nothing is published automatically from here.</p>" +
      '<p class="small">' + prog + "</p>" + (rows.length ? '<ul class="cr-gaps">' + rows.map(([id, x]) => { const g = G[id];
        return '<li class="cr-g' + (g ? " cr-s-" + g.sev : "") + '"><div><b>' + esc(g ? g.title : id) + '</b> <span class="cr-ist">' + esc((ST.find((y) => y[0] === x.st) || [, x.st])[1]) + "</span>" + (!g && x.st !== "approved" ? ' <span class="small muted">(no longer detected)</span>' : "") + "</div>" + (g ? '<p class="small">' + esc(g.rec) + "</p>" : "") +
          '<div class="row small">' + ST.filter(([k]) => k !== x.st && k !== "open" && (k !== "approved" || x.st === "verified")).map(([k, n]) => '<button class="btn small" data-act="cr-iss" data-id="' + esc(id) + '" data-v="' + k + '">' + n + "</button>").join("") + '<button class="btn small" data-act="cr-brief" data-id="' + esc(id) + '">Draft fix brief</button><button class="btn small" data-act="cr-profe" data-id="' + esc(id) + '">Request Profe enhancement</button></div>' +
          '<details class="small"><summary>History (' + (x.hist || []).length + ")</summary><ul>" + (x.hist || []).map((h) => "<li>" + esc(h.t.slice(0, 16).replace("T", " ") + " · " + h.who + " · " + h.act) + "</li>").join("") + "</ul></details></li>"; }).join("") + "</ul>" : '<p class="muted">No issues tracked yet. Use "Mark for review" on the Gaps tab.</p>') +
      (s.req.length ? "<h2>Profe enhancement requests</h2><ul class=\"small\">" + s.req.map((r) => "<li>" + esc(r.t.slice(0, 10) + " · " + r.title) + "</li>").join("") + "</ul>" : "") +
      '<h2>Audit trail</h2><p class="small">' + s.log.length + ' entries on this device · <button class="linkbtn" data-act="cr-audit-dl">Download audit log (JSON)</button> · <label class="linkbtn">Import log<input type="file" accept="application/json" data-crimport="1" hidden></label></p><ul class="small cr-log">' + s.log.slice(-25).reverse().map((l) => "<li>" + esc(l.t.slice(0, 16).replace("T", " ") + " · " + l.who + " · " + l.act + (l.id ? " · " + l.id : "") + (l.note ? " · " + l.note : "")) + "</li>").join("") + "</ul>" +
      '<pre class="cr-brief" id="cr-brief" hidden></pre>'; }
  function crReports(M) { return "<p>Exports for internal quality assurance and external review. Every figure comes from the live computation above.</p>" +
      '<div class="cr-rep"><button class="btn primary" data-act="cr-xlsx">Spreadsheet (.xlsx, all tables)</button><button class="btn" data-act="cr-pack">Curriculum Alignment Evidence Pack (print / PDF)</button><button class="btn" data-act="cr-csv" data-what="register">Register (CSV)</button><button class="btn" data-act="cr-csv" data-what="gaps">Gaps (CSV)</button><button class="btn" data-act="cr-audit-dl">Audit log (JSON)</button></div><p class="small" id="cr-repmsg"></p>' +
      '<p class="muted small">The evidence pack separates <b>verified findings</b> (computed from the content against the stated criteria), <b>internal estimates</b> (targets, effort minutes, proxies) and <b>unvalidated claims</b> (outcomes not yet checked against their source). Curriculum alignment is not accreditation or endorsement by the Instituto Cervantes.</p>' +
      "<h2>Method</h2><p class=\"small\">Coverage % = verified covered outcomes ÷ applicable mapped outcomes × 100. Taught: at least one lesson/guide section at or below the outcome's level matches it, with 2+ examples for grammar. Practised: " + crReg().qa.thresholds.practice_items_grammar + "+ matching items (grammar) or " + crReg().qa.thresholds.practice_skill_activities + "+ activities (skills). Assessed: at least one mock-exam task or item at the level (or above, for grammar) targets it. Full documentation: tools/curric/METRICS.md in the repository.</p>"; }
  /* ---- exports ---- */
  function crTables(M) { const R = crReg(), s = crStore();
    const reg = [["ID", "Level", "Competency", "Source", "Section / descriptor", "Outcome", "Topics", "Teaching records", "Practice records", "Assessment records", "Taught", "Practised", "Assessed", "Coverage", "Weight", "Mastery criteria", "Validation", "Last review"]].concat(R.outcomes.map((o) => { const e = M.EV[o.id], v = s.val[o.id];
      return [o.id, o.lvl.toUpperCase(), crCN(o.comp), crSrc(o.src).short, o.ref, o.text, e.topics.join(" "), e.T.length, e.P.length, e.a === null ? "n/a" : e.A.length, e.t ? "yes" : "no", e.p ? "yes" : "no", e.a === null ? "n/a" : e.a ? "yes" : "no", CR_COV[e.cov], o.w, o.mastery, CR_ST[crStat(o)] || crStat(o), (v && v.t ? v.t.slice(0, 10) : o.rev) || ""]; }));
    const ov = [["Level", "Outcomes", "Taught %", "Practised %", "Assessed %", "All three %", "Pending validation"]].concat(CR_LV.map((lv) => crSummaryRow(R.outcomes.filter((o) => o.lvl === lv), M, lv.toUpperCase())).concat([crSummaryRow(R.outcomes, M, "All")]).map((r) => [r.label, r.n, r.t, r.p, r.a, r.all, r.pend]));
    const heat = [["Competency"].concat(CR_LV.map((l) => l.toUpperCase()))].concat(R.comps.map(([c, n]) => [n].concat(CR_LV.map((lv) => { const x = crCell(M, c, lv); return x.v == null ? "n/a" : x.v + "% " + CR_COV[x.st] + (x.pend ? " (pending)" : ""); }))));
    const bal = [["Scope", "Competency", "Target %", "Actual % (time)", "Deviation", "Activities", "Minutes", "Flag"]]; CR_LV.forEach((lv) => crBalance(M.inv, lv).rows.forEach((r) => bal.push([lv.toUpperCase(), crCN(r.c), r.target, r.actual, r.dev, r.n, r.min, r.flag ? "yes" : ""])));
    M.inv.topics.forEach((T) => crBalance(M.inv, T.id).rows.filter((r) => r.target || r.actual).forEach((r) => bal.push([T.lvl.toUpperCase() + " " + T.title, crCN(r.c), r.target, r.actual, r.dev, r.n, r.min, r.flag ? "yes" : ""])));
    const gaps = [["Severity", "Type", "Finding", "Detail", "Recommended action", "Level", "Outcome", "Status"]].concat(M.G.map((g) => [CR_SEV[g.sev], g.rule, g.title, g.detail, g.rec, (g.lvl || "").toUpperCase(), g.oid || "", (s.issues[g.id] || {}).st || "open"]));
    const dele = [["Level", "Paper", "Task", "Focus", "Format", "Items / length", "Criteria", "App papers", "Issues", "Practice at level", "Status"]]; Object.entries(M.DL).forEach(([lv, d]) => (d.rows || []).forEach((r) => dele.push([lv.toUpperCase(), r.t.pname, r.t.n, r.t.focus, r.t.format, r.t.items || r.t.length, r.t.criteria, r.papers, r.issues.join(" "), r.practice, r.st])));
    const score = [["Scope", "Total", "Capped"].concat(CR_DIM.map((x) => x[1]))].concat(["all"].concat(CR_LV).map((sc) => { const S = crScore(M, sc); return [sc === "all" ? "Whole curriculum" : sc.toUpperCase(), S.total, S.capped ? "yes" : ""].concat(CR_DIM.map(([k]) => (S.d[k] == null ? "n/a" : S.d[k]))); }));
    const rem = [["Issue", "Status", "Last change", "History"]].concat(Object.entries(s.issues).map(([id, x]) => [id, x.st, x.t || "", (x.hist || []).map((h) => h.t.slice(0, 10) + " " + h.who + ": " + h.act).join(" | ")]));
    const src = [["Key", "Source", "Version", "URL", "Checked", "Review every (months)", "Note"]].concat(Object.entries(R.sources).map(([k, x]) => [k, x.name, x.version, x.url, x.checked || "not yet", x.review_months, (x.note || "") + (x.superseded_by ? " Superseded by " + x.superseded_by.name + ": " + x.superseded_by.note : "")]));
    const meth = [["Item", "Definition"]].concat(CR_DIM.map(([k, n]) => [n + " (weight " + R.qa.weights[k] + ")", CR_FORM[k]])).concat([["Coverage %", "Verified covered outcomes ÷ applicable mapped outcomes × 100"], ["Critical cap", "Any critical issue caps a total at " + R.qa.critical_cap], ["Effort minutes", JSON.stringify(R.effort)], ["Thresholds", JSON.stringify(R.qa.thresholds)], ["Computed", M.at + " · build " + M.build], ["Not accreditation", "Curriculum alignment does not imply accreditation or endorsement by the Instituto Cervantes."]]);
    return [["Overview", ov], ["Register", reg], ["Heatmap", heat], ["Exercise mix", bal], ["Gaps", gaps], ["DELE alignment", dele], ["Scorecard", score], ["Remediation", rem], ["Sources", src], ["Method", meth]]; }
  const crCSV = (rows) => "﻿" + rows.map((r) => r.map((c) => { const v = String(c == null ? "" : c); return /[",\n;]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(",")).join("\r\n");
  function crZip(files) { // store-only zip (enough for .xlsx)
    const T = crZip.t || (crZip.t = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; }));
    const crc = (b) => { let c = 0xffffffff; for (let i = 0; i < b.length; i++) c = T[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
    const enc = new TextEncoder(), parts = [], cd = []; let off = 0;
    const u16 = (v) => [v & 255, (v >>> 8) & 255], u32 = (v) => [v & 255, (v >>> 8) & 255, (v >>> 16) & 255, (v >>> 24) & 255];
    files.forEach(([name, data]) => { const nb = enc.encode(name), db = typeof data === "string" ? enc.encode(data) : data, c = crc(db);
      const lh = new Uint8Array([0x50, 0x4b, 3, 4, ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0x21), ...u32(c), ...u32(db.length), ...u32(db.length), ...u16(nb.length), ...u16(0)]);
      parts.push(lh, nb, db); cd.push(new Uint8Array([0x50, 0x4b, 1, 2, ...u16(20), ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0x21), ...u32(c), ...u32(db.length), ...u32(db.length), ...u16(nb.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(off)]), nb);
      off += lh.length + nb.length + db.length; });
    const cdl = cd.reduce((n, b) => n + b.length, 0), end = new Uint8Array([0x50, 0x4b, 5, 6, ...u16(0), ...u16(0), ...u16(files.length), ...u16(files.length), ...u32(cdl), ...u32(off), ...u16(0)]);
    return new Blob(parts.concat(cd, [end]), { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }); }
  function crXlsx(tables) { const x = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "");
    const col = (i) => { let s = ""; i++; while (i) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; };
    const sheet = (rows) => '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><sheetData>' +
      rows.map((r, ri) => '<row r="' + (ri + 1) + '">' + r.map((c, ci) => { const ref = col(ci) + (ri + 1), st = ri === 0 ? ' s="1"' : "";
        return typeof c === "number" && isFinite(c) ? '<c r="' + ref + '"' + st + "><v>" + c + "</v></c>" : '<c r="' + ref + '" t="inlineStr"' + st + "><is><t xml:space=\"preserve\">" + x(c) + "</t></is></c>"; }).join("") + "</row>").join("") + "</sheetData></worksheet>";
    const f = [["[Content_Types].xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' + tables.map((_, i) => '<Override PartName="/xl/worksheets/sheet' + (i + 1) + '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>').join("") + "</Types>"],
      ["_rels/.rels", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'],
      ["xl/workbook.xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>' + tables.map(([n], i) => '<sheet name="' + x(n.slice(0, 31)) + '" sheetId="' + (i + 1) + '" r:id="rId' + (i + 1) + '"/>').join("") + "</sheets></workbook>"],
      ["xl/_rels/workbook.xml.rels", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + tables.map((_, i) => '<Relationship Id="rId' + (i + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet' + (i + 1) + '.xml"/>').join("") + '<Relationship Id="rId' + (tables.length + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>'],
      ["xl/styles.xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf/></cellStyleXfs><cellXfs count="2"><xf/><xf fontId="1" applyFont="1"/></cellXfs></styleSheet>']]
      .concat(tables.map(([, rows], i) => ["xl/worksheets/sheet" + (i + 1) + ".xml", sheet(rows)]));
    return crZip(f); }
  function crSave(name, blob, text) { const msg = document.getElementById("cr-repmsg");
    if (text != null && window.AndroidApp && AndroidApp.saveText) { const r = AndroidApp.saveText(name, text); if (msg) msg.textContent = /^ERR/.test(r) ? "Couldn't save: " + r.slice(4) : "Saved to " + r; return; }
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000); if (msg) msg.textContent = "Downloaded " + name + "."; }
  function crPack(M) { const R = crReg(), T = crTables(M), s = crStore(), when = new Date(M.at).toLocaleString();
    const tbl = (rows, cls) => '<table class="cr-tbl ' + (cls || "") + '"><thead><tr>' + rows[0].map((h) => "<th>" + esc(h) + "</th>").join("") + "</tr></thead><tbody>" + rows.slice(1).map((r) => "<tr>" + r.map((c) => "<td>" + esc(c == null ? "" : c) + "</td>").join("") + "</tr>").join("") + "</tbody></table>";
    const get = (n) => T.find((x) => x[0] === n)[1], reg = get("Register"), pend = R.outcomes.filter((o) => /pending|reassess/.test(crStat(o)));
    const ver = R.outcomes.filter((o) => crStat(o) === "validated" || crStat(o) === "source-checked");
    return '<div class="ui-page cr cr-pack"><p class="crumbs noprint"><a href="#cobertura/reports">Curriculum coverage</a><span aria-hidden="true">›</span><span>Evidence pack</span> · <button class="linkbtn" data-act="cr-print">Print / save as PDF</button></p>' +
      "<h1>Curriculum Alignment Evidence Pack</h1><p><b>Ruta DELE</b> · curriculum version: build " + esc(M.build) + " · register " + esc(R.built) + " · generated " + esc(when) + "</p>" +
      '<p class="callout small">This pack describes how the app\'s content lines up with the CEFR Companion Volume (2020), the Plan Curricular del Instituto Cervantes and the official DELE exam guides. <b>It does not imply accreditation, approval or endorsement by the Instituto Cervantes or the Council of Europe.</b> It measures curriculum coverage, not what any learner has mastered.</p>' +
      "<h2>1. How to read this pack</h2><ul class=\"small\"><li><b>Verified findings</b>: computed from the app's content records against the criteria in section 9 (coverage, gaps, exam-structure checks, item validation).</li><li><b>Internal estimates</b>: topic target weights, minutes per activity, the difficulty proxy and the mastery criteria are design choices, not measurements.</li><li><b>Unvalidated claims</b>: " + pend.length + " of " + R.outcomes.length + " outcomes have not yet been checked line by line against their source (PCIC rows, and C2 rows whose guide has been superseded). " + ver.length + " are source-checked or validated.</li></ul>" +
      "<h2>2. Sources</h2>" + tbl(get("Sources")) + "<h2>3. Coverage by CEFR level</h2>" + tbl(get("Overview")) + "<h2>4. Competency coverage</h2>" + tbl(get("Heatmap")) +
      "<h2>5. DELE assessment alignment</h2>" + tbl(get("DELE alignment"), "cr-small") + "<h2>6. Quality scorecard</h2>" + tbl(get("Scorecard"), "cr-small") +
      "<h2>7. Identified gaps (" + M.G.length + ")</h2>" + tbl(get("Gaps").slice(0, 1).concat(get("Gaps").slice(1, 201)), "cr-small") + (M.G.length > 200 ? '<p class="small">First 200 shown; the spreadsheet has all.</p>' : "") +
      "<h2>8. Remediation history</h2>" + (Object.keys(s.issues).length ? tbl(get("Remediation"), "cr-small") : '<p class="small">No remediation recorded on this device yet.</p>') +
      "<h2>9. Quality assurance procedure and validation rules</h2>" + tbl(get("Method"), "cr-small") + '<ul class="small"><li>Every page load recomputes all figures from the content; nothing is typed in by hand.</li><li>Fixes are made in the source files, released as a new build, then revalidated; an issue only closes after revalidation passes and an administrator approves it.</li><li>AI-generated content is never published from the dashboard: it only drafts briefs.</li><li>Sources are re-checked at the interval shown in section 2; outcomes tied to a superseded source are flagged for reassessment.</li></ul>' +
      "<h2>10. Learning outcome traceability register</h2>" + tbl([reg[0].filter((_, i) => [0, 1, 2, 3, 4, 5, 6, 10, 11, 12, 13, 16, 17].includes(i))].concat(reg.slice(1).map((r) => r.filter((_, i) => [0, 1, 2, 3, 4, 5, 6, 10, 11, 12, 13, 16, 17].includes(i)))), "cr-small") + "</div>"; }
  /* ---- events ---- */
  document.addEventListener("change", (e) => { const t = e.target; if (!t.closest || !t.closest(".cr")) return;
    if (t.dataset.crf) { CR.f[t.dataset.crf] = t.value; const y = scrollY; curricView().then(() => scrollTo(0, y)); }
    else if (t.dataset.crscope) { CR.scope = t.value; const y = scrollY; curricView().then(() => scrollTo(0, y)); }
    else if (t.dataset.crimport && t.files && t.files[0]) { t.files[0].text().then((txt) => { try { const d = JSON.parse(txt), s = crStore(); (d.log || []).forEach((l) => { if (!s.log.some((x) => x.t === l.t && x.act === l.act && x.id === l.id)) s.log.push(l); }); Object.assign(s.val, d.val || {}); Object.entries(d.issues || {}).forEach(([k, v]) => { if (!s.issues[k] || String(v.t) > String(s.issues[k].t)) s.issues[k] = v; }); crPut(s); crLog("import", "", (d.log || []).length + " log entries"); curricView(); } catch (x) { alert("That file isn't an audit log."); } }); }
  });
  document.addEventListener("input", (e) => { const t = e.target; if (t.dataset && t.dataset.crf === "q" && t.closest(".cr")) { CR.f.q = t.value; clearTimeout(CR.qt); CR.qt = setTimeout(() => { const p = t.selectionStart; curricView().then(() => { const n = document.querySelector('[data-crf="q"]'); if (n) { n.focus(); try { n.setSelectionRange(p, p); } catch (x) {} } }); }, 350); } });
  document.addEventListener("submit", async (e) => { const f = e.target; if (!f.dataset || f.dataset.crform !== "login") return; e.preventDefault();
    const code = f.code.value, who = f.who.value.trim(), msg = document.getElementById("cr-lmsg"), R = crReg();
    let ok = false; try { ok = (await crSha("ruta-dele:" + code)) === R.admin_hash; } catch (x) { if (msg) msg.textContent = "This browser can't check the passcode here (it needs a secure https page)."; return; }
    if (!ok) { if (msg) msg.textContent = "That passcode isn't right."; return; }
    const s = crStore(); s.on = true; s.who = who || "admin"; crPut(s); crLog("sign-in", "", ""); curricView(); });
  document.addEventListener("click", async (e) => { const b = e.target.closest && e.target.closest("[data-act^='cr-']"); if (!b) return; const a = b.dataset.act, s = crStore();
    if (a === "cr-cell") { const k = b.dataset.c + "|" + b.dataset.l; CR.sel = CR.sel === k ? null : k; const y = scrollY; await curricView(); scrollTo(0, y); const d = document.querySelector(".cr-det"); if (d && CR.sel) d.scrollIntoView({ behavior: "smooth", block: "start" }); }
    else if (a === "cr-reval") { crLog("revalidate", "", "manual"); CR.EX = null; await crModel(true); curricView(); }
    else if (a === "cr-out") { s.on = false; crPut(s); crLog("sign-out", "", ""); location.hash = "#ajustes"; }
    else if (a === "cr-val") { const id = b.dataset.id, v = b.dataset.v, note = v === "needs-update" ? prompt("What needs updating?") || "" : ""; s.val[id] = { st: v, who: s.who || "admin", t: new Date().toISOString(), note }; crPut(s); crLog("outcome " + v, id, note); const y = scrollY; await curricView(); scrollTo(0, y); }
    else if (a === "cr-iss") { const id = b.dataset.id, v = b.dataset.v, x = s.issues[id] || { st: "new", hist: [] }; x.st = v; x.t = new Date().toISOString(); x.hist = (x.hist || []).concat([{ t: x.t, who: s.who || "admin", act: v }]); s.issues[id] = x; crPut(s); crLog("issue " + v, id, ""); if (v === "fixed") { /* verified on the next revalidation */ } const y = scrollY; await curricView(); scrollTo(0, y); }
    else if (a === "cr-brief" || a === "cr-profe") { const M = await crModel(), g = M.G.find((x) => x.id === b.dataset.id) || { title: b.dataset.id, detail: "", rec: "", links: [] };
      const txt = (a === "cr-profe" ? "Profe enhancement request" : "Fix brief") + " — " + g.title + "\n\nWhat was found: " + g.detail + "\nWhat to do: " + g.rec + "\nWhere: " + g.links.map((l) => l.t + " (" + l.h + ")").join(", ") + "\nChecks before release: run the dashboard's Revalidate; the finding must disappear; node tools/profe_check.js and the tests must pass.\nRule: do not publish generated content without review.\n(Draft only; nothing has been changed.)";
      if (a === "cr-profe") { s.req.push({ t: new Date().toISOString(), id: g.id, title: g.title }); crPut(s); crLog("Profe request", g.id, ""); }
      else crLog("brief drafted", g.id, "");
      const p = document.getElementById("cr-brief"); if (p) { p.hidden = false; p.textContent = txt; p.scrollIntoView({ behavior: "smooth", block: "center" }); } try { navigator.clipboard.writeText(txt); } catch (x) {} }
    else if (a === "cr-csv") { const M = await crModel(), T = crTables(M), what = b.dataset.what, rows = (T.find((x) => x[0] === (what === "gaps" ? "Gaps" : "Register")) || [])[1], txt = crCSV(rows); crSave("ruta-dele-" + what + ".csv", new Blob([txt], { type: "text/csv" }), txt); crLog("export csv", what, ""); }
    else if (a === "cr-xlsx") { const M = await crModel(); crSave("ruta-dele-curriculum.xlsx", crXlsx(crTables(M))); crLog("export xlsx", "", ""); }
    else if (a === "cr-audit-dl") { const txt = JSON.stringify({ app: "ruta-dele", kind: "curriculum-audit", exported: new Date().toISOString(), log: s.log, issues: s.issues, val: s.val, req: s.req }, null, 1); crSave("ruta-dele-curriculum-audit.json", new Blob([txt], { type: "application/json" }), txt); crLog("export audit", "", ""); }
    else if (a === "cr-pack") { const M = await crModel(); app.innerHTML = crPack(M); scrollTo(0, 0); crLog("evidence pack", "", ""); }
    else if (a === "cr-print") { window.print(); }
  });
  window.__curric = { model: crModel, evaluate: crEvaluate, inventory: crInventory, gaps: crGaps, score: crScore, balance: crBalance, dele: crDele, tables: crTables, xlsx: crXlsx, csv: crCSV, reg: crReg, store: crStore, put: crPut, sha: crSha, reset: () => { CR.M = null; CR.EX = null; } };
