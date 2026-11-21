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
  const VC_LANG = { immersion: ["Spanish only", "Speak only Spanish, slowly and simply at the learner's level; never switch to English unless they explicitly ask."], bilingual: ["Spanish first", "Speak Spanish the whole call, at the learner's level; don't translate your replies into English. If the learner speaks English, understand them, give them the Spanish way to say it and invite them to say it themselves (e.g. «Puedes decir: “Perdí el autobús”. Ahora inténtalo tú: ¿por qué llegaste tarde?»), warmly, without making it feel like a punishment. One English word inside a Spanish sentence is not a request to switch. Use English only when they explicitly ask for an explanation in English (brief, then back to Spanish) or when told below to coach a repeated mistake."], english: ["Mostly English", "Explain in English and use Spanish for the examples and the practice phrases."] };
  const VC_CORR = { every: ["Correct every mistake (gently)", "Correct every real mistake the learner makes: start your reply with «Se dice: …» and the corrected sentence, add the reason in a few words when it helps, then carry on with the conversation. Never repeat a wrong sentence back as if it were right. After explaining something new, check it is clear («¿Está claro?»); if not, find which part is confusing and explain it another way with one example."], flow: ["Conversation first", "Correct only big or repeated mistakes, in one short phrase, then carry on with the conversation."], now: ["Immediate coaching", "When the learner makes a mistake, give the corrected Spanish and a one-line reason, invite a quick retry, then continue."], end: ["End-of-session review", "Don't correct during the call (only if meaning is unclear); the learner gets a review at the end."] };
  const vcP = (k, d) => (TS["vc_" + k] != null ? TS["vc_" + k] : d);

  /* ---------- the prompt note for the call ---------- */
  // English in Profe's other voice only for real coaching: an explicit request, a repeated mistake, or the «Mostly English» mode
  function vcEnOK() { return !!(VC.on && (vcP("lang", "bilingual") === "english" || VC.wantEn || VC.coachNow)); }
  window.__vcEnOK = vcEnOK;
  // v245: spoken-tutoring practice for language learning, added to every call turn
  function vcTeach() {
    const lv = (() => { try { return " (" + String(learnerLevel(pageCtx())).toUpperCase() + ")"; } catch (e) { return ""; } })();
    return "\n- HOW GOOD SPOKEN TUTORS TEACH (follow these every turn):" +
      "\n  · The learner should talk more than you: keep your turn under about 25 words and end it with a question or a clear invitation, so they know it's their turn." +
      "\n  · Comprehensible input: speak at the learner's level" + lv + ", just a little above it; reuse words they have just used; if they struggle, simplify, slow down and offer two choices («¿Prefieres la playa o la montaña?») or a sentence starter («Puedes decir: Me gusta… porque…»)." +
      "\n  · Correct mostly by recasting: say their idea back in correct Spanish inside your natural reply («Ah, ¿fuiste al mercado ayer? ¡Qué bien!»); stop to explain only when a mistake blocks meaning or keeps coming back." +
      "\n  · Ask open questions (¿qué?, ¿cómo?, ¿por qué?, cuéntame…) more than yes/no ones, and build each question on the details they just gave." +
      "\n  · Personal and memorable: use their name now and then (not every turn), bring back something they told you earlier, and connect new words to their life." +
      "\n  · Energy: sound genuinely interested and happy to talk — react to what they say («¡No me digas!», «¡Qué interesante!», «¡Me encanta!»), praise the specific thing they did well, celebrate attempts, vary your words (never the same praise twice in a row), and keep a light, friendly sense of humour." +
      "\n  · If they answer in English, stay in simple Spanish (unless they asked for English): show them how to say what they said in Spanish and invite them to try it." +
      "\n  · If they sound tired or frustrated, make it easier, encourage them warmly and offer a short break or a different activity.";
  }
  window.__vcNote = (compact) => {
    if (!VC.on) return "";
    const L = VC_LANG[vcP("lang", "bilingual")] || VC_LANG.bilingual, C = VC_CORR[vcP("corr", "every")] || VC_CORR.every;
    // v247: the on-device model holds ~2,048 tokens in all; the full call brief (~4,300 characters) filled most of it, so a
    // compact brief carries the essentials of good spoken tutoring for it
    if (compact) return "\n\nLIVE VIDEO CALL, spoken aloud. You are Profe, a warm, enthusiastic Spanish tutor." +
      "\n- Say 1–2 short sentences (under 25 words). No lists, markdown or emojis." +
      "\n- React to what they said with real interest, then ask ONE open question built on it." +
      "\n- Speak simple Spanish at their level" + (function () { try { return " (" + String(learnerLevel(pageCtx())).toUpperCase() + ")"; } catch (e) { return ""; } })() + ". If they answer in English, reply in simple Spanish and give them the Spanish for what they said." +
      "\n- Do NOT correct the learner and never say «Se dice», «Es correcto» or «Es una frase correcta»: the app checks their Spanish before you answer. If you notice a mistake, just use the right form naturally in your reply. Praise one specific thing; vary your words; use their name sometimes." +
      "\n- If they want to practise verbs, the app runs the drill; never ask «¿Quieres practicar…?» twice in a row: talk about their life instead." +
      "\n- After you explain something, ask «¿Está claro?». If not, find which part is confusing and explain it another way with one example." +
      (VC.fixSaid ? "\n- You have JUST told them: «Se dice: " + VC.fixSaid + "». Don't repeat it; carry on from it." : "") +
      "\n- Unsure what they said? Ask. Never invent facts." +
      "\n- Language: " + String(L[1]).slice(0, 160) + (vcP("corr", "every") === "every" ? "" : "\n- Corrections: " + String(C[1]).slice(0, 140)) +
      (VC.wantEn ? "\n- THIS TURN they asked for English: explain in 2 short English sentences, give the Spanish, then a short Spanish question." : "") +
      (VC.coachNow ? "\n- THIS TURN, in one short English sentence, coach the mistake they keep making (" + VC.coachNow.why + "): correct Spanish «" + VC.coachNow.to + "», invite a retry, then carry on in Spanish." : "") +
      (VC.instr.length ? "\n- For this call they asked: " + VC.instr.map((x) => "«" + x.slice(0, 80) + "»").join("; ") + "." : "");
    return "\n\nLIVE VIDEO CALL (spoken aloud):\n- You are Profe, an AI Spanish tutor, in a live voice call. Reply in 1–3 short spoken sentences: no lists, no markdown, no emojis, no headings.\n- Respond to what the learner actually meant; keep the conversation going with ONE natural follow-up question; allow them to change topic or stop.\n- If you are not sure what they said, ask one short clarification question. Never invent what they said.\n- What the learner says comes from speech recognition: it may be cut, misheard or mix English and Spanish. Keep their words in the language they used. If a word looks misheard or the meaning is unclear, ask ONE short, specific question instead of guessing; never correct something they may not have said.\n- Facts: check the meaning, not only the grammar. If they state something clearly false (e.g. «Barcelona es la capital de España»), say kindly that the Spanish is fine if it is, give the fact in one line (Madrid), then carry on. Opinions, preferences, jokes, hypotheticals and role-play are not errors. If a fact may be out of date or you're not sure, say so; never invent a source.\n- Corrections, when the mode calls for one: acknowledge what they meant, give the better Spanish, the key point in a few words (English unless they chose Spanish only), offer a quick retry when useful, then go back to the topic. Accept regional usage.\n- Be a good conversation partner: react to the specifics they said, build the next question on their answer, share a short example or a light joke now and then, suggest a role-play or a small challenge when it fits, give hints or an easier question if they struggle, and leave them thinking time. Don't fire question after question, don't lecture, don't repeat the same praise. Every so often, offer to keep going or switch activity.\n- A word they quote («how do you say ‘bookshelf’?») is not a request to switch language; only switch when they ask.\n- Be warm and enthusiastic, like a favourite teacher: notice what the learner did well and say so specifically («¡Muy bien!», «¡Eso es!», «¡Perfecto, «fui» es correcto!»), encourage every attempt, and keep the energy up with exclamations where natural." + vcTeach() + (VC.fixSaid ? "\n- You have JUST told the learner: «Se dice: " + VC.fixSaid + "». Don't repeat that correction; carry on from it." : "") + "\n- Language: " + L[1] + "\n- Corrections: " + C[1] +
      (VC.wantEn ? "\n- THIS TURN the learner explicitly asked for English: explain briefly in English (2–3 sentences), give the Spanish with one example, then invite them back into Spanish with a short question." : "") +
      (VC.coachNow ? "\n- THIS TURN, coach a repeated mistake in English (the learner has made it " + VC.coachNow.n + " times; check it really is in what they said, not a recognition error): say in one short English sentence what keeps going wrong (" + VC.coachNow.why + "), give the correct Spanish «" + VC.coachNow.to + "» in a useful example, invite a quick retry, then carry on in Spanish." : "") +
      (VC.instr.length ? "\n- The learner asked, for this whole call: " + VC.instr.map((x) => "«" + x + "»").join("; ") + ". Keep doing all of it." : "");
  };

  /* ---------- watching speech: lip sync from the words actually spoken ---------- */
  const AV = { cur: null, speaking: false, q: 0, lastEnd: 0, m: { w: 5.2, h: 0.3 }, smile: 0 };
  /* v245 correction: Android's isSpeaking() turns false as soon as the audio is HANDED TO THE MIXER, not when it has played;
     fast engines (Samsung) hand most of a sentence over early, so v244 shut the mouth while the voice played on. Rules now:
     the sentence's own events (start … onDone, which Android sends only after the audio has played) bound the mouth;
     «sound playing» is only ever used as a YES (start a mouth that missed its start, keep one going); never as a NO.
     Every utterance is logged (AV.diag) so a test call on the phone shows exactly what the engine sent.
     (v244 notes:) on the phone the audio itself is the authority. Android's text-to-speech says whether sound is playing right now
     (AndroidTTS.speaking()). Samsung's engine (and others) can report «start» before the sound, skip «start» for a sentence,
     or report every word as it is *synthesised* — far ahead of the audio — which raced the mouth to the end of the sentence
     and shut it while the voice carried on. Now: word events faster than speech are ignored (AV.earlyEv), a sentence whose
     «start» never came begins when the sound does (AV.pend), and the mouth's clock only runs while sound is playing. */
  AV.diag = [];
  function avDiagNew(u) { const d = { n: (AV.dn = (AV.dn || 0) + 1), len: String(u.text || "").length, tq: performance.now(), start: null, words: 0, w1: null, wN: null, end: null, natYes: 0, natNo: 0, silent: 0, how: "" }; u.__vd = d; AV.diag.push(d); if (AV.diag.length > 30) AV.diag.shift(); return d; }
  window.__vcLipDiag = () => { const L = AV.diag.map((d) => { const st = d.start != null ? Math.round(d.start - d.tq) : "none", dur = d.end != null && d.start != null ? ((d.end - d.start) / 1000).toFixed(1) + "s" : "?";
      return "#" + d.n + " " + d.len + "ch start+" + st + "ms dur " + dur + " words " + d.words + (d.words ? " (" + Math.round(d.w1) + "–" + Math.round(d.wN) + "ms)" : "") + " sound " + d.natYes + "/" + (d.natYes + d.natNo) + (d.silent ? " MOUTH-STILL " + Math.round(d.silent) + "ms" : "") + (d.how ? " " + d.how : ""); });
    return "Lip-sync (" + (AV.earlyEv ? "engine reports words early" : "word events trusted") + "; " + (AV.natSeen ? "phone reports sound" : "no sound signal") + "):\n" + L.slice(-12).join("\n"); };
  function vcTtsNat() { try { if (window.__natSpeaking) return !!window.__natSpeaking(); if (window.AndroidTTS && typeof AndroidTTS.speaking === "function") return !!AndroidTTS.speaking(); } catch (e) {} return null; }
  const VIS = { rest: [5.2, 0.3], mbp: [5, 0], a: [5.4, 5.2], e: [6, 3], i: [6.2, 2], o: [3.8, 4.6], u: [3, 3.4], f: [5.4, 1.2], l: [5.2, 1.3] };
  function visOf(ch, nx, en) {
    ch = (ch || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    if (/[aá]/.test(ch)) return "a"; if (ch === "e") return "e"; if (ch === "i" || ch === "y") return "i"; if (ch === "o") return "o"; if (ch === "u" || ch === "w") return "u";
    if (/[mbp]/.test(ch)) return "mbp"; if (ch === "v") return en ? "f" : "mbp"; if (ch === "f") return "f";
    if (/[a-zñ]/.test(ch)) return "l"; return "rest";
  }
  function avKeys(word, en) { // the word as mouth shapes with relative durations (vowels long, consonants short)
    const ks = []; for (let i = 0; i < word.length; i++) { const v = visOf(word[i], word[i + 1], en), vow = /^(a|e|i|o|u)$/.test(v), wt = vow ? 1.7 : v === "mbp" ? 0.8 : 0.55;
      if (ks.length && ks[ks.length - 1][0] === v) ks[ks.length - 1][1] += wt * 0.5; else ks.push([v, wt]); }
    if (!ks.length) ks.push(["rest", 1]); ks.T = ks.reduce((a, k) => a + k[1], 0); return ks; }
  function avWords(text) { const out = []; const re = /[\p{L}\d'’]+/gu; let m; while ((m = re.exec(text))) out.push({ i: m.index, len: m[0].length }); return out; }
  /* v251 (S24 log 17:04): a listening session that started while Profe was «thinking» stayed open while he spoke, and his
     own words («vamos a practicar preguntar, yo te digo…») came back as the learner's turn — twice. Now any such session
     stops the moment he speaks, and a turn made mostly of words Profe said in the last 30 s, heard within 4 s of him
     stopping, is ignored as his own voice. */
  const vcEW = (x) => (String(x || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").match(/[a-zñ']+/g) || []);
  // an echo carries a run of 5+ consecutive words exactly as Profe said them (a learner's own answer that reuses his words
  // — «sí, me gusta el mercado» — doesn't)
  function vcIsEcho(text) {
    const ws = vcEW(text); if (ws.length < 5) return false; const now = Date.now();
    for (const r of (AV.recent || []).filter((x) => now - x.t < 30000)) { const pw = " " + r.w.join(" ") + " ";
      for (let i = 0; i + 5 <= ws.length; i++) if (pw.includes(" " + ws.slice(i, i + 5).join(" ") + " ")) return true; }
    return false;
  }
  window.__vcIsEcho = vcIsEcho;
  window.__vcTurns = () => (VC.on ? (VC.turns || 0) : 0);
  function avBegin(u) {
    try { const now = Date.now(); AV.recent = (AV.recent || []).filter((x) => now - x.t < 30000); AV.recent.push({ t: now, w: vcEW(u && u.text) }); if (VC.hold) vcHoldStop(); } catch (e) {}
    const en = /^en/i.test(u.lang || "");
    AV.cur = { u, text: String(u.text || ""), rate: u.rate || 1, en, words: avWords(String(u.text || "")), wi: 0, wStart: performance.now() + 280, t0: performance.now(), hasB: false, bWi: -1, mpc: AV.mpc || 0 };
    AV.speaking = true; AV.lastBegin = Date.now(); AV.smile = /^(¡?muy bien|¡?excelente|¡?perfecto|¡?genial|¡?fenomenal|¡?estupendo|¡?fant[aá]stico|¡?bravo|¡?s[ií]+,|great|well done|nice|perfect|excellent|awesome|¡?eso es|¡?bien hecho|¡?correcto)/i.test(AV.cur.text) ? 1 : 0;
    AV.mood = AV.smile ? "joy" : /[!¡]/.test(AV.cur.text) ? "excited" : /[?¿]\s*$/.test(AV.cur.text) ? "ask" : "warm"; AV.moodT = performance.now();
    AV.cur.capOff = capAdd(AV.cur.text);
    try { vcOnSpeak(u); } catch (e) {}
  }
  function avWord(u, ci) { const c = AV.cur; if (!c || c.u !== u) return; const now = performance.now(); let k = c.words.findIndex((w) => w.i >= ci); if (k < 0) k = c.words.length - 1; if (k > 0 && c.words[k].i > ci) k--;
    // v244: an engine that reports words faster than anyone can speak (≈ 30 ms a letter) is reporting synthesis, not sound:
    // ignore its word events for the rest of the call and keep time from the audio instead
    if (AV.earlyEv) return;
    // v247 (from a real Samsung call log): Google's online voices report words about twice as fast as they play (35 ms a
    // letter against 77 ms of audio), so the mouth reached the last word halfway through and rested. Events are «early»
    // when they run clearly ahead of the real playback pace (learned from finished sentences, AV.real) or faster than
    // 50 ms a letter before anything is learned; then the mouth follows the audio clock to the end of the sentence.
    if (c.words[k] && c.words[k].i >= 20) { const imp = (now - c.t0) / c.words[k].i, lim = AV.real ? AV.real * 0.72 : 50;
      if (imp < lim) { AV.earlyEv = true; c.hasB = false; c.bWi = -1; c.est = null; c.mpc = AV.real || 0; c.wi = 0; return; } }
    // v240: some engines restart their positions inside a long utterance (chunked synthesis) or repeat one: each word event
    // still means «the next word has started», so the position never goes backwards
    if (c.hasB && k <= c.bWi) k = Math.min(c.words.length - 1, c.bWi + 1);
    // learn the voice's real pace (ms per character) from consecutive word events, for the stretches without events
    if (c.hasB && k > c.bWi && now - c.lastB < 2500) { const ch = c.words[k].i - c.words[c.bWi].i; if (ch > 0) { const mpc = (now - c.lastB) / ch; c.mpc = c.mpc ? c.mpc * 0.7 + mpc * 0.3 : mpc; } }
    c.hasB = true; c.lastB = now; c.bWi = k; c.est = null; c.wi = Math.max(0, k); c.wStart = performance.now(); avBeat(c); }
  // a small nod on long (usually stressed) words, a bigger one on emphasis: speech looks alive, not just a moving mouth
  function avBeat(c) { const w = c.words[c.wi]; if (!w) return; if (w.len >= 6 || (AV.mood !== "warm" && w.len >= 4)) AV.kick = performance.now(); capMark(c); }
  function avDone(u) {
    try { const d = u && u.__vd, c = AV.cur; if (d && d.start != null && c && c.u === u) { const took = performance.now() - c.t0, n = c.text.length; if (n > 20 && took > 700) { const r = (took - 120) / n; if (r > 40 && r < 200) AV.real = AV.real ? AV.real * 0.6 + r * 0.4 : r; } } } catch (e) {}
    try { if (AV.q <= 1) setTimeout(() => { if (!AV.speaking) document.querySelectorAll("#vc-pro span.on").forEach((x) => { x.classList.remove("on"); x.classList.add("said"); }); }, 250); } catch (e) {}
    if (AV.cur && AV.cur.u === u) { const c = AV.cur, took = performance.now() - c.t0, n = c.text.length;
      if (c.mpc && c.hasB && !AV.earlyEv && (!AV.real || c.mpc > AV.real * 0.72)) AV.mpc = c.mpc; else if (n > 25 && took > 600) { const mpc = (took - 150) / n; AV.mpc = AV.mpc ? AV.mpc * 0.6 + mpc * 0.4 : mpc; } } if (AV.cur && AV.cur.u === u) { if (AV.mood === "joy") AV.after = performance.now() + 1800; AV.cur = null; } AV.q = Math.max(0, AV.q - 1); AV.speaking = !!AV.cur; AV.lastEnd = Date.now(); }
  function avUnq(u) { if (u) u.__vcEnd = 1; if (AV.pendQ) AV.pendQ = AV.pendQ.filter((x) => x !== u); }
  function avStopAll() { AV.pendQ = []; AV.cur = null; AV.speaking = false; AV.q = 0; AV.lastEnd = Date.now(); AV.m.h = 0; }
  function hookSpeech() {
    const ss = window.speechSynthesis; if (!ss || ss.__vcHooked) return; ss.__vcHooked = true;
    const sp = ss.speak.bind(ss), ca = ss.cancel.bind(ss);
    try {
      ss.speak = function (u) {
        if (VC.on && u && !u.__vcw) { u.__vcw = 1; AV.q++; u.__vcT = performance.now(); u.__vcQ = 1; try { avDiagNew(u); } catch (x) {} const o = { s: u.onstart, b: u.onboundary, e: u.onend, r: u.onerror };
          // enthusiasm: a brighter voice in a call (higher on ¡exclamations!, a lift on questions)
          try { const tx = String(u.text || ""), p0 = +u.pitch || 1; if (!u.__vcp) { u.__vcp = 1; u.pitch = Math.min(1.25, p0 * (/[!¡]/.test(tx) ? 1.12 : /[?¿]/.test(tx) ? 1.07 : 1.05)); } } catch (x) {}
          // v247: a sentence's own start always takes the mouth (unless it already has it)
          u.onstart = function (ev) { try { if (u.__vd) u.__vd.start = performance.now(); if (!(AV.cur && AV.cur.u === u)) { u.__vcs = 1; avBegin(u); } } catch (x) {} if (o.s) return o.s.call(this, ev); };
          u.onboundary = function (ev) { try { const d = u.__vd; if (d) { const tt = performance.now() - (d.start || d.tq); d.words++; if (d.w1 == null) d.w1 = tt; d.wN = tt; } if (!ev || ev.name === "word" || ev.name == null) avWord(u, ev ? ev.charIndex : 0); } catch (x) {} if (o.b) return o.b.call(this, ev); };
          u.onend = function (ev) { try { avUnq(u); AV.lastEndP = performance.now(); if (u.__vd) { const d = u.__vd; d.end = performance.now(); window.__vlog("speak", "#" + d.n + " " + d.len + " chars · start " + (d.start != null ? "+" + Math.round(d.start - d.tq) + " ms" : "NONE") + " · " + (d.start != null ? ((d.end - d.start) / 1000).toFixed(1) + " s" : "?") + " · word events " + d.words + " · sound yes " + d.natYes + "/" + (d.natYes + d.natNo) + (d.silent ? " · LIPS STILL " + Math.round(d.silent) + " ms" : " · lips ok") + (d.how ? " · " + d.how : "") + " · voice " + ((u.voice && u.voice.name) || u.lang || "?") + " · «" + String(u.text || "").slice(0, 50) + "»"); } if (AV.pend === u) AV.pend = null; avDone(u); } catch (x) {} if (o.e) return o.e.call(this, ev); };
          u.onerror = function (ev) {
            // v251 (S24 log: the first greeting failed with «synthesis-failed» and the call went silent): try once more
            if (ev && ev.error === "synthesis-failed") AV.synthFail = Date.now(); // vcSay says the line again
            try { avUnq(u); if (u.__vd) { u.__vd.end = performance.now(); u.__vd.how = "error:" + (ev && ev.error || ""); window.__vlog("speak", "#" + u.__vd.n + " stopped: " + (ev && ev.error || "error") + " · «" + String(u.text || "").slice(0, 50) + "»"); } if (AV.pend === u) AV.pend = null; avDone(u); } catch (x) {} if (o.r) return o.r.call(this, ev); }; }
        const r = sp(u);
        // queued after the engine took it: an engine that clears its queue inside speak() must not drop this sentence
        if (u && u.__vcQ && !u.__vcQd && !u.__vcEnd) { u.__vcQd = 1; (AV.pendQ = AV.pendQ || []).push(u); }
        return r;
      };
      ss.cancel = function () { if (VC.on) avStopAll(); return ca(); };
    } catch (e) {}
  }
  hookSpeech();

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
      Array.from({ length: 9 }, (_, n) => { const x = 8 + n * 47, y = 36 + Math.sin((n + 0.5) / 9 * Math.PI) * 27; const ac = typeof S !== "undefined" ? S.accent : "", tri = es || ac === "es-PA" || ac === "es-CO";
        const c = es ? ["#c60b1e", "#ffc400"][n % 2] : ac === "es-PA" ? ["#da121a", "#ffffff", "#072357"][n % 3] : ac === "es-CO" ? ["#fcd116", "#003893", "#ce1126"][n % 3] : ["#ff4d8d", "#2bb3e8", "#ffcf3a", "#38c172", "#ff8a3d", "#9b6bff"][n % 6];
        return tri ? '<path d="M' + x + " " + y + "h34l-17 34z" + '" fill="' + c + '"/>' : '<path d="M' + x + " " + (y - 2) + "h34v30l-5-5-6 5-6-5-6 5-6-5-5 5z" + '" fill="' + c + '" opacity=".92"/><circle cx="' + (x + 17) + '" cy="' + (y + 12) + '" r="5" fill="#2e1d12" opacity=".25"/>'; }).join("") + "</g>");
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
    // smiling eyes: skin crescents rise from below the eyes (opacity set by the mood)
    C.push('<g class="vc-cheeks" opacity="0">' + VC_EYE.map(([x, y], n) => '<path clip-path="url(#vcEye' + n + ')" d="M' + (x - 34) + " " + (y + 30) + "Q" + x + " " + (y + 12) + " " + (x + 34) + " " + (y + 30) + "V" + (y + 40) + "H" + (x - 34) + 'Z" fill="' + skD + '"/><path d="M' + (x - 26) + " " + (y + 24) + "Q" + x + " " + (y + 12) + " " + (x + 26) + " " + (y + 24) + '" stroke="' + skDD + '" stroke-width="2" fill="none" opacity=".45" stroke-linecap="round"/>').join("") + "</g>");
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
    // v240 thinking gesture: a hand resting under the chin (to the side, below the mouth), shown only while an answer is
    // really being prepared and the wait is noticeable; hidden with reduced motion
    // v245 thinking pose: a hand resting on the chin on the side Profe is looking to — thumb under the chin, curled fingers in
    // front of it, index finger along the jaw, sleeve and wrist below. Drawn for the viewer's right; mirrored (.vc-hand-m)
    // when he looks to the left. It moves with the head (vcAnimate) and comes in only while an answer is really being prepared.
    C.push('<g class="vc-hand" opacity="0"><g class="vc-hand-m">' +
      '<ellipse cx="282" cy="560" rx="30" ry="12" fill="#000" opacity=".07" filter="url(#vcSoft)"/>' +
      '<path d="M322 900L398 900L360 700C354 670 326 652 300 656L270 668C272 724 292 806 322 900Z" fill="' + sh + '"/>' +
      '<path d="M270 668C276 700 290 760 302 820" stroke="' + shD + '" stroke-width="5" fill="none" opacity=".35" stroke-linecap="round"/>' +
      '<path d="M276 664C278 646 292 634 312 634C330 636 344 648 346 668L340 690C322 700 296 698 280 688Z" fill="url(#vcSkin)"/>' +
      '<path d="M258 604C254 574 272 552 300 550C328 548 346 570 346 600C346 634 326 664 296 668C272 670 262 636 258 604Z" fill="url(#vcSkin)"/>' +
      '<path d="M266 612C278 630 300 640 326 632" stroke="' + skDD + '" stroke-width="2.2" fill="none" opacity=".35" stroke-linecap="round"/>' +
      '<path d="M266 584C256 578 244 574 234 574" stroke="url(#vcSkin)" stroke-width="14" stroke-linecap="round" fill="none"/>' +
      '<path d="M262 590C252 585 242 582 234 582" stroke="' + skDD + '" stroke-width="1.4" stroke-linecap="round" fill="none" opacity=".3"/>' +
      [[236, 566], [240, 584], [246, 602]].map(([x, y]) => '<rect x="' + x + '" y="' + y + '" width="56" height="19" rx="9.5" fill="url(#vcSkin)" stroke="' + skDD + '" stroke-opacity=".28" stroke-width="1.4"/>').join("") +
      '<path d="M246 575C250 573 254 573 258 575M250 593C254 591 258 591 262 593M256 611C260 609 264 609 268 611" stroke="' + skDD + '" stroke-width="1.4" fill="none" opacity=".35" stroke-linecap="round"/>' +
      '<path d="M306 600C302 580 304 560 308 540C312 524 316 512 318 500" stroke="url(#vcSkin)" stroke-width="18" stroke-linecap="round" fill="none"/>' +
      '<path d="M316 600C312 580 314 562 317 544C320 528 324 516 326 506" stroke="' + skDD + '" stroke-width="1.4" fill="none" opacity=".28"/>' +
      '<path d="M316 500Q320 492 324 500" stroke="#fff" stroke-width="3" opacity=".35" fill="none" stroke-linecap="round"/>' +
      '<path d="M304 548C308 546 312 546 314 549M310 528C313 526 317 526 319 529" stroke="' + skDD + '" stroke-width="1.3" fill="none" opacity=".35" stroke-linecap="round"/>' +
      '</g></g>');
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
      // v244: what the phone is really doing (sound playing or not), read a few times a second
      if (!AV.natT || now - AV.natT > 150) { AV.natT = now; AV.nat = vcTtsNat(); if (AV.nat) AV.natSeen = true;
        const d = AV.cur && AV.cur.u && AV.cur.u.__vd; if (d && AV.nat != null) { if (AV.nat) d.natYes++; else d.natNo++; } }
      // v246: no «start» and no sound signal at all (some engines send neither): begin 0.6 s after Profe started the sentence
      { const hd = AV.pendQ && AV.pendQ[0];
        if (!AV.cur && hd && !hd.__vcs && (AV.nat || now - Math.max(hd.__vcT || now, AV.lastEndP || 0) > 600)) { try { hd.__vcs = 1; avBegin(hd); AV.cur.noStart = 1; if (hd.__vd) hd.__vd.how = AV.nat ? "began on sound" : "no signals: began after 0.6 s"; } catch (e) {} } }
      AV.lastStep = now;
      let tgt = VIS.rest; const c = AV.cur;
      if (c && c.words.length) {
        const per = (AV.earlyEv && AV.real) ? AV.real : c.mpc ? Math.min(160, Math.max(40, c.mpc)) : AV.real ? AV.real : (c.en ? 62 : 70) / Math.max(0.5, c.rate); let w = c.words[c.wi], el = now - c.wStart;
        // no word events from this voice (or they stopped mid-utterance): place the mouth by the time elapsed over the text that
        // is left. v240: the estimate stretches when the voice is slower than expected, so it can never run out while the
        // audio is still playing (it used to reach the last word early and close the mouth for the rest of a long reply).
        const est = !c.hasB || now - (c.lastB || 0) > 900;
        if (est) {
          if (!c.est) { const lp = c.loopFrom != null, a = lp ? c.loopFrom : c.hasB ? Math.min(c.words.length - 1, c.bWi + 1) : 0, t0 = lp ? c.loopT : c.hasB ? c.lastB + (c.words[c.bWi] ? c.words[c.bWi].len * per + 60 : 0) : c.t0 + (AV.mpc ? 120 : 280);
            const units = []; let tot = 0; for (let j = a; j < c.words.length; j++) { const wd = c.words[j], nx = c.words[j + 1], gap = nx ? c.text.slice(wd.i + wd.len, nx.i) : "", pause = Math.max(1, gap.length) + (/[.!?…]/.test(gap) ? 3 : /[,;:]/.test(gap) ? 1 : 0); /* real voices pause at punctuation */ units.push([j, tot]); tot += wd.len + pause; }
            c.est = { a, t0, units, tot, dur: tot * per }; }
          // v250 (S24 log: lips still for the last half of the greeting): the estimate ran out while the voice was still
          // playing and the old «stretch» parked the mouth near the last word. Until the sentence's own end arrives, the
          // mouth keeps talking: it goes round the last few words again.
          const E = c.est, el2 = now - E.t0; if (el2 > E.dur) { c.loopFrom = Math.max(0, c.words.length - 4); c.loopT = now; c.est = null; c.looped = (c.looped || 0) + 1; }
          const at = Math.max(0, el2 / E.dur) * E.tot; let j = 0; while (j < E.units.length - 1 && E.units[j + 1][1] <= at) j++;
          const prev = c.wi; c.wi = E.units.length ? E.units[j][0] : c.wi; w = c.words[c.wi]; const into = at - (E.units[j] ? E.units[j][1] : 0);
          el = w ? into * (w.len * per) / Math.max(1, w.len) : 0; c.wStart = now - el; if (c.wi !== prev) avBeat(c);
        }
        // syllables, not letters: the mouth opens on each vowel (held longer) and closes between them, like real speech
        if (w && !c.hasB && now - c.t0 < 280) w = null; // some phones report "start" before the audio: wait for the first word
        if (w) { const ks = w.keys || (w.keys = avKeys(c.text.substr(w.i, w.len), c.en)), dur = w.len * per;
          if (el < dur) { let pos = (el / dur) * ks.T, j = 0; while (j < ks.length - 1 && pos > ks[j][1]) { pos -= ks[j][1]; j++; } tgt = VIS[ks[j][0]]; }
          else tgt = c.hasB && !est ? [5, 0.6] : VIS.rest; } // between words / at commas: nearly closed, as in real speech
      }
      { const d = c && c.u && c.u.__vd; if (d) { if (AV.m.h < 0.8) { AV.stillT = AV.stillT || now; if (now - AV.stillT > 600) d.silent += Math.min(100, now - (AV.stillLast || now)); } else AV.stillT = 0; AV.stillLast = now; } else AV.stillT = 0; }
      const m = AV.m, f = c ? 0.42 : 0.35; m.w += (tgt[0] - m.w) * f; m.h += (tgt[1] - m.h) * f; if (!c && m.h < 0.05) m.h = 0;
      const mood = c ? AV.mood : VC.st === "listening" ? "listen" : VC.st === "thinking" ? "think" : AV.after > now ? "joy" : "warm";
      const smileT = { joy: 10, excited: 6.5, ask: 4.2, warm: 4.4, listen: 5, think: 2.2 }[mood] || 4; AV.sm = (AV.sm == null ? smileT : AV.sm + (smileT - AV.sm) * 0.08);
      const smile = AV.sm, W = m.w * 6.4 + smile * 1.2, H = m.h * 5.6, y = 508;
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
      const think = (VC.posed || VC.st) === "thinking", base = think ? 0.2 : VC.st === "listening" ? 0.02 : 0.06, t = Math.max(base, closeT);
      svg.querySelectorAll(".vc-lid").forEach((l) => { const x = +l.dataset.x, yy = +l.dataset.y, e = yy - 14 + t * 42, mid = e - 16 * (1 - t); l.setAttribute("d", "M" + (x - 36) + " " + (yy - 34) + "H" + (x + 36) + "V" + e.toFixed(1) + "Q" + x + " " + mid.toFixed(1) + " " + (x - 36) + " " + e.toFixed(1) + "Z"); });
      svg.querySelectorAll(".vc-lash").forEach((l) => { const x = +l.dataset.x, yy = +l.dataset.y, e = yy - 14 + t * 42, mid = e - 16 * (1 - t); l.setAttribute("d", "M" + (x - 31) + " " + (e - 1).toFixed(1) + "Q" + x + " " + (mid - 1).toFixed(1) + " " + (x + 31) + " " + (e - 1).toFixed(1)); });
      // gaze: at the learner while listening, up and aside while thinking, small natural shifts while speaking
      if (now > VC_GAZE.t) { VC_GAZE.t = now + 900 + Math.random() * 1800; const s2 = c ? 3 : 1.5; VC_GAZE.tx = (Math.random() - 0.5) * s2 * 2; VC_GAZE.ty = (Math.random() - 0.5) * s2; }
      const tSide = VC.thinkSide || 1, gx = reduce ? 0 : think ? 7.5 * tSide : VC.st === "listening" ? 0 : VC_GAZE.tx, gy = reduce ? 0 : think ? -7.5 : VC.st === "listening" ? 0 : VC_GAZE.ty;
      VC_GAZE.x += (gx - VC_GAZE.x) * 0.15; VC_GAZE.y += (gy - VC_GAZE.y) * 0.15;
      svg.querySelectorAll(".vc-iris").forEach((g) => g.setAttribute("transform", "translate(" + VC_GAZE.x.toFixed(2) + " " + VC_GAZE.y.toFixed(2) + ")"));
      // brows: up when asking or excited, a lift on each beat, raised and soft while listening
      const kick = AV.kick ? Math.max(0, 1 - (now - AV.kick) / 380) : 0;
      const bT = ({ joy: -6, excited: -7, ask: -8, warm: -2, listen: -5, think: -3 }[mood] || 0) - kick * 4; AV.bw = (AV.bw == null ? bT : AV.bw + (bT - AV.bw) * 0.12);
      { const hand = q(".vc-hand"); if (hand) { const want = !reduce && (VC.posed || VC.st) === "thinking" && VC.handOn && now - (VC.thinkT || now) > 700 ? 1 : 0; AV.hand = (AV.hand || 0) + (want - (AV.hand || 0)) * (want ? 0.07 : 0.22);
        if (AV.hand < 0.01 && !want) AV.hand = 0; hand.setAttribute("opacity", Math.min(1, AV.hand * 1.6).toFixed(2));
        const hm = q(".vc-hand-m"); const side = VC.thinkSide || 1; if (hm && hm.dataset.s !== String(side)) { hm.dataset.s = String(side); hm.setAttribute("transform", side < 0 ? "matrix(-1 0 0 1 400 0)" : ""); }
        hand.setAttribute("transform", (AV.headT || "") + " translate(0 " + ((1 - AV.hand) * 70).toFixed(1) + ")"); } }
      const br = q(".vc-brows"); if (br) br.setAttribute("transform", "translate(0 " + AV.bw.toFixed(2) + ")");
      // smiling eyes: cheeks lift the lower lids when Profe is happy
      const ch = q(".vc-cheeks"); if (ch) ch.setAttribute("opacity", Math.max(0, Math.min(1, (smile - 4.6) / 3)).toFixed(2));
      // head and body: restrained, a little more while speaking; a slight tilt while listening; breathing
      if (!reduce) { const s = now / 1000, amp = c ? 1.3 : 0.6; const nodL = AV.nodL ? Math.max(0, 1 - (now - AV.nodL) / 700) : 0;
        // v245 thinking: the head tilts toward the side he looks to and the chin lifts (eased, so it never snaps)
        const thinkW = (VC.posed || VC.st) === "thinking" ? 1 : 0; AV.think = (AV.think || 0) + (thinkW - (AV.think || 0)) * 0.06; const th = AV.think;
        const rot = (Math.sin(s * 0.8) * 1.4 * amp + (VC.st === "listening" ? 2.5 : mood === "ask" ? -2.5 : 0) + (c ? Math.sin(s * 2.1) * 0.7 : 0)) * (1 - th) + th * (5.5 * (VC.thinkSide || 1) + Math.sin(s * 0.6) * 0.6),
          ty = (Math.sin(s * 1.2) * 1.4 * amp + kick * 5 + Math.sin(nodL * Math.PI) * 7 + (mood === "joy" && c ? Math.abs(Math.sin(s * 5)) * -2 : 0)) * (1 - th) - th * 5;
        AV.headT = "translate(0 " + ty.toFixed(2) + ") rotate(" + rot.toFixed(2) + " 200 640)";
        const hd = q(".vc-head"); if (hd) hd.setAttribute("transform", AV.headT);
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
        '<div class="vc-cap" id="vc-cap" aria-live="off"' + (VC.cc ? "" : " hidden") + '><p class="vc-you" id="vc-you"></p><p class="vc-pro" id="vc-pro"></p></div>' +
        '<div class="vc-bar" role="toolbar" aria-label="Call controls">' +
          '<button class="vc-b" data-act="vc-mute" aria-pressed="' + VC.muted + '" aria-label="' + (VC.muted ? "Unmute microphone" : "Mute microphone") + '">' + vcI(VC.muted ? "micoff" : "mic") + "</button>" +
          '<button class="vc-b" data-act="vc-cc" aria-pressed="' + VC.cc + '" aria-label="Captions ' + (VC.cc ? "on" : "off") + '">' + vcI("cc") + "</button>" +
          '<button class="vc-b vc-endb" data-act="vc-end" aria-label="End call">' + vcI("end") + "</button>" +
          '<button class="vc-b" data-act="vc-rate" aria-label="Speech speed ' + rate.toFixed(1) + '×"><b class="vc-rt">' + rate.toFixed(1) + "×</b></button>" +
          '<button class="vc-b" data-act="vc-cam" aria-pressed="' + !!VC.cam + '" aria-label="' + (VC.cam ? "Turn camera off" : "Turn camera on") + '">' + vcI(VC.cam ? "cam" : "camoff") + "</button></div></div>" +
      '<div class="vc-sheet" id="vc-sheet" hidden></div>';
  }
  const vcMed = (k) => { const a = VC.metrics.slice(-20).map((x) => x[k] || 0).sort((x, y) => x - y); return a.length ? a[Math.floor(a.length / 2)] : 0; };
  function vcSheet() {
    const opt = (k, map, d) => '<div class="vc-opts" role="group">' + Object.entries(map).map(([v, [n]]) => '<button class="vc-o" data-act="vc-opt" data-k="' + k + '" data-v="' + v + '" aria-pressed="' + (vcP(k, d) === v) + '">' + n + "</button>").join("") + "</div>";
    const ms = VC.metrics.slice(-20).map((x) => x.lat).filter((x) => x > 0).sort((a, b) => a - b), med = ms.length ? ms[Math.floor(ms.length / 2)] : null;
    return '<div class="vc-sh-in"><span class="vc-grab" aria-hidden="true"></span><div class="vc-sh-h"><b>Call settings</b><button class="vc-ibtn" data-act="vc-set" aria-label="Close settings">✕</button></div>' +
      '<button class="vc-o vc-report" data-act="vc-report">Copy call report (to send to support)</button>' +
      '<p class="vc-l">Captions</p>' + opt("txt", { all: ["Profe and me"], pro: ["Only Profe"], off: ["Off"] }, vcTxt()) +
      "<p class=\"vc-l\">Language</p>" + opt("lang", VC_LANG, "bilingual") +
      "<p class=\"vc-l\">Corrections</p>" + opt("corr", VC_CORR, "every") +
      '<p class="vc-l">English help for a repeated mistake</p>' + opt("enhelp", { "2": ["After 2 times"], "3": ["After 3 times"], off: ["Only when I ask"] }, "3") +
      '<p class="vc-l">Interrupt Profe by speaking</p><div class="vc-opts"><button class="vc-o" data-act="vc-opt" data-k="barge" data-v="' + (vcP("barge", "off") === "on" ? "off" : "on") + '" aria-pressed="' + (vcP("barge", "off") === "on") + '">' + (vcP("barge", "off") === "on" ? "On · best with headphones" : "Off · tap Profe to interrupt") + "</button></div>" +
      '<p class="vc-note">Profe is an AI tutor, an animated character drawn on your phone. Your phone’s speech service turns your voice into text (on Android, Google’s); the app keeps no audio or video. Your camera, if you turn it on, is only shown to you: Profe can’t see it. The words of the call are saved in Profe › History, where you can delete them.</p>' +
      (med != null ? '<p class="vc-note">This call: Profe starts answering about ' + (vcMed("total") / 1000).toFixed(1) + " s after you stop talking (" + (vcMed("eot") / 1000).toFixed(1) + " s waiting to be sure you’ve finished, " + (med / 1000).toFixed(1) + " s to answer · " + ms.length + " turns).</p>" : "") + "</div>";
  }
  function vcSet(st, hint) {
    if (VC.st !== st) try { window.__vlog("call", "state → " + st); } catch (e) {}
    VC.st = st; const root = document.getElementById("vcall"); if (!root) return;
    root.dataset.state = st; const e = document.getElementById("vc-st"); if (e) e.textContent = VC_ST[st] || "";
    const h = document.getElementById("vc-hint"); if (h) h.textContent = hint != null ? hint : st === "speaking" ? "Tap to interrupt" : st === "listening" ? "" : st === "paused" ? "Tap to talk" : "";
  }
  const vcPlain = (t) => String(t || "").replace(/\*\*|__|`|#+\s/g, "").replace(/\[[^\]]*\]\([^)]*\)/g, "").replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, "").replace(/\n+/g, " ").replace(/\s{2,}/g, " ").trim();
  const CAP = { gen: -1, text: "", n: 0 };
  function capAdd(t) { // a new spoken part: add it to this turn's caption, return the index of its first word
    t = vcPlain(t); if (!t) return CAP.n;
    if (CAP.gen !== VC.gen) { CAP.gen = VC.gen; CAP.text = ""; CAP.n = 0; }
    const at = CAP.n; if (CAP.text.endsWith(t)) return Math.max(0, CAP.n - avWords(t).length); // the same part again ("repeat")
    CAP.text = CAP.text ? CAP.text + " " + t : t; CAP.n = avWords(CAP.text).length; capPaint(); return at;
  }
  function capPaint() {
    const p = document.getElementById("vc-pro"); if (!p) return; let h = "", last = 0, k = 0; const re = /[\p{L}\d'’]+/gu; let m;
    while ((m = re.exec(CAP.text))) { h += esc(CAP.text.slice(last, m.index)) + '<span data-w="' + k++ + '">' + esc(m[0]) + "</span>"; last = m.index + m[0].length; }
    p.innerHTML = h + esc(CAP.text.slice(last)); capMark(AV.cur);
  }
  function capMark(c) {
    const p = document.getElementById("vc-pro"); if (!p || !c || c.capOff == null) return; const k = c.capOff + c.wi;
    const ons = p.querySelectorAll("span.on"); if (ons.length === 1 && +ons[0].dataset.w === k) return; ons.forEach((x) => x.classList.remove("on")); // v239: exactly one lit word
    p.querySelectorAll("span:not(.said)").forEach((x) => { if (+x.dataset.w < k) x.classList.add("said"); });
    const sp = p.querySelector('span[data-w="' + k + '"]'); if (!sp) return; sp.classList.add("on");
    const box = document.getElementById("vc-cap"); if (box && !box.__user) { const y = sp.offsetTop - box.clientHeight * 0.35; box.scrollTop = Math.max(0, y); }
  }
  function vcCapYou(fin, im) { const y = document.getElementById("vc-you"); if (!y) return; if (!fin && !im) { y.textContent = ""; return; }
    y.innerHTML = "You: " + esc(fin) + (im ? ' <span class="vc-prov" title="still listening">' + esc(im) + "</span>" : ""); }
  function vcCap(you, pro) { if (you != null) { const y = document.getElementById("vc-you"); if (y) y.textContent = you ? "You: " + you : ""; } if (pro != null) { CAP.gen = VC.gen; CAP.text = vcPlain(pro); CAP.n = avWords(CAP.text).length; capPaint(); } }
  function vcOnSpeak(u) {
    if (!VC.on) return; vcHoldStop(); vcSet("speaking");
    if (VC.tTurn) { const ans = Date.now() - VC.tTurn; VC.metrics.push({ lat: ans, eot: VC.eot || 0, total: ans + (VC.eot || 0), t: Date.now() }); if (VC.metrics.length > 60) VC.metrics.shift(); VC.tTurn = 0; }
    if (vcP("barge", "off") === "on" && !VC.muted) vcBargeOn();
  }

  /* ---------- the conversation loop ---------- */
  function vcStopMic() { vcHoldStop(); const r = VC.rec; VC.rec = null; if (r) { try { r._vcDead = 1; r.abort(); } catch (e) {} } clearTimeout(VC.qT); clearTimeout(VC.sT); }
  function vcQuietThen(fn) { // wait until Profe has finished speaking (all queued parts), then go on
    const g = VC.gen; let quiet = 0; clearInterval(VC.qi);
    VC.qi = setInterval(() => { if (!VC.on || g !== VC.gen) return clearInterval(VC.qi); let sp = false; try { sp = speechSynthesis.speaking || speechSynthesis.pending; } catch (e) {} if (AV.speaking || AV.q > 0 || sp || (typeof tBusy !== "undefined" && tBusy)) quiet = 0; else quiet++; if (quiet >= 3) { clearInterval(VC.qi); fn(); } }, 150);
  }
  function vcLang() { const es = typeof sttLang === "function" ? sttLang() : "es-US"; return window.AndroidSTT && window.AndroidSTT.multiLang ? es + "|en-US" : es; }
  // v235 end of turn, tuned for language learners: how long a silence must last before Profe answers.
  // A sentence that is clearly unfinished (ends on «pero», «and», «porque», «the», «um»…, a comma, or is still only provisional
  // text from the recogniser) waits much longer; after «wait / espera» Profe is extra patient for half a minute.
  const VC_OPEN_END = /(?:^|\s)(?:y|e|o|u|ni|pero|porque|que|qué|si|cuando|como|donde|de|del|a|al|en|con|sin|para|por|el|la|los|las|un|una|mi|tu|su|muy|más|es|está|estoy|soy|tengo|quiero|hay|and|but|or|because|so|the|a|an|to|of|in|with|for|my|your|is|was|i|it|that|if|um+|uh+|eh+|em+|mm+|este|pues|bueno|o sea|like|well|i mean|you know)$/i;
  function vcEot(t, isFinal) {
    // v237: shorter than v235 (the learner found Profe slow); safe because more speech while Profe prepares continues the turn (vcHold)
    t = String(t || "").trim(); const n = (t.match(/\S+/g) || []).length; let w = isFinal ? (/[.?!]$/.test(t) ? 800 : 1100) : 1700;
    if (n <= 2) w += 400; if (VC_OPEN_END.test(t.replace(/[.,;:!?…]+$/, "")) && !/[.?!]$/.test(t)) w += 1300; else if (/[,…-]$/.test(t)) w += 600;
    if ((VC.patient || 0) > Date.now()) w += 2500; return w;
  }
  window.__vcEot = vcEot;
  function vcListen(seed) {
    if (!VC.on || VC.paused) return; vcStopMic();
    if (VC.preloadAt === 1) { VC.preloadAt = 0; setTimeout(() => { try { if (VC.on && window.__natState !== "loaded" && window.AndroidLLM && AndroidLLM.preload) { window.__vlog("ai", "loading the model after the greeting"); AndroidLLM.preload(); } } catch (e) {} }, 1200); }
    if (VC.muted) { vcSet("muted", "You’re muted. Tap the mic to talk."); return; }
    if (!CAN_MIC) { vcSet("paused", "This browser can’t listen. Use Chrome on Android or Safari on iPhone."); return; }
    const r = new SR(); VC.rec = r; r.lang = vcLang(); r.continuous = !IS_IOS; r.interimResults = true;
    let fin = seed || "", live = seed || "", done = false; const g = VC.gen;
    const finish = (text) => { if (done) return; done = true; VC.eot = VC.lastHeard ? Date.now() - VC.lastHeard : 0; clearTimeout(VC.qT); clearTimeout(VC.sT); if (VC.rec === r) VC.rec = null; try { r._vcDead = 1; r.abort(); } catch (e) {} if (!VC.on || g !== VC.gen) return;
      text = String(text || "").trim(); if (text) { VC.empties = 0; vcTurn(text); } else { VC.empties++; if (VC.empties >= 3) vcSet("paused", "Still there? Tap Profe to talk."); else vcListen(); } };
    // the learner's turn ends after a pause; learners pause more, so short or unfinished sentences get longer
    const wait = (t, isFinal) => vcEot(t, isFinal);
    r.onstart = () => { if (r._vcDead) return; VC.fails = 0; vcSet("listening"); clearTimeout(VC.sT); VC.sT = setTimeout(() => finish(live), 20000);
      if (seed) { VC.lastHeard = Date.now(); vcCapYou(seed, ""); clearTimeout(VC.qT); VC.qT = setTimeout(() => finish(live), wait(seed, true)); } }; // a continued turn: answer after the usual pause if nothing more comes
    if (!seed) VC.heardAt = 0;
    r.onresult = (e) => { if (r._vcDead) return; if (!VC.heardAt) VC.heardAt = Date.now(); let f = "", im = ""; for (let i = 0; i < e.results.length; i++) { const x = e.results[i][0].transcript; if (e.results[i].isFinal) f += x + " "; else im += x + " "; }
      fin = ((seed ? seed + " " : "") + f).trim(); live = (fin + " " + im).trim(); vcCapYou(fin, im.trim()); VC.lastHeard = Date.now();
      { const nw = (live.match(/\S+/g) || []).length; if (nw - (VC.nodN || 0) >= 4) { VC.nodN = nw; AV.nodL = performance.now(); } }
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
    // v240: Spanish first — the English half of a bilingual confirmation is only spoken in «Mostly English» mode
    if (Array.isArray(parts) && vcP("lang", "bilingual") !== "english") { const es = parts.filter((x) => x[1]); if (es.length) parts = es; }
    const g = VC.gen; vcStopMic(); vcSet("speaking");
    const t0 = Date.now(); await new Promise((res) => { try { speakMixed(parts, res); } catch (e) { res(); } setTimeout(res, 15000); });
    // v251 (S24 log: the first greeting failed with «synthesis-failed» and the call went silent): one more try
    if (VC.on && g === VC.gen && (AV.synthFail || 0) >= t0 && Date.now() - t0 < 3000) { try { window.__vlog("speak", "synthesis failed: saying it again"); } catch (e) {}
      await new Promise((r) => setTimeout(r, 500)); await new Promise((res) => { try { speakMixed(parts, res); } catch (e) { res(); } setTimeout(res, 15000); }); }
    if (VC.on && g === VC.gen && then) vcQuietThen(then);
  }
  const VC_CMD = [
    [/^(?:please\s+)?(?:end|finish|stop)\s+(?:the\s+)?call\b|^hang\s*up\b|^(?:termina|terminar|acaba|acabar|finaliza)\s+(?:la\s+)?llamada\b|^cuelga\b|^colgar\b/i, "end"],
    [/^(?:stop|wait|hold on|one moment|espera|para|un momento|alto)\W*$/i, "stop"],
    [/^(?:repeat(?: that)?|say (?:that|it) again|again|once more|pardon|what\?|repite(?:lo)?|otra vez|¿?puedes repetir(?:lo)?\??|¿?c[oó]mo\?)\W*$/i, "repeat"],
    [/\b(?:speak|talk|go)\s+(?:more\s+)?slow(?:er|ly)\b|^slower\b|m[aá]s despacio|m[aá]s lento|habla despacio/i, "slower"],
    [/\b(?:speak|talk|go)\s+faster\b|^faster\b|m[aá]s r[aá]pido/i, "faster"],
  ];
  // while Profe is thinking (before any speech), keep listening: more words from the learner mean the turn wasn't over
  function vcHold(text, g) {
    vcHoldStop(); if (VC.muted || !CAN_MIC) return; let r; try { r = new SR(); } catch (e) { return; } VC.hold = r; r.lang = vcLang(); r.continuous = !IS_IOS; r.interimResults = true;
    r.onresult = (e) => { if (r._dead || VC.hold !== r || g !== VC.gen || AV.speaking || AV.q > 0) return; let t = ""; for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript + " "; t = t.trim();
      const n = (t.match(/[\p{L}\d']+/gu) || []).length, fin = [...e.results].some((x) => x.isFinal); if (n < 2 && !fin) return;
      vcHoldStop(); VC.gen++; VC.conts = (VC.conts || 0) + 1; VC.contDrop = text; try { speechSynthesis.cancel(); } catch (x) {} try { if (typeof speechCut === "function") speechCut(); } catch (x) {}
      vcListen(text + " " + t); };
    r.onerror = () => {}; r.onend = () => { if (VC.hold === r) VC.hold = null; };
    try { r.start(); } catch (e) { VC.hold = null; }
  }
  function vcHoldStop() { const r = VC.hold; VC.hold = null; if (r) { r._dead = 1; try { r.abort(); } catch (e) {} } }
  // v245: a name from «me llamo Ana», «soy Ana», «I'm Ana» or just «Ana», as speech recognition writes it
  function vcNameFrom(t) {
    const s = String(t || "").trim().replace(/[.!?¡¿,]/g, ""); const STOP = /^(profe|hola|hello|hi|bien|muy|yes|no|si|sí|gracias|thanks|okay|ok|vale|el|la|un|una|yo|me|my|name|is|soy|llamo|i|am|im|bueno|what|que|qué|como|cómo)$/i;
    const ADJ = /^(cansad[oa]s?|bien|mal|feliz|contento|contenta|nervios[oa]|de|del|estudiante|profesor|profesora|nuevo|nueva|tired|good|fine|ok|happy|sad|from|a|an|the|not|very|so|here|ready|listo|lista)$/i;
    let m = /\b(?:me llamo|mi nombre es|my name is|my name's|i'?m called|ll[aá]mame|call me)\s+(?:(?:to|a|the|is|es|el|la|de)\s+)?([A-Za-zÁÉÍÓÚÑáéíóúñü]{2,20})/i.exec(s);
    if (!m) m = /\bmi nombre es([a-záéíóúñ]{3,20})\b/i.exec(s); // «mi nombre estimar» = «mi nombre es Timar» run together
    // «soy Ana» / «I'm Ana» only in a short answer, and not «soy cansado» / «I'm tired»
    if (!m && s.split(/\s+/).length <= 3) { const m2 = /\b(?:soy|i am|i'?m)\s+([A-Za-zÁÉÍÓÚÑáéíóúñü]{2,20})/i.exec(s); if (m2 && !ADJ.test(m2[1])) m = m2; }
    vcNameFrom.sure = !!m; let n = m && m[1]; if (!n) { const w = s.split(/\s+/).filter(Boolean); if (w.length && !STOP.test(w[w.length - 1]) && !ADJ.test(w[w.length - 1]) && (w.length === 1 || (w.length === 2 && /^(hola|hi|hello|hey|bueno|pues|ah|oh|eh|um|mm|ok|vale)$/i.test(w[0])))) n = w[w.length - 1]; } // v248: «me gusta» / «number Smart» are not names
    if (!n || STOP.test(n)) return ""; return n.charAt(0).toUpperCase() + n.slice(1).toLowerCase();
  }
  window.__vcNameFrom = vcNameFrom;
  async function vcTurn(text) {
    VC.turns = (VC.turns || 0) + 1;
    // echo = 5+ of Profe's words in a row AND first heard within 3 s of him finishing AND he didn't ask for a repeat
    if (vcIsEcho(text)) try { window.__vlog("call", "sounds like Profe's words (heard " + ((VC.heardAt || Date.now()) - (AV.lastEnd || 0)) + " ms after he stopped)"); } catch (e) {}
    if (vcIsEcho(text) && (VC.heardAt || Date.now()) - (AV.lastEnd || 0) < 3000 && !/\b(repite|rep[ií]telo|repeat|say it|dilo|ahora t[uú]|tu turno|your turn|di:)/i.test(VC.lastPro || "")) { try { window.__vlog("call", "ignored Profe's own voice: «" + String(text).slice(0, 60) + "»"); } catch (e) {} vcListen(); return; }
    if (!VC.on) return; const g = ++VC.gen; VC.nodN = 0; vcCap(text, ""); vcStopMic();
    const t = text.trim(), low = t.toLowerCase();
    // a command is a short utterance; inside a longer sentence ("…habla despacio y explica mis errores") it's an instruction
    const nW = (low.match(/\S+/g) || []).length;
    const cmd = (VC_CMD.find(([re, k]) => re.test(low) && (k === "end" ? nW <= 6 : nW <= 4)) || [])[1];
    if (VC.askName === "confirm" && cmd !== "end") { // v248: «¿Te llamas Smart?»
      const yes = /^(s[ií]|yes|yeah|yep|correcto|eso es|exacto|claro|as[ií] es|that'?s right|right)\b/i.test(low), better = vcNameFrom(t), fem = (() => { try { return pvGender() === "f"; } catch (e) { return false; } })();
      if (yes && !(better && vcNameFrom.sure)) { const nm3 = VC.nameGuess; VC.askName = 0; TS.lname = nm3; tsave(); vcSay([["¡Mucho gusto, " + nm3 + "! " + (fem ? "Encantada" : "Encantado") + " de conocerte.", true], ["¿De qué quieres hablar hoy?", true]], () => vcListen()); return; }
      if (better && vcNameFrom.sure) { VC.askName = 0; TS.lname = better; tsave(); vcSay([["¡Ah, " + better + "! ¡Mucho gusto! " + (fem ? "Encantada" : "Encantado") + " de conocerte.", true], ["¿De qué quieres hablar hoy?", true]], () => vcListen()); return; }
      VC.askName = 2; vcSay([["Perdona. ¿Cómo te llamas? Dime «me llamo…» y tu nombre.", true], ["Say «me llamo» and your name.", false]], () => vcListen()); return;
    }
    if (window.__notMyName && window.__notMyName(t) && !(vcNameFrom(t) && vcNameFrom.sure && !/no me llamo/i.test(low))) { TS.lname = ""; tsave(); VC.askName = 2; vcSay([["¡Perdona! ¿Cómo te llamas? Dime «me llamo…» y tu nombre.", true]], () => vcListen()); return; }
    // v252: no name yet and they say «me llamo Timar» later in the call → greet them by name (the AI answered it before)
    if (!VC.askName && !TS.lname && cmd !== "end" && nW <= 6) { const nm4 = vcNameFrom(t); if (nm4 && vcNameFrom.sure) { const fem4 = (() => { try { return pvGender() === "f"; } catch (e) { return false; } })(); TS.lname = nm4; tsave();
      vcSay([["¡Mucho gusto, " + nm4 + "! " + (fem4 ? "Encantada" : "Encantado") + " de conocerte.", true], ["¿De qué quieres hablar hoy?", true]], () => vcListen()); return; } }
    if (VC.askName && cmd !== "end") {
      const nm2 = vcNameFrom(t), fem = (() => { try { return pvGender() === "f"; } catch (e) { return false; } })();
      if (nm2 && !vcNameFrom.sure) { VC.askName = "confirm"; VC.nameGuess = nm2; vcSay([["¿Te llamas " + nm2 + "?", true]], () => vcListen()); return; } // a guess: check before saving
      if (nm2) { VC.askName = 0; TS.lname = nm2; tsave();
        // a name guessed from a bare word may be a recognition slip («number Smart»): say how to fix it
        vcSay([["¡Mucho gusto, " + nm2 + "! " + (fem ? "Encantada" : "Encantado") + " de conocerte.", true]].concat(vcNameFrom.sure ? [] : [["Si no lo he oído bien, dime «me llamo…» y lo cambio.", true]]).concat([["¿De qué quieres hablar hoy? Puede ser de tu día, de tus planes o de lo que estás estudiando.", true]]), () => vcListen()); return; }
      if (nW <= 3 && /^(hola|hello|hi|hey|buenas|buenos|qu[eé] tal|ol[aá])\b/i.test(t.trim())) { vcSay([["¡Hola! ¿Y cómo te llamas?", true]], () => vcListen()); return; } // a greeting, not a name: ask kindly
      // v252 (5th S24 log): «me llamo» with the name cut off by the mic is not «carry on without a name»
      if (/^(me llamo|mi nombre es|my name is|soy|i'?m)[\s.!?]*$/i.test(t.trim())) { VC.askName = 2; vcSay([["¿Cómo? Dime solo tu nombre.", true]], () => vcListen()); return; }
      if (nW > 3) VC.askName = 0; // they went straight into a sentence: don't insist, answer it
      else if (VC.askName === 1) { VC.askName = 2; vcSay([["Perdona, no te he oído bien. ¿Cómo te llamas?", true], ["You can say: «Me llamo…»", false]], () => vcListen()); return; }
      VC.askName = 0; // asked twice: carry on without a name
    }
    if (cmd === "end") { vcSay([["¡Hasta luego!", true], ["Great talking with you.", false]], () => vcEnd()); return; }
    if (cmd === "stop" && !(window.__drillOn && window.__drillOn())) { VC.patient = Date.now() + 30000; vcListen(); return; }
    if (cmd === "repeat" && !(window.__drillOn && window.__drillOn())) { if (VC.lastPro) { vcSay(VC.lastPro, () => vcListen()); } else vcListen(); return; }
    if (cmd === "slower" || cmd === "faster") { const r0 = vcRate(), r1 = Math.max(0.7, Math.min(1.2, +(r0 + (cmd === "slower" ? -0.1 : 0.1)).toFixed(1))); TS.vc_rate = r1; tsave(); window.__vcRate = r1; vcPaintBar();
      vcSay(cmd === "slower" ? [["Vale, más despacio.", true], ["Okay, slower.", false]] : [["Vale, más rápido.", true], ["Okay, a bit faster.", false]], () => vcListen()); return; }
    // the learner's own instructions for the call ("you're the waiter", "speak slowly", "explain my mistakes in English")
    if (/\b(you(?:'re| are) (?:the|a|my)|act as|be (?:the|a)|let'?s practi[cs]e|eres (?:el|la|un|una|mi)|haz de|explain (?:my )?(?:mistakes|errors|things) in english|correct (?:me|my)|don'?t correct|no me corrijas|corr[ií]geme|only (?:in )?spanish|solo (?:en )?espa[nñ]ol|speak (?:to me )?in (?:english|spanish))\b/i.test(t)) {
      VC.instr.push(t.slice(0, 160)); VC.instr = VC.instr.slice(-6);
      if (/speak slow|habla despacio|more slowly/i.test(t) && vcRate() > 0.85) { TS.vc_rate = 0.85; tsave(); window.__vcRate = 0.85; vcPaintBar(); }
      if (/only (?:in )?spanish|solo (?:en )?espa/i.test(t)) { TS.vc_lang = "immersion"; tsave(); }
      if (/explain (?:my )?(?:mistakes|errors|things) in english|in english/i.test(t) && vcP("lang", "bilingual") === "immersion") { TS.vc_lang = "bilingual"; tsave(); }
    }
    // v240: English only when asked, or to coach a mistake the learner keeps making (counted across the call)
    VC.wantEn = /\b(in english|en ingl[eé]s|explain (it|that|this)?\s*(to me )?in english|what does .{1,40} mean|qu[eé] significa|no entiendo|i don'?t understand)\b/i.test(t);
    VC.coachNow = null;
    try { const thr = vcP("enhelp", "3"); if (thr !== "off" && typeof quickFixes === "function") { VC.errs = VC.errs || {};
      quickFixes(t).forEach((f) => { const k = String(f.why || f.from + "→" + f.to).slice(0, 80); VC.errs[k] = (VC.errs[k] || 0) + 1;
        if (!VC.coachNow && VC.errs[k] >= +thr) { VC.coachNow = { why: String(f.why || ("«" + f.from + "» → «" + f.to + "»")).slice(0, 160), to: f.to, n: VC.errs[k] }; VC.errs[k] = 0; VC.coached = (VC.coached || 0) + 1; } }); } } catch (e) {}
    // v249 «correct me more»: when the app's own checker finds a real mistake, Profe says the right sentence at once
    // («Se dice: …»), then the AI carries on (told not to repeat it). Not in a drill (it grades its own answers), not in
    // «review at the end» mode, not when English coaching takes this turn.
    VC.fixSaid = null;
    try { const mode = vcP("corr", "every");
      if (mode !== "end" && mode !== "flow" && !VC.coachNow && !(window.__drillOn && window.__drillOn()) && nW >= 2 && typeof quickFixes === "function" && typeof applyFixes === "function") {
        const fx = quickFixes(t); const better = fx.length ? applyFixes(t, fx) : "";
        if (better && better.toLowerCase().replace(/\W+/g, "") !== t.toLowerCase().replace(/\W+/g, "")) { VC.fixSaid = better; try { window.__vlog("call", "correction: «" + t + "» → «" + better + "»"); } catch (e) {}
          await new Promise((r) => vcSay([["Se dice: «" + better.replace(/^./, (c) => c.toUpperCase()).replace(/[.!?]*$/, "") + "».", true]], r)); if (!VC.on || g !== VC.gen) return; } } } catch (e) {}
    vcSet("thinking"); VC.tTurn = Date.now(); VC.thinkT = performance.now(); VC.thinkSide = Math.random() < 0.5 ? -1 : 1; VC.handOn = !VC.handLast && Math.random() < 0.6; VC.handLast = VC.handOn; const h0 = location.hash; vcHold(t, g);
    if (window.__vcThinkDelay) await new Promise((r) => setTimeout(r, window.__vcThinkDelay)); // tests: a slow answer
    if (!VC.on || g !== VC.gen) return;
    let n0 = 0; try { n0 = tCur ? tCur.msgs.length : 0; } catch (e) {}
    // a continued turn replaces the half-sentence that was sent first (so the model sees the learner's words once, complete)
    if (VC.contDrop && t.indexOf(VC.contDrop) === 0) { try { const k = tCur.msgs.map((m) => m.r === "u" && m.c === VC.contDrop).lastIndexOf(true); if (k >= 0) tCur.msgs.splice(k, 1); } catch (e) {} } VC.contDrop = null;
    try { await tSend(t, true); } catch (e) {}
    VC.wantEn = false; VC.coachNow = null; VC.fixSaid = null;
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
    Object.assign(VC, { on: true, muted: false, paused: false, t0: Date.now(), gen: VC.gen + 1, lastPro: "", turns: 0, instr: [], empties: 0, fails: 0, metrics: [], blocked: false });
    try { window.__vlog("call", "call started · Profe " + pName() + " · build " + (window.__BUILD || "?")); } catch (e) {}
    /* v250 (S24 log: two restarts in the first 15 s of a call): loading the AI model (~2 GB) while the scene starts and the
       greeting plays ran the phone out of memory. The model now loads after the greeting, when the call is listening; after
       a restart during a call, calls run in SAFE MODE for a day (lighter scene without blur; the model loads with the
       learner's first sentence). */
    VC.safe = (() => { try { return Date.now() - (+localStorage.getItem("rd-vcsafe") || 0) < 24 * 3600000; } catch (e) { return false; } })();
    VC.preloadAt = VC.safe ? 0 : 1; if (VC.safe) try { window.__vlog("call", "safe mode (the app restarted during an earlier call)"); } catch (e) {}
    hookSpeech(); window.__vcOn = true; window.__vcRate = vcRate(); VC.cc = vcP("cc", true) !== false;
    let root = document.getElementById("vcall"); if (!root) { root = document.createElement("div"); root.id = "vcall"; root.className = "vc"; root.setAttribute("role", "dialog"); root.setAttribute("aria-label", "Video call with " + pName()); document.body.appendChild(root); }
    root.innerHTML = vcxHTML(); root.hidden = false; root.classList.toggle("vc-safe", !!VC.safe || !!window.AndroidTTS); /* v251: the lighter scene is the default in the Android app (the full one crashed the S24 with the AI model loaded; the light one ran 13 min) */ document.body.classList.add("vc-open"); root.classList.toggle("vc-noyou", vcTxt() === "pro"); vcSet("connecting"); vcTimer(); vcAnimate();
    { const cb = root.querySelector("#vc-cap"); if (cb) { const hold = () => { cb.__user = true; clearTimeout(cb.__ut); cb.__ut = setTimeout(() => { cb.__user = false; }, 6000); }; cb.addEventListener("touchmove", hold, { passive: true }); cb.addEventListener("wheel", hold, { passive: true }); } }
    const pill = document.getElementById("vc-pill"); if (pill) pill.remove();
    const nm = TS.lname ? ", " + TS.lname : "";
    const en = vcP("lang", "bilingual") === "english", fem = (() => { try { return pvGender() === "f"; } catch (e) { return false; } })();
    // v245: the first time ever (no name yet), Profe introduces himself and asks the learner's name; later calls greet by name
    VC.askName = !TS.lname ? 1 : 0;
    const back = ["¡Qué alegría verte otra vez!", "¡Qué bueno verte de nuevo!", "¡Me alegra mucho verte!"][Math.floor(Math.random() * 3)];
    const prof = (fem ? "profesora" : "profesor");
    const greet = VC.askName ? (en ? [["Hi! I'm " + pName() + ", your Spanish tutor. I'm so happy to meet you!", false], ["¿Cómo te llamas?", true], ["What's your name?", false]]
        : [["¡Hola! Soy " + pName() + ", tu " + prof + " de español. ¡Qué alegría conocerte!", true], ["¿Cómo te llamas?", true]])
      : TS.vc_intro ? (en ? [["Hi" + nm + "! Great to see you again.", false], ["¿De qué quieres hablar hoy?", true]] : [["¡Hola" + nm + "! " + back, true], ["¿De qué quieres hablar hoy?", true]])
      : (en ? [["Hi" + nm + "! I'm " + pName() + ", your Spanish tutor.", false], ["¿De qué quieres hablar hoy?", true]] : [["¡Hola" + nm + "! Soy " + pName() + ", tu " + prof + " de español. ¡Qué alegría conocerte!", true], ["¿De qué quieres hablar hoy?", true]]);
    if (!TS.vc_intro) { TS.vc_intro = 1; tsave(); }
    VC.lastPro = vcPlain(greet.map((x) => x[0]).join(" ")); vcCap("", VC.lastPro);
    const go = () => vcSay(greet, () => vcListen());
    try { const vm = window.__pvVoiceMatch && window.__pvVoiceMatch(); if (vm && vm.m === "mismatch") setTimeout(() => vcToast("This phone has no " + (vm.want === "m" ? "man’s" : "woman’s") + " voice for " + pName() + " in your Spanish variety. Profe › Profe’s look: pick another look, or add voices in your phone’s settings."), 1500); } catch (e) {}
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
    const cap = root.querySelector("#vc-cap"); if (cap) cap.hidden = !VC.cc; root.classList.toggle("vc-noyou", vcTxt() === "pro");
  }
  const vcTxt = () => (!VC.cc ? "off" : TS.vc_you === false ? "pro" : "all");
  function vcToast(t) { const root = document.getElementById("vcall"); if (!root) return; let e = root.querySelector(".vc-toast"); if (!e) { e = document.createElement("p"); e.className = "vc-toast"; e.setAttribute("role", "status"); root.appendChild(e); } e.textContent = t; clearTimeout(VC.tt); VC.tt = setTimeout(() => e.remove(), 4500); }
  function vcEnd() {
    try { if (window.__nameReset) window.__nameReset(); } catch (e) {} // a guest's name lasts for their call only
    try { window.__vlog("call", "call ended after " + Math.round((Date.now() - (VC.t0 || Date.now())) / 1000) + " s"); } catch (e) {}
    if (!VC.on) return; const secs = Math.round((Date.now() - VC.t0) / 1000), turns = VC.metrics.length;
    VC.on = false; window.__vcOn = false; VC.gen++; clearInterval(VC.qi); clearInterval(VC.tick); cancelAnimationFrame(VC_RAF); vcStopMic(); vcCamOff();
    try { if (typeof SPK_GEN !== "undefined") SPK_GEN++; } catch (e) {} try { if (typeof tBusy !== "undefined" && tBusy && tCtl) tCtl.abort(); } catch (e) {}
    try { speechSynthesis.cancel(); } catch (e) {} avStopAll();
    const root = document.getElementById("vcall"); if (root) root.remove(); const p = document.getElementById("vc-pill"); if (p) p.remove(); document.body.classList.remove("vc-open");
    try { if (VC.wasWake && typeof hfWakeStart === "function") hfWakeStart(); } catch (e) {} VC.wasWake = false;
    try { if (typeof coachToast === "function" && secs > 5) coachToast("Call ended · " + Math.floor(secs / 60) + ":" + String(secs % 60).padStart(2, "0") + " · " + turns + " answers from " + pName() + (vcP("corr", "flow") === "end" ? " · say or type “review my call” for your feedback" : "")); } catch (e) {}
    try { if (typeof tRender === "function" && document.body.classList.contains("tutor-open")) tRender(); } catch (e) {}
  }
  window.__vc = { open: vcOpen, end: vcEnd, state: () => VC.st, st: VC, av: AV, turn: (t) => vcTurn(t), interrupt: vcInterrupt, eot: vcEot, enOK: () => vcEnOK(), pose: (st, side) => { VC.posed = st || null; VC.handOn = true; VC.thinkSide = side || 1; VC.thinkT = performance.now() - 2000; }, minimize: vcMinimize, resume: vcResume, vis: visOf, note: () => window.__vcNote() };

  document.addEventListener("click", (ev) => {
    const b = ev.target.closest && ev.target.closest("[data-act^='vc-']"); if (!b) return; const a = b.dataset.act;
    if (a === "vc-open") { ev.preventDefault(); vcOpen(); return; }
    if (a === "vc-resume") { vcResume(); return; }
    if (!VC.on) return;
    if (a === "vc-end") { vcEnd(); return; }
    if (a === "vc-tap") { if (VC.st === "speaking" || AV.speaking) vcInterrupt(); else if (VC.blocked) { VC.blocked = false; vcListen(); } else if (/paused|disconnected|reconnecting|muted/.test(VC.st)) { if (VC.muted) { VC.muted = false; vcRepaint(); } VC.empties = 0; VC.fails = 0; vcListen(); } return; }
    if (a === "vc-mute") { VC.muted = !VC.muted; vcRepaint(); if (VC.muted) { vcStopMic(); vcSet("muted", "You’re muted. Tap the mic to talk."); } else if (!AV.speaking) vcListen(); return; }
    if (a === "vc-cc") { VC.cc = !VC.cc; TS.vc_cc = VC.cc; tsave(); vcRepaint(); vcToast(VC.cc ? "Captions on" : "Captions off"); return; }
    if (a === "vc-rate") { const R = [0.8, 0.9, 1, 1.1], k = R.indexOf(vcRate()); TS.vc_rate = R[(k + 1) % R.length]; tsave(); window.__vcRate = TS.vc_rate; vcPaintBar(); return; }
    if (a === "vc-cam") { vcCam(); return; }
    if (a === "vc-report") { const txt = (window.__pvDiagText ? window.__pvDiagText() : (window.__vcLipDiag ? window.__vcLipDiag() : "")); const done = () => vcToast("Call report copied. Paste it into the chat with Claude.");
      try { navigator.clipboard.writeText(txt).then(done, () => { prompt("Copy this report:", txt); }); } catch (x) { try { prompt("Copy this report:", txt); } catch (y) {} } return; }
    if (a === "vc-set") { const s = document.getElementById("vc-sheet"); if (!s) return; s.hidden = !s.hidden; if (!s.hidden) s.innerHTML = vcSheet(); const r = document.getElementById("vcall"); if (r) r.classList.toggle("vc-sheet-on", !s.hidden);
      if (!s.hidden && !s.__sw) { s.__sw = 1; let y0 = null; s.addEventListener("touchstart", (e) => { y0 = (s.querySelector(".vc-sh-in") || s).scrollTop > 0 ? null : e.touches[0].clientY; }, { passive: true });
        s.addEventListener("touchend", (e) => { if (y0 != null && e.changedTouches[0].clientY - y0 > 70) { s.hidden = true; if (r) r.classList.remove("vc-sheet-on"); } y0 = null; }, { passive: true }); }
      return; }
    if (a === "vc-opt" && b.dataset.k === "txt") { const v = b.dataset.v; VC.cc = v !== "off"; TS.vc_cc = VC.cc; if (v !== "off") TS.vc_you = v === "all"; tsave(); vcRepaint(); const s = document.getElementById("vc-sheet"); if (s) s.innerHTML = vcSheet(); vcToast(v === "off" ? "Captions off" : v === "pro" ? "Captions: only Profe" : "Captions: Profe and you"); return; }
    if (a === "vc-opt") { TS["vc_" + b.dataset.k] = b.dataset.v; tsave(); const s = document.getElementById("vc-sheet"); if (s) s.innerHTML = vcSheet(); return; }
  });
  // the self-view can be dragged out of the way
  (function () { let d = null; document.addEventListener("pointerdown", (e) => { const v = e.target.closest && e.target.closest("#vc-self"); if (!v) return; const r = v.getBoundingClientRect(); d = { v, dx: e.clientX - r.left, dy: e.clientY - r.top }; try { v.setPointerCapture(e.pointerId); } catch (x) {} });
    document.addEventListener("pointermove", (e) => { if (!d) return; const W = innerWidth, H = innerHeight, r = d.v.getBoundingClientRect(); d.v.style.left = Math.max(8, Math.min(W - r.width - 8, e.clientX - d.dx)) + "px"; d.v.style.top = Math.max(8, Math.min(H - r.height - 8, e.clientY - d.dy)) + "px"; d.v.style.right = "auto"; });
    document.addEventListener("pointerup", () => { d = null; }); })();
  // app in the background / screen locked: stop listening; back in front: carry on
  document.addEventListener("visibilitychange", () => { if (!VC.on || VC.paused) return; if (document.hidden) { vcStopMic(); try { speechSynthesis.cancel(); } catch (e) {} avStopAll(); vcSet("paused", "Tap to talk"); } else { VC.empties = 0; vcListen(); } });
  /* ==================== /Profe video call ==================== */
