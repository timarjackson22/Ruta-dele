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

  /* ---------- the scene (v229): Profe as a lit, Pixar-style character in a warm café (original art, drawn in code) ----------
     The character follows the learner's chosen Profe look (skin, hair style, beard, glasses, clothes). Everything that moves
     has a class: vc-head (head sway, pivot at the neck), vc-body (breathing), vc-lid (eyelids), vc-iris (gaze), vc-brow,
     vc-mouth / vc-teeth / vc-tongue (speech). The background is out of focus like a camera's depth of field. */
  const vcShade = (hex, f) => { const n = parseInt(hex.slice(1), 16), c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.max(0, Math.min(255, Math.round(v * f)))); return "#" + c.map((v) => v.toString(16).padStart(2, "0")).join(""); };
  const VC_EYE = [[150, 408], [250, 408]];
  function vcScene() {
    if (window.__vcFailFace) throw new Error("test: no face");
    const keys = Object.keys(PV_PORTRAITS); const k0 = (typeof pvKey === "function" ? pvKey() : "") || keys[0], o = PV_PORTRAITS[k0] || PV_PORTRAITS[keys[0]];
    const sk = o.skin, skL = vcShade(sk, 1.22), skD = vcShade(sk, 0.72), skDD = vcShade(sk, 0.56), hr = o.hair, hrL = vcShade(hr, 1.9), hrD = vcShade(hr, 0.7), sh = o.shirt, shL = vcShade(sh, 1.3), shD = vcShade(sh, 0.62);
    const es = (typeof S !== "undefined" && S.region === "es");
    const B = [];
    // --- the café, out of focus
    B.push('<defs>' +
      '<filter id="vcBlur" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="5"/></filter><filter id="vcBlur2" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="9"/></filter><filter id="vcSoft"><feGaussianBlur stdDeviation="2.2"/></filter><filter id="vcSoft6" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6"/></filter>' +
      '<linearGradient id="vcWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a3020"/><stop offset=".55" stop-color="#2e1d12"/><stop offset="1" stop-color="#1a110a"/></linearGradient>' +
      '<radialGradient id="vcGlow" cx="76%" cy="17%" r="62%"><stop offset="0" stop-color="#ffcf8a" stop-opacity=".95"/><stop offset=".35" stop-color="#e8954a" stop-opacity=".45"/><stop offset="1" stop-color="#e8954a" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="vcBrass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8a5a2b"/><stop offset=".5" stop-color="#e2b46e"/><stop offset="1" stop-color="#7a4c22"/></linearGradient>' +
      '<radialGradient id="vcVig" cx="50%" cy="45%" r="75%"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>' +
      '<radialGradient id="vcSkin" cx="60%" cy="34%" r="72%"><stop offset="0" stop-color="' + skL + '"/><stop offset=".5" stop-color="' + sk + '"/><stop offset=".86" stop-color="' + skD + '"/><stop offset="1" stop-color="' + skDD + '"/></radialGradient>' +
      '<linearGradient id="vcSide" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="' + skDD + '" stop-opacity=".55"/><stop offset=".35" stop-color="' + skDD + '" stop-opacity="0"/><stop offset=".8" stop-color="#ffd9a8" stop-opacity="0"/><stop offset="1" stop-color="#ffd9a8" stop-opacity=".22"/></linearGradient>' +
      '<linearGradient id="vcNeck" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + skDD + '"/><stop offset=".45" stop-color="' + skD + '"/><stop offset="1" stop-color="' + sk + '"/></linearGradient>' +
      '<linearGradient id="vcShirt" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + shD + '"/><stop offset=".55" stop-color="' + sh + '"/><stop offset="1" stop-color="' + shL + '"/></linearGradient>' +
      '<radialGradient id="vcHair" cx="62%" cy="25%" r="80%"><stop offset="0" stop-color="' + hrL + '"/><stop offset=".45" stop-color="' + hr + '"/><stop offset="1" stop-color="' + hrD + '"/></radialGradient>' +
      '<radialGradient id="vcIris" cx="45%" cy="40%" r="60%"><stop offset="0" stop-color="#a8703e"/><stop offset=".6" stop-color="#5a3216"/><stop offset="1" stop-color="#26140a"/></radialGradient>' +
      '<radialGradient id="vcSclera" cx="50%" cy="40%" r="60%"><stop offset=".6" stop-color="#fffaf3"/><stop offset="1" stop-color="#e8dccd"/></radialGradient>' +
      VC_EYE.map(([x, y], n) => '<clipPath id="vcEye' + n + '"><ellipse cx="' + x + '" cy="' + y + '" rx="31" ry="27"/></clipPath>').join("") +
      '<clipPath id="vcMouthClip"><path class="vc-mclip" d=""/></clipPath></defs>');
    B.push('<g class="vc-bg" filter="url(#vcBlur)"><rect x="-20" y="-20" width="440" height="900" fill="url(#vcWall)"/>' +
      // shelves with books and jars (left), a screen and a plant
      '<g opacity=".85"><rect x="-20" y="290" width="150" height="10" fill="#6b4428"/><rect x="-20" y="420" width="150" height="10" fill="#6b4428"/>' +
      [[0, 238, 14, 52, "#8c3b2e"], [16, 246, 12, 44, "#c9a24d"], [30, 236, 16, 54, "#3f5f7a"], [48, 250, 11, 40, "#7a8f4a"], [70, 256, 26, 34, "#d9c7a6"], [100, 248, 14, 42, "#a4472f"], [4, 372, 30, 48, "#c2a27a"], [40, 380, 12, 40, "#5b4a8a"], [54, 366, 14, 54, "#2f6f5a"], [72, 376, 13, 44, "#b65f3c"], [92, 384, 24, 36, "#e0d2b8"]].map(([x, y, w, h, c]) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="2" fill="' + c + '"/>').join("") + "</g>" +
      '<rect x="262" y="520" width="170" height="130" rx="6" fill="#1f2b33" opacity=".75"/><g stroke="#5c8aa0" stroke-width="2" opacity=".35">' + [540, 556, 572, 588, 604, 620].map((y, n) => '<path d="M276 ' + y + 'h' + (60 + (n * 37) % 70) + '"/>').join("") + "</g>" +
      '<g fill="#2f5a36" opacity=".9"><ellipse cx="18" cy="640" rx="34" ry="12" transform="rotate(-35 18 640)"/><ellipse cx="44" cy="610" rx="30" ry="10" transform="rotate(-70 44 610)"/><ellipse cx="6" cy="690" rx="38" ry="12" transform="rotate(-15 6 690)"/><ellipse cx="60" cy="660" rx="28" ry="9" transform="rotate(-50 60 660)"/></g>' +
      '<rect x="-20" y="-20" width="440" height="900" fill="url(#vcGlow)"/>' +
      // the pendant lamp
      '<path d="M300 -20V88" stroke="#2a1a10" stroke-width="3"/><path d="M246 92h108l26 52H220z" fill="url(#vcBrass)"/><ellipse cx="300" cy="144" rx="80" ry="10" fill="#ffe2a8" opacity=".9"/><circle cx="300" cy="150" r="16" fill="#fff6dc"/>' +
      "</g>" +
      // bokeh lights, softer still
      '<g filter="url(#vcBlur2)">' + [[60, 120, 16, "#ffd08a", 0.55], [120, 70, 10, "#ffb35c", 0.5], [360, 260, 20, "#ffd9a0", 0.4], [30, 470, 14, "#ffc070", 0.35], [380, 470, 12, "#ffe0b0", 0.4], [330, 360, 9, "#fff0d0", 0.5], [90, 330, 8, "#ffcc80", 0.45], [210, 120, 12, "#ffd9a0", 0.35], [370, 600, 16, "#ffb35c", 0.3]].map(([x, y, r, c, a]) => '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + c + '" opacity="' + a + '"/>').join("") + "</g>" +
      // bunting: Spain's colours, or Latin American papel picado
      '<g filter="url(#vcSoft)" opacity=".8" transform="translate(0 78)"><path d="M-10 36Q200 92 410 40" stroke="#3a2618" stroke-width="2" fill="none"/>' +
      Array.from({ length: 9 }, (_, n) => { const x = 8 + n * 47, y = 36 + Math.sin((n + 0.5) / 9 * Math.PI) * 27; const c = es ? ["#c60b1e", "#ffc400"][n % 2] : ["#ff4d8d", "#2bb3e8", "#ffcf3a", "#38c172", "#ff8a3d", "#9b6bff"][n % 6];
        return es ? '<path d="M' + x + " " + y + "h34l-17 34z" + '" fill="' + c + '"/>' : '<path d="M' + x + " " + (y - 2) + "h34v30l-5-5-6 5-6-5-6 5-6-5-5 5z" + '" fill="' + c + '" opacity=".92"/><circle cx="' + (x + 17) + '" cy="' + (y + 12) + '" r="5" fill="#2e1d12" opacity=".25"/>'; }).join("") + "</g>");
    B.push('<rect x="-20" y="-20" width="440" height="900" fill="#140c06" opacity=".26"/>');
    // --- Profe
    const C = [];
    C.push('<g class="vc-body"><path d="M-60 1120L-40 780C-10 680 84 618 200 608C316 618 410 680 440 780L460 1120Z" fill="url(#vcShirt)"/>' +
      '<path d="M140 604Q200 660 260 604Q200 638 140 604Z" fill="' + shD + '"/><path d="M144 608Q200 654 256 608" stroke="' + shL + '" stroke-width="3" fill="none" opacity=".35"/>' +
      '<g stroke="' + shD + '" stroke-width="2" opacity=".18">' + [60, 90, 120, 280, 310, 340].map((x) => '<path d="M' + x + " " + (x < 200 ? 880 - (200 - x) * 0.2 : 880 - (x - 200) * 0.2) + "L" + (x + (x < 200 ? 26 : -26)) + " " + (720 + Math.abs(200 - x) * 0.3) + '"/>').join("") + "</g>" +
      '<path d="M40 790C70 732 110 700 150 686M360 790C330 732 290 700 250 686" stroke="' + shD + '" stroke-width="6" fill="none" opacity=".3" stroke-linecap="round"/></g>');
    C.push('<g class="vc-head">');
    C.push('<path d="M150 530C150 568 146 596 136 614C176 636 224 636 264 614C254 596 250 568 250 530Z" fill="url(#vcNeck)"/>' +
      '<ellipse cx="200" cy="566" rx="58" ry="22" fill="' + skDD + '" opacity=".75" filter="url(#vcSoft6)"/>');
    const st = o.style;
    if (st === "long" || st === "bob" || st === "curly") C.push(st === "long" ? '<path d="M70 350C52 470 50 580 64 664C112 680 138 640 146 570L134 372ZM330 350C348 470 350 580 336 664C288 680 262 640 254 570L266 372Z" fill="url(#vcHair)"/>'
      : st === "bob" ? '<path d="M64 372C54 452 58 518 84 560C120 572 136 540 140 508L130 372ZM336 372C346 452 342 518 316 560C280 572 264 540 260 508L270 372Z" fill="url(#vcHair)"/>'
      : [[78, 396, 34], [70, 452, 32], [84, 506, 28], [322, 396, 34], [330, 452, 32], [316, 506, 28]].map(([x, y, r]) => '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="url(#vcHair)"/>').join(""));
    C.push([76, 324].map((x) => '<ellipse cx="' + x + '" cy="428" rx="19" ry="30" fill="' + skD + '"/><ellipse cx="' + (x + (x < 200 ? 4 : -4)) + '" cy="430" rx="8" ry="16" fill="' + skDD + '" opacity=".6"/>').join(""));
    C.push('<path class="vc-face-shape" d="M200 252C298 252 334 332 330 414C327 486 300 544 254 560Q200 578 146 560C100 544 73 486 70 414C66 332 102 252 200 252Z" fill="url(#vcSkin)"/>' +
      '<path d="M200 252C298 252 334 332 330 414C327 486 300 544 254 560Q200 578 146 560C100 544 73 486 70 414C66 332 102 252 200 252Z" fill="url(#vcSide)"/>' +
      '<path d="M318 360C330 410 326 470 300 516" stroke="#ffe0b0" stroke-width="6" fill="none" opacity=".28" stroke-linecap="round" filter="url(#vcSoft)"/>' +
      '<path d="M88 470C104 520 140 548 176 556M312 470C296 520 260 548 224 556" stroke="' + skDD + '" stroke-width="10" fill="none" opacity=".22" stroke-linecap="round" filter="url(#vcSoft6)"/><ellipse cx="200" cy="548" rx="26" ry="10" fill="#fff" opacity=".1" filter="url(#vcSoft)"/>' +
      '<ellipse cx="200" cy="292" rx="110" ry="30" fill="' + skDD + '" opacity=".28" filter="url(#vcSoft6)"/><ellipse cx="262" cy="440" rx="30" ry="22" fill="#fff" opacity=".07" filter="url(#vcSoft6)"/>' +
      '<ellipse cx="132" cy="474" rx="30" ry="17" fill="#e2665a" opacity=".07" filter="url(#vcSoft6)"/><ellipse cx="268" cy="474" rx="30" ry="17" fill="#e2665a" opacity=".07" filter="url(#vcSoft6)"/>' +
      '<ellipse cx="226" cy="318" rx="34" ry="16" fill="#fff" opacity=".1" filter="url(#vcSoft6)"/>');
    // eyes: sclera, iris (moves), eyelid (blinks), lashes; then brows
    VC_EYE.forEach(([x, y], n) => C.push('<ellipse cx="' + x + '" cy="' + (y + 2) + '" rx="36" ry="31" fill="' + skDD + '" opacity=".2" filter="url(#vcSoft)"/>' +
      '<path d="M' + (x - 30) + " " + (y - 30) + "Q" + x + " " + (y - 44) + " " + (x + 30) + " " + (y - 30) + '" stroke="' + skDD + '" stroke-width="2.2" fill="none" opacity=".4" stroke-linecap="round"/>' +
      '<g clip-path="url(#vcEye' + n + ')"><ellipse cx="' + x + '" cy="' + y + '" rx="31" ry="27" fill="url(#vcSclera)"/>' +
      '<g class="vc-iris"><circle cx="' + x + '" cy="' + (y + 1) + '" r="17.5" fill="url(#vcIris)"/><circle cx="' + x + '" cy="' + (y + 1) + '" r="8.4" fill="#120a06"/><circle cx="' + (x + 6) + '" cy="' + (y - 6) + '" r="5" fill="#fff" opacity=".95"/><circle cx="' + (x - 6) + '" cy="' + (y + 7) + '" r="2" fill="#fff" opacity=".6"/></g>' +
      '<path class="vc-lid" data-x="' + x + '" data-y="' + y + '" d="" fill="' + skD + '"/></g>' +
      '<path class="vc-lash" data-x="' + x + '" data-y="' + y + '" d="" stroke="#22150e" stroke-width="3.2" fill="none" stroke-linecap="round"/>' +
      '<path d="M' + (x - 24) + " " + (y + 25) + "Q" + x + " " + (y + 32) + " " + (x + 24) + " " + (y + 25) + '" stroke="' + skDD + '" stroke-width="1.6" fill="none" opacity=".4"/>'));
    C.push('<g class="vc-brows">' + VC_EYE.map(([x, y], n) => '<path d="M' + (x - 28) + " " + (y - (n ? 52 : 46)) + "Q" + x + " " + (y - 64) + " " + (x + 28) + " " + (y - (n ? 46 : 52)) + '" stroke="' + hrD + '" stroke-width="7" fill="none" stroke-linecap="round"/>').join("") + "</g>");
    // nose
    C.push('<path d="M190 412C186 430 182 444 180 452" stroke="' + skDD + '" stroke-width="3" fill="none" opacity=".22" stroke-linecap="round" filter="url(#vcSoft)"/>' +
      '<ellipse cx="200" cy="464" rx="22" ry="7" fill="' + skDD + '" opacity=".4" filter="url(#vcSoft)"/>' +
      '<path d="M178 452C178 440 188 434 200 434C212 434 222 440 222 452C222 462 212 466 200 466C188 466 178 462 178 452Z" fill="' + sk + '"/>' +
      '<ellipse cx="190" cy="459" rx="5" ry="2.4" fill="' + skDD + '" opacity=".22"/><ellipse cx="210" cy="459" rx="5" ry="2.4" fill="' + skDD + '" opacity=".22"/><path d="M200 414V440" stroke="#fff" stroke-width="5" opacity=".1" stroke-linecap="round" filter="url(#vcSoft)"/><ellipse cx="206" cy="444" rx="7" ry="5" fill="#fff" opacity=".28" filter="url(#vcSoft)"/>');
    // mouth: the opening, teeth and tongue (clipped to the opening), lips over it
    C.push('<g class="vc-mouthg"><path class="vc-mouth-in" d="" fill="#4a1a1a"/><g clip-path="url(#vcMouthClip)"><path class="vc-teeth" d="" fill="#fbf8f2"/><ellipse class="vc-tongue" cx="200" cy="520" rx="0" ry="0" fill="#c24f58"/></g>' +
      '<path class="vc-mouth" d="" fill="none" stroke="' + o.lips + '" stroke-width="5.5" stroke-linejoin="round" stroke-linecap="round"/><ellipse class="vc-lip2" cx="200" cy="514" rx="12" ry="3" fill="#fff" opacity=".16"/></g>' +
      '<path d="M190 540Q200 546 210 540" stroke="' + skDD + '" stroke-width="2" fill="none" opacity=".35"/>');
    if (o.beard) C.push('<path d="M86 446C92 532 140 572 200 576C260 572 308 532 314 446C302 504 266 538 232 544C222 532 210 528 200 528C190 528 178 532 168 544C134 538 98 504 86 446Z" fill="' + hr + '" opacity=".62" filter="url(#vcSoft)"/>' +
      '<path d="M166 492C178 482 192 483 200 488C208 483 222 482 234 492C222 489 210 491 200 494C190 491 178 489 166 492Z" fill="' + hr + '" opacity=".8"/>');
    // hair, in front
    const front = {
      short: '<path d="M72 392C58 276 118 206 204 206C292 206 346 276 328 392C320 336 298 302 266 290C228 312 168 312 130 290C102 306 82 342 72 392Z" fill="url(#vcHair)"/><path d="M128 246C168 222 244 220 290 250M110 286C150 262 230 258 300 290" stroke="' + hrL + '" stroke-width="3" fill="none" opacity=".3" stroke-linecap="round"/>',
      long: '<path d="M68 410C56 290 118 214 202 214C288 214 346 290 332 410C322 334 292 296 252 282C218 302 154 308 114 298C92 320 76 360 68 410Z" fill="url(#vcHair)"/><path d="M130 250C170 228 240 228 288 254" stroke="' + hrL + '" stroke-width="3" fill="none" opacity=".3"/>',
      bob: '<path d="M64 420C52 296 118 212 202 212C288 212 350 296 336 420C326 342 296 298 262 286C222 304 158 306 120 292C94 318 74 362 64 420Z" fill="url(#vcHair)"/>',
      curly: [[104, 300, 36], [142, 258, 38], [196, 240, 40], [250, 256, 38], [292, 296, 36], [84, 352, 28], [316, 350, 28], [170, 276, 28], [226, 276, 28]].map(([x, y, r]) => '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="url(#vcHair)"/>').join(""),
      side: '<path d="M72 392C62 282 124 214 208 214C292 216 342 282 328 380C308 322 266 290 212 286C176 300 136 322 104 334C88 350 78 368 72 392Z" fill="url(#vcHair)"/><path d="M120 300C166 266 240 258 298 284" stroke="' + hrL + '" stroke-width="4" fill="none" opacity=".35"/>',
      buzz: '<path d="M78 366C74 284 128 236 200 236C272 236 326 284 322 366C308 316 266 288 200 288C134 288 92 316 78 366Z" fill="' + hr + '" opacity=".85"/>',
    }[st] || "";
    C.push(front + '<path d="M120 270C160 238 244 236 286 268" stroke="' + hrL + '" stroke-width="3" fill="none" opacity=".25"/>');
    if (o.glasses) C.push('<g fill="#fff" fill-opacity=".06" stroke="#2a221d" stroke-width="4">' + VC_EYE.map(([x, y]) => '<rect x="' + (x - 44) + '" y="' + (y - 36) + '" width="88" height="68" rx="26"/>').join("") + '</g><path d="M194 402Q200 394 206 402M106 398L76 392M294 398L324 392" stroke="#2a221d" stroke-width="4" fill="none"/>' +
      '<path d="M120 380L136 368M216 380L232 368" stroke="#fff" stroke-width="5" opacity=".18" stroke-linecap="round"/>');
    C.push("</g>");
    return '<svg class="vc-scene vc-svg" viewBox="0 0 400 860" preserveAspectRatio="xMidYMid slice" role="img" aria-label="' + esc(pName()) + ', AI tutor">' + B.join("") + '<g class="vc-char" transform="translate(200 300) scale(.82) translate(-200 -300)">' + C.join("") + "</g>" + '<rect width="400" height="860" fill="url(#vcVig)" pointer-events="none"/></svg>';
  }
  const vcFace = vcScene;
  let VC_RAF = 0, VC_BLINK = 0, VC_BLINKT = 0, VC_GAZE = { x: 0, y: 0, tx: 0, ty: 0, t: 0 };
  function vcAnimate() {
    cancelAnimationFrame(VC_RAF);
    const reduce = (() => { try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } })();
    const step = (now) => {
      if (!VC.on) return;
      const root = document.getElementById("vcall"); const svg = root && root.querySelector(".vc-scene"); if (!svg) { VC_RAF = requestAnimationFrame(step); return; }
      // the mouth: the letter being spoken now, from the word the voice reported
      let tgt = VIS.rest; const c = AV.cur;
      if (c && c.words.length) {
        const per = (c.en ? 62 : 70) / Math.max(0.5, c.rate); let w = c.words[c.wi], el = now - c.wStart;
        if (!c.hasB) { while (w && el > w.len * per + 70 && c.wi < c.words.length - 1) { c.wStart += w.len * per + 70; c.wi++; w = c.words[c.wi]; el = now - c.wStart; } }
        if (w) { const k = Math.floor(el / per); tgt = k < w.len ? VIS[visOf(c.text[w.i + k], c.text[w.i + k + 1], c.en)] : c.hasB ? [5, 0.6] : VIS.rest; }
      }
      const m = AV.m, f = c ? 0.5 : 0.35; m.w += (tgt[0] - m.w) * f; m.h += (tgt[1] - m.h) * f; if (!c && m.h < 0.05) m.h = 0;
      const smile = VC.st === "listening" ? 3.4 : AV.smile ? 5 : 2.4, W = m.w * 6.4, H = m.h * 5.6, y = 508;
      const up = y + 1.5 - smile - H * 0.22, dn = y + 2.5 + H;
      const lips = "M" + (200 - W).toFixed(1) + " " + (y - smile * 0.4).toFixed(1) + "Q200 " + up.toFixed(1) + " " + (200 + W).toFixed(1) + " " + (y - smile * 0.4).toFixed(1) + "Q200 " + dn.toFixed(1) + " " + (200 - W).toFixed(1) + " " + (y - smile * 0.4).toFixed(1) + "Z";
      const q = (sel) => svg.querySelector(sel);
      const mo = q(".vc-mouth"), mi = q(".vc-mouth-in"), mc = q(".vc-mclip"), te = q(".vc-teeth"), tg = q(".vc-tongue");
      if (mo) mo.setAttribute("d", lips); if (mi) mi.setAttribute("d", H > 0.6 ? lips : ""); if (mc) mc.setAttribute("d", lips);
      if (te) te.setAttribute("d", H > 4 ? "M" + (200 - W * 0.7).toFixed(1) + " " + (up - 2).toFixed(1) + "h" + (W * 1.4).toFixed(1) + "v" + Math.min(7, 2 + H * 0.3).toFixed(1) + "h-" + (W * 1.4).toFixed(1) + "Z" : "");
      const l2 = q(".vc-lip2"); if (l2) { l2.setAttribute("cy", (dn + 3).toFixed(1)); l2.setAttribute("rx", (W * 0.45).toFixed(1)); }
      if (tg) { tg.setAttribute("cy", (dn - 2).toFixed(1)); tg.setAttribute("rx", H > 9 ? (W * 0.55).toFixed(1) : "0"); tg.setAttribute("ry", H > 9 ? (H * 0.32).toFixed(1) : "0"); }
      // eyelids: natural blinks every 2.5–6 s; a little lower while thinking
      if (now > VC_BLINKT) { VC_BLINK = now; VC_BLINKT = now + 2500 + Math.random() * 3500; }
      const bl = now - VC_BLINK, closeT = bl < 75 ? bl / 75 : bl < 165 ? 1 - (bl - 75) / 90 : 0;
      const think = VC.st === "thinking", base = think ? 0.2 : VC.st === "listening" ? 0.02 : 0.06, t = Math.max(base, closeT);
      svg.querySelectorAll(".vc-lid").forEach((l) => { const x = +l.dataset.x, yy = +l.dataset.y, e = yy - 14 + t * 42, mid = e - 16 * (1 - t); l.setAttribute("d", "M" + (x - 36) + " " + (yy - 34) + "H" + (x + 36) + "V" + e.toFixed(1) + "Q" + x + " " + mid.toFixed(1) + " " + (x - 36) + " " + e.toFixed(1) + "Z"); });
      svg.querySelectorAll(".vc-lash").forEach((l) => { const x = +l.dataset.x, yy = +l.dataset.y, e = yy - 14 + t * 42, mid = e - 16 * (1 - t); l.setAttribute("d", "M" + (x - 31) + " " + (e - 1).toFixed(1) + "Q" + x + " " + (mid - 1).toFixed(1) + " " + (x + 31) + " " + (e - 1).toFixed(1)); });
      // gaze: at the learner while listening, up and aside while thinking, small natural shifts while speaking
      if (now > VC_GAZE.t) { VC_GAZE.t = now + 900 + Math.random() * 1800; const s2 = c ? 3 : 1.5; VC_GAZE.tx = (Math.random() - 0.5) * s2 * 2; VC_GAZE.ty = (Math.random() - 0.5) * s2; }
      const gx = reduce ? 0 : think ? -6 : VC.st === "listening" ? 0 : VC_GAZE.tx, gy = reduce ? 0 : think ? -6 : VC.st === "listening" ? 0 : VC_GAZE.ty;
      VC_GAZE.x += (gx - VC_GAZE.x) * 0.15; VC_GAZE.y += (gy - VC_GAZE.y) * 0.15;
      svg.querySelectorAll(".vc-iris").forEach((g) => g.setAttribute("transform", "translate(" + VC_GAZE.x.toFixed(2) + " " + VC_GAZE.y.toFixed(2) + ")"));
      const br = q(".vc-brows"); if (br) br.setAttribute("transform", "translate(0 " + (VC.st === "listening" ? -4 : think ? -3 : AV.smile ? -2 : 0) + ")");
      // head and body: restrained, a little more while speaking; a slight tilt while listening; breathing
      if (!reduce) { const s = now / 1000, amp = c ? 1 : 0.5; const rot = Math.sin(s * 0.8) * 1.1 * amp + (VC.st === "listening" ? 2 : 0) + (c ? Math.sin(s * 2.1) * 0.5 : 0), ty = Math.sin(s * 1.2) * 1.4 * amp;
        const hd = q(".vc-head"); if (hd) hd.setAttribute("transform", "translate(0 " + ty.toFixed(2) + ") rotate(" + rot.toFixed(2) + " 200 640)");
        const bd = q(".vc-body"); if (bd) bd.setAttribute("transform", "translate(0 " + (Math.sin(s * 1.6) * 1.2).toFixed(2) + ")"); }
      VC_RAF = requestAnimationFrame(step);
    };
    VC_RAF = requestAnimationFrame(step);
  }
  window.__vcMouthH = () => AV.m.h;

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
    return '<button type="button" class="vc-stage" data-act="vc-tap" aria-label="' + esc(pName()) + '. Tap to interrupt or to talk">' +
        (VC.audioOnly ? '<span class="vc-audio"><span class="vc-aav">' + esc(pName()[0]) + "</span><small>Audio only · the animation couldn’t load</small></span>" : '<span class="vc-face">' + face + "</span>") + "</button>" +
      '<div class="vc-top"><span class="vc-who"><b>' + esc(pName()) + '</b><span class="vc-ai" title="Profe is an AI tutor">AI tutor</span></span><span class="vc-pill"><i class="vc-dot" aria-hidden="true"></i><span class="vc-st" id="vc-st" role="status" aria-live="polite"></span><span class="vc-time" id="vc-time">0:00</span></span>' +
        '<button class="vc-ibtn" data-act="vc-set" aria-label="Call settings">' + vcI("gear") + "</button></div>" +
      '<video class="vc-self" id="vc-self" playsinline muted autoplay hidden aria-label="Your camera (only on your screen)"></video>' +
      '<div class="vc-bottom"><span class="vc-hint" id="vc-hint"></span>' +
        '<div class="vc-cap" id="vc-cap" aria-live="polite"' + (VC.cc ? "" : " hidden") + '><p class="vc-you" id="vc-you"></p><p class="vc-pro" id="vc-pro"></p></div>' +
        '<div class="vc-bar" role="toolbar" aria-label="Call controls">' +
          '<button class="vc-b" data-act="vc-mute" aria-pressed="' + VC.muted + '" aria-label="' + (VC.muted ? "Unmute microphone" : "Mute microphone") + '">' + vcI(VC.muted ? "micoff" : "mic") + "</button>" +
          '<button class="vc-b" data-act="vc-cc" aria-pressed="' + VC.cc + '" aria-label="Captions ' + (VC.cc ? "on" : "off") + '">' + vcI("cc") + "</button>" +
          '<button class="vc-b vc-endb" data-act="vc-end" aria-label="End call">' + vcI("end") + "</button>" +
          '<button class="vc-b" data-act="vc-rate" aria-label="Speech speed ' + rate.toFixed(1) + '×"><b class="vc-rt">' + rate.toFixed(1) + "×</b></button>" +
          '<button class="vc-b" data-act="vc-cam" aria-pressed="' + !!VC.cam + '" aria-label="' + (VC.cam ? "Turn camera off" : "Turn camera on") + '">' + vcI(VC.cam ? "cam" : "camoff") + "</button></div></div>" +
      '<div class="vc-sheet" id="vc-sheet" hidden></div>';
  }
  function vcSheet() {
    const opt = (k, map, d) => '<div class="vc-opts" role="group">' + Object.entries(map).map(([v, [n]]) => '<button class="vc-o" data-act="vc-opt" data-k="' + k + '" data-v="' + v + '" aria-pressed="' + (vcP(k, d) === v) + '">' + n + "</button>").join("") + "</div>";
    const ms = VC.metrics.slice(-20).map((x) => x.lat).filter((x) => x > 0).sort((a, b) => a - b), med = ms.length ? ms[Math.floor(ms.length / 2)] : null;
    return '<div class="vc-sh-in"><span class="vc-grab" aria-hidden="true"></span><div class="vc-sh-h"><b>Call settings</b><button class="vc-ibtn" data-act="vc-set" aria-label="Close settings">✕</button></div>' +
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
    if (a === "vc-set") { const s = document.getElementById("vc-sheet"); if (!s) return; s.hidden = !s.hidden; if (!s.hidden) s.innerHTML = vcSheet(); const r = document.getElementById("vcall"); if (r) r.classList.toggle("vc-sheet-on", !s.hidden);
      if (!s.hidden && !s.__sw) { s.__sw = 1; let y0 = null; s.addEventListener("touchstart", (e) => { y0 = (s.querySelector(".vc-sh-in") || s).scrollTop > 0 ? null : e.touches[0].clientY; }, { passive: true });
        s.addEventListener("touchend", (e) => { if (y0 != null && e.changedTouches[0].clientY - y0 > 70) { s.hidden = true; if (r) r.classList.remove("vc-sheet-on"); } y0 = null; }, { passive: true }); }
      return; }
    if (a === "vc-opt") { TS["vc_" + b.dataset.k] = b.dataset.v; tsave(); const s = document.getElementById("vc-sheet"); if (s) s.innerHTML = vcSheet(); return; }
  });
  // the self-view can be dragged out of the way
  (function () { let d = null; document.addEventListener("pointerdown", (e) => { const v = e.target.closest && e.target.closest("#vc-self"); if (!v) return; const r = v.getBoundingClientRect(); d = { v, dx: e.clientX - r.left, dy: e.clientY - r.top }; try { v.setPointerCapture(e.pointerId); } catch (x) {} });
    document.addEventListener("pointermove", (e) => { if (!d) return; const W = innerWidth, H = innerHeight, r = d.v.getBoundingClientRect(); d.v.style.left = Math.max(8, Math.min(W - r.width - 8, e.clientX - d.dx)) + "px"; d.v.style.top = Math.max(8, Math.min(H - r.height - 8, e.clientY - d.dy)) + "px"; d.v.style.right = "auto"; });
    document.addEventListener("pointerup", () => { d = null; }); })();
  // app in the background / screen locked: stop listening; back in front: carry on
  document.addEventListener("visibilitychange", () => { if (!VC.on || VC.paused) return; if (document.hidden) { vcStopMic(); try { speechSynthesis.cancel(); } catch (e) {} avStopAll(); vcSet("paused", "Tap to talk"); } else { VC.empties = 0; vcListen(); } });
  /* ==================== /Profe video call ==================== */
