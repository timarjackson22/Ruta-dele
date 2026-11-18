  /* ==================== Profe video call (v228) ====================
     A live, hands-free call with an animated Profe drawn on the phone (no paid avatar service, no server).
     - Same brain as the chat (tSend → commands, dictionary-grounded answers, the on-device AI); call preferences go
       into the prompt through window.__vcNote (language mode, correction style, the learner's own instructions).
     - Lip sync: every utterance the app speaks passes through speechSynthesis.speak; while a call is on, the call
       watches each one (start / word boundaries / end) and drives the mouth from the letters of the word actually
       being spoken. The mouth closes the instant speech ends or is cancelled.
     - One mic owner: the call listens through the guarded recogniser (micGuard), stops the "Ok Profe" wake
       listener while it runs, and never listens while Profe talks unless "interrupt by voice" is on (headphones).
     - Nothing is recorded. The camera is optional, off by default, shown only on the learner's screen. */
  const VC = { on: false, st: "idle", muted: false, cc: true, cam: null, t0: 0, rec: null, gen: 0, lastPro: "", paused: false, metrics: [], instr: [], empties: 0, fails: 0, wasWake: false };
  const VC_FLAG = true; // rollback: set to false (or TS.vcall = false) and the call button disappears
  const vcEnabled = () => VC_FLAG && TS.vcall !== false && !!window.speechSynthesis;
  const VC_ST = { idle: "", connecting: "Connecting…", listening: "Listening…", thinking: "Thinking…", speaking: "Speaking", muted: "Muted", reconnecting: "Reconnecting the mic…", paused: "Paused", disconnected: "Call ended" };
  const VC_LANG = { immersion: ["Spanish only", "Speak only Spanish, slowly and simply at the learner's level; never switch to English unless they explicitly ask."], bilingual: ["Bilingual", "Practise in Spanish; explain grammar and mistakes briefly in English when it helps or when asked."], english: ["Mostly English", "Explain in English and use Spanish for the examples and the practice phrases."] };
  const VC_CORR = { flow: ["Conversation first", "Correct only big or repeated mistakes, in one short phrase, then carry on with the conversation."], now: ["Immediate coaching", "When the learner makes a mistake, give the corrected Spanish and a one-line reason, invite a quick retry, then continue."], end: ["End-of-session review", "Don't correct during the call (only if meaning is unclear); the learner gets a review at the end."] };
  const vcP = (k, d) => (TS["vc_" + k] != null ? TS["vc_" + k] : d);

  /* ---------- the prompt note for the call ---------- */
  window.__vcNote = () => {
    if (!VC.on) return "";
    const L = VC_LANG[vcP("lang", "bilingual")] || VC_LANG.bilingual, C = VC_CORR[vcP("corr", "flow")] || VC_CORR.flow;
    return "\n\nLIVE VIDEO CALL (spoken aloud):\n- You are Profe, an AI Spanish tutor, in a live voice call. Reply in 1–3 short spoken sentences: no lists, no markdown, no emojis, no headings.\n- Respond to what the learner actually meant; keep the conversation going with ONE natural follow-up question; allow them to change topic or stop.\n- If you are not sure what they said, ask one short clarification question. Never invent what they said.\n- Language: " + L[1] + "\n- Corrections: " + C[1] +
      (VC.instr.length ? "\n- The learner asked, for this whole call: " + VC.instr.map((x) => "«" + x + "»").join("; ") + ". Keep doing all of it." : "");
  };

  /* ---------- watching speech: lip sync from the words actually spoken ---------- */
  const AV = { cur: null, speaking: false, q: 0, lastEnd: 0, m: { w: 5.2, h: 0.3 }, smile: 0 };
  const VIS = { rest: [5.2, 0.3], mbp: [5, 0], a: [5.4, 5.2], e: [6, 3], i: [6.2, 2], o: [3.8, 4.6], u: [3, 3.4], f: [5.4, 1.2], l: [5.2, 2.4] };
  function visOf(ch, nx, en) {
    ch = (ch || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    if (/[aá]/.test(ch)) return "a"; if (ch === "e") return "e"; if (ch === "i" || ch === "y") return "i"; if (ch === "o") return "o"; if (ch === "u" || ch === "w") return "u";
    if (/[mbp]/.test(ch)) return "mbp"; if (ch === "v") return en ? "f" : "mbp"; if (ch === "f") return "f";
    if (/[a-zñ]/.test(ch)) return "l"; return "rest";
  }
  function avWords(text) { const out = []; const re = /[\p{L}\d'’]+/gu; let m; while ((m = re.exec(text))) out.push({ i: m.index, len: m[0].length }); return out; }
  function avBegin(u) {
    const en = /^en/i.test(u.lang || "");
    AV.cur = { u, text: String(u.text || ""), rate: u.rate || 1, en, words: avWords(String(u.text || "")), wi: 0, wStart: performance.now(), hasB: false };
    AV.speaking = true; AV.lastBegin = Date.now(); AV.smile = /^(¡?muy bien|¡?excelente|¡?perfecto|¡?genial|great|well done|nice|¡?eso es|¡?bien hecho)/i.test(AV.cur.text) ? 1 : 0;
    try { vcOnSpeak(u); } catch (e) {}
  }
  function avWord(u, ci) { const c = AV.cur; if (!c || c.u !== u) return; c.hasB = true; let k = c.words.findIndex((w) => w.i >= ci); if (k < 0) k = c.words.length - 1; if (k > 0 && c.words[k].i > ci) k--; c.wi = Math.max(0, k); c.wStart = performance.now(); }
  function avDone(u) { if (AV.cur && AV.cur.u === u) { AV.cur = null; } AV.q = Math.max(0, AV.q - 1); AV.speaking = !!AV.cur; AV.lastEnd = Date.now(); }
  function avStopAll() { AV.cur = null; AV.speaking = false; AV.q = 0; AV.lastEnd = Date.now(); AV.m.h = 0; }
  (function hookSpeech() {
    const ss = window.speechSynthesis; if (!ss || ss.__vcHooked) return; ss.__vcHooked = true;
    const sp = ss.speak.bind(ss), ca = ss.cancel.bind(ss);
    try {
      ss.speak = function (u) {
        if (VC.on && u && !u.__vcw) { u.__vcw = 1; AV.q++; const o = { s: u.onstart, b: u.onboundary, e: u.onend, r: u.onerror };
          u.onstart = function (ev) { try { avBegin(u); } catch (x) {} if (o.s) return o.s.call(this, ev); };
          u.onboundary = function (ev) { try { if (!ev || ev.name === "word" || ev.name == null) avWord(u, ev ? ev.charIndex : 0); } catch (x) {} if (o.b) return o.b.call(this, ev); };
          u.onend = function (ev) { try { avDone(u); } catch (x) {} if (o.e) return o.e.call(this, ev); };
          u.onerror = function (ev) { try { avDone(u); } catch (x) {} if (o.r) return o.r.call(this, ev); }; }
        return sp(u);
      };
      ss.cancel = function () { if (VC.on) avStopAll(); return ca(); };
    } catch (e) {}
  })();

  /* ---------- the face: Profe's own portrait, with a moving mouth, eyes and brows ---------- */
  function vcFace() {
    if (window.__vcFailFace) throw new Error("test: no face");
    const k = (typeof pvKey === "function" ? pvKey() : "") || Object.keys(PV_PORTRAITS)[0];
    let svg = portrait(PV_PORTRAITS[k] ? k : Object.keys(PV_PORTRAITS)[0], "vc");
    if (!svg) throw new Error("no portrait");
    const o = PV_PORTRAITS[PV_PORTRAITS[k] ? k : Object.keys(PV_PORTRAITS)[0]];
    svg = svg.replace('<rect width="100" height="100" fill="' + o.bg + '"/>', "")
      .replace(/<path d="M39\.5 40\.5q3\.5-2 7 0M53\.5 40\.5q3\.5-2 7 0"[^>]*\/>/, (m) => '<g class="vc-brows">' + m + "</g>")
      .replace(/(<ellipse cx="43" cy="45\.5"[^>]*\/><ellipse cx="57" cy="45\.5"[^>]*\/><circle cx="43\.6"[^>]*\/><circle cx="57\.6"[^>]*\/>)/, '<g class="vc-eyes">$1</g>')
      .replace(/<path d="M44\.5 57\.5q5\.5 4 11 0"[^>]*\/>/, '<path class="vc-mouth" d="M45 57.6Q50 58 55 57.6Q50 58.4 45 57.6Z" fill="#5b2323" stroke="' + o.lips + '" stroke-width="1.5" stroke-linejoin="round"/><path class="vc-teeth" d="" fill="#fff" opacity=".9"/>')
      .replace('class="pp"', 'class="pp vc-svg"');
    if (!/vc-mouth/.test(svg)) throw new Error("no mouth");
    return svg;
  }
  let VC_RAF = 0, VC_BLINK = 0, VC_BLINKT = 0;
  function vcAnimate() {
    cancelAnimationFrame(VC_RAF);
    const reduce = (() => { try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } })();
    const step = (now) => {
      if (!VC.on) return;
      const root = document.getElementById("vcall"); const svg = root && root.querySelector(".vc-svg"); if (!svg) { VC_RAF = requestAnimationFrame(step); return; }
      // the mouth: the letter being spoken now, from the word the voice reported
      let tgt = VIS.rest; const c = AV.cur;
      if (c && c.words.length) {
        const per = (c.en ? 62 : 70) / Math.max(0.5, c.rate); let w = c.words[c.wi], el = now - c.wStart;
        if (!c.hasB) { while (w && el > w.len * per + 70 && c.wi < c.words.length - 1) { c.wStart += w.len * per + 70; c.wi++; w = c.words[c.wi]; el = now - c.wStart; } }
        if (w) { const k = Math.floor(el / per); tgt = k < w.len ? VIS[visOf(c.text[w.i + k], c.text[w.i + k + 1], c.en)] : c.hasB ? [5, 0.6] : VIS.rest; }
      }
      const m = AV.m, f = c ? 0.5 : 0.35; m.w += (tgt[0] - m.w) * f; m.h += (tgt[1] - m.h) * f; if (!c && m.h < 0.05) m.h = 0;
      const smile = VC.st === "listening" ? 0.5 : AV.smile ? 0.9 : 0.25, W = m.w, H = m.h, y = 57.6;
      const mouth = svg.querySelector(".vc-mouth"), teeth = svg.querySelector(".vc-teeth");
      if (mouth) mouth.setAttribute("d", "M" + (50 - W).toFixed(2) + " " + y + "Q50 " + (y + 0.4 - smile - H * 0.25).toFixed(2) + " " + (50 + W).toFixed(2) + " " + y + "Q50 " + (y + 0.6 + H).toFixed(2) + " " + (50 - W).toFixed(2) + " " + y + "Z");
      if (teeth) teeth.setAttribute("d", H > 2 ? "M" + (50 - W * 0.6).toFixed(2) + " " + (y - 0.1) + "h" + (W * 1.2).toFixed(2) + "v" + Math.min(1.1, H * 0.25).toFixed(2) + "h-" + (W * 1.2).toFixed(2) + "Z" : "");
      // eyes: natural blinks every 2.5–6 s; brows by state
      if (now > VC_BLINKT) { VC_BLINK = now; VC_BLINKT = now + 2500 + Math.random() * 3500; }
      const bl = now - VC_BLINK, sy = bl < 70 ? 1 - bl / 70 * 0.9 : bl < 150 ? 0.1 + (bl - 70) / 80 * 0.9 : 1;
      const eyes = svg.querySelector(".vc-eyes"), think = VC.st === "thinking";
      if (eyes) eyes.setAttribute("transform", "translate(0 " + (think ? -0.8 : 0) + ") translate(0 45.5) scale(1 " + sy.toFixed(3) + ") translate(0 -45.5)" + (think ? " translate(0.8 0)" : ""));
      const brows = svg.querySelector(".vc-brows"); if (brows) brows.setAttribute("transform", "translate(0 " + (VC.st === "listening" ? -0.9 : think ? -0.6 : AV.smile ? -0.4 : 0) + ")");
      // the head: restrained movement, a little more while speaking; a slight tilt while listening
      if (!reduce) { const t = now / 1000, amp = c ? 1 : 0.45; const rot = Math.sin(t * 0.9) * 1.2 * amp + (VC.st === "listening" ? 2.2 : 0) + (c ? Math.sin(t * 2.3) * 0.6 : 0), ty = Math.sin(t * 1.3) * 0.7 * amp;
        svg.style.transform = "translateY(" + ty.toFixed(2) + "px) rotate(" + rot.toFixed(2) + "deg)"; }
      VC_RAF = requestAnimationFrame(step);
    };
    VC_RAF = requestAnimationFrame(step);
  }

  /* ---------- the call screen ---------- */
  const VC_IC = {
    mic: '<path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    micoff: '<path d="M3 3l18 18M9 9v3a3 3 0 0 0 5.1 2.1M15 9.3V6a3 3 0 0 0-5.7-1.3M5 11a7 7 0 0 0 11.2 5.6M19 11a7 7 0 0 1-.6 2.8M12 18v3"/>',
    cc: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 10.5a2 2 0 1 0 0 3M16 10.5a2 2 0 1 0 0 3"/>',
    cam: '<rect x="2" y="6" width="14" height="12" rx="2"/><path d="m16 10 6-3v10l-6-3z"/>',
    camoff: '<path d="M3 3l18 18M16 16H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2M10 6h4a2 2 0 0 1 2 2v4l6-3v10"/>',
    end: '<path d="M3 15.5c5-4.7 13-4.7 18 0l-2.4 2.4c-.5.5-1.3.5-1.8.1l-2-1.6c-.4-.3-.6-.8-.5-1.3l.3-1.6a12 12 0 0 0-5.2 0l.3 1.6c.1.5-.1 1-.5 1.3l-2 1.6c-.5.4-1.3.4-1.8-.1z"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    video: '<rect x="2" y="6" width="14" height="12" rx="2.5"/><path d="m16 10.5 5.5-3.2v9.4L16 13.5z"/>',
  };
  const vcI = (k) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + VC_IC[k] + "</svg>";
  window.__vcBtn = () => (vcEnabled() ? '<button class="btn small vcbtn" data-act="vc-open" aria-label="Video call with Profe" title="Video call with Profe">' + vcI("video") + "</button>" : "");
  function vcRate() { return +vcP("rate", 1) || 1; }
  function vcxHTML() {
    let face = ""; try { face = vcFace(); VC.audioOnly = false; } catch (e) { VC.audioOnly = true; }
    const rate = vcRate();
    return '<div class="vc-top"><span class="vc-ai" title="Profe is an AI tutor">AI tutor</span><span class="vc-st" id="vc-st" role="status" aria-live="polite"></span><span class="vc-time" id="vc-time">0:00</span>' +
      '<button class="vc-ibtn" data-act="vc-set" aria-label="Call settings">' + vcI("gear") + "</button></div>" +
      '<button type="button" class="vc-stage" data-act="vc-tap" aria-label="Profe. Tap to interrupt or to talk">' +
        (VC.audioOnly ? '<span class="vc-audio"><span class="vc-aav">' + esc(pName()[0]) + "</span><small>Audio only · the animation couldn’t load</small></span>" : '<span class="vc-face">' + face + "</span>") +
        '<span class="vc-ring" aria-hidden="true"></span><span class="vc-hint" id="vc-hint"></span></button>' +
      '<div class="vc-cap" id="vc-cap" aria-live="polite"' + (VC.cc ? "" : " hidden") + '><p class="vc-you" id="vc-you"></p><p class="vc-pro" id="vc-pro"></p></div>' +
      '<video class="vc-self" id="vc-self" playsinline muted autoplay hidden aria-label="Your camera (only on your screen)"></video>' +
      '<div class="vc-bar" role="toolbar" aria-label="Call controls">' +
        '<button class="vc-b" data-act="vc-mute" aria-pressed="' + VC.muted + '" aria-label="' + (VC.muted ? "Unmute" : "Mute") + '">' + vcI(VC.muted ? "micoff" : "mic") + "<small>" + (VC.muted ? "Unmute" : "Mute") + "</small></button>" +
        '<button class="vc-b" data-act="vc-cc" aria-pressed="' + VC.cc + '" aria-label="Captions">' + vcI("cc") + "<small>Captions</small></button>" +
        '<button class="vc-b" data-act="vc-rate" aria-label="Profe’s speed ' + rate + '×"><b class="vc-rt">' + rate.toFixed(1) + "×</b><small>Speed</small></button>" +
        '<button class="vc-b" data-act="vc-cam" aria-pressed="' + !!VC.cam + '" aria-label="' + (VC.cam ? "Turn camera off" : "Turn camera on") + '">' + vcI(VC.cam ? "cam" : "camoff") + "<small>Camera</small></button>" +
        '<button class="vc-b vc-endb" data-act="vc-end" aria-label="End call">' + vcI("end") + "<small>End</small></button></div>" +
      '<div class="vc-sheet" id="vc-sheet" hidden></div>';
  }
  function vcSheet() {
    const opt = (k, map, d) => '<div class="vc-opts" role="group">' + Object.entries(map).map(([v, [n]]) => '<button class="vc-o" data-act="vc-opt" data-k="' + k + '" data-v="' + v + '" aria-pressed="' + (vcP(k, d) === v) + '">' + n + "</button>").join("") + "</div>";
    const ms = VC.metrics.slice(-20).map((x) => x.lat).filter((x) => x > 0).sort((a, b) => a - b), med = ms.length ? ms[Math.floor(ms.length / 2)] : null;
    return '<div class="vc-sh-in"><div class="vc-sh-h"><b>Call settings</b><button class="vc-ibtn" data-act="vc-set" aria-label="Close settings">✕</button></div>' +
      "<p class=\"vc-l\">Language</p>" + opt("lang", VC_LANG, "bilingual") +
      "<p class=\"vc-l\">Corrections</p>" + opt("corr", VC_CORR, "flow") +
      '<p class="vc-l">Interrupt Profe by speaking</p><div class="vc-opts"><button class="vc-o" data-act="vc-opt" data-k="barge" data-v="' + (vcP("barge", "off") === "on" ? "off" : "on") + '" aria-pressed="' + (vcP("barge", "off") === "on") + '">' + (vcP("barge", "off") === "on" ? "On · best with headphones" : "Off · tap Profe to interrupt") + "</button></div>" +
      '<p class="vc-note">Profe is an AI tutor, an animated character drawn on your phone. Your phone’s speech service turns your voice into text (on Android, Google’s); the app keeps no audio or video. Your camera, if you turn it on, is only shown to you: Profe can’t see it. The words of the call are saved in Profe › History, where you can delete them.</p>' +
      (med != null ? '<p class="vc-note">This call: Profe starts answering in about ' + (med / 1000).toFixed(1) + " s (" + ms.length + " turns).</p>" : "") + "</div>";
  }
  function vcSet(st, hint) {
    VC.st = st; const root = document.getElementById("vcall"); if (!root) return;
    root.dataset.state = st; const e = document.getElementById("vc-st"); if (e) e.textContent = VC_ST[st] || "";
    const h = document.getElementById("vc-hint"); if (h) h.textContent = hint != null ? hint : st === "speaking" ? "Tap to interrupt" : st === "listening" ? "" : st === "paused" ? "Tap to talk" : "";
  }
  const vcPlain = (t) => String(t || "").replace(/\*\*|__|`|#+\s/g, "").replace(/\[[^\]]*\]\([^)]*\)/g, "").replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, "").replace(/\n+/g, " ").replace(/\s{2,}/g, " ").trim();
  function vcCap(you, pro) { if (you != null) { const y = document.getElementById("vc-you"); if (y) y.textContent = you ? "You: " + you : ""; } if (pro != null) { const p = document.getElementById("vc-pro"); if (p) p.textContent = pro; } }
  function vcOnSpeak(u) {
    if (!VC.on) return; vcSet("speaking"); vcCap(null, vcPlain(u.text));
    if (VC.tTurn) { VC.metrics.push({ lat: Date.now() - VC.tTurn, t: Date.now() }); if (VC.metrics.length > 60) VC.metrics.shift(); VC.tTurn = 0; }
    if (vcP("barge", "off") === "on" && !VC.muted) vcBargeOn();
  }

  /* ---------- the conversation loop ---------- */
  function vcStopMic() { const r = VC.rec; VC.rec = null; if (r) { try { r._vcDead = 1; r.abort(); } catch (e) {} } clearTimeout(VC.qT); clearTimeout(VC.sT); }
  function vcQuietThen(fn) { // wait until Profe has finished speaking (all queued parts), then go on
    const g = VC.gen; let quiet = 0; clearInterval(VC.qi);
    VC.qi = setInterval(() => { if (!VC.on || g !== VC.gen) return clearInterval(VC.qi); let sp = false; try { sp = speechSynthesis.speaking || speechSynthesis.pending; } catch (e) {} if (AV.speaking || AV.q > 0 || sp || (typeof tBusy !== "undefined" && tBusy)) quiet = 0; else quiet++; if (quiet >= 3) { clearInterval(VC.qi); fn(); } }, 150);
  }
  function vcLang() { const es = typeof sttLang === "function" ? sttLang() : "es-US"; return window.AndroidSTT && window.AndroidSTT.multiLang ? es + "|en-US" : es; }
  function vcListen(seed) {
    if (!VC.on || VC.paused) return; vcStopMic();
    if (VC.muted) { vcSet("muted", "You’re muted. Tap the mic to talk."); return; }
    if (!CAN_MIC) { vcSet("paused", "This browser can’t listen. Use Chrome on Android or Safari on iPhone."); return; }
    const r = new SR(); VC.rec = r; r.lang = vcLang(); r.continuous = !IS_IOS; r.interimResults = true;
    let fin = seed || "", live = seed || "", done = false; const g = VC.gen;
    const finish = (text) => { if (done) return; done = true; clearTimeout(VC.qT); clearTimeout(VC.sT); if (VC.rec === r) VC.rec = null; try { r._vcDead = 1; r.abort(); } catch (e) {} if (!VC.on || g !== VC.gen) return;
      text = String(text || "").trim(); if (text) { VC.empties = 0; vcTurn(text); } else { VC.empties++; if (VC.empties >= 3) vcSet("paused", "Still there? Tap Profe to talk."); else vcListen(); } };
    // the learner's turn ends after a pause; learners pause more, so short or unfinished sentences get longer
    const wait = (t, isFinal) => { const n = (t.match(/\S+/g) || []).length; return isFinal && /[.?!]$/.test(t) ? 1200 : n >= 5 ? 1700 : n >= 2 ? 2300 : 2900; };
    r.onstart = () => { if (r._vcDead) return; VC.fails = 0; vcSet("listening"); clearTimeout(VC.sT); VC.sT = setTimeout(() => finish(live), 20000); };
    r.onresult = (e) => { if (r._vcDead) return; let f = "", im = ""; for (let i = 0; i < e.results.length; i++) { const x = e.results[i][0].transcript; if (e.results[i].isFinal) f += x + " "; else im += x + " "; }
      fin = ((seed ? seed + " " : "") + f).trim(); live = (fin + " " + im).trim(); vcCap(live, null);
      clearTimeout(VC.sT); clearTimeout(VC.qT); VC.qT = setTimeout(() => finish(live), wait(live, !im.trim())); };
    r.onerror = (e) => { if (r._vcDead) return; r._err = e && e.error; };
    r.onend = () => { if (r._vcDead || done) return; const er = r._err;
      if (/not-allowed|service-not-allowed/.test(er || "")) { done = true; VC.rec = null; vcSet("disconnected", "The microphone is blocked. Allow it for Ruta DELE, then tap to try again."); VC.blocked = true; return; }
      if (live) { finish(live); return; }
      if (er && !/no-speech|aborted/.test(er)) { done = true; VC.rec = null; VC.fails++; if (VC.fails > 3) { vcSet("paused", "The mic keeps dropping. Tap Profe to try again."); return; } vcSet("reconnecting"); setTimeout(() => { if (VC.on && g === VC.gen) vcListen(); }, 600 * VC.fails); return; }
      done = true; VC.rec = null; if (VC.on && g === VC.gen) vcListen(); };
    vcSet("connecting"); try { r.start(); } catch (e) { done = true; vcSet("reconnecting"); setTimeout(() => vcListen(), 800); }
  }
  // interrupt by voice (headphones): listen while Profe talks; anything that isn't Profe's own words takes the turn
  function vcBargeOn() {
    if (VC.rec || !VC.on || VC.muted) return; const r = new SR(); VC.rec = r; r.lang = vcLang(); r.continuous = !IS_IOS; r.interimResults = true; const g = VC.gen;
    r.onresult = (e) => { if (r._vcDead) return; let t = ""; for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript + " "; t = t.trim(); const ws = (t.toLowerCase().match(/[\p{L}']+/gu) || []); if (ws.length < 2) return;
      const said = new Set((String((AV.cur && AV.cur.text) || VC.lastPro).toLowerCase().match(/[\p{L}']+/gu) || [])); const own = ws.filter((w) => said.has(w)).length / ws.length; if (own >= 0.5) return; // Profe hearing itself
      r._vcDead = 1; try { r.abort(); } catch (x) {} if (VC.rec === r) VC.rec = null; vcInterrupt(t); };
    r.onend = () => { if (VC.rec === r) VC.rec = null; if (!r._vcDead && VC.on && g === VC.gen && AV.speaking) setTimeout(() => { if (AV.speaking) vcBargeOn(); }, 300); };
    try { r.start(); } catch (e) { VC.rec = null; }
  }
  function vcInterrupt(seed) {
    VC.gen++; clearInterval(VC.qi);
    try { if (typeof SPK_GEN !== "undefined") SPK_GEN++; } catch (e) {}
    try { if (typeof tBusy !== "undefined" && tBusy && tCtl) tCtl.abort(); } catch (e) {}
    try { speechSynthesis.cancel(); } catch (e) {} avStopAll();
    VC.paused = false; vcListen(seed);
  }
  async function vcSay(parts, then) { // Profe speaks something of the call's own (greeting, confirmations)
    const g = VC.gen; vcStopMic(); vcSet("speaking");
    await new Promise((res) => { try { speakMixed(parts, res); } catch (e) { res(); } setTimeout(res, 15000); });
    if (VC.on && g === VC.gen && then) vcQuietThen(then);
  }
  const VC_CMD = [
    [/^(?:please\s+)?(?:end|finish|stop)\s+(?:the\s+)?call\b|^hang\s*up\b|^(?:termina|terminar|acaba|acabar|finaliza)\s+(?:la\s+)?llamada\b|^cuelga\b|^colgar\b/i, "end"],
    [/^(?:stop|wait|hold on|one moment|espera|para|un momento|alto)\W*$/i, "stop"],
    [/^(?:repeat(?: that)?|say (?:that|it) again|again|once more|pardon|what\?|repite(?:lo)?|otra vez|¿?puedes repetir(?:lo)?\??|¿?c[oó]mo\?)\W*$/i, "repeat"],
    [/\b(?:speak|talk|go)\s+(?:more\s+)?slow(?:er|ly)\b|^slower\b|m[aá]s despacio|m[aá]s lento|habla despacio/i, "slower"],
    [/\b(?:speak|talk|go)\s+faster\b|^faster\b|m[aá]s r[aá]pido/i, "faster"],
  ];
  async function vcTurn(text) {
    if (!VC.on) return; const g = ++VC.gen; vcCap(text, ""); vcStopMic();
    const t = text.trim(), low = t.toLowerCase();
    // a command is a short utterance; inside a longer sentence ("…habla despacio y explica mis errores") it's an instruction
    const nW = (low.match(/\S+/g) || []).length;
    const cmd = (VC_CMD.find(([re, k]) => re.test(low) && (k === "end" ? nW <= 6 : nW <= 4)) || [])[1];
    if (cmd === "end") { vcSay([["¡Hasta luego!", true], ["Great talking with you.", false]], () => vcEnd()); return; }
    if (cmd === "stop") { vcListen(); return; }
    if (cmd === "repeat") { if (VC.lastPro) { vcSay(VC.lastPro, () => vcListen()); } else vcListen(); return; }
    if (cmd === "slower" || cmd === "faster") { const r0 = vcRate(), r1 = Math.max(0.7, Math.min(1.2, +(r0 + (cmd === "slower" ? -0.1 : 0.1)).toFixed(1))); TS.vc_rate = r1; tsave(); window.__vcRate = r1; vcPaintBar();
      vcSay(cmd === "slower" ? [["Vale, más despacio.", true], ["Okay, slower.", false]] : [["Vale, más rápido.", true], ["Okay, a bit faster.", false]], () => vcListen()); return; }
    // the learner's own instructions for the call ("you're the waiter", "speak slowly", "explain my mistakes in English")
    if (/\b(you(?:'re| are) (?:the|a|my)|act as|be (?:the|a)|let'?s practi[cs]e|eres (?:el|la|un|una|mi)|haz de|explain (?:my )?(?:mistakes|errors|things) in english|correct (?:me|my)|don'?t correct|no me corrijas|corr[ií]geme|only (?:in )?spanish|solo (?:en )?espa[nñ]ol|speak (?:to me )?in (?:english|spanish))\b/i.test(t)) {
      VC.instr.push(t.slice(0, 160)); VC.instr = VC.instr.slice(-6);
      if (/speak slow|habla despacio|more slowly/i.test(t) && vcRate() > 0.85) { TS.vc_rate = 0.85; tsave(); window.__vcRate = 0.85; vcPaintBar(); }
      if (/only (?:in )?spanish|solo (?:en )?espa/i.test(t)) { TS.vc_lang = "immersion"; tsave(); }
      if (/explain (?:my )?(?:mistakes|errors|things) in english|in english/i.test(t) && vcP("lang", "bilingual") === "immersion") { TS.vc_lang = "bilingual"; tsave(); }
    }
    vcSet("thinking"); VC.tTurn = Date.now(); const h0 = location.hash;
    let n0 = 0; try { n0 = tCur ? tCur.msgs.length : 0; } catch (e) {}
    try { await tSend(t, true); } catch (e) {}
    if (!VC.on || g !== VC.gen) return;
    let m = null; try { m = tCur && tCur.msgs.length > n0 ? [...tCur.msgs].reverse().find((x) => x.r === "a") : null; if (m && m.c && !m.err) VC.lastPro = vcPlain(m.c); } catch (e) {}
    // the chat wrote an answer but didn't say it (no AI engine, a typed-style reply): the call says it
    const spoke = (AV.lastBegin || 0) >= VC.tTurn - 50 || AV.speaking || AV.q > 0;
    if (!spoke && location.hash === h0) {
      if (m && m.c && !m.err) { vcSay(vcPlain(m.c), () => vcListen()); return; }
      if (m && m.err) { VC.lastPro = "To chat freely I need Profe's AI. Turn it on in Profe's settings. Meanwhile I can open your lesson, play audio or start a practice."; vcSay([["Para conversar necesito la inteligencia artificial de Profe.", true], ["To chat freely I need Profe's AI: turn it on in Profe's settings, under History and settings. Meanwhile I can open your lesson, play audio or start a practice.", false]], () => vcListen()); return; }
    }
    // an app command opened something (a lesson, a video, a song): the call steps aside, clearly, until the learner comes back
    const opened = location.hash !== h0 && !/^#?$/.test(location.hash);
    vcQuietThen(() => { if (!VC.on || g !== VC.gen) return; if (opened) vcMinimize(); else vcListen(); });
  }

  /* ---------- open, pause, end ---------- */
  function vcPaintBar() { const b = document.querySelector('#vcall [data-act="vc-rate"] .vc-rt'); if (b) b.textContent = vcRate().toFixed(1) + "×"; }
  function vcTimer() { clearInterval(VC.tick); VC.tick = setInterval(() => { const e = document.getElementById("vc-time"); if (!e || !VC.on) return; const s = Math.floor((Date.now() - VC.t0) / 1000); e.textContent = Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); }, 1000); }
  function vcOpen() {
    if (!vcEnabled()) return; if (VC.on) { vcResume(); return; }
    try { if (typeof listening !== "undefined" && listening) stopListening(); } catch (e) {}
    try { if (typeof HF !== "undefined" && HF.eng === "on") { VC.wasWake = true; hfWakeStop(); } } catch (e) {}
    try { speechSynthesis.cancel(); } catch (e) {}
    Object.assign(VC, { on: true, muted: false, paused: false, t0: Date.now(), gen: VC.gen + 1, lastPro: "", instr: [], empties: 0, fails: 0, metrics: [], blocked: false });
    window.__vcOn = true; window.__vcRate = vcRate(); VC.cc = vcP("cc", true) !== false;
    let root = document.getElementById("vcall"); if (!root) { root = document.createElement("div"); root.id = "vcall"; root.className = "vc"; root.setAttribute("role", "dialog"); root.setAttribute("aria-label", "Video call with " + pName()); document.body.appendChild(root); }
    root.innerHTML = vcxHTML(); root.hidden = false; document.body.classList.add("vc-open"); vcSet("connecting"); vcTimer(); vcAnimate();
    const pill = document.getElementById("vc-pill"); if (pill) pill.remove();
    if (!TS.vc_intro) { TS.vc_intro = 1; tsave(); }
    const nm = TS.lname ? ", " + TS.lname : "", lv = (() => { try { return String(learnerLevel(pageCtx())).toUpperCase(); } catch (e) { return ""; } })();
    const greet = vcP("lang", "bilingual") === "english" ? [["Hi" + nm + "! I'm Profe, your AI Spanish tutor.", false], ["¿De qué quieres hablar hoy?", true]]
      : [["¡Hola" + nm + "! Soy Profe, tu tutor de español con inteligencia artificial.", true], ["¿De qué quieres hablar hoy?", true]];
    VC.lastPro = vcPlain(greet.map((x) => x[0]).join(" ")); vcCap("", VC.lastPro);
    const go = () => vcSay(greet, () => vcListen());
    if (typeof IS_IOS !== "undefined" && IS_IOS && typeof MIC_OK !== "undefined" && !MIC_OK && typeof micAsk === "function") micAsk().then(() => go()); else go();
  }
  function vcMinimize() {
    VC.paused = true; vcStopMic(); const root = document.getElementById("vcall"); if (root) root.hidden = true; document.body.classList.remove("vc-open");
    let p = document.getElementById("vc-pill"); if (!p) { p = document.createElement("button"); p.id = "vc-pill"; p.type = "button"; p.dataset.act = "vc-resume"; document.body.appendChild(p); }
    p.innerHTML = vcI("video") + "<span><b>Call paused</b><small>Tap to talk to " + esc(pName()) + "</small></span>"; p.setAttribute("aria-label", "Return to the video call with " + pName());
  }
  function vcResume() { const root = document.getElementById("vcall"); if (!root) return; root.hidden = false; document.body.classList.add("vc-open"); const p = document.getElementById("vc-pill"); if (p) p.remove(); VC.paused = false; VC.empties = 0; vcListen(); }
  function vcCamOff() { if (VC.cam) { try { VC.cam.getTracks().forEach((t) => t.stop()); } catch (e) {} VC.cam = null; } const v = document.getElementById("vc-self"); if (v) { v.srcObject = null; v.hidden = true; } }
  async function vcCam() {
    if (VC.cam) { vcCamOff(); vcRepaint(); return; }
    try { if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw { name: "NotSupportedError" };
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 480 }, height: { ideal: 640 } }, audio: false }); if (!VC.on) { s.getTracks().forEach((t) => t.stop()); return; }
      VC.cam = s; vcRepaint(); const v = document.getElementById("vc-self"); if (v) { v.srcObject = s; v.hidden = false; try { await v.play(); } catch (e) {} }
    } catch (e) { const n = e && e.name; vcToast(/NotAllowed|Security/.test(n) ? "Camera blocked. You can keep talking with just your microphone." : "No camera available here. You can keep talking with just your microphone."); }
  }
  function vcRepaint() { // the bar only, so the face and captions keep their state
    const root = document.getElementById("vcall"); if (!root) return; const tmp = document.createElement("div"); tmp.innerHTML = vcxHTML(); const nb = tmp.querySelector(".vc-bar"), ob = root.querySelector(".vc-bar"); if (nb && ob) ob.replaceWith(nb);
    const cap = root.querySelector("#vc-cap"); if (cap) cap.hidden = !VC.cc;
  }
  function vcToast(t) { const root = document.getElementById("vcall"); if (!root) return; let e = root.querySelector(".vc-toast"); if (!e) { e = document.createElement("p"); e.className = "vc-toast"; e.setAttribute("role", "status"); root.appendChild(e); } e.textContent = t; clearTimeout(VC.tt); VC.tt = setTimeout(() => e.remove(), 4500); }
  function vcEnd() {
    if (!VC.on) return; const secs = Math.round((Date.now() - VC.t0) / 1000), turns = VC.metrics.length;
    VC.on = false; window.__vcOn = false; VC.gen++; clearInterval(VC.qi); clearInterval(VC.tick); cancelAnimationFrame(VC_RAF); vcStopMic(); vcCamOff();
    try { if (typeof SPK_GEN !== "undefined") SPK_GEN++; } catch (e) {} try { if (typeof tBusy !== "undefined" && tBusy && tCtl) tCtl.abort(); } catch (e) {}
    try { speechSynthesis.cancel(); } catch (e) {} avStopAll();
    const root = document.getElementById("vcall"); if (root) root.remove(); const p = document.getElementById("vc-pill"); if (p) p.remove(); document.body.classList.remove("vc-open");
    try { if (VC.wasWake && typeof hfWakeStart === "function") hfWakeStart(); } catch (e) {} VC.wasWake = false;
    try { if (typeof coachToast === "function" && secs > 5) coachToast("Call ended · " + Math.floor(secs / 60) + ":" + String(secs % 60).padStart(2, "0") + " · " + turns + " answers from " + pName() + (vcP("corr", "flow") === "end" ? " · say or type “review my call” for your feedback" : "")); } catch (e) {}
    try { if (typeof tRender === "function" && document.body.classList.contains("tutor-open")) tRender(); } catch (e) {}
  }
  window.__vc = { open: vcOpen, end: vcEnd, state: () => VC.st, st: VC, av: AV, turn: (t) => vcTurn(t), interrupt: vcInterrupt, minimize: vcMinimize, resume: vcResume, vis: visOf, note: () => window.__vcNote() };

  document.addEventListener("click", (ev) => {
    const b = ev.target.closest && ev.target.closest("[data-act^='vc-']"); if (!b) return; const a = b.dataset.act;
    if (a === "vc-open") { ev.preventDefault(); vcOpen(); return; }
    if (a === "vc-resume") { vcResume(); return; }
    if (!VC.on) return;
    if (a === "vc-end") { vcEnd(); return; }
    if (a === "vc-tap") { if (VC.st === "speaking" || AV.speaking) vcInterrupt(); else if (VC.blocked) { VC.blocked = false; vcListen(); } else if (/paused|disconnected|reconnecting|muted/.test(VC.st)) { if (VC.muted) { VC.muted = false; vcRepaint(); } VC.empties = 0; VC.fails = 0; vcListen(); } return; }
    if (a === "vc-mute") { VC.muted = !VC.muted; vcRepaint(); if (VC.muted) { vcStopMic(); vcSet("muted", "You’re muted. Tap the mic to talk."); } else if (!AV.speaking) vcListen(); return; }
    if (a === "vc-cc") { VC.cc = !VC.cc; TS.vc_cc = VC.cc; tsave(); vcRepaint(); return; }
    if (a === "vc-rate") { const R = [0.8, 0.9, 1, 1.1], k = R.indexOf(vcRate()); TS.vc_rate = R[(k + 1) % R.length]; tsave(); window.__vcRate = TS.vc_rate; vcPaintBar(); return; }
    if (a === "vc-cam") { vcCam(); return; }
    if (a === "vc-set") { const s = document.getElementById("vc-sheet"); if (!s) return; s.hidden = !s.hidden; if (!s.hidden) s.innerHTML = vcSheet(); return; }
    if (a === "vc-opt") { TS["vc_" + b.dataset.k] = b.dataset.v; tsave(); const s = document.getElementById("vc-sheet"); if (s) s.innerHTML = vcSheet(); return; }
  });
  // the self-view can be dragged out of the way
  (function () { let d = null; document.addEventListener("pointerdown", (e) => { const v = e.target.closest && e.target.closest("#vc-self"); if (!v) return; const r = v.getBoundingClientRect(); d = { v, dx: e.clientX - r.left, dy: e.clientY - r.top }; try { v.setPointerCapture(e.pointerId); } catch (x) {} });
    document.addEventListener("pointermove", (e) => { if (!d) return; const W = innerWidth, H = innerHeight, r = d.v.getBoundingClientRect(); d.v.style.left = Math.max(8, Math.min(W - r.width - 8, e.clientX - d.dx)) + "px"; d.v.style.top = Math.max(8, Math.min(H - r.height - 8, e.clientY - d.dy)) + "px"; d.v.style.right = "auto"; });
    document.addEventListener("pointerup", () => { d = null; }); })();
  // app in the background / screen locked: stop listening; back in front: carry on
  document.addEventListener("visibilitychange", () => { if (!VC.on || VC.paused) return; if (document.hidden) { vcStopMic(); try { speechSynthesis.cancel(); } catch (e) {} avStopAll(); vcSet("paused", "Tap to talk"); } else { VC.empties = 0; vcListen(); } });
  /* ==================== /Profe video call ==================== */
