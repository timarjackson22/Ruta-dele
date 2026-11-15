"""Checks YouTube videos for Ruta DELE: plays in other apps (embeds)? caption tracks? channel, views, length.
Prints facts only, never caption text. Run on GitHub Actions (workflow video-check): python tools/video_check.py ID ID ..."""
import sys, re, json, html, urllib.request, urllib.error, http.cookiejar
cj = http.cookiejar.CookieJar(); op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
H = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36", "Accept-Language": "es,en;q=0.8"}
def get(u, data=None, hdr=None):
    r = urllib.request.Request(u, data=data, headers=dict(H, **(hdr or {}))); return op.open(r, timeout=30).read().decode("utf-8", "replace")
CLIENTS = [("ANDROID", "20.10.38", {}), ("WEB_EMBEDDED_PLAYER", "1.20241009.01.00", {"thirdParty": {"embedUrl": "https://timarjackson22.github.io/Ruta-dele/"}}), ("TVHTML5_SIMPLY_EMBEDDED_PLAYER", "2.0", {"thirdParty": {"embedUrl": "https://timarjackson22.github.io/Ruta-dele/"}}), ("IOS", "19.45.4", {}), ("MWEB", "2.20241010.01.00", {})]
def oembed(v):
    try: j = json.loads(get("https://www.youtube.com/oembed?format=json&url=https://www.youtube.com/watch?v=" + v)); return 200, j.get("title"), j.get("author_name")
    except urllib.error.HTTPError as e: return e.code, None, None
    except Exception as e: return str(e)[:40], None, None
def check(v):
    oc, ot, oa = oembed(v)
    base = {"id": v, "oembed": oc, "title": ot, "author": oa}
    for name, ver, extra in CLIENTS:
        try:
            ctx = {"client": dict({"clientName": name, "clientVersion": ver, "hl": "es"})}; ctx.update(extra)
            pr = json.loads(get("https://www.youtube.com/youtubei/v1/player?prettyPrint=false", json.dumps({"context": ctx, "videoId": v}).encode(), {"Content-Type": "application/json"}))
        except Exception as e: continue
        ps = pr.get("playabilityStatus", {})
        if ps.get("status") != "OK": base.setdefault("tried", []).append(name + ":" + str(ps.get("status"))); continue
        vd = pr.get("videoDetails", {}); tr = (pr.get("captions") or {}).get("playerCaptionsTracklistRenderer", {}).get("captionTracks", [])
        es = [t for t in tr if t.get("languageCode", "").startswith("es")]; n = None
        if es:
            t = sorted(es, key=lambda t: t.get("kind") == "asr")[0]
            try: n = len(re.findall(r"<text |<p ", get(t["baseUrl"].replace("&fmt=srv3", ""))))
            except Exception as e: n = "fetch failed: " + str(e)[:50]
        base.update({"client": name, "embed_player": ps.get("playableInEmbed"), "views": int(vd.get("viewCount", 0) or 0), "secs": int(vd.get("lengthSeconds", 0) or 0), "author": vd.get("author") or oa, "title": vd.get("title") or ot,
                     "tracks": [t.get("languageCode", "") + ("(auto)" if t.get("kind") == "asr" else "") for t in tr], "es_lines": n})
        return base
    return base
def check_old(v):
    page = html.unescape(get("https://www.youtube.com/watch?v=" + v))
    if 'action="https://consent.youtube.com/s"' in page:
        m = re.search('name="v" value="(.*?)"', page); cj.set_cookie(http.cookiejar.Cookie(0, "CONSENT", "YES+" + m.group(1), None, False, ".youtube.com", True, True, "/", True, False, None, False, None, None, {}))
        page = html.unescape(get("https://www.youtube.com/watch?v=" + v))
    key = re.search(r'"INNERTUBE_API_KEY":\s*"([a-zA-Z0-9_-]+)"', page)
    if not key: return {"id": v, "err": "no key" + (" (captcha)" if "g-recaptcha" in page else "")}
    emb = re.search(r'"playableInEmbed":\s*(true|false)', page)
    pr = json.loads(get("https://www.youtube.com/youtubei/v1/player?key=" + key.group(1), json.dumps({"context": {"client": {"clientName": "ANDROID", "clientVersion": "20.10.38"}}, "videoId": v}).encode(), {"Content-Type": "application/json"}))
    ps = pr.get("playabilityStatus", {}); vd = pr.get("videoDetails", {})
    tr = (pr.get("captions") or {}).get("playerCaptionsTracklistRenderer", {}).get("captionTracks", [])
    tracks = [t.get("languageCode", "") + ("(auto)" if t.get("kind") == "asr" else "") for t in tr]
    n = None; es = [t for t in tr if t.get("languageCode", "").startswith("es")]
    if es:
        t = sorted(es, key=lambda t: t.get("kind") == "asr")[0]
        try: n = len(re.findall(r"<text ", get(t["baseUrl"].replace("&fmt=srv3", ""))))
        except Exception as e: n = "fetch failed: " + str(e)[:60]
    return {"id": v, "status": ps.get("status"), "reason": ps.get("reason"), "embed_page": emb.group(1) if emb else None, "embed_player": ps.get("playableInEmbed"),
            "title": vd.get("title"), "author": vd.get("author"), "views": int(vd.get("viewCount", 0) or 0), "secs": int(vd.get("lengthSeconds", 0) or 0), "tracks": tracks, "es_lines": n}
out = []
def rss(ch):
    x = get("https://www.youtube.com/feeds/videos.xml?channel_id=" + ch)
    for e in re.findall(r"<entry>(.*?)</entry>", x, re.S):
        g = lambda p: (re.search(p, e, re.S) or [None, None])[1]
        print("RSS " + json.dumps({"ch": ch, "id": g(r"<yt:videoId>(.*?)<"), "title": html.unescape(g(r"<title>(.*?)<") or ""), "author": html.unescape(g(r"<name>(.*?)<") or ""), "date": g(r"<published>(.*?)<"), "views": int(g(r'views="(\d+)"') or 0)}, ensure_ascii=False), flush=True)
for v in sys.argv[1:]:
    if v.startswith("chan:"):
        try:
            j = json.loads(get("https://www.youtube.com/oembed?format=json&url=https://www.youtube.com/watch?v=" + v[5:])); au = j.get("author_url")
            pg = get(au); cid = (re.search(r'"(?:externalId|channelId)":"(UC[\w-]{22})"', pg) or re.search(r'channel/(UC[\w-]{22})', pg))
            print("RSS " + json.dumps({"ch": "lookup", "title": au + " -> " + (cid.group(1) if cid else "?")}))
            if cid: rss(cid.group(1))
        except Exception as e: print("RSS " + json.dumps({"ch": v, "err": str(e)[:100]}))
        continue
    if v.startswith("lrc:"):  # lrc:Artist~Title (underscores for spaces): LRCLIB synced lyrics
        try:
            import urllib.parse, urllib.request
            ar, ti = [x.replace("_", " ") for x in v[4:].split("~", 1)]
            u = "https://lrclib.net/api/search?" + urllib.parse.urlencode({"track_name": ti, "artist_name": ar})
            rq = urllib.request.Request(u, headers={"User-Agent": "RutaDELE/1 (https://github.com/timarjackson22/Ruta-dele)", "Origin": "https://timarjackson22.github.io"})
            with urllib.request.urlopen(rq, timeout=20) as r: cors = r.headers.get("Access-Control-Allow-Origin"); js = json.loads(r.read().decode())
            rows = [{"id": x.get("id"), "track": x.get("trackName"), "artist": x.get("artistName"), "album": x.get("albumName"), "dur": x.get("duration"), "synced": bool(x.get("syncedLyrics")), "first": (x.get("syncedLyrics") or "").split("\n")[:3]} for x in js[:4]]
            print("LRC " + json.dumps({"q": ar + " / " + ti, "cors": cors, "n": len(js), "top": rows}, ensure_ascii=False), flush=True)
        except Exception as e: print("LRC " + json.dumps({"q": v, "err": str(e)[:120]}))
        continue
    if v.startswith("lrcapp:"):  # lrcapp:VIDEOID~Artist~Title: what the app would pick (same query, same choice, same intro guess as vlFetch in vextra.js)
        try:
            import urllib.parse, urllib.request
            vid, ar, ti = [x.replace("_", " ") for x in v[7:].split("~", 2)]
            try: L = check(vid).get("secs") or 0
            except Exception: L = 0
            ti2 = re.sub(r"\s*[-\u2013|].*$", "", re.sub(r"\((?:en vivo|live|official[^)]*|video oficial|videoclip|lyrics?|letra|audio)\)", "", ti, flags=re.I)); ti2 = re.sub(r"\s+", " ", ti2).strip()
            ar2 = re.split(r",|&| y | ft\.| feat\.", ar, flags=re.I)[0]; ar2 = re.sub(r"\s+", " ", re.sub(r"\b(music|vevo|official)\b", "", ar2, flags=re.I)).strip()
            def q(params):
                rq = urllib.request.Request("https://lrclib.net/api/search?" + urllib.parse.urlencode(params), headers={"User-Agent": "RutaDELE/1 (https://github.com/timarjackson22/Ruta-dele)"})
                with urllib.request.urlopen(rq, timeout=20) as r: return json.loads(r.read().decode())
            rows = q({"track_name": ti2, "artist_name": ar2}); used = "track+artist"
            if not any(x.get("syncedLyrics") for x in rows): rows = rows + q({"q": ti2 + " " + ar2}); used += ",q"
            ok = [x for x in rows if x.get("syncedLyrics") and len([l for l in x["syncedLyrics"].split("\n") if re.match(r"^\[\d+:\d+(\.\d+)?\]\s*\S", l)]) > 4]
            if L: ok.sort(key=lambda x: abs((x.get("duration") or 0) - L))
            if not ok: print("LRCAPP " + json.dumps({"id": vid, "q": [ar2, ti2], "used": used, "video": L, "found": len(rows), "pick": None}, ensure_ascii=False)); continue
            b = ok[0]; lines = [l for l in b["syncedLyrics"].split("\n") if l.strip()]
            t0 = re.match(r"^\[(\d+):(\d+(?:\.\d+)?)\]", lines[0]); t0 = int(t0.group(1)) * 60 + float(t0.group(2)) if t0 else 0
            extra = L - (b.get("duration") or 0) if L else 0; off = round(extra, 1) if 2 < extra < 40 and t0 < 3 else 0
            print("LRCAPP " + json.dumps({"id": vid, "q": [ar2, ti2], "used": used, "video": L, "pick": {"id": b["id"], "artist": b.get("artistName"), "track": b.get("trackName"), "dur": b.get("duration"), "lines": len(lines), "first_at": t0, "guess_off": off}, "alts": [(x.get("duration"), x["id"]) for x in ok[1:4]], "first": lines[:3]}, ensure_ascii=False), flush=True)
        except Exception as e: print("LRCAPP " + json.dumps({"q": v, "err": str(e)[:160]}))
        continue
    if v.startswith("ytsearch:"):  # ytsearch:words_with_underscores: the same parsing as CaptionBridge.searchRun
        try:
            import urllib.parse, urllib.request
            q = v[9:].replace("_", " ")
            rq = urllib.request.Request("https://www.youtube.com/results?hl=es&search_query=" + urllib.parse.quote(q), headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36", "Accept-Language": "es,en;q=0.8"})
            with urllib.request.urlopen(rq, timeout=20) as r: page = r.read().decode("utf-8", "replace")
            out = []
            for m in re.finditer(r'"videoRenderer":\{"videoId":"([\w-]{11})"', page):
                ch = page[m.end():m.end() + 6000]; n = ch.find('"videoRenderer"'); ch = ch[:n] if n > 0 else ch
                t = re.search(r'"title":\{"runs":\[\{"text":"((?:[^"\\]|\\.)*)"', ch); l = re.search(r'"lengthText":\{.*?"simpleText":"([0-9:]+)"', ch); o = re.search(r'"ownerText":\{"runs":\[\{"text":"((?:[^"\\]|\\.)*)"', ch)
                secs = 0
                if l:
                    for part in l.group(1).split(":"): secs = secs * 60 + int(part)
                row = {"id": m.group(1), "t": t.group(1) if t else None, "ch": o.group(1) if o else None, "secs": secs}
                try: c = check(m.group(1)); row["tracks"] = c.get("tracks"); row["err"] = c.get("err")
                except Exception as e: row["err"] = str(e)[:60]
                out.append(row)
                if len(out) >= 6: break
            print("YTS " + json.dumps({"q": q, "len": len(page), "consent": "consent.youtube.com" in page, "n": len(out), "rows": out}, ensure_ascii=False), flush=True)
        except Exception as e: print("YTS " + json.dumps({"q": v, "err": str(e)[:160]}))
        continue
    if v.startswith("rss:"):
        try: rss(v[4:])
        except Exception as e: print("RSS " + json.dumps({"ch": v, "err": str(e)[:100]}))
        continue
    try: r = check(v)
    except Exception as e: r = {"id": v, "err": str(e)[:120]}
    out.append(r); print("ROW " + json.dumps(r, ensure_ascii=False), flush=True)
