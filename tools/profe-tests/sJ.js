// J. Home Continue banner (M2) and the video page's Next video button (M3), 15 Nov 2026. YouTube is simulated.
const { open } = require("./h.js");
const R = []; const rec = (n, ok, info) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (!ok && info != null ? "  " + String(info).slice(0, 500) : "")); };
const YT = `(() => { window.__yt = { log: [] };
  function Player(el, o) { const self = this; window.__yt.p = this; this.o = o; this.t = 0; this.st = -1; const n = document.getElementById(el); if (n) { const f = document.createElement("div"); f.id = el; n.replaceWith(f); }
    this._iv = setInterval(() => { if (self.st === 1) self.t += 0.1; }, 100); setTimeout(() => o.events.onReady({ target: self }), 50); }
  Player.prototype = { getCurrentTime() { return this.t; }, getDuration() { return 300; }, seekTo(t) { this.t = t; }, playVideo() { window.__yt.log.push(["play", performance.now()]); if (!window.__ytBlock) this.st = 1; }, pauseVideo() { this.st = 2; },
    getPlayerState() { return this.st; }, getVideoData() { return { video_id: this.o.videoId }; }, unloadModule() {}, setPlaybackRate() {}, destroy() { clearInterval(this._iv); }, getAvailablePlaybackRates() { return [1]; } };
  window.YT = { Player, PlayerState: { ENDED: 0, PLAYING: 1, PAUSED: 2 } }; })();`;
(async () => {
  const H = await open({ hash: "#inicio", noOpen: true, init: YT }); const p = H.p;
  await p.waitForFunction(() => !!window.__cb, null, { timeout: 8000 });
  // seed real progress: a lesson, flashcards, a story, mistakes → several slides
  await p.evaluate(() => { const k = Object.keys(localStorage).find((x) => { try { return "last" in JSON.parse(localStorage.getItem(x)) || "goal" in JSON.parse(localStorage.getItem(x)); } catch (e) { return false; } }); });
  const seeded = await p.evaluate(() => { const L = window.__cb.slides(); return L.map((s) => s.k); });
  rec("Banner slides come only from real state (a new learner gets the sheet/exam suggestions, not fake progress)", !seeded.includes("lesson") && !seeded.includes("mist"), JSON.stringify(seeded));
  await p.evaluate(() => { location.hash = "#a1-u2"; }); await H.wait(600); await p.evaluate(() => { location.hash = "#inicio"; }); await H.wait(600);
  const ks = await p.evaluate(() => [...document.querySelectorAll("#cbslides .cbslide")].map((x) => x.dataset.k));
  rec("Opening a lesson adds a Continue-lesson slide with unit, progress, duration and a resume button", ks.includes("lesson") && await p.evaluate(() => { const s = document.querySelector('.cbslide[data-k="lesson"]'); return /Unit 2 of/.test(s.textContent) && /min/.test(s.textContent) && /Resume|Start/.test(s.textContent) && !!s.querySelector(".cbbar"); }), JSON.stringify(ks));
  rec("Schedule summary is always shown; with no plan it offers Create study plan", await p.evaluate(() => /Create study plan/.test(document.querySelector(".cbsched").textContent)));
  // exactly one slide visible; controls work without moving focus
  const one = await p.evaluate(() => [...document.querySelectorAll("#cbslides .cbslide")].filter((x) => !x.hidden).length);
  rec("One slide visible, the rest hidden and inert", one === 1);
  if (ks.length > 1) {
    const i0 = await p.evaluate(() => window.__cb.state.i);
    await p.focus('[data-cb="next"]'); await p.click('[data-cb="next"]'); await H.wait(100);
    const af = await p.evaluate(() => ({ i: window.__cb.state.i, f: document.activeElement && document.activeElement.dataset.cb, live: document.getElementById("cbslides").getAttribute("aria-live") }));
    rec("Next button moves one slide, keeps focus on the button, announces politely", af.i === (i0 + 1) % ks.length && af.f === "next" && af.live === "polite", JSON.stringify(af));
    await p.click('[data-cb="go"][data-i="0"]'); await H.wait(100); rec("Dots choose a slide", await p.evaluate(() => window.__cb.state.i === 0));
    // auto-rotation (7 s) while nothing is touched; pauses while focus is inside
    await p.evaluate(() => { document.activeElement && document.activeElement.blur(); window.__cb.state.hold = 0; window.__cb.state.paused = false; }); await p.mouse.move(5, 5);
    const a0 = await p.evaluate(() => window.__cb.state.i); await H.wait(7600); const a1 = await p.evaluate(() => window.__cb.state.i);
    rec("Rotates by itself after about 7 seconds", a1 !== a0, a0 + "→" + a1);
    await p.focus('#cbslides .cbslide:not([hidden]) .cbcard'); const b0 = await p.evaluate(() => window.__cb.state.i); await H.wait(7600); const b1 = await p.evaluate(() => window.__cb.state.i);
    rec("Pauses while focus is in the banner", b0 === b1, b0 + "→" + b1);
    await p.evaluate(() => document.activeElement.blur());
    // a tap in progress keeps its destination
    const href = await p.evaluate(() => { const c = document.querySelector("#cbslides .cbslide:not([hidden]) .cbcard"); c.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true })); return c.getAttribute("href") || c.dataset.act; });
    await H.wait(7600); const same = await p.evaluate(() => { const c = document.querySelector("#cbslides .cbslide:not([hidden]) .cbcard"); return c.getAttribute("href") || c.dataset.act; });
    rec("A press holds the slide so the destination can't change under the finger", href === same, href + " vs " + same);
    // swipe
    const s0 = await p.evaluate(() => window.__cb.state.i); const box = await p.$("#cbanner"); const bb = await box.boundingBox();
    await p.evaluate(([x, y]) => { const el = document.getElementById("cbanner"), T = (cx) => new Touch({ identifier: 1, target: el, clientX: cx, clientY: y }); el.dispatchEvent(new TouchEvent("touchstart", { touches: [T(x + 200)], bubbles: true })); el.dispatchEvent(new TouchEvent("touchend", { changedTouches: [T(x + 40)], bubbles: true })); }, [bb.x, bb.y + 40]);
    rec("Swipe left shows the next slide", await p.evaluate((s0) => window.__cb.state.i !== s0, s0));
    // pause button
    await p.click('[data-cb="pause"]'); const pz = await p.evaluate(() => ({ u: window.__cb.state.user, l: document.querySelector('[data-cb="pause"]').getAttribute("aria-pressed") }));
    rec("Pause button stops rotation (aria-pressed)", pz.u === true && pz.l === "true", JSON.stringify(pz));
  }
  // reduced motion: no automatic rotation
  await p.emulateMedia({ reducedMotion: "reduce" }); await p.evaluate(() => { window.__cb.state.user = false; location.hash = "#curso"; }); await H.wait(300); await p.evaluate(() => { location.hash = "#inicio"; }); await H.wait(500);
  const r0 = await p.evaluate(() => window.__cb.state.i); await H.wait(7600); const r1 = await p.evaluate(() => window.__cb.state.i);
  rec("Reduced motion: no automatic rotation, pause button hidden", r0 === r1 && await p.evaluate(() => { const b = document.querySelector('[data-cb="pause"]'); return !b || b.hidden; }), r0 + "→" + r1);
  await p.emulateMedia({ reducedMotion: "no-preference" });
  // with a plan: the plan's next session is a slide and the summary shows status
  await p.evaluate(() => { const P = window.__plan, d = P.blank(); d.target = "a2"; d.current = "a1"; for (let i = 0; i < 7; i++) { d.avail[i] = [{ s: "06:00", e: "23:30" }]; d.want[i] = 60; } P.commit(P.generate(d, true)); location.hash = "#curso"; }); await H.wait(300);
  await p.evaluate(() => { location.hash = "#inicio"; }); await H.wait(500);
  const pl = await p.evaluate(() => ({ k: [...document.querySelectorAll("#cbslides .cbslide")].map((x) => x.dataset.k), sum: document.querySelector(".cbsched").textContent }));
  rec("With a study plan: a scheduled-session slide and a status summary (Today …, plan overall …)", pl.k[0] === "plan" && /Today/.test(pl.sum) && /plan overall/.test(pl.sum), JSON.stringify(pl));
  // ---- Next video ----
  const order = await p.evaluate(() => window.__cb.order().map((v) => v.yt));
  await p.evaluate((id) => { location.hash = "#video-" + id; }, order[0]); await H.wait(900);
  const nb = await p.evaluate(() => { const b = document.querySelector('[data-act="v-next"]'), top = b && b.getBoundingClientRect().top, fr = document.querySelector(".vframe").getBoundingClientRect().top; return { id: b && b.dataset.id, above: top < fr, dis: b.disabled }; });
  rec("Next video button sits above the player and points at the next video in list order", nb.id === order[1] && nb.above && !nb.dis, JSON.stringify(nb) + " expected " + order[1]);
  await p.evaluate(() => { window.__yt.p.playVideo(); window.__yt.p.t = 42; }); await H.wait(1200);
  const t0 = await p.evaluate(() => performance.now());
  await p.evaluate(() => { const b = document.querySelector('[data-act="v-next"]'); b.click(); b.click(); b.click(); }); await H.wait(2600);
  const nx = await p.evaluate(([prev, t0]) => { const d = (window.__S || {}); const plays = window.__yt.log.filter((x) => x[0] === "play" && x[1] > t0); return { hash: location.hash, plays: plays.length, delay: plays.length ? Math.round(plays[0][1] - t0) : null, st: window.__yt.p.getPlayerState(), prev: (JSON.parse(localStorage.getItem(Object.keys(localStorage).find((k) => { try { return JSON.parse(localStorage.getItem(k)).vid; } catch (e) { return false; } }))).vid || {})[prev] }; }, [order[0], t0]);
  rec("Next video opens the next one (once, despite three taps) and starts it by itself", nx.hash === "#video-" + order[1] && nx.plays === 1 && nx.st === 1, JSON.stringify(nx));
  rec("The skipped video keeps its position and is not marked watched", nx.prev && nx.prev.at >= 40 && !nx.prev.w, JSON.stringify(nx.prev));
  // blocked autoplay → Tap to play
  await p.evaluate(() => { window.__ytBlock = true; document.querySelector('[data-act="v-next"]').click(); }); await H.wait(2800);
  const bl = await p.evaluate(() => ({ btn: !!document.getElementById("vtapplay"), txt: (document.getElementById("vtapplay") || {}).textContent }));
  rec("If the browser blocks autoplay, a Tap to play control explains why", bl.btn && /didn't let/.test(bl.txt), JSON.stringify(bl));
  await p.evaluate(() => { window.__ytBlock = false; document.getElementById("vtapplay").click(); }); await H.wait(300);
  rec("Tap to play starts it", await p.evaluate(() => window.__yt.p.getPlayerState() === 1 && !document.getElementById("vtapplay")));
  // the last video: disabled
  await p.evaluate((id) => { location.hash = "#video-" + id; }, order[order.length - 1]); await H.wait(900);
  rec("At the end of the list the button is disabled and says so", await p.evaluate(() => { const b = document.querySelector('[data-act="v-next"]'); return b.disabled && /Last video/.test(b.textContent); }));
  // Loop key in the Replay button: sunk → the video starts again at its end; released → the end scrolls Next video into view
  await p.evaluate((id) => { location.hash = "#video-" + id; }, order[1]); await H.wait(900);
  const lk = await p.evaluate(() => { const r = document.querySelector(".vrep"), b = r && r.querySelector('[data-act="v-vloop"]'), rp = r && r.querySelector('[data-act="v-loop"]'); if (!b || !rp) return null; const w = r.getBoundingClientRect().width, bw = b.getBoundingClientRect().width; return { share: Math.round(100 * bw / w), dot: !!b.querySelector(".vrepdot") }; });
  rec("Replay button has a round Loop key in about its right third", lk && lk.dot && lk.share >= 25 && lk.share <= 40, JSON.stringify(lk));
  await p.click('[data-act="v-vloop"]'); await H.wait(150);
  const sunk = await p.evaluate(() => { const b = document.querySelector('[data-act="v-vloop"]'); return b.getAttribute("aria-pressed") === "true" && getComputedStyle(b).transform !== "none"; });
  await p.evaluate(() => { const P = window.__yt.p; P.st = 1; P.t = 299; window.__yt.log.length = 0; P.st = 0; P.o.events.onStateChange({ data: 0 }); }); await H.wait(600);
  const looped = await p.evaluate(() => ({ st: window.__yt.p.getPlayerState(), t: Math.round(window.__yt.p.t), play: window.__yt.log.some((x) => x[0] === "play") }));
  rec("Loop sunk: at the end the same video plays again from the start", sunk && looped.st === 1 && looped.t <= 2 && looped.play, JSON.stringify([sunk, looped]));
  await p.click('[data-act="v-vloop"]'); await H.wait(150); await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await H.wait(200);
  await p.evaluate(() => { const P = window.__yt.p; P.st = 0; P.o.events.onStateChange({ data: 0 }); }); await H.wait(1200);
  const vis = await p.evaluate(() => { const r = document.querySelector(".vnextbar").getBoundingClientRect(); return { top: Math.round(r.top), released: document.querySelector('[data-act="v-vloop"]').getAttribute("aria-pressed") === "false", st: window.__yt.p.getPlayerState() }; });
  rec("Loop released: at the end the page scrolls so Next video is visible (and the video doesn't restart)", vis.released && vis.top >= 0 && vis.top < 300 && vis.st === 0, JSON.stringify(vis));
  // voice
  await p.evaluate((id) => { location.hash = "#video-" + id; }, order[2]); await H.wait(900);
  await p.evaluate(() => window.__pv.route("next video", "chat")); await H.wait(1200);
  rec("Voice: 'next video'", await p.evaluate((id) => location.hash === "#video-" + id, order[3]));
  rec("No page errors", !H.errs.length, H.errs.join(" | "));
  await H.close(); console.log(R.filter(Boolean).length + "/" + R.length + " passed"); process.exit(R.every(Boolean) ? 0 : 1);
})();
