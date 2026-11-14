  /* ===================== videos: watch Spanish and practise with it (tools/VIDEO_BRIEF.md) ===================== */
  const VID_START = [
    { yt: "2GrDFoMl978", t: "Citas a ciegas (Blind Dates)", ch: "Dreaming Spanish", lvl: "A2", note: "Gabriel, from Spain, joins a dating show and talks with three women he can't see.",
      q: [["¿De dónde es Gabriel?", ["De España", "De México", "De Argentina"], 0], ["¿Qué hace María, la primera cita?", ["Es influencer", "Es médica", "Es profesora"], 0], ["¿Qué escritor le gusta a Sofía?", ["Gabriel García Márquez", "Pablo Neruda", "Jorge Luis Borges"], 0], ["¿Cómo termina la historia?", ["Sofía lo rechaza al final", "Gabriel y Sofía se casan", "Gabriel elige a María"], 0]] },
    { yt: "rw-DW_YlfoI", t: "If you are a beginner, watch this", ch: "Spanish After Hours", lvl: "A1", note: "Everyday actions, sitting and reading, explained with simple objects; present and past.", q: [] },
    { yt: "rqiOwOmYO80", t: "¿Cuál es tu nivel de español?", ch: "Dreaming Spanish", lvl: "A1–C1", note: "Four short clips that get harder, from superbeginner to advanced: see how far you follow.", q: [] },
    { yt: "ot5L3fIl0z0", t: "¿Cuál es el mejor lugar para vivir?", ch: "Easy Spanish", lvl: "B1", note: "Street interviews in Mexico: where people would like to live, and why.",
      q: [["Para elegir dónde vivir, ¿qué es importante para los entrevistados?", ["El precio y la seguridad", "Tener playa cerca", "Que haya muchos turistas"], 0], ["Si se fueran a vivir lejos, ¿qué extrañarían?", ["La familia, la comida y sus mascotas", "El tráfico", "El frío"], 0], ["¿Hace falta hablar el idioma del país, según ellos?", ["Ayuda, pero no es imprescindible", "Sí, es obligatorio", "No sirve para nada"], 0]] },
  ];
  const ytId = (s) => { const m = /(?:youtu\.be\/|[?&]v=|\/shorts\/|\/embed\/|\/live\/)([\w-]{11})/.exec(String(s || "")) || /^([\w-]{11})$/.exec(String(s || "").trim()); return m ? m[1] : null; };
  const vMine = () => (S.myv = S.myv || []);
  const vData = (id) => { S.vid = S.vid || {}; return (S.vid[id] = S.vid[id] || { c: [] }); };
  const vFind = (id) => VID_START.find((v) => v.yt === id) || vMine().find((v) => v.yt === id) || null;
  const vThumb = (id) => "https://i.ytimg.com/vi/" + id + "/mqdefault.jpg";
  async function vTitle(id) { try { const r = await fetch("https://www.youtube.com/oembed?format=json&url=" + encodeURIComponent("https://www.youtube.com/watch?v=" + id)); if (!r.ok) return null; const j = await r.json(); return { t: j.title, ch: j.author_name }; } catch (e) { return null; } }
  function vAdd(link, title) {
    const id = ytId(link); if (!id) return null;
    if (!vFind(id)) { vMine().unshift({ yt: id, t: title || "My video", ch: "", lvl: "", added: Date.now(), mine: 1 }); save(); vTitle(id).then((m) => { const v = vMine().find((x) => x.yt === id); if (m && v && (!title || v.t === "My video")) { v.t = m.t; v.ch = m.ch; save(); if (/^#video/.test(location.hash)) route(); } }); }
    return id;
  }
  function videosHub() {
    const card = (v) => { const d = (S.vid || {})[v.yt] || {}, n = (d.c || []).length;
      return '<a class="vcard" href="#video-' + v.yt + '"><span class="vthumb"><img src="' + vThumb(v.yt) + '" alt="" loading="lazy" onerror="this.style.display=\'none\'"><span class="vplay" aria-hidden="true">' + IC("play") + "</span>" + (d.w ? '<span class="vdone">' + IC("check") + " Watched</span>" : "") + '</span><span class="vtxt"><b>' + esc(v.t) + "</b><small>" + esc([v.ch, v.lvl].filter(Boolean).join(" · ") || "Your video") + (n ? " · " + n + " word" + (n > 1 ? "s" : "") + " caught" : "") + "</small></span></a>"; };
    app.innerHTML = '<div class="ui-page">' + uiTitle("Videos", "Watch real Spanish, then practise with it: catch words, shadow the speakers, answer and retell.", "", "Ver y practicar") +
      '<form class="vadd" id="vadd"><label class="sr" for="vlink">YouTube link</label><input id="vlink" type="text" inputmode="url" autocapitalize="off" spellcheck="false" placeholder="Paste a YouTube link" autocomplete="off"><button class="btn primary" type="submit">Add</button></form>' +
      '<p class="gfoot" style="margin-top:6px">' + (/Android/i.test(navigator.userAgent) ? "Tip: in the YouTube app, tap Share › Ruta DELE to add a video here." : "Tip: in YouTube, tap Share › Copy link, then paste it here.") + ' <span id="vadd-msg" role="status"></span></p>' +
      (vMine().length ? '<h2 class="ghead">My videos</h2><div class="vgrid">' + vMine().map(card).join("") + "</div>" : "") +
      '<h2 class="ghead">Start here</h2><div class="vgrid">' + VID_START.map(card).join("") + "</div>" +
      '<p class="gfoot">Videos play from YouTube inside the app. Starter videos are from Dreaming Spanish, Spanish After Hours and Easy Spanish.</p></div>';
  }
  document.addEventListener("submit", (e) => {
    if (e.target.id !== "vadd") return; e.preventDefault();
    const v = document.getElementById("vlink").value, id = vAdd(v); const m = document.getElementById("vadd-msg");
    if (!id) { if (m) m.textContent = "That doesn't look like a YouTube link."; return; }
    location.hash = "#video-" + id;
  });

  /* ---------- the player page ---------- */
  const VP = { p: null, ready: false, id: null, loop: null, rate: 1, tick: null, dur: 0, failed: false };
  function ytApi() { return new Promise((res) => { if (window.YT && window.YT.Player) return res(window.YT); const prev = window.onYouTubeIframeAPIReady; window.onYouTubeIframeAPIReady = () => { try { prev && prev(); } catch (e) {} res(window.YT); }; if (!document.getElementById("yt-api")) { const s = document.createElement("script"); s.id = "yt-api"; s.src = "https://www.youtube.com/iframe_api"; document.head.appendChild(s); } }); }
  const vpT = () => { try { return VP.p && VP.ready ? VP.p.getCurrentTime() || 0 : 0; } catch (e) { return 0; } };
  const vpSeek = (t) => { try { VP.p.seekTo(Math.max(0, t), true); } catch (e) {} };
  const vpPlay = () => { try { VP.p.playVideo(); } catch (e) {} };
  const vpPause = () => { try { VP.p.pauseVideo(); } catch (e) {} };
  const mmss = (t) => Math.floor(t / 60) + ":" + String(Math.floor(t % 60)).padStart(2, "0");
  function vpStop() { clearInterval(VP.tick); VP.tick = null; VP.loop = null; try { VP.p && VP.p.destroy && VP.p.destroy(); } catch (e) {} VP.p = null; VP.ready = false; VP.id = null; }
  function videoPage(id) {
    vpStop(); const v = vFind(id) || (vAdd(id) && vFind(id)); if (!v) { app.innerHTML = '<div class="stack"><h1>Video not found</h1><a class="btn" href="#videos">All videos</a></div>'; return; }
    const d = vData(id); VP.id = id; VP.failed = false;
    app.innerHTML = '<div class="stack vpage"><div><p class="eyebrow">' + esc([v.ch, v.lvl].filter(Boolean).join(" · ") || "Your video") + "</p><h1>" + esc(v.t) + "</h1>" + (v.note ? '<p class="muted">' + esc(v.note) + "</p>" : "") + (v.mine ? '<p class="small"><button class="btn small" data-act="v-rename">Rename</button> <button class="btn small" data-act="v-remove">Remove</button></p>' : "") + "</div>" +
      '<div class="vframe"><div id="vplayer"></div><div class="vfail" id="vfail" hidden><p>This video can\'t play inside the app here (the owner may only allow it on YouTube, or you\'re offline). The exercises below still work.</p><a class="btn primary" href="https://www.youtube.com/watch?v=' + id + '" target="_blank" rel="noopener">Open in YouTube</a></div></div>' +
      '<p class="vslow small" id="vslow" hidden>Not playing? <a href="https://www.youtube.com/watch?v=' + id + '" target="_blank" rel="noopener">Open in YouTube</a>, then come back for the exercises.</p>' +
      '<div class="vctl"><button class="btn small" data-act="v-back5" aria-label="Back 5 seconds">' + IC("back") + ' 5 s</button><button class="btn small" data-act="v-loop" aria-pressed="false">' + IC("repeat") + ' Replay line</button><button class="btn small" data-act="v-rate" aria-pressed="false">0.75×</button><button class="btn small primary" data-act="v-catch">' + IC("pen") + " Catch a word</button></div>" +
      '<form class="vcatch" id="vcatch" hidden><label class="small" for="vcin">What did you hear? <span class="muted" id="vcat-t"></span></label><div class="row"><input id="vcin" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Type the word or phrase"><button class="btn primary" type="submit">Save</button><button class="btn" type="button" data-act="v-catch-x">Cancel</button></div><p class="small muted" id="vcat-mean"></p></form>' +
      '<section class="block"><div class="shead"><h2>Words you caught</h2><button class="btn small" data-act="v-deck"' + (d.c.length ? "" : " hidden") + ">" + IC("cards") + ' Add all to flashcards</button></div><ul class="vcaught" id="vcaught">' + vCaughtHTML(d) + "</ul></section>" +
      (v.q && v.q.length ? '<section class="block"><div class="shead"><h2>Check your understanding</h2><span class="result" id="vq-res"></span></div>' + vQuizHTML(v, d) + "</section>" : "") +
      '<section class="block"><div class="shead"><h2>Retell it</h2></div><p class="muted small" style="margin-top:0">In Spanish, say what happened: ¿Quién aparece? ¿Dónde están? ¿Qué pasa? ¿Cómo termina? (3–6 sentences)</p><textarea id="vret" class="extxt" rows="5" placeholder="En el vídeo…">' + esc(d.r || "") + '</textarea><div class="row" style="margin-top:8px"><button class="btn primary" data-act="v-ret-check">Check my Spanish</button>' + (CAN_MIC ? '<button class="btn" data-act="v-ret-mic">' + IC("mic") + " Say it</button>" : "") + '<button class="btn" data-act="v-ret-profe">' + IC("speech") + ' Ask Profe to review</button></div><div id="vret-res"></div></section>' +
      '<div class="unav"><a class="btn" href="#videos">‹ All videos</a></div></div>';
    const VERR = { 2: "the link looks wrong", 5: "this phone's player couldn't play it", 100: "the video was removed or made private", 101: "the owner only allows it on YouTube", 150: "the owner only allows it on YouTube", 152: "YouTube refused to play it inside apps", 153: "YouTube couldn't check which site is asking" };
    const vfail = (code) => { VP.failed = true; const f = document.getElementById("vfail"); if (f) { f.hidden = false; f.querySelector("p").textContent = "This video can't play inside the app: " + (VERR[code] || "YouTube didn't load") + (code ? " (code " + code + ")" : "") + ". The exercises below still work."; } const pl = document.getElementById("vplayer"); if (pl) pl.style.visibility = "hidden"; const sl = document.getElementById("vslow"); if (sl) sl.hidden = true; };
    const vlive = () => { if (VP.ready) return; VP.ready = true; clearTimeout(tmo); const sl = document.getElementById("vslow"); if (sl) sl.hidden = true; };
    // slow or silent player: keep it visible (it may still play) and offer YouTube underneath
    const tmo = setTimeout(() => { if (VP.id !== id || VP.ready) return; if (!window.YT || !window.YT.Player) vfail(0); else { const sl = document.getElementById("vslow"); if (sl) sl.hidden = false; } }, 10000);
    ytApi().then((YT) => {
      if (VP.id !== id || !document.getElementById("vplayer")) return;
      VP.p = new YT.Player("vplayer", { videoId: id, playerVars: { playsinline: 1, rel: 0, modestbranding: 1, cc_load_policy: 1, cc_lang_pref: "es", hl: "es", fs: 0, enablejsapi: 1, origin: location.origin, widget_referrer: location.href.split("#")[0] },
        events: { onReady: () => { vlive(); try { VP.dur = VP.p.getDuration() || 0; } catch (e) {} if (d.at && d.at > 5 && !d.w) vpSeek(d.at - 2); },
          onError: (e) => { clearTimeout(tmo); vfail(e && e.data); },
          onStateChange: (e) => { vlive(); if (e.data === 0) vWatched(id); } } });
      VP.tick = setInterval(() => {
        if (!VP.ready || VP.id !== id) return; const t = vpT();
        if (VP.loop && t >= VP.loop.b) vpSeek(VP.loop.a);
        if (t > (d.at || 0) + 5) { d.at = Math.floor(t); save(); }
        try { VP.dur = VP.p.getDuration() || VP.dur; } catch (e) {}
        if (VP.dur && t > VP.dur * 0.85 && !d.w) vWatched(id);
      }, 250);
    });
  }
  function vWatched(id) { const d = vData(id); if (d.w) return; d.w = Date.now(); save(); try { actAdd(5); S.tot = S.tot || {}; S.tot.video = (S.tot.video || 0) + 1; qBump("listen"); } catch (e) {} try { coachToast("Video watched · +5 points. Now try the exercises below."); } catch (e) {} }
  function vMeaning(es) {
    const w = es.toLowerCase().trim().replace(/[¿?¡!.,;:]/g, ""); if (!w) return "";
    try { const tg = TG[w]; if (tg) return tg[2].split(/[;|]/)[0].trim(); } catch (e) {}
    try { const hit = W.find((x) => x[0].toLowerCase() === w); if (hit) return String(hit[2]).split(";")[0]; } catch (e) {}
    return "";
  }
  function vCaughtHTML(d) {
    if (!d.c.length) return '<li class="muted small vempty">Nothing yet. While you watch, tap <b>Catch a word</b> when you hear something new.</li>';
    return d.c.map((c, k) => '<li><button class="vts" data-act="v-seek" data-t="' + c.t + '">' + mmss(c.t) + '</button><span class="vw"><b lang="es">' + esc(c.es) + "</b>" + (c.en ? "<small>" + esc(c.en) + "</small>" : "") + (c.sc != null ? '<small class="vsc ' + (c.sc >= 70 ? "ok" : "") + '">Said it: ' + c.sc + "%</small>" : "") + "</span>" + (CAN_MIC ? '<button class="btn small" data-act="v-shadow" data-k="' + k + '" aria-label="Replay and say it">' + IC("mic") + " Say it</button>" : "") + '<button class="vx" data-act="v-del" data-k="' + k + '" aria-label="Remove">✕</button></li>').join("");
  }
  const vShuf = (q, i) => { const o = q[1].map((x, j) => [x, j]); let s = i * 7 + q[0].length; for (let a = o.length - 1; a > 0; a--) { s = (s * 9301 + 49297) % 233280; const b = s % (a + 1); [o[a], o[b]] = [o[b], o[a]]; } return o; };
  function vQuizHTML(v, d) {
    return '<ol class="mc" data-scope="vq">' + v.q.map((q, i) => '<li><p class="mq">' + esc(q[0]) + '</p><div class="opts">' + vShuf(q, i).map(([o, j]) => '<button class="opt" data-act="vq" data-q="' + i + '" data-o="' + j + '">' + esc(o) + "</button>").join("") + "</div></li>").join("") + "</ol>";
  }
  function vRedraw() { const d = vData(VP.id), ul = document.getElementById("vcaught"); if (ul) ul.innerHTML = vCaughtHTML(d); const b = document.querySelector('[data-act="v-deck"]'); if (b) b.hidden = !d.c.length; }
  function vShadow(k) {
    const d = vData(VP.id), c = d.c[k]; if (!c) return;
    vpSeek(Math.max(0, c.t - 3)); vpPlay();
    const li = document.querySelectorAll("#vcaught li")[k]; if (li) li.classList.add("vbusy");
    setTimeout(() => { vpPause(); const go = () => { const r = new SR(); r.lang = sttLang(); r.continuous = false; r.interimResults = false; let heard = "";
      r.onresult = (e) => { heard = e.results[0][0].transcript; }; r.onerror = () => {};
      r.onend = () => { if (li) li.classList.remove("vbusy"); if (!heard) { try { coachToast("I didn't hear anything. Tap Say it and try again."); } catch (e) {} return; } c.sc = Math.round(pcScore(heard, c.es) * 100); c.heard = heard; save(); vRedraw(); try { sfx(c.sc >= 70); } catch (e) {} };
      try { r.start(); } catch (e) {} }; if (typeof IS_IOS !== "undefined" && IS_IOS && !MIC_OK) micAsk().then((ok) => ok && go()); else go(); }, 4200);
  }
  function vRetCheck() {
    const txt = (document.getElementById("vret") || {}).value || "", out = document.getElementById("vret-res"), d = vData(VP.id); d.r = txt; save();
    if (txt.trim().split(/\s+/).length < 5) { out.innerHTML = '<p class="small">Write at least a couple of sentences in Spanish first.</p>'; return; }
    const lv = curLevel(), T = { lvl: lv, type: "resumen", reg: "neutral", words: [30, 120], points: [] }, A = wAnalyze(T, txt), sc = wDetScores(T, A, A.rule.length);
    const bar = (n, lab) => '<div class="vsk"><span>' + lab + '</span><span class="qbar"><i style="width:' + Math.round((n / 3) * 100) + '%"></i></span><b>' + n + "/3</b></div>";
    out.innerHTML = '<div class="vret-box"><p class="small" style="margin:0 0 6px">' + A.wc + " words · " + (A.conn.length ? "connectors: " + A.conn.map(esc).join(", ") : "no connectors yet (try y, pero, porque, después)") + " · tenses: " + (A.tenses.length || 0) + "</p>" + bar(sc.coh, "Organisation") + bar(sc.cor, "Accuracy") + bar(sc.alc, "Range") +
      (A.rule.length ? '<p class="small" style="margin:8px 0 4px"><b>Corrections</b></p><ul class="small vfix">' + A.rule.slice(0, 6).map((f) => "<li>«" + esc(f.from) + "» → <b>" + esc(f.to) + "</b>: " + esc(f.why) + "</li>").join("") + "</ul>" : '<p class="small" style="margin:8px 0 0">No mistakes found by the app\'s checker. For content and style, ask Profe to review it.</p>') + "</div>";
    try { actAdd(3); } catch (e) {}
  }
  document.addEventListener("click", (e) => {
    const t = e.target.closest && e.target.closest("[data-act]"), a = t && t.dataset.act; if (!a || !/^(v-|vq$)/.test(a)) return;
    const id = VP.id, d = id ? vData(id) : null;
    if (a === "v-back5") vpSeek(vpT() - 5);
    else if (a === "v-loop") { if (VP.loop) { VP.loop = null; t.setAttribute("aria-pressed", "false"); } else { const n = vpT(); VP.loop = { a: Math.max(0, n - 5), b: n + 0.2 }; vpSeek(VP.loop.a); vpPlay(); t.setAttribute("aria-pressed", "true"); } }
    else if (a === "v-rate") { VP.rate = VP.rate === 1 ? 0.75 : 1; try { VP.p.setPlaybackRate(VP.rate); } catch (x) {} t.setAttribute("aria-pressed", String(VP.rate !== 1)); }
    else if (a === "v-catch") { vpPause(); const f = document.getElementById("vcatch"); f.hidden = false; f.dataset.t = Math.floor(vpT()); document.getElementById("vcat-t").textContent = "at " + mmss(vpT()); const i = document.getElementById("vcin"); i.value = ""; i.focus(); }
    else if (a === "v-catch-x") { document.getElementById("vcatch").hidden = true; vpPlay(); }
    else if (a === "v-seek") { vpSeek(+t.dataset.t - 1); vpPlay(); document.getElementById("vplayer") && document.querySelector(".vframe").scrollIntoView({ block: "start", behavior: "smooth" }); }
    else if (a === "v-del") { d.c.splice(+t.dataset.k, 1); save(); vRedraw(); }
    else if (a === "v-shadow") vShadow(+t.dataset.k);
    else if (a === "v-deck") { let D = SRD.decks.find((x) => x.name === "Videos"); if (!D) D = dkNew("Videos"); let n = 0; d.c.forEach((c) => { if (dkAdd(D.id, c.es, c.en, "video:" + id)) n++; }); try { dkToast(n ? n + " added to <b>Videos</b> · <a href=\"#repaso-" + D.id + "\">Study ›</a>" : "Already in <b>Videos</b>"); } catch (x) {} }
    else if (a === "vq") { const v = vFind(id), qi = +t.dataset.q, oi = +t.dataset.o, right = v.q[qi][2]; const btns = t.parentElement.querySelectorAll(".opt"); if (btns[0].disabled) return; btns.forEach((b) => { b.disabled = true; if (+b.dataset.o === right) b.classList.add("right"); }); if (oi !== right) t.classList.add("wrong"); try { sfx(oi === right); } catch (x) {} d.qa = d.qa || {}; d.qa[qi] = oi === right ? 1 : 0; save(); const n = Object.keys(d.qa).length; if (n === v.q.length) { const sc = Object.values(d.qa).reduce((x, y) => x + y, 0); document.getElementById("vq-res").textContent = sc + " / " + v.q.length; try { actAdd(sc); if (sc === v.q.length) celebrate(false); } catch (x) {} } }
    else if (a === "v-ret-check") vRetCheck();
    else if (a === "v-ret-mic") { const ta = document.getElementById("vret"); listen((txt) => { ta.value = (ta.value ? ta.value.trim() + " " : "") + txt; d.r = ta.value; save(); }); }
    else if (a === "v-ret-profe") { vpPause(); const v = vFind(id), txt = (document.getElementById("vret") || {}).value || ""; d.r = txt; save(); tOpen("I watched the video «" + v.t + "»" + (v.note ? " (" + v.note + ")" : "") + ". Here is my summary in Spanish. Please evaluate it first, then correct my Spanish politely, one or two points at a time:\n\n" + (txt.trim() || "(I haven't written it yet: ask me what I understood.)")); }
    else if (a === "v-rename") { const v = vFind(id), n = prompt("Name this video", v.t); if (n && n.trim()) { v.t = n.trim().slice(0, 80); save(); route(); } }
    else if (a === "v-remove") { S.myv = vMine().filter((x) => x.yt !== id); save(); location.hash = "#videos"; }
  });
  document.addEventListener("submit", (e) => {
    if (e.target.id !== "vcatch") return; e.preventDefault();
    const f = e.target, es = document.getElementById("vcin").value.trim(); if (!es) return;
    const d = vData(VP.id); d.c.push({ t: +f.dataset.t || 0, es, en: vMeaning(es) }); save(); f.hidden = true; vRedraw(); try { actAdd(1); } catch (x) {} vpPlay();
  });
  document.addEventListener("input", (e) => { if (e.target.id === "vcin") { const m = document.getElementById("vcat-mean"); if (m) { const x = vMeaning(e.target.value); m.textContent = x ? "Meaning: " + x : ""; } } });
  addEventListener("hashchange", () => { if (!/^#video-/.test(location.hash)) vpStop(); });
  // a YouTube link shared from another app (Android share sheet → ?text=…) opens as a video
  try { const sp = new URLSearchParams(location.search); const txt = (sp.get("text") || "") + " " + (sp.get("url") || ""); const id = /youtu/.test(txt) ? ytId(txt) : null;
    if (id) { vAdd(txt, sp.get("title") || ""); history.replaceState(null, "", location.pathname + "#video-" + id); } } catch (e) {}
  UIC.video = ["#e5484d", '<rect x="2.5" y="5" width="19" height="14" rx="3"/><path d="m10 9.2 5 2.8-5 2.8z" fill="#fff"/>'];
  // Profe opening pauses the video, like page audio
  document.addEventListener("click", (e) => { if (VP.p && e.target.closest && e.target.closest('#tutor-fab, [data-act="t-open"]')) vpPause(); }, true);
  // Profe knows which video you're on, what it's about, and the words you caught
  function vCtx(id) { const v = vFind(id); if (!v) return null; const d = vData(id);
    return { label: "Video · " + v.t, lvl: /^[abc][12]/i.test(v.lvl || "") ? v.lvl.slice(0, 2).toLowerCase() : undefined,
      text: "The learner is watching the YouTube video «" + v.t + "»" + (v.ch ? " by " + v.ch : "") + (v.lvl ? " (level " + v.lvl + ")" : "") + (v.note ? ". About: " + v.note : "") + (VP.id === id && VP.ready ? ". Currently at " + mmss(vpT()) : "") + ".\nWords they caught: " + (d.c.map((c) => c.es + (c.en ? " (" + c.en + ")" : "")).join(", ") || "none yet") + (d.r ? "\nTheir retelling so far: " + d.r.slice(0, 1500) : "") + "\nYou can't see or hear the video; ask what they understood rather than inventing what happens in it." }; }
