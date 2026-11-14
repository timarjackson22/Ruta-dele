  /* ---------- videos: captions from the audio, word check, ad signals, playback report (tools/VIDEO_AUDIT_BRIEF.md) ---------- */
  // F. words that come up in songs and street Spanish
  Object.assign(VSLANG, {
    "mami": ["babe, darling (to a woman); also 'mum'", "Caribbean, Latin America"], "papi": ["babe, darling (to a man); also 'dad'", "Caribbean, Latin America"], "bebé": ["baby, darling", "everywhere (songs)"], "baby": ["baby, darling (from English)", "everywhere (songs)"], "mor": ["love (short for amor)", "Caribbean, Colombia"],
    "perreo": ["reggaeton dancing", "Puerto Rico, Latin America"], "perrear": ["to dance reggaeton", "Puerto Rico, Latin America"], "janguear": ["to hang out (from English)", "Puerto Rico"], "jangueo": ["hanging out, partying", "Puerto Rico"], "corillo": ["group of friends, crew", "Puerto Rico"],
    "flow": ["style, vibe (from English)", "everywhere (music)"], "rumbear": ["to party", "Colombia, Venezuela, Caribbean"], "parche": ["plan, group of friends", "Colombia"], "parchar": ["to hang out", "Colombia"], "vacilar": ["to have fun, to joke; to flirt", "Latin America"], "vacilón": ["fun, a laugh", "Latin America"], "vacile": ["fun, banter", "Latin America"],
    "guaya": ["a sad, heartbroken feeling", "Colombia, Puerto Rico (music)"], "dale": ["go on! let's go! OK!", "everywhere"], "fuego": ["hot, amazing (literally 'fire')", "songs"], "duro": ["great, tough (literally 'hard')", "Caribbean, Latin America"], "nena": ["girl, babe", "everywhere"], "nene": ["boy, babe", "everywhere"],
    "chimba": ["awesome (vulgar); also something bad", "Colombia"], "bandido": ["bad boy, player (literally 'bandit')", "songs"], "bandida": ["bad girl, player", "songs"], "shorty": ["girl (from English)", "songs"], "jevita": ["girlfriend, girl", "Caribbean, Venezuela"], "tiguere": ["street-smart guy", "Dominican Republic"],
    "bellaco": ["horny (vulgar)", "Puerto Rico"], "bellaca": ["horny (vulgar)", "Puerto Rico"], "wepa": ["yay! woo-hoo!", "Puerto Rico"], "sandunga": ["charm, grace; a party", "Caribbean, Mexico"], "parisear": ["to party", "Caribbean"], "rico": ["tasty; also hot, sexy", "everywhere"], "rica": ["tasty; also hot, sexy", "everywhere"],
    "parcerito": ["buddy", "Colombia"], "gonorrea": ["very good or very bad (vulgar)", "Colombia"], "pelada": ["girl (Colombia); also bald, broke", "Colombia"], "pelados": ["kids", "Panama, Colombia"], "chévere": ["great, cool", "Caribbean, Venezuela, Colombia, Panama"],
  });
  Object.assign(VSHORT, { "pa'l": "para el", "toy'": "estoy", "pa'ca": "para acá", "mija'": "mi hija", "na'ita": "nadita (nothing at all)", "pai": "papá (dad)", "mai": "mamá (mum)", "ma": "mamá / mami (mum, babe)" });

  // A. captions from the audio: the app listens to its own playback (Android 13+), saved per video
  const vaKey = (id) => "vaud:" + id;
  const vaGet = (id) => { try { return JSON.parse(localStorage.getItem(vaKey(id)) || "null"); } catch (e) { return null; } };
  const vaHas = (id) => { const x = vaGet(id); return !!(x && x.cues && x.cues.length); };
  const vaOk = () => { try { return !!(window.AndroidAud && window.AndroidAud.available()); } catch (e) { return false; } };
  const VA = { on: false, id: null, seg: null, cues: [], live: "" };
  function vaXml(cues) { return "<transcript>" + cues.map((c) => '<text start="' + c.s.toFixed(2) + '" dur="' + Math.max(0.5, c.e - c.s).toFixed(2) + '">' + esc(c.text) + "</text>").join("") + "</transcript>"; }
  function vaUse(id, keepYt) { const x = vaGet(id); if (!x) return; VCAP.fromAudio = true; vcGot(id, { kind: "audio", es: vaXml(x.cues), en: "", secs: VP.secs || 0 }); vData(id).cap = "audio"; save(); }
  function vcNoCaps(id) {
    if (vaHas(id)) { vaUse(id); return; }
    vcState("none");
    const w = document.querySelector("#vcap .vcap-msg"); if (!w) return;
    w.innerHTML = esc("This video has no Spanish captions on YouTube.") + (vaOk() ? ' <span class="small">The app can make them from the video\'s sound.</span><br><button class="btn small primary" data-act="va-start" style="margin-top:8px">' + IC("mic") + " Captions from the audio</button>" : " " + esc("Listen and catch words by ear."));
  }
  function vaStart() {
    if (!vaOk()) return;
    VA.id = VP.id; VA.cues = []; VA.seg = null; VA.live = "";
    vaBanner("Asking Android for permission to record the video's sound…");
    try { window.AndroidAud.start(S.region === "es" ? "es-ES" : "es-US"); } catch (e) { vaBanner("Couldn't start: " + e, true); }
  }
  function vaStop(save2) { if (!VA.on && !VA.id) return; try { window.AndroidAud && window.AndroidAud.stop(); } catch (e) {} if (save2 !== false) vaFinish(); VA.on = false; }
  function vaBanner(msg, err) {
    let b = document.getElementById("vabar"); const host = document.getElementById("vcapw"); if (!host) return;
    if (!b) { host.insertAdjacentHTML("afterbegin", '<p class="vabar small" id="vabar" role="status"></p>'); b = document.getElementById("vabar"); }
    if (!msg) { b.remove(); return; }
    b.className = "vabar small" + (err ? " err" : "") + (VA.on ? " on" : "");
    b.innerHTML = (VA.on ? '<i aria-hidden="true"></i>' : "") + "<span>" + esc(msg) + "</span>" + (VA.on ? ' <button class="btn small" data-act="va-stop">Stop</button>' : "");
  }
  window.__aaud = { ev(type, text) {
    if (!VA.id || VA.id !== VP.id) return;
    if (type === "state") {
      if (text === "listening") { VA.on = true; vaBanner("Listening to the video. Captions appear as they're spoken."); try { vpSeek(vpLo()); vpPlay(); } catch (e) {} vcState("loading"); const m = document.querySelector("#vcap .vcap-msg"); if (m) m.textContent = "Captions will appear here as the video speaks…"; }
      else if (text === "asking") vaBanner("Android will ask to record: choose Start (the app only listens to its own video).");
      else if (text === "stopped") { VA.on = false; vaFinish(); }
      else if (/^error:/.test(text)) { VA.on = false; vaBanner(text.slice(6), true); }
      return;
    }
    if (VP.ad) { VA.seg = null; return; } // an ad: not part of the video
    const t = vpT();
    if (type === "partial") { if (VA.seg == null) VA.seg = Math.max(vpLo(), t - 1.2); VA.live = text; vaShowLive(); return; }
    if (type === "final") {
      const s = VA.seg != null ? VA.seg : Math.max(vpLo(), t - Math.min(6, 0.35 * text.split(/\s+/).length)); VA.seg = null; VA.live = "";
      VA.cues.push({ s, e: Math.max(s + 0.6, t), text: vcClean(text) }); VA.cues.sort((a, b) => a.s - b.s);
      try { localStorage.setItem(vaKey(VA.id), JSON.stringify({ cues: VA.cues, at: Date.now(), done: false })); } catch (e) {}
      vcGot(VA.id, { kind: "audio", es: vaXml(VA.cues), en: "", secs: VP.secs || 0 }); vaShowLive();
    }
  } };
  function vaShowLive() { const inn = document.getElementById("vcap-in"); if (!inn) return; let l = document.getElementById("valive"); if (!VA.live) { if (l) l.remove(); return; } if (!l) { inn.insertAdjacentHTML("beforeend", '<p class="valive" id="valive" aria-live="polite"></p>'); l = document.getElementById("valive"); } l.textContent = VA.live + " …"; }
  function vaFinish() {
    const id = VA.id; if (!id) return; VA.on = false;
    if (VA.cues.length) { try { localStorage.setItem(vaKey(id), JSON.stringify({ cues: VA.cues, at: Date.now(), done: true })); } catch (e) {} vData(id).cap = "audio"; save(); vaBanner("Captions saved: next time this video has them from the start."); setTimeout(() => vaBanner(""), 5000); if (VP.id === id) vWordCheck(id); }
    else vaBanner("No speech was picked up. Is the volume on? Music can make it harder.", true);
    VA.id = null;
  }
  document.addEventListener("click", (e) => { const t = e.target.closest && e.target.closest("[data-act]"), a = t && t.dataset.act; if (a === "va-start") vaStart(); else if (a === "va-stop") vaStop(); else if (a === "va-redo") { try { localStorage.removeItem(vaKey(VP.id)); } catch (x) {} vaStart(); } else if (a === "v-report") vReport(); else if (a === "v-copyrep") { const ta = document.getElementById("vrep"); try { navigator.clipboard.writeText(ta.value); t.textContent = "Copied"; } catch (x) { ta.select(); document.execCommand("copy"); t.textContent = "Copied"; } } });

  // D. every word in the video in the dictionary: unknown words get a translation and are kept as video words
  const vLex = () => (S.vlex = S.vlex || {});
  async function vWordCheck(id) {
    if (VCAP.checked === id + ":" + VCAP.cues.length) return; VCAP.checked = id + ":" + VCAP.cues.length;
    try { await loadLex(); } catch (e) {}
    const seen = new Map();
    VCAP.cues.forEach((c) => { const ws = c.text.match(/[\p{L}'’]+/gu) || []; ws.forEach((w, i) => { const lw = w.toLowerCase().replace(/’/g, "'"); const name = i > 0 && /^\p{Lu}/u.test(w); if (!seen.has(lw)) seen.set(lw, { name, ex: c.text }); else if (!name) seen.get(lw).name = false; }); });
    const known = (w) => { try { if (TG[w] || TG[w.replace(/'+$/, "")]) return true; } catch (e) {} if (lexIdx(w) >= 0) return true; if (VSLANG[w] || VSHORT[w] || VJARGON[w] || vLex()[w]) return true; return !!vInformal(w, ""); };
    const todo = [...seen].filter(([w, o]) => !o.name && w.length > 1 && !/^\d/.test(w) && !known(w) && !known(w.replace(/^'+|'+$/g, ""))).slice(0, 60);
    VCAP.unknown = todo.map((x) => x[0]);
    if (!todo.length) return;
    let n = 0;
    for (const [w, o] of todo) {
      if (VP.id !== id) break;
      let en = ""; try { if (window.__trEn) en = String(await window.__trEn(w) || "").trim(); } catch (e) {}
      if (en && en.toLowerCase() === w) en = "";
      vLex()[w] = { en, v: id, ex: o.ex.slice(0, 160), t: Date.now() }; n++;
    }
    save();
    if (n && VP.id === id) try { coachToast(n + " new word" + (n > 1 ? "s" : "") + " from this video added to Words › Informal"); } catch (e) {}
  }

  // E. Words › Informal: slang, shortened forms, expressions, jargon and words learned from videos
  function infRows() {
    const rows = [];
    Object.entries(VSLANG).forEach(([w, m]) => rows.push([w, m[0], "Informal · " + m[1]]));
    Object.entries(VSHORT).forEach(([w, b]) => rows.push([w, "short for «" + b + "»", "Shortened form"]));
    Object.entries(VPHRASE).forEach(([w, m]) => rows.push([w, m[0], "Expression · " + m[1]]));
    Object.entries(VJARGON).forEach(([w, m]) => rows.push([w, m, "Jargon"]));
    Object.entries(vLex()).forEach(([w, o]) => { const v = vFind(o.v); rows.push([w, o.en || "(no translation yet)", "From a video" + (v ? " · " + v.t : ""), o.ex]); });
    return rows.sort((a, b) => a[0].localeCompare(b[0], "es"));
  }
  function infHTML(q) {
    const nq = (x) => String(x).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""), qq = nq(q || "");
    const rows = infRows().filter((r) => !qq || nq(r[0]).includes(qq) || nq(r[1]).includes(qq));
    return '<p class="muted small">' + rows.length + " informal words, shortened forms, expressions and jargon" + (Object.keys(vLex()).length ? ", including " + Object.keys(vLex()).length + " heard in your videos" : "") + ". They're coloured in the video captions; tap one there to hear it in context.</p>" +
      '<div class="tbl"><table class="words inf"><thead><tr><th>Spanish</th><th>English</th><th>Kind</th></tr></thead><tbody>' +
      rows.map((r) => '<tr><td lang="es"><b>' + esc(r[0]) + "</b>" + (r[3] ? '<br><span class="muted small">«' + esc(r[3]) + "»</span>" : "") + "</td><td>" + esc(r[1]) + '</td><td class="muted small">' + esc(r[2]) + "</td></tr>").join("") + "</tbody></table></div>";
  }

  // C. ads: YouTube's own signals, when its player sends them, plus a playback report to send if anything still drifts
  const VDIAG = [];
  addEventListener("message", (e) => {
    if (!/youtube/.test(String(e.origin))) return; let d; try { d = typeof e.data === "string" ? JSON.parse(e.data) : e.data; } catch (x) { return; }
    if (!d || d.event !== "infoDelivery" || !d.info) return;
    const keys = Object.keys(d.info), adKey = keys.find((k) => /^(ad|isAd|adState|adPlaying|showAd)/i.test(k));
    VP.ytAd = adKey ? !!d.info[adKey] && d.info[adKey] !== "0" : VP.ytAd;
    if (VDIAG.length < 400) VDIAG.push({ at: Math.round(performance.now() / 100) / 10, msg: keys.slice(0, 12).join(",") + (adKey ? " " + adKey + "=" + JSON.stringify(d.info[adKey]) : "") });
  });
  setInterval(() => { if (!VP.p || !VP.ready || !VP.id) return; let r = {}; try { r = { t: Math.round(VP.p.getCurrentTime() * 10) / 10, d: Math.round(VP.p.getDuration()), st: VP.p.getPlayerState(), vid: (VP.p.getVideoData() || {}).video_id, fr: Math.round((VP.p.getVideoLoadedFraction ? VP.p.getVideoLoadedFraction() : 0) * 100) / 100 }; } catch (e) {} r.ad = !!VP.ad; r.secs = VP.secs; VDIAG.push(r); if (VDIAG.length > 400) VDIAG.splice(0, 100); }, 1000);
  function vReport() {
    const v = vFind(VP.id) || {}, txt = "Ruta DELE playback report\nvideo: " + VP.id + " " + (v.t || "") + "\nbuild: " + (window.__BUILD || "") + "\nUA: " + navigator.userAgent + "\nreal length: " + (VP.secs || "unknown") + "\n" + VDIAG.slice(-150).map((x) => JSON.stringify(x)).join("\n");
    openSheet('<div class="row" style="justify-content:space-between"><b>Playback report</b><button class="btn small" data-act="l-close">Close</button></div><p class="small muted">What the YouTube player reported over the last minutes (times, lengths, ads). Copy it and send it in the chat if the captions or the start time go wrong.</p><textarea id="vrep" class="extxt" rows="8" readonly>' + esc(txt) + '</textarea><div class="row" style="margin-top:8px"><button class="btn primary small" data-act="v-copyrep">Copy</button></div>');
  }
  document.addEventListener("click", (e) => { const t = e.target.closest && e.target.closest('[data-act="w-inf"], [data-act="w-type"]'); if (!t) return; if (t.dataset.act === "w-inf") { e.stopImmediatePropagation(); WV.inf = !WV.inf; if (WV.inf) WV.types = []; wordsView(); } else WV.inf = false; }, true);
