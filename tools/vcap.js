  /* ---------- caption window under the video (tools/VIDEO_CAPTIONS_BRIEF.md) ---------- */
  // informal Spanish: shortened forms of regular words, informal/slang words (with where they're used), and jargon
  const VSHORT = { "pa": "para", "pa'": "para", "p'": "para", "pal": "para el", "pa'l": "para el", "palante": "para adelante", "pa'lante": "para adelante", "patrás": "para atrás", "pa'trás": "para atrás", "pacá": "para acá", "pa'cá": "para acá", "pallá": "para allá", "pa'llá": "para allá",
    "na'": "nada", "ná": "nada", "naa": "nada", "to'": "todo", "tó": "todo", "toa": "toda", "toa'": "toda", "toos": "todos", "ta": "está", "'ta": "está", "tá": "está", "tás": "estás", "'tás": "estás", "toy": "estoy", "'toy": "estoy", "tamos": "estamos", "tamo": "estamos", "tamo'": "estamos", "taba": "estaba", "'taba": "estaba",
    "vamo": "vamos", "vamo'": "vamos", "ma'": "más", "pue": "pues", "pue'": "pues", "pos": "pues", "nomás": "no más (just, only)", "namás": "nada más (just, only)", "usté": "usted", "verdá": "verdad", "mijo": "mi hijo (my son / dear)", "mija": "mi hija (my daughter / dear)", "m'hijo": "mi hijo", "m'hija": "mi hija", "onde": "donde", "ónde": "dónde", "pa'que": "para que", "pa'cer": "para hacer",
    "porfa": "por favor", "peli": "película (film)", "pelis": "películas (films)", "finde": "fin de semana (weekend)", "profe": "profesor / profesora (teacher)", "cole": "colegio (school)", "bici": "bicicleta (bike)", "tele": "televisión (TV)", "compa": "compañero / compadre (pal)", "uni": "universidad (university)", "cumple": "cumpleaños (birthday)", "depa": "departamento (flat, Mexico)", "refri": "refrigerador (fridge)", "mates": "matemáticas (maths)", "insti": "instituto (secondary school, Spain)", "boli": "bolígrafo (pen)", "info": "información", "súper": "supermercado or 'super, very'", "seño": "señorita (miss, teacher)", "porfis": "por favor" };
  const VSLANG = {
    "chévere": ["great, cool", "Caribbean, Venezuela, Colombia, Panama"], "bacano": ["great, cool", "Colombia"], "bacana": ["great, cool", "Colombia"], "bacán": ["great, cool", "Chile, Peru, Colombia"],
    "güey": ["dude, mate (among friends)", "Mexico"], "wey": ["dude, mate (among friends)", "Mexico"], "guey": ["dude, mate (among friends)", "Mexico"], "chido": ["cool", "Mexico"], "chida": ["cool", "Mexico"], "chidos": ["cool", "Mexico"], "neta": ["the truth; for real?", "Mexico"],
    "chamba": ["work, job", "Mexico, Central America, Peru"], "chambear": ["to work", "Mexico, Central America"], "órale": ["come on! / OK! / wow!", "Mexico"], "ándale": ["come on, hurry up; that's it!", "Mexico"], "cuate": ["buddy", "Mexico"], "cuates": ["buddies", "Mexico"],
    "morro": ["kid, young guy", "Mexico"], "morra": ["girl, young woman", "Mexico"], "chela": ["beer", "Mexico"], "chelas": ["beers", "Mexico"], "ahorita": ["right now, or in a little while", "Mexico, Central America, Caribbean"], "chafa": ["cheap, poor quality", "Mexico"], "gacho": ["bad, mean, ugly", "Mexico"],
    "chamaco": ["kid", "Mexico, Central America"], "chamaca": ["girl, kid", "Mexico, Central America"], "chavo": ["guy, kid", "Mexico"], "chava": ["girl", "Mexico"], "carnal": ["brother, buddy", "Mexico"], "chingón": ["awesome (vulgar)", "Mexico"], "chingona": ["awesome (vulgar)", "Mexico"], "lana": ["money (Mexico); also 'wool'", "Mexico"],
    "parce": ["friend, mate", "Colombia"], "parcero": ["friend, mate", "Colombia"], "parcera": ["friend, mate", "Colombia"], "berraco": ["tough, great; also angry", "Colombia"], "verraco": ["tough, great; also angry", "Colombia"], "berraca": ["tough, great; also angry", "Colombia"], "guayabo": ["hangover", "Colombia"], "rumba": ["party (also a dance)", "Colombia, Venezuela"], "man": ["guy (from English)", "Colombia, Venezuela"],
    "chamo": ["kid, guy", "Venezuela"], "chama": ["girl", "Venezuela"], "chamos": ["guys, kids", "Venezuela"], "pana": ["buddy", "Venezuela, Panama, Ecuador, Caribbean"], "panas": ["buddies", "Venezuela, Panama, Ecuador, Caribbean"], "burda": ["a lot, very", "Venezuela"],
    "xopá": ["what's up?", "Panama"], "chopá": ["what's up?", "Panama"], "fren": ["friend", "Panama"], "pelao": ["kid (short for pelado)", "Panama, Colombia"], "pelaíto": ["little kid", "Panama"], "vaina": ["thing, stuff, situation", "Panama, Colombia, Venezuela, Caribbean"], "vainas": ["things, stuff", "Panama, Colombia, Venezuela, Caribbean"], "chuleta": ["wow! damn! (surprise); also 'pork chop'", "Panama"], "mae": ["dude", "Costa Rica"], "tuanis": ["cool", "Costa Rica"],
    "jeva": ["girlfriend", "Caribbean, Venezuela"], "jevo": ["boyfriend", "Caribbean, Venezuela"], "guagua": ["bus", "Caribbean, Canary Islands"],
    "che": ["hey, mate", "Argentina, Uruguay"], "boludo": ["dude (friends); also 'idiot'", "Argentina"], "boluda": ["dude (friends); also 'idiot'", "Argentina"], "pibe": ["kid, guy", "Argentina"], "piba": ["girl", "Argentina, Spain"], "mina": ["girl, woman (also 'mine')", "Argentina"], "laburo": ["work, job", "Argentina, Uruguay"], "laburar": ["to work", "Argentina, Uruguay"], "guita": ["money", "Argentina"], "bondi": ["bus", "Argentina"], "quilombo": ["mess, chaos", "Argentina, Uruguay"], "copado": ["cool", "Argentina"], "posta": ["for real", "Argentina"], "bárbaro": ["great! (also 'barbaric')", "Argentina, Uruguay"],
    "cachai": ["you know? / get it?", "Chile"], "po": ["filler, like 'then' (sí po = yeah)", "Chile"], "weón": ["dude (vulgar)", "Chile, Peru"], "huevón": ["dude; also 'idiot' (vulgar)", "Chile, Peru, Venezuela"],
    "mola": ["it's cool", "Spain"], "molan": ["they're cool", "Spain"], "molar": ["to be cool", "Spain"], "mole": ["(that it) is cool", "Spain"], "guay": ["cool", "Spain"], "guays": ["cool", "Spain"], "flipar": ["to be amazed", "Spain"], "flipo": ["I'm amazed", "Spain"], "flipas": ["you're amazed / you're dreaming", "Spain"], "flipante": ["mind-blowing", "Spain"], "flipando": ["amazed", "Spain"],
    "currar": ["to work", "Spain"], "curro": ["job, work", "Spain"], "curra": ["works", "Spain"], "chaval": ["kid, young guy", "Spain"], "chavala": ["girl", "Spain"], "chavales": ["kids", "Spain"], "colega": ["mate (also 'colleague')", "Spain"], "colegas": ["mates (also 'colleagues')", "Spain"], "majo": ["nice, friendly", "Spain"], "maja": ["nice, friendly", "Spain"],
    "mogollón": ["loads, a lot", "Spain"], "cutre": ["shabby, tacky", "Spain"], "guiri": ["foreign tourist", "Spain"], "guiris": ["foreign tourists", "Spain"], "chulo": ["cool, pretty; also cocky", "Spain, Mexico"], "chula": ["cool, pretty; also cocky", "Spain, Mexico"], "tronco": ["mate, dude (also 'tree trunk')", "Spain"], "mazo": ["a lot, really (also 'mallet')", "Spain (Madrid)"], "bocata": ["sandwich", "Spain"], "tío": ["dude, guy (also 'uncle')", "Spain"], "tía": ["girl, mate (also 'aunt')", "Spain"],
    "plata": ["money (also 'silver')", "Latin America"], "bro": ["bro (from English)", "everywhere"], "okey": ["OK (from English)", "everywhere"], "full": ["very, a lot (from English)", "Ecuador, Colombia, Venezuela"],
  };
  const VPHRASE = { "qué onda": ["what's up?", "Mexico, Central America"], "buena onda": ["good vibes; nice (person)", "Latin America"], "pura vida": ["great, all good; hi / thanks", "Costa Rica"], "en plan": ["like, kind of (filler)", "Spain"], "o sea": ["I mean, like (filler)", "everywhere"], "qué sopa": ["what's up?", "Panama"], "de una": ["sure, right away", "Colombia, Ecuador"], "qué más": ["how's it going?", "Colombia"], "a full": ["all out, at full speed", "Latin America"], "qué pedo": ["what's up? (vulgar)", "Mexico"] };
  const VJARGON = { "golazo": "a great goal (football)", "remontada": "a comeback (sport)", "prórroga": "extra time (football, Spain)", "penalti": "penalty kick (football)", "penal": "penalty kick (football, Latin America)", "córner": "corner kick (football)", "pichichi": "top scorer of the league (football, Spain)", "colista": "team at the bottom of the table (sport)", "fichaje": "a signing, a transfer (sport)", "triplete": "three goals, or three titles (sport)", "var": "video referee (football)",
    "borrasca": "a low-pressure storm system (weather)", "dana": "an isolated cold-air storm (weather, Spain)", "chubascos": "showers (weather)", "chubasco": "a shower (weather)", "anticiclón": "a high-pressure system (weather)", "isobaras": "isobars (weather maps)", "ciclogénesis": "rapid storm formation (weather)", "vaguada": "a trough of low pressure (weather)", "calima": "dust haze (weather)" };
  const VFAM = new Set(["mi", "tu", "su", "mis", "tus", "sus", "el", "la", "los", "las", "un", "una", "nuestro", "nuestra", "vuestro", "vuestra", "del", "al"]);
  // what kind of informal word is this? → {k: "short"|"slang"|"jargon", base, mean, where}
  function vInformal(w, prev) {
    const x = w.toLowerCase(); if (!x) return null;
    if (VSHORT[x]) return { k: "short", base: VSHORT[x] };
    if (VJARGON[x]) return { k: "jargon", mean: VJARGON[x] };
    if (VSLANG[x]) { if ((x === "tío" || x === "tía") && VFAM.has(prev)) return null; return { k: "slang", mean: VSLANG[x][0], where: VSLANG[x][1] }; }
    const tg = (y) => { try { return !!TG[y]; } catch (e) { return false; } };
    if (tg(x)) return null;
    let m;
    if ((m = /^(.{2,})ao(s?)$/.exec(x)) && tg(m[1] + "ado" + m[2])) return { k: "short", base: m[1] + "ado" + m[2] };
    if ((m = /^(.{2,})á(s?)$/.exec(x)) && tg(m[1] + "ada" + m[2])) return { k: "short", base: m[1] + "ada" + m[2] };
    if ((m = /^(.{2,})ío(s?)$/.exec(x)) && tg(m[1] + "ido" + m[2])) return { k: "short", base: m[1] + "ido" + m[2] };
    if ((m = /^(.+)'$/.exec(x))) { for (const end of ["s", "do", "da", "e"]) if (tg(m[1] + end)) return { k: "short", base: m[1] + end }; }
    if ((m = /^'(.+)$/.exec(x))) { for (const st of ["es", "a"]) if (tg(st + m[1])) return { k: "short", base: st + m[1] }; }
    return null;
  }
  const VCAP = { id: null, cues: [], kind: "", raf: 0, cur: -1, word: -1, raw: -1, t0: 0, n0: 0, resume: false, overlayOff: false };
  const vcPref = () => (S.vcap = S.vcap || { en: false, hide: false });
  // YouTube's tags and markers are noise: [Música], (risas), ♪, >>, a leading dash
  const vcClean = (t) => String(t || "").replace(/\[[^\]]*\]|\([^)]*\)|<[^>]*>/g, " ").replace(/[♪♫♬🎵🎶]/g, " ").replace(/>>+/g, " ").replace(/(^|\s)[-–—](?=\s)/g, " ").replace(/\s+/g, " ").trim();
  function vcDecode(s) { const ta = document.createElement("textarea"); ta.innerHTML = s; return ta.value; }
  // YouTube caption XML: srv1 (<text start dur>) or srv3 (<p t d> with word timings in <s t>)
  function vcParse(xml) {
    if (!xml) return [];
    const doc = new DOMParser().parseFromString(xml, "text/xml"), out = [];
    doc.querySelectorAll("text").forEach((n) => { const s = +n.getAttribute("start") || 0, d = +n.getAttribute("dur") || 2; const txt = vcClean(vcDecode(vcDecode(n.textContent || ""))); if (txt) out.push({ s, e: s + d, text: txt }); });
    doc.querySelectorAll("body > p, p[t]").forEach((p) => {
      const s = (+p.getAttribute("t") || 0) / 1000, d = (+p.getAttribute("d") || 2000) / 1000, ss = p.querySelectorAll("s"); let words = null, txt;
      if (ss.length) { words = []; let inTag = false; ss.forEach((x) => { const raw = vcDecode(x.textContent || "").trim(); if (/^[\[(]/.test(raw)) inTag = true; const w = inTag ? "" : vcClean(raw); if (/[\])]$/.test(raw)) inTag = false; if (w) words.push({ t: s + (+x.getAttribute("t") || 0) / 1000, w }); }); txt = words.map((x) => x.w).join(" "); }
      else txt = vcClean(vcDecode(vcDecode(p.textContent || "")));
      if (txt && !(out.length && out[out.length - 1].s === s && out[out.length - 1].text === txt)) out.push({ s, e: s + d, text: txt, words });
    });
    out.sort((a, b) => a.s - b.s);
    for (let i = 0; i < out.length - 1; i++) if (out[i].e > out[i + 1].s) out[i].e = out[i + 1].s; // automatic captions overlap: each line ends where the next begins
    return out;
  }
  function vcPair(es, en) { // English line for each Spanish line: the English cue that starts closest (same track, so the timings match)
    if (!en.length) return; let j = 0;
    es.forEach((c) => { while (j < en.length - 1 && Math.abs(en[j + 1].s - c.s) <= Math.abs(en[j].s - c.s)) j++; if (Math.abs(en[j].s - c.s) < 1.2) c.en = en[j].text; });
  }
  // caption fragments → sentences. Channel captions are split at their punctuation; YouTube's automatic captions have none,
  // so sentences start at clear pauses (word timings) and the app adds capitals, ¿…?, full stops and a few commas.
  const VQW = new Set(["qué", "cómo", "dónde", "cuándo", "cuál", "cuáles", "quién", "quiénes", "cuánto", "cuánta", "cuántos", "cuántas", "adónde"]);
  const VOPEN = new Set(["bueno", "pues", "entonces", "oye", "mira", "hola", "sí", "vale", "claro", "eh", "ok", "okey", "vaya", "venga", "perdón", "disculpa", "mmm", "ah", "oh"]);
  function vcPunct(ws) {
    const out = ws.slice(), lw = out.map((w) => w.toLowerCase()), n = out.length;
    if (n > 2 && VOPEN.has(lw[0])) out[0] += ",";
    for (let i = 2; i < n; i++) if (/^(pero|aunque|sino)$/.test(lw[i]) && !/[,;:]$/.test(out[i - 1])) out[i - 1] += ",";
    const qi = VQW.has(lw[0]) || (lw[0] === "por" && lw[1] === "qué") ? 0 : VOPEN.has(lw[0]) && (VQW.has(lw[1]) || (lw[1] === "por" && lw[2] === "qué")) ? 1 : -1;
    const pos = (w) => { try { return (TG[w] || [])[1] || ""; } catch (e) { return ""; } };
    const ex = qi >= 0 && (lw[qi] === "qué" || lw[qi] === "cuánto" || lw[qi] === "cuánta") && /^(adj|adv)/.test(pos(lw[qi + 1] || "")); // ¡Qué bonito!, ¡Qué bien!
    const tag = n > 3 && qi < 0 && (lw[n - 1] === "verdad" || (lw[n - 1] === "no" && !/^(o|que|si|porque|ni)$/.test(lw[n - 2])));
    if (tag) { out[n - 2] = out[n - 2].replace(/,?$/, ","); out[n - 1] = "¿" + out[n - 1] + "?"; }
    else if (ex) { out[qi] = "¡" + out[qi]; out[n - 1] += "!"; }
    else if (qi >= 0) { out[qi] = "¿" + out[qi]; out[n - 1] += "?"; }
    else out[n - 1] += ".";
    out[0] = out[0].replace(/^([¿¡]?)(\p{L})/u, (m, a, b) => a + b.toUpperCase());
    return out;
  }
  function vcSentences(cues, en, kind) {
    const W = [];
    cues.forEach((c) => {
      if (c.words && c.words.length) c.words.forEach((x) => W.push({ t: x.t, w: x.w }));
      else { const ws = c.text.split(/\s+/).filter(Boolean), tot = ws.reduce((a, b) => a + b.length + 1, 0), dur = Math.max(0.5, (c.e - c.s) * 0.92); let acc = 0; ws.forEach((w) => { W.push({ t: c.s + (dur * acc) / tot, w }); acc += w.length + 1; }); }
    });
    const END = /[.?!…]["»”)]?$/, hasP = W.filter((x) => END.test(x.w)).length >= Math.max(1, W.length / 45), S = [];
    let cur = []; const push = () => { if (cur.length) S.push(cur); cur = []; };
    for (let i = 0; i < W.length; i++) {
      const x = W[i];
      cur.push(x); const nx = W[i + 1]; if (!nx) { push(); break; }
      const gap = nx.t - x.t;
      if (hasP) { if (END.test(x.w) || cur.length >= 40) push(); }
      else if ((gap >= 0.8 && cur.length >= 3) || gap >= 1.6) push();
      else if (cur.length >= 22) { let best = -1, bg = 0; for (let k = 6; k < cur.length - 2; k++) { const g = cur[k + 1].t - cur[k].t; if (g > bg) { bg = g; best = k; } } if (best < 0) best = cur.length - 2; const rest = cur.splice(best + 1); S.push(cur); cur = rest; }
    }
    const out = S.map((ws) => { const raw = ws.map((x) => x.w), txt = hasP ? raw : vcPunct(raw); return { s: ws[0].t, words: ws.map((x, i) => ({ t: x.t, w: txt[i] })), text: txt.join(" ") }; });
    out.forEach((c, i) => { c.e = out[i + 1] ? out[i + 1].s : c.s + Math.max(2, c.words.length * 0.45); });
    if (en.length && kind !== "asr") out.forEach((c) => { const xs = en.filter((x) => x.s >= c.s - 0.3 && x.s < c.e - 0.3).map((x) => x.text); if (xs.length) c.en = xs.join(" "); });
    VCAP.addedP = !hasP;
    return out;
  }
  const vcCache = new Map();
  function vcLoad(id) {
    VCAP.id = id; VCAP.cues = []; VCAP.cur = -1; VCAP.word = -1; VCAP.overlayOff = false;
    const box = document.getElementById("vcapw"); if (!box) return;
    if (!window.AndroidCap) { vcState("app"); return; }
    let hit = vcCache.get(id); if (!hit) try { const j = localStorage.getItem("vcap:" + id); if (j) hit = JSON.parse(j); } catch (e) {}
    if (hit) { vcGot(id, hit); if (hit.secs) return; } // older saved copies have no video length: fetch again quietly to get it (the ad check needs it)
    else vcState("loading");
    const rid = "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    window.__acap = window.__acap || { cbs: {}, ev(k, json, err) { const f = this.cbs[k]; delete this.cbs[k]; if (f) f(json, err); } };
    window.__acap.cbs[rid] = (json, err) => {
      if (VCAP.id !== id) return;
      if (err || !json) { if (!hit) vcState("error", err); return; }
      let r; try { r = JSON.parse(json); } catch (e) { vcState("error", "unreadable reply"); return; }
      if (r.none) { if (+r.secs > 0) VP.secs = +r.secs; vData(id).cap = "none"; save(); vcNoCaps(id); return; }
      vcCache.set(id, r);
      try { const keys = Object.keys(localStorage).filter((k) => k.startsWith("vcap:")); if (keys.length >= 8) localStorage.removeItem(keys[0]); localStorage.setItem("vcap:" + id, JSON.stringify(r)); } catch (e) {}
      if (!hit) vcGot(id, r); else if (+r.secs > 0) VP.secs = +r.secs;
    };
    try { window.AndroidCap.fetch(rid, id); } catch (e) { vcState("error", String(e)); }
  }
  function vcGot(id, r) {
    const es = vcParse(r.es), en = vcParse(r.en), v = vFind(id), hi = v && v.clip ? v.clip[1] : 1e9, lo = v && v.clip ? v.clip[0] : 0;
    VCAP.kind = r.kind; if (+r.secs > 0) VP.secs = +r.secs;
    const dd = vData(id); if (dd.cap !== r.kind && r.kind !== "audio") { dd.cap = r.kind; save(); }
    if (r.kind === "asr" && vaHas(id)) { vaUse(id); return; } // your captions from the audio beat YouTube's automatic ones
    VCAP.cues = vcSentences(es.filter((c) => c.s < hi && c.e > lo), en, r.kind).filter((c) => c.s < hi);
    if (!VCAP.cues.length) { vcNoCaps(id); return; }
    vcRender(); vcStart(); vWordCheck(id);
  }
  function vcState(st, why) {
    const w = document.getElementById("vcap"), n = document.getElementById("vcap-note"); if (!w) return;
    const msg = { app: "The caption window works in the Ruta DELE app for Android. Here, YouTube's Spanish subtitles are shown on the video.", loading: "Loading the Spanish captions…", none: "This video has no Spanish captions on YouTube, so there's nothing to read along. Listen and catch words by ear.", error: "Couldn't load the captions" + (why ? " (" + String(why).slice(0, 80) + ")" : "") + "." }[st];
    w.classList.add("vcap-empty"); w.querySelector("#vcap-in").innerHTML = '<p class="vcap-msg">' + esc(msg) + (st === "error" ? ' <button class="btn small" data-act="vc-retry">Try again</button>' : "") + "</p>";
    if (n) n.textContent = ""; w.dataset.state = st;
  }
  function vcWords(text) { // Spanish line → tappable words, informal ones coloured
    const toks = text.match(/[\p{L}\p{M}'’]+|[^\p{L}\p{M}'’]+/gu) || [], lower = toks.map((t) => t.toLowerCase().replace(/’/g, "'"));
    let out = "", prev = "", wi = 0;
    for (let i = 0; i < toks.length; i++) {
      const t = toks[i]; if (!/\p{L}/u.test(t)) { out += esc(t); continue; }
      const x = lower[i].replace(/^'+|'+$/g, ""); let inf = null;
      const nx = lower.slice(i + 1).find((y) => /\p{L}/u.test(y));
      if (nx && VPHRASE[lower[i] + " " + nx]) { const ph = lower[i] + " " + nx; inf = { k: "slang", mean: VPHRASE[ph][0], where: VPHRASE[ph][1], ph }; }
      if (!inf) inf = vInformal(lower[i], prev) || vInformal(x, prev);
      out += '<span class="vword' + (inf ? " vinf vinf-" + inf.k : "") + '" data-act="vc-w" data-wi="' + wi + '"' + (inf ? ' data-inf="' + esc(JSON.stringify(inf)) + '"' : "") + ">" + esc(t) + "</span>";
      if (inf && inf.ph) { // the second word of a phrase gets the same colour and card
        const j = toks.indexOf(toks.slice(i + 1).find((y) => /\p{L}/u.test(y)), i + 1); out += toks.slice(i + 1, j).map(esc).join(""); wi++;
        out += '<span class="vword vinf vinf-slang" data-act="vc-w" data-wi="' + wi + '" data-inf="' + esc(JSON.stringify(inf)) + '">' + esc(toks[j]) + "</span>"; i = j;
      }
      prev = lower[i]; wi++;
    }
    return out;
  }
  function vcRender() {
    const w = document.getElementById("vcap"); if (!w) return; const P = vcPref();
    w.classList.remove("vcap-empty"); w.dataset.state = "ready"; w.classList.toggle("show-en", !!P.en); w.classList.toggle("hide-text", !!P.hide);
    w.querySelector("#vcap-in").innerHTML = '<div class="vcap-pad"></div>' + VCAP.cues.map((c, i) => '<div class="vcue' + (c.mark ? " mark" : "") + '" data-i="' + i + '"><div class="vcl"><p class="ves" lang="es">' + vcWords(c.text) + '</p><p class="ven" lang="en">' + esc(c.en || "") + "</p></div></div>").join("") + '<div class="vcap-pad end"></div><div class="vtip" id="vtip" hidden role="status"></div>';
    const n = document.getElementById("vcap-note"); if (n) n.innerHTML = '<span class="vkey"><i aria-hidden="true"></i>Informal word</span> ' + esc(VCAP.kind === "audio" ? "Captions made from the video's sound on this phone" + (VCAP.addedP ? ", punctuation added by the app" : "") + "." : VCAP.kind === "asr" ? "YouTube's automatic Spanish captions" + (VCAP.addedP ? ", punctuation added by the app" : "") + ": a word can be misheard now and then." : "The channel's own Spanish captions.") +
      (vaOk() && VCAP.kind !== "manual" ? ' <button class="lnk" data-act="' + (VCAP.kind === "audio" ? "va-redo" : "va-start") + '">' + (VCAP.kind === "audio" ? "Make them again from the audio" : "Make captions from the audio instead") + "</button>" : "") + ' <button class="lnk" data-act="v-report">Report a playback problem</button>';
    VCAP.cur = -1; VCAP.word = -1; vcTick(true);
  }
  // the video's clock, smoothed between the player's updates so lines and words change on time
  function vcNow() {
    if (VP.ad) return -1; // an ad is playing: the captions wait at the start
    const raw = vpT(), now = performance.now(); let st = 2; try { st = VP.p.getPlayerState(); } catch (e) {}
    if (raw !== VCAP.raw) { VCAP.raw = raw; VCAP.t0 = raw; VCAP.n0 = now; }
    return st === 1 ? VCAP.t0 + Math.min(0.6, ((now - VCAP.n0) / 1000) * (VP.rate || 1)) : raw;
  }
  function vcStart() { cancelAnimationFrame(VCAP.raf); const loop = () => { if (!VCAP.cues.length || !document.getElementById("vcap")) return; vcTick(false); VCAP.raf = requestAnimationFrame(loop); }; VCAP.raf = requestAnimationFrame(loop); }
  function vcStop() { cancelAnimationFrame(VCAP.raf); VCAP.raf = 0; VCAP.id = null; VCAP.cues = []; }
  function vcFind(t) { const C = VCAP.cues; let lo = 0, hi = C.length - 1, k = -1; while (lo <= hi) { const m = (lo + hi) >> 1; if (C[m].s <= t + 0.05) { k = m; lo = m + 1; } else hi = m - 1; } return k; }
  function vcTick(force) {
    const w = document.getElementById("vcap"); if (!w || !VCAP.cues.length) return;
    if (VP.ready && !VCAP.overlayOff) { try { VP.p.unloadModule && VP.p.unloadModule("captions"); } catch (e) {} VCAP.overlayOff = true; } // our window replaces the subtitles on the video
    if (w.scrollTop) w.scrollTop = 0; // tapping inside can scroll the window itself; the glide does all the moving
    const t = vcNow(), k = vcFind(t);
    if (k !== VCAP.cur || force) {
      const rows = w.querySelectorAll(".vcue");
      rows.forEach((r, i) => { r.classList.toggle("on", i === k); r.classList.toggle("past", i < k); });
      VCAP.cur = k; VCAP.word = -1;
      const row = rows[Math.max(0, k)], inner = w.querySelector("#vcap-in");
      if (row && inner) { const y = Math.max(0, row.offsetTop - w.clientHeight * (cueOn() ? 0.3 : 0.2)); inner.style.transform = "translateY(" + -y + "px)"; }
      if (vcPref().en) vcFillEn(k);
    }
    if (k < 0) { const tp = document.getElementById("vtip"); if (tp) tp.hidden = true; return; }
    const c = VCAP.cues[k], row = w.querySelectorAll(".vcue")[k], spans = row ? row.querySelectorAll(".ves .vword") : []; if (!spans.length) return;
    let wi;
    if (c.words && c.words.length === spans.length) { wi = 0; for (let i = 0; i < c.words.length; i++) if (c.words[i].t <= t + 0.05) wi = i; }
    else { const len = [...spans].map((s) => s.textContent.length + 1), tot = len.reduce((a, b) => a + b, 0), f = Math.min(1, Math.max(0, (t - c.s) / Math.max(0.5, (c.e - c.s) * 0.92))); let acc = 0; wi = spans.length - 1; for (let i = 0; i < len.length; i++) { acc += len[i]; if (acc / tot > f) { wi = i; break; } } }
    if (wi !== VCAP.word) { spans.forEach((s, i) => { s.classList.toggle("now", i === wi); s.classList.toggle("said", i < wi); }); VCAP.word = wi; vcTip(k, spans, wi); }
  }
  // cue tips: the English bubble above the word being said; little words (de, el…) and names jump ahead to the next real word
  const VLITTLE = /^(el|la|los|las|lo|un|una|unos|unas|de|del|a|al|y|e|o|u|en|que|con|se|me|te|le|les|nos|os|mi|mis|tu|tus|su|sus|es|por|para|no|ni|si|ya|pues|eh|ah)$/;
  function vcGl(span, prev) {
    const inf = span.dataset.inf ? JSON.parse(span.dataset.inf) : null, w = span.textContent.replace(/^[¿¡'’]+|[^\p{L}']+$/gu, ""), lw = w.toLowerCase();
    if (inf) return inf.k === "short" ? (cueOne(cueGloss(inf.base.split(/[ (]/)[0])) || inf.base) + " (" + inf.base.split(" (")[0] + ")" : String(inf.mean).split(/[;(]/)[0].trim();
    if (VLITTLE.test(lw) || !lw) return "";
    const vl = (S.vlex || {})[lw]; if (vl && vl.en) return cueOne(vl.en) || vl.en;
    try { return cueOne(cueGloss(w)); } catch (e) { return ""; }
  }
  function vcTip(k, spans, wi) {
    const tip = document.getElementById("vtip"); if (!tip) return;
    if (!cueOn() || vcPref().hide || wi < 0) { tip.hidden = true; return; }
    const c = VCAP.cues[k]; c.gl = c.gl || [];
    let j = -1; for (let i = wi; i < spans.length; i++) { if (c.gl[i] == null) c.gl[i] = vcGl(spans[i]); if (c.gl[i]) { j = i; break; } }
    if (j < 0) return; // nothing left to translate in this sentence: the last bubble stays
    if (tip.dataset.k === k + ":" + j && !tip.hidden) return;
    tip.dataset.k = k + ":" + j; tip.textContent = c.gl[j];
    const inner = document.getElementById("vcap-in"), r = spans[j].getBoundingClientRect(), ir = inner.getBoundingClientRect();
    tip.hidden = false; const tw = tip.offsetWidth, maxL = inner.clientWidth - tw - 4;
    const cx = r.left + r.width / 2 - ir.left, left = Math.max(4, Math.min(maxL, cx - tw / 2));
    tip.style.left = left + "px"; tip.style.top = (r.top - ir.top - tip.offsetHeight - 7) + "px"; tip.style.setProperty("--ax", Math.max(10, Math.min(tw - 10, cx - left)) + "px");
  }
  function vcFillEn(k) { // lines YouTube didn't translate: the app's translator, a few lines ahead
    if (!window.__trEn) return;
    for (let i = Math.max(0, k); i < Math.min(VCAP.cues.length, k + 4); i++) { const c = VCAP.cues[i]; if (c.en || c.enBusy) continue; c.enBusy = 1; const id = VCAP.id;
      window.__trEn(c.text).then((en) => { c.enBusy = 0; if (!en || VCAP.id !== id) return; c.en = en; const p = document.querySelector('#vcap .vcue[data-i="' + i + '"] .ven'); if (p) p.textContent = en; }).catch(() => { c.enBusy = 0; }); }
  }
  function vcWordCard(span) {
    const word = span.textContent.replace(/^['’]+|['’]+$/g, ""), inf = span.dataset.inf ? JSON.parse(span.dataset.inf) : null;
    try { if (VP.p && VP.p.getPlayerState() === 1) { vpPause(); VCAP.resume = true; } } catch (e) {}
    const lines = (() => { try { return wordLines(inf && inf.k === "short" ? inf.base.split(/[ (/]/)[0] : word); } catch (e) { return []; } })();
    const what = !inf ? "" : inf.k === "short" ? '<p class="vinfo vinf-short"><b>Shortened form</b> of «' + esc(inf.base) + "». Informal speech: the end (or start) of the word is dropped.</p>" : inf.k === "jargon" ? '<p class="vinfo vinf-jargon"><b>Jargon:</b> ' + esc(inf.mean) + "</p>" : '<p class="vinfo vinf-slang"><b>Informal' + (inf.ph ? " expression «" + esc(inf.ph) + "»" : " word") + ":</b> " + esc(inf.mean) + (inf.where ? ' <span class="muted">· ' + esc(inf.where) + "</span>" : "") + "</p>";
    VCAP.card = { w: inf && inf.ph ? inf.ph : word, en: inf ? (inf.k === "short" ? inf.base : inf.mean) : "", t: VCAP.cur >= 0 ? VCAP.cues[VCAP.cur].s : vpT() };
    openSheet('<div class="row" style="justify-content:space-between"><span class="sw" lang="es">' + esc(VCAP.card.w) + '</span><button class="btn small" data-act="vc-close">Close</button></div>' + what + (lines.length ? lines.join("") : inf ? "" : (S.vlex || {})[word.toLowerCase()] && S.vlex[word.toLowerCase()].en ? '<p class="vinfo"><b>Heard in your videos:</b> ' + esc(S.vlex[word.toLowerCase()].en) + ' <span class="muted small">(app translation)</span></p>' : '<p class="muted">Not in the app\'s dictionary. It will be translated when the word check runs.</p>') +
      '<div class="row" style="margin-top:10px"><button class="btn primary small" data-act="vc-catch">' + IC("pen") + " Catch it</button></div>");
    if (!VCAP.card.en) { const txt = lines.join(" ").replace(/<[^>]+>/g, " "); VCAP.card.en = ((txt.match(/·\s*([^·]+?)\s*(?:\s(?:less common|#\d+).*)?$/m) || [])[1] || "").trim().slice(0, 60); }
  }
  function vcCloseCard() { const sh = document.getElementById("sheet"); if (sh) sh.hidden = true; if (VCAP.resume) { VCAP.resume = false; vpPlay(); } }
  document.addEventListener("click", (e) => {
    const t = e.target.closest && e.target.closest("[data-act]"), a = t && t.dataset.act; if (!a || !/^vc-/.test(a)) return;
    if (a === "vc-w") vcWordCard(t);
    else if (a === "vc-close") vcCloseCard();
    else if (a === "vc-catch") { const d = vData(VP.id), c = VCAP.card; if (c && !d.c.some((x) => x.es.toLowerCase() === c.w.toLowerCase())) { d.c.push({ t: Math.floor(c.t), es: c.w, en: c.en }); save(); try { actAdd(1); } catch (x) {} vRedraw(); } vcCloseCard(); try { coachToast("Caught «" + c.w + "»"); } catch (x) {} }
    else if (a === "vc-seek") { vpSeek(+t.dataset.t); vpPlay(); VCAP.raw = -1; vcTick(true); }
    else if (a === "vc-en") { const P = vcPref(); P.en = !P.en; save(); t.setAttribute("aria-pressed", String(P.en)); const w = document.getElementById("vcap"); if (w) w.classList.toggle("show-en", P.en); if (P.en) vcFillEn(VCAP.cur); VCAP.cur = -2; }
    else if (a === "vc-cue") { UI.cues = !cueOn(); uiSave(); t.setAttribute("aria-pressed", String(cueOn())); VCAP.cur = -2; VCAP.word = -1; const tp = document.getElementById("vtip"); if (tp) { tp.hidden = true; tp.dataset.k = ""; } }
    else if (a === "vc-hide") { const P = vcPref(); P.hide = !P.hide; save(); t.setAttribute("aria-pressed", String(P.hide)); const w = document.getElementById("vcap"); if (w) w.classList.toggle("hide-text", P.hide); }
    else if (a === "vc-retry") { try { localStorage.removeItem("vcap:" + VP.id); } catch (x) {} vcCache.delete(VP.id); vcLoad(VP.id); }
  });
  function vcHTML() { const P = vcPref();
    return '<section class="vcapw" id="vcapw" aria-label="Captions"><div class="vcap-head"><span class="vcap-tg"><button class="btn small" data-act="vc-cue" aria-pressed="' + cueOn() + '">Cue tips</button><button class="btn small" data-act="vc-en" aria-pressed="' + !!P.en + '">English</button><button class="btn small" data-act="vc-hide" aria-pressed="' + !!P.hide + '">Just listen</button></span></div>' +
      '<div class="vcap" id="vcap"><div class="vcap-in" id="vcap-in"></div><div class="vcap-listen" aria-hidden="true">Listening mode: text hidden</div></div><p class="vcap-note small muted" id="vcap-note"></p></section>'; }
