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
    if (!VL.tried[id] && !vlOff(id) && vlMusic(id)) { VL.tried[id] = 1; vlTry(id).then((ok) => { if (!ok && VCAP.id === id) vcNoCaps(id); }); return; }
    if (vaHas(id)) { vaUse(id); return; }
    vcState("none");
    const w = document.querySelector("#vcap .vcap-msg"); if (!w) return;
    w.innerHTML = esc("This video has no Spanish captions on YouTube.") + (vaOk() ? ' <span class="small">The app can make them from the video\'s sound.</span><br><button class="btn small primary" data-act="va-start" style="margin-top:8px">' + IC("mic") + " Captions from the audio</button>" : " " + esc("Listen and catch words by ear."));
  }
  function vaStart() {
    if (!vaOk()) return;
    VA.id = VP.id; VA.cues = []; VA.seg = null; VA.live = ""; VA.peak = 0; VA.levels = 0; VA.engine = "";
    vaBanner("Asking Android for permission to record the video's sound…");
    const mode = vaMode(); VA.mode = mode;
    try { const L = S.region === "es" ? "es-ES" : "es-US"; if (window.AndroidAud.startMode) window.AndroidAud.startMode(L, mode); else window.AndroidAud.start(L); } catch (e) { vaBanner("Couldn't start: " + e, true); }
  }
  // which recogniser makes captions from the sound: on the phone (offline) or Google online (often catches more words)
  // default: Google's online recogniser, which catches clearly more words of real video speech than the phone's offline model (S24 report, Nov 2026); "Redo on the phone (offline)" switches
  const vaMode = () => { try { return localStorage.getItem("ruta-va-mode") || "online"; } catch (e) { return "online"; } };
  function vaRedoOnline() { try { localStorage.setItem("ruta-va-mode", "online"); localStorage.removeItem(vaKey(VP.id)); } catch (e) {} vaStart(); }
  function vaRedoPhone() { try { localStorage.setItem("ruta-va-mode", "phone"); localStorage.removeItem(vaKey(VP.id)); } catch (e) {} vaStart(); }
  document.addEventListener("click", (e) => { const t = e.target.closest && e.target.closest('[data-act="va-online"],[data-act="va-phone"]'); if (!t) return; if (t.dataset.act === "va-online") vaRedoOnline(); else vaRedoPhone(); });
  function vaStop(save2) { if (!VA.on && !VA.id) return;
    try { const st = (new Error().stack || "").split("\n").slice(2, 4).map((x) => x.trim().replace(/^at /, "").replace(/\(.*\)/, "").trim()).join(" < "); window.__pvLog && window.__pvLog("video-audio stop asked by the app: " + st + " · video at " + (typeof vpT === "function" ? Math.round(vpT()) : "?") + "s"); } catch (e) {} try { window.AndroidAud && window.AndroidAud.stop(); } catch (e) {} if (save2 !== false) vaFinish(); VA.on = false; }
  function vaBanner(msg, err) {
    let b = document.getElementById("vabar"); const host = document.getElementById("vcapw"); if (!host) return;
    if (!b) { host.insertAdjacentHTML("afterbegin", '<p class="vabar small" id="vabar" role="status"></p>'); b = document.getElementById("vabar"); }
    if (!msg) { b.remove(); return; }
    b.className = "vabar small" + (err ? " err" : "") + (VA.on ? " on" : "");
    b.innerHTML = (VA.on ? '<i aria-hidden="true"></i>' : "") + "<span>" + esc(msg) + "</span>" + (VA.on ? ' <button class="btn small" data-act="va-stop">Stop</button>' : "");
  }
  window.__aaud = { ev(type, text) {
    try { if (type !== "partial" && window.__pvLog && (type !== "level" || (VA.lvN = (VA.lvN || 0) + 1) % 10 === 1)) window.__pvLog("video-audio " + type + " " + String(text || "").slice(0, 60) + (type === "level" ? " (peak so far " + (VA.peak || 0).toFixed(3) + ")" : "")); } catch (e) {}
    if (!VA.id || VA.id !== VP.id) return;
    if (type === "level") { const x = +text || 0; VA.levels++; if (!VP.ad) VA.peak = Math.max(VA.peak || 0, x); return; }
    if (type === "state" && /^engine:/.test(text)) { VA.engine = text.slice(7); return; }
    if (type === "state") {
      if (text === "listening" && VA.sync) { VA.on = true; vaBanner("Syncing: the video plays from the start while the app listens to the singing (up to a minute)…"); try { vpSeek(vpLo()); vpPlay(); } catch (e) {} }
      else if (text === "listening") { VA.on = true; vaBanner("Listening to the video. Captions appear as they're spoken."); try { vpSeek(vpLo()); vpPlay(); } catch (e) {} vcState("loading"); const m = document.querySelector("#vcap .vcap-msg"); if (m) m.textContent = "Captions will appear here as the video speaks…"; }
      else if (text === "asking") vaBanner("Android will ask to record: choose Start (the app only listens to its own video).");
      else if (text === "stopped") { VA.on = false; vaFinish(); }
      else if (text === "error:no-lang") { VA.on = false; vaBanner("Spanish speech recognition isn't downloaded on this phone, and no online speech service answered.", true); const b = document.getElementById("vabar"); if (b && window.__pvModelDl) b.insertAdjacentHTML("beforeend", ' <button class="btn small primary" data-act="pv-model-dl">Download Spanish</button>'); }
      else if (/^error:/.test(text)) { VA.on = false; vaBanner(text.slice(6), true); }
      return;
    }
    if (VP.ad) { VA.seg = null; return; } // an ad: not part of the video
    const t = vpT();
    if (type === "partial") { if (VA.seg == null) VA.seg = Math.max(vpLo(), t - 1.2); VA.live = VA.sync ? "" : text; vaShowLive(); return; }
    if (type === "final") {
      const s = VA.seg != null ? VA.seg : Math.max(vpLo(), t - Math.min(6, 0.35 * text.split(/\s+/).length)); VA.seg = null; VA.live = "";
      if (VA.sync) { vlSyncHit(text, s); vaShowLive(); return; }
      VA.cues.push({ s, e: Math.max(s + 0.6, t), text: vcClean(text) }); VA.cues.sort((a, b) => a.s - b.s);
      try { localStorage.setItem(vaKey(VA.id), JSON.stringify({ cues: VA.cues, at: Date.now(), done: false })); } catch (e) {}
      vcGot(VA.id, { kind: "audio", es: vaXml(VA.cues), en: "", secs: VP.secs || 0 }); vaShowLive();
    }
  } };
  function vaShowLive() { const inn = document.getElementById("vcap-in"); if (!inn) return; let l = document.getElementById("valive"); if (!VA.live) { if (l) l.remove(); return; } if (!l) { inn.insertAdjacentHTML("beforeend", '<p class="valive" id="valive" aria-live="polite"></p>'); l = document.getElementById("valive"); } l.textContent = VA.live + " …"; }
  function vaFinish() {
    const id = VA.id; if (!id) return; VA.on = false;
    if (VA.sync || VL.sync) { VA.id = null; if (VL.sync) vlSyncEnd(false); return; }
    if (VA.cues.length) { try { localStorage.setItem(vaKey(id), JSON.stringify({ cues: VA.cues, at: Date.now(), done: true })); } catch (e) {} vData(id).cap = "audio"; save(); vaBanner("Captions saved: next time this video has them from the start."); { const b = document.getElementById("vabar"); if (b) b.insertAdjacentHTML("beforeend", VA.mode === "online" ? ' <button class="btn small" data-act="va-phone">Redo on the phone (offline)</button>' : ' <button class="btn small" data-act="va-online">Missed words? Redo with Google online</button>'); } setTimeout(() => { const b = document.getElementById("vabar"); if (b && !b.querySelector("[data-act=va-online],[data-act=va-phone]")) vaBanner(""); }, 5000); if (VP.id === id) vWordCheck(id); }
    else if (VA.levels > 4 && (VA.peak || 0) < 0.003) vaBanner("The video's sound didn't reach the app: Android passed it silence. Turn the media volume up (not muted), start again and choose Start on Android's prompt. If it still happens, this phone doesn't allow the app to record its own video sound.", true);
    else if (!(window.AndroidApp && window.AndroidApp.version)) vaBanner("The sound reached the app but no Spanish speech was recognised. Your Android app is an older version: update it (Settings › App shows the version; download the latest from the Ruta DELE page) — the new one uses Google's speech service, which works with Samsung phones.", true);
    else vaBanner("The sound reached the app but no Spanish speech was recognised" + (VA.engine ? " (" + (VA.engine === "on-device" ? "on-device recogniser" : VA.engine === "google" ? "Google speech service" : "phone's speech service") + ")" : "") + ". Music makes it harder: try a spoken video. It helps if Spanish is one of your voice languages: Google app › your profile picture › Settings › Voice › Languages.", true);
    if (!VA.cues.length && VA.levels > 4 && (VA.peak || 0) >= 0.003) { const b = document.getElementById("vabar"); if (b && !b.querySelector("[data-act^=va-]")) b.insertAdjacentHTML("beforeend", VA.mode === "online" ? "" : ' <button class="btn small primary" data-act="va-online">Try Google online</button>'); }
    VA.id = null;
  }
  document.addEventListener("click", (e) => { const t = e.target.closest && e.target.closest("[data-act]"), a = t && t.dataset.act; if (a === "va-start") vaStart(); else if (a === "va-stop") vaStop(); else if (a === "va-redo") { try { localStorage.removeItem(vaKey(VP.id)); } catch (x) {} vaStart(); } else if (a === "v-report") vReport(); else if (a === "v-copyrep") { const ta = document.getElementById("vrep"); try { navigator.clipboard.writeText(ta.value); t.textContent = "Copied"; } catch (x) { ta.select(); document.execCommand("copy"); t.textContent = "Copied"; } } });

  // D. every word in the video in the dictionary: unknown words get a translation and are kept as video words
  const vLex = () => (S.vlex = S.vlex || {});
  async function vWordCheck(id) {
    if (VCAP.checked === id + ":" + VCAP.cues.length) return; VCAP.checked = id + ":" + VCAP.cues.length;
    try { await loadLex(); } catch (e) {}
    VCAP.cues.forEach((c) => { c.gl = null; }); VCAP.word = -1; // the full dictionary is in: work out the Verbatim bubbles again
    const seen = new Map();
    VCAP.cues.forEach((c) => { const ws = c.text.match(/[\p{L}'’]+/gu) || []; ws.forEach((w, i) => { const lw = w.toLowerCase().replace(/’/g, "'"); const name = i > 0 && /^\p{Lu}/u.test(w); if (!seen.has(lw)) seen.set(lw, { name, ex: c.text }); else if (!name) seen.get(lw).name = false; }); });
    const known = (w) => { try { if (TG[w] || TG[w.replace(/'+$/, "")]) return true; } catch (e) {} if (lexIdx(w) >= 0) return true; if (VSLANG[w] || VSHORT[w] || VJARGON[w] || vLex()[w]) return true; return !!vInformal(w, ""); };
    const todo = [...seen].filter(([w, o]) => !o.name && w.length > 1 && !/^\d/.test(w) && !known(w) && !known(w.replace(/^'+|'+$/g, ""))).slice(0, 60);
    VCAP.unknown = todo.map((x) => x[0]);
    if (!todo.length) return;
    let n = 0;
    for (const [w, o] of todo) {
      if (VP.id !== id) break;
      const m = vMorph(w); let en = m ? m.en : ""; // a word built from a known one (abracito → little hug) needs no translator
      if (!en) { try { if (window.__trEn) en = String(await window.__trEn(w) || "").trim(); } catch (e) {} }
      if (en && en.toLowerCase() === w) en = "";
      vLex()[w] = Object.assign({ en, v: id, ex: o.ex.slice(0, 160), t: Date.now() }, m && m.base ? { base: m.base, how: m.how } : {}); n++;
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
    Object.entries(vLex()).forEach(([w, o]) => { const v = vFind(o.v); rows.push([w, o.en || "(no translation yet)", "From a video" + (o.base ? " · from «" + o.base + "»" : "") + (v ? " · " + v.t : ""), o.ex]); });
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
  /* ===== songs: real synced lyrics as captions (LRCLIB, free and open; tools/VIDEO_LYRICS_BRIEF.md) ===== */
  const VL = { tried: {}, sync: null };
  const vlKey = (id) => "lrc:" + id;
  function vlGet(id) { try { return JSON.parse(localStorage.getItem(vlKey(id)) || "null"); } catch (e) { return null; } }
  function vlPut(id, x) { try { localStorage.setItem(vlKey(id), JSON.stringify(x)); } catch (e) {} }
  // is this a song? the library's music, or a video whose title/channel says so
  function vlMusic(id) { const v = vFind(id) || {}; return v.cat === "musica" || /\b(official (music )?video|video oficial|videoclip|lyrics?|letra|ft\.|feat\.|vevo|music)\b/i.test((v.t || "") + " " + (v.ch || "")); }
  // what to search for: the library knows song and artist; a video you added only has YouTube's title ("Artist - Song (Official Video)") and channel ("ArtistVEVO")
  const vlJunk = (t) => String(t || "").replace(/[\(\[][^\)\]]*(?:en vivo|live|official|oficial|video|videoclip|lyrics?|letra|audio|visualizer|visualiser|hd|4k|remaster|explicit)[^\)\]]*[\)\]]/gi, "").replace(/\b(?:official (?:music )?video|video oficial|videoclip oficial|lyric video|con letra|letra|lyrics)\b/gi, "").replace(/\s+(?:ft\.?|feat\.?|featuring|con)\s.*$/i, "").replace(/["“”«»]/g, "").replace(/\s+/g, " ").replace(/^[\s\-–|:]+|[\s\-–|:]+$/g, "").trim();
  const vlArtist = (a) => String(a || "").replace(/vevo$/i, "").replace(/\s*-\s*topic$/i, "").replace(/\b(?:music|official|oficial|tv|records|channel)\b/gi, "").split(/,|&| y | x | ft\.| feat\./i)[0].replace(/([a-z])([A-Z])/g, "$1 $2").replace(/\s+/g, " ").trim();
  function vlQueries(id) { const v = vFind(id) || {}, T = String(v.t || ""), ch = vlArtist(v.ch), out = [];
    const add = (track, artist) => { track = vlJunk(track); artist = vlArtist(artist); if (track && track.toLowerCase() !== artist.toLowerCase() && !out.some((q) => q.track.toLowerCase() === track.toLowerCase() && q.artist.toLowerCase() === artist.toLowerCase())) out.push({ track, artist }); };
    const parts = T.split(/\s+[-–—|]\s+/).map(vlJunk).filter(Boolean);
    if (!v.mine) add(T.split(/\s+[-–—|]\s+/)[0], v.ch);
    const lo = (x) => String(x).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""), ci = ch ? parts.findIndex((x) => lo(vlArtist(x)) === lo(ch) || lo(x).includes(lo(ch))) : -1;
    if (parts.length >= 2 && ci >= 0) add(parts[ci === 0 ? 1 : 0], parts[ci]);
    if (parts.length >= 2) { add(parts[1], parts[0]); add(parts[0], parts[1]); if (ch) { add(parts[1], ch); add(parts[0], ch); } }
    else add(T, ch);
    return out.slice(0, 4); }
  const vlQuery = (id) => vlQueries(id)[0] || { track: "", artist: "" };
  function vlParse(lrc) { const out = []; String(lrc || "").split("\n").forEach((ln) => { const m = ln.match(/^\[(\d+):(\d+(?:\.\d+)?)\]\s*(.*)$/); if (m && m[3].trim()) out.push({ t: +m[1] * 60 + +m[2], text: m[3].trim() }); }); return out; }
  // the closest recording to this video: synced lyrics, length nearest the video's
  async function vlFetch(id) {
    const Q = vlQueries(id); if (!Q.length) return null; const v = vFind(id) || {};
    const L = VP.secs || VP.dur || 0, get = async (p) => { const ac = new AbortController(), tm = setTimeout(() => ac.abort(), 7000); const r = await fetch("https://lrclib.net/api/search?" + new URLSearchParams(p), { signal: ac.signal }); clearTimeout(tm); return r.ok ? r.json() : []; };
    const good = (rows, strict) => rows.filter((x) => x.syncedLyrics && vlParse(x.syncedLyrics).length > 4 && (!strict || !L || Math.abs((x.duration || 0) - L) < 30));
    let ok = [];
    try {
      for (const q of Q) { ok = good(await get(q.artist ? { track_name: q.track, artist_name: q.artist } : { track_name: q.track }), !!v.mine); if (ok.length) break; }
      if (!ok.length) ok = good(await get({ q: (Q[0].track + " " + Q[0].artist).trim() }), true); // last try: the words anywhere, but only a recording of the video's length
    } catch (e) { pvl("lyrics lookup failed: " + e); return null; }
    if (!ok.length) return null;
    ok.sort((a, b) => (L ? Math.abs(a.duration - L) - Math.abs(b.duration - L) : 0));
    const best = ok[0], lines = vlParse(best.syncedLyrics);
    // a music video is often longer than the record (an intro): first guess, the extra length if the song would otherwise start before the music
    const extra = L && best.duration ? L - best.duration : 0, off = extra > 2 && extra < 40 && lines[0].t < 3 ? Math.round(extra * 10) / 10 : 0;
    return { src: best.id, track: best.trackName, artist: best.artistName, dur: best.duration, lines, off, guessed: !!off || Math.abs(extra) > 2, at: Date.now() };
  }
  // no lyrics in LRCLIB: borrow the captions of another upload of the same song (a fan "letra" video often has captions typed by a person). Android app only.
  function vlAndroid(fn, arg) { return new Promise((res) => { if (!window.AndroidCap || !window.AndroidCap[fn]) return res(null); const rid = "l" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    window.__acap = window.__acap || { cbs: {}, ev(k, json, err) { const f = this.cbs[k]; delete this.cbs[k]; if (f) f(json, err); } };
    const tm = setTimeout(() => { delete window.__acap.cbs[rid]; res(null); }, 20000); window.__acap.cbs[rid] = (json, err) => { clearTimeout(tm); try { res(err || !json ? null : JSON.parse(json)); } catch (e) { res(null); } };
    try { window.AndroidCap[fn](rid, arg); } catch (e) { clearTimeout(tm); res(null); } }); }
  async function vlBorrow(id) {
    if (!window.AndroidCap || !window.AndroidCap.search) return null;
    const v = vFind(id) || {}, q = vlQuery(id), L = VP.secs || VP.dur || 0; if (!q.track) return null;
    // the title's parts ("Song", "Artist"): an upload of the same song has every word of one part and at least half of the other's
    const parts = (v.mine ? String(v.t || "").split(/\s+[-–—|]\s+/).map(vlJunk).filter(Boolean) : [q.track, q.artist].filter(Boolean)).map(vlNorm).filter((x) => x.length);
    const same = (t) => { const w = vlNorm(t || ""); return parts.some((a, i) => a.every((x) => w.includes(x)) && parts.every((b, k) => k === i || b.filter((x) => w.includes(x)).length * 2 >= b.length)); };
    const rows = await vlAndroid("search", (v.mine ? vlJunk(String(v.t || "").replace(/\s+[-–—|]\s+/g, " ")) : q.track + " " + q.artist) + " letra"); if (!Array.isArray(rows)) { pvl("borrow: search failed"); return null; }
    const cands = rows.filter((r) => r.id !== id && (!L || !r.secs || Math.abs(r.secs - L) <= 15) && same(r.t)).slice(0, 4);
    pvl("borrow: " + rows.length + " results, " + cands.length + " of the same song and length");
    for (const c of cands) {
      const r = await vlAndroid("fetch", c.id);
      if (!r || r.kind !== "manual" || !r.es) continue;
      const lines = vcParse(r.es).map((x) => ({ t: x.s, text: vcClean ? vcClean(x.text) : x.text })).filter((x) => x.text && /\p{L}/u.test(x.text));
      if (lines.length < 6) continue;
      pvl("borrow: using the captions of " + c.id + " «" + (c.t || "") + "»");
      const extra = L && r.secs ? L - +r.secs : 0;
      return { src: "yt:" + c.id, from: "yt", track: q.track, artist: q.artist, dur: +r.secs || 0, lines, off: 0, guessed: Math.abs(extra) > 2, at: Date.now() };
    }
    return null;
  }
  const pvl = (x) => { try { window.__pvLog && window.__pvLog("lyrics " + x); } catch (e) {} };
  async function vlLen() { for (let i = 0; i < 30 && !(VP.secs || VP.dur); i++) { try { VP.dur = (VP.p && VP.p.getDuration && VP.p.getDuration()) || VP.dur; } catch (e) {} if (!(VP.secs || VP.dur)) await new Promise((r) => setTimeout(r, 100)); } return VP.secs || VP.dur || 0; }
  async function vlTry(id) {
    let x = vlGet(id); if (!x) await vlLen();
    if (!x) { x = await vlFetch(id); if (!x && VCAP.id === id) x = await vlBorrow(id); if (x) vlPut(id, x); }
    if (!x || VCAP.id !== id) { pvl(x ? "page changed" : "none found for " + JSON.stringify(vlQuery(id))); return false; }
    pvl("using LRCLIB #" + x.src + " " + x.artist + " – " + x.track + " (offset " + x.off + "s)");
    vlShow(id, x); return true;
  }
  function vlShow(id, x) {
    const L = x.lines, xml = "<transcript>" + L.map((l, i) => { const s = l.t + (x.off || 0), e = L[i + 1] ? L[i + 1].t + (x.off || 0) : s + 4; return '<text start="' + Math.max(0, s).toFixed(2) + '" dur="' + Math.max(0.6, e - s).toFixed(2) + '">' + esc(l.text) + "</text>"; }).join("") + "</transcript>";
    vcGot(id, { kind: "lyrics", es: xml, en: "", secs: VP.secs || 0 });
  }
  // the note under the lyrics: where they come from, and one button that lines them up with the video
  function vlNote() { const x = vlGet(VCAP.id) || {}, failed = VL.failed === VCAP.id, auto = vaOk() && !failed;
    const src = x.from === "yt" ? "Lyrics from another YouTube upload of this song" : "Song lyrics" + (x.artist ? ": " + x.artist + " – " + x.track : "");
    const btn = VL.sync ? '<span class="vlnow">Syncing…</span>' : auto ? '<button class="btn small primary" data-act="vl-auto">' + (x.synced ? "Sync again" : "Sync with the video") + "</button>" : '<button class="btn small primary" data-act="vl-tap">Tap when the singing starts</button>';
    return esc(src + (x.synced ? " · synced ✓" : "")) + ' <span class="vlsync">' + btn + '<button class="lnk" data-act="vl-off">Wrong song?</button></span> '; }
  function vlNudge(d) { const id = VCAP.id, x = vlGet(id); if (!x) return; x.off = Math.round(((x.off || 0) + d) * 10) / 10; x.guessed = false; vlPut(id, x); const keep = VCAP.cur; vlShow(id, x); vlSaid("Lyrics " + (d > 0 ? "later" : "earlier") + " · offset " + x.off.toFixed(1) + " s"); }
  // tap when you hear the first sung line: that line starts now
  function vlTapFirst() { const id = VCAP.id, x = vlGet(id); if (!x) return; const t = vpT(); x.off = Math.round((t - x.lines[0].t - 0.3) * 10) / 10; x.guessed = false; x.synced = true; vlPut(id, x); vlShow(id, x); vlSaid("Synced: the first line starts at " + Math.max(0, t - 0.3).toFixed(1) + " s"); }
  function vlSaid(m) { try { coachToast("🎵 " + m); } catch (e) {} }
  // automatic sync: listen to a little of the sound, match what is heard to the lyrics, set the offset from the agreeing matches
  const vlNorm = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9ñ ]/g, " ").split(/\s+/).filter((w) => w.length > 2);
  function vlSyncStart() { const x = vlGet(VCAP.id); if (!x || !vaOk()) return; VL.sync = { id: VCAP.id, hits: [], t0: Date.now() }; VL.failed = null; VA.sync = true; vaStart(); vlShow(VCAP.id, x);  setTimeout(() => { if (VL.sync && Date.now() - VL.sync.t0 >= 75000) vlSyncEnd(false); }, 76000); }
  function vlSyncHit(text, s) {
    const S2 = VL.sync; if (!S2) return; const x = vlGet(S2.id); if (!x) return; const hw = vlNorm(text); if (hw.length < 2) return;
    let best = -1, bs = 0; x.lines.forEach((l, i) => { const lw = vlNorm(l.text); if (!lw.length) return; const set = new Set(lw); const k = hw.filter((w) => set.has(w)).length / Math.max(3, Math.min(hw.length, lw.length)); if (k > bs) { bs = k; best = i; } });
    if (best < 0 || bs < 0.5) return; S2.hits.push(s - x.lines[best].t); pvl("sync hit «" + text + "» ≈ line " + (best + 1) + " → " + (s - x.lines[best].t).toFixed(1) + "s");
    const H = S2.hits.slice().sort((a, b) => a - b), med = H[Math.floor(H.length / 2)], agree = H.filter((h) => Math.abs(h - med) < 1.5).length;
    if (agree >= 2) { x.off = Math.round(med * 10) / 10; x.guessed = false; x.synced = true; vlPut(S2.id, x); vlSyncEnd(true); }
  }
  function vlSyncEnd(ok) { const S2 = VL.sync; VL.sync = null; VA.sync = false; VA.id = null; VA.on = false; try { window.AndroidAud && window.AndroidAud.stop(); } catch (e) {} try { vaBanner(""); } catch (e) {} const x = S2 && vlGet(S2.id); if (ok && x && VCAP.id === S2.id) { vlShow(S2.id, x); vlSaid("Lyrics lined up with the video (offset " + x.off.toFixed(1) + " s)."); } else if (!ok) { VL.failed = S2 && S2.id; if (S2 && VCAP.id === S2.id && x) vlShow(S2.id, x); vlSaid("Couldn't hear enough of the singing to sync. Tap the button when the singing starts."); } }
  document.addEventListener("click", (e) => { const t = e.target.closest && e.target.closest("[data-act^=vl-]"), a = t && t.dataset.act; if (!a) return;
    if (a === "vl-early") vlNudge(-0.5); else if (a === "vl-late") vlNudge(0.5); else if (a === "vl-tap") vlTapFirst(); else if (a === "vl-auto") vlSyncStart(); else if (a === "vl-off") { const id = VCAP.id; try { localStorage.setItem("lrc-off:" + id, "1"); } catch (x) {} VL.tried[id] = 1; vcLoad(id); } });
  const vlOff = (id) => { try { return localStorage.getItem("lrc-off:" + id) === "1"; } catch (e) { return false; } };
