/* Ruta DELE Android bridge: gives the web app speechSynthesis and SpeechRecognition backed by Android. */
(function () {
  if (window.__rutaBridge) return;
  window.__rutaBridge = true;

  /* ---------- text to speech ---------- */
  if (window.AndroidTTS) {
    var A = window.AndroidTTS, cbs = {}, seq = 0, voices = [];
    var S = {
      speaking: false, pending: false, paused: false, onvoiceschanged: null,
      getVoices: function () { return voices.slice(); },
      speak: function (u) {
        var id = String(++seq); cbs[id] = u; S.speaking = true;
        var lang = u.lang || (u.voice && u.voice.lang) || "es-US";
        try { A.speak(id, String(u.text || ""), lang, +u.rate || 1, +u.pitch || 1, u.voice && u.voice.name ? u.voice.name : ""); } catch (e) { fin(id, "error"); }
      },
      cancel: function () {
        var ids = Object.keys(cbs);
        for (var k = 0; k < ids.length; k++) { var u = cbs[ids[k]]; delete cbs[ids[k]]; try { if (u.onerror) u.onerror({ error: "interrupted", utterance: u }); } catch (e) {} }
        S.speaking = false;
        try { A.stop(); } catch (e) {}
      },
      pause: function () {}, resume: function () {},
      addEventListener: function (t, f) { if (t === "voiceschanged") S.onvoiceschanged = f; },
      removeEventListener: function () {}
    };
    function fin(id, type) {
      var u = cbs[id]; if (!u) return; delete cbs[id];
      if (!Object.keys(cbs).length) S.speaking = false;
      try { if (type === "end") { if (u.onend) u.onend({ utterance: u }); } else if (u.onerror) u.onerror({ error: "synthesis-failed", utterance: u }); } catch (e) {}
    }
    function load() {
      try {
        var v = JSON.parse(A.voices() || "[]");
        if (!v.length) return false;
        v.sort(function (a, b) { return ((b.quality || 300) - (a.quality || 300)) || ((a.network ? 1 : 0) - (b.network ? 1 : 0)); });
        voices = v.map(function (o) { return { name: o.name, lang: o.lang, voiceURI: o.name, localService: !o.network, quality: o.quality || 300, network: !!o.network, "default": false }; });
        if (typeof S.onvoiceschanged === "function") try { S.onvoiceschanged(); } catch (e) {}
        return true;
      } catch (e) { return false; }
    }
    function U(text) { this.text = text || ""; this.lang = ""; this.rate = 1; this.pitch = 1; this.volume = 1; this.voice = null; this.onstart = this.onend = this.onerror = this.onboundary = this.onpause = this.onresume = this.onmark = null; }
    U.prototype.addEventListener = function (t, f) { this["on" + t] = f; };
    window.__atts = {
      ev: function (type, id) { var u = cbs[id]; if (!u) return; if (type === "start") { try { if (u.onstart) u.onstart({ utterance: u }); } catch (e) {} return; } fin(id, type); },
      voices: function () { load(); }
    };
    try { Object.defineProperty(window, "speechSynthesis", { value: S, configurable: true, writable: true }); } catch (e) { window.speechSynthesis = S; }
    window.SpeechSynthesisUtterance = U;
    if (!load()) { var n = 0, t = setInterval(function () { if (load() || ++n > 60) clearInterval(t); }, 250); }
  }

  /* ---------- speech recognition ---------- */
  if (window.AndroidSTT) {
    var R = window.AndroidSTT, active = null;
    function alt(t, f) { var a = [{ transcript: t, confidence: 0.9 }]; a.isFinal = f; a.item = function (i) { return a[i]; }; return a; }
    function fire(r, list, idx) { list.item = function (i) { return list[i]; }; try { if (r.onresult) r.onresult({ results: list, resultIndex: idx }); } catch (e) {} }
    function SR() { this.lang = "es-US"; this.interimResults = false; this.continuous = false; this.maxAlternatives = 1; this.onresult = this.onerror = this.onend = this.onstart = this.onspeechend = this.onaudiostart = this.onsoundstart = null; this._final = []; }
    SR.prototype.start = function () { if (active && active !== this) try { R.cancel(); } catch (e) {} active = this; this._final = []; R.start(this.lang || "es-US", !!this.interimResults, !!this.continuous); };
    SR.prototype.stop = function () { R.stop(); };
    SR.prototype.abort = function () { R.cancel(); };
    SR.prototype.addEventListener = function (t, f) { this["on" + t] = f; };
    window.__astt = {
      ev: function (type, a) {
        var r = active; if (!r) return;
        if (type === "start") { try { if (r.onstart) r.onstart({}); if (r.onaudiostart) r.onaudiostart({}); } catch (e) {} }
        else if (type === "partial") { var l = r._final.map(function (t) { return alt(t, true); }); l.push(alt(a, false)); fire(r, l, r._final.length); }
        else if (type === "final") { r._final.push(a); fire(r, r._final.map(function (t) { return alt(t, true); }), r._final.length - 1); }
        else if (type === "error") { try { if (r.onerror) r.onerror({ error: a }); } catch (e) {} }
        else if (type === "end") { active = null; try { if (r.onend) r.onend({}); } catch (e) {} }
      }
    };
    window.SpeechRecognition = SR;
    window.webkitSpeechRecognition = SR;
  }
})();
