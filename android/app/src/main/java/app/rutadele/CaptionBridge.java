package app.rutadele;

import android.os.Handler;
import android.os.Looper;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Spanish captions for Practice › Videos: the video's own YouTube caption track (made by the channel, or YouTube's
 * automatic one) with its timings, plus YouTube's English translation of it. Free, no keys: the same public steps the
 * open-source transcript tools use (watch page → player data → caption track). Websites can't do this (browsers block
 * it), so the app does it here.
 * JavaScript: AndroidCap.fetch(id, videoId). Result: window.__acap.ev(id, json, error),
 * json = {lang, kind: "manual"|"asr", es: xml, en: xml} or {none: true}.
 */
public class CaptionBridge {
    static final String UA = "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36";
    final WebView web;
    final Handler main = new Handler(Looper.getMainLooper());
    final ExecutorService ex = Executors.newSingleThreadExecutor();
    String cookie = "";

    CaptionBridge(WebView web) { this.web = web; }

    @JavascriptInterface
    public boolean available() { return true; }

    @JavascriptInterface
    public void fetch(final String id, final String videoId) {
        ex.execute(() -> {
            try {
                if (!videoId.matches("[\\w-]{11}")) throw new IOException("bad id");
                reply(id, run(videoId).toString(), null);
            } catch (Exception e) {
                reply(id, null, e.getClass().getSimpleName() + ": " + e.getMessage());
            }
        });
    }

    void reply(String id, String json, String err) {
        final String code = "window.__acap && __acap.ev(" + JSONObject.quote(id) + "," + JSONObject.quote(json == null ? "" : json) + "," + JSONObject.quote(err == null ? "" : err) + ")";
        main.post(() -> web.evaluateJavascript(code, null));
    }

    String http(String url, String post) throws IOException {
        HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
        c.setConnectTimeout(15000);
        c.setReadTimeout(20000);
        c.setRequestProperty("User-Agent", UA);
        c.setRequestProperty("Accept-Language", "es,en;q=0.8");
        if (!cookie.isEmpty()) c.setRequestProperty("Cookie", cookie);
        if (post != null) {
            c.setRequestMethod("POST");
            c.setDoOutput(true);
            c.setRequestProperty("Content-Type", "application/json");
            c.getOutputStream().write(post.getBytes(StandardCharsets.UTF_8));
        }
        int code = c.getResponseCode();
        if (code >= 400) { c.disconnect(); throw new IOException("HTTP " + code); }
        try (InputStream in = c.getInputStream()) {
            ByteArrayOutputStream b = new ByteArrayOutputStream();
            byte[] buf = new byte[16384];
            int n;
            while ((n = in.read(buf)) > 0) b.write(buf, 0, n);
            return b.toString("UTF-8");
        } finally { c.disconnect(); }
    }

    JSONObject run(String vid) throws Exception {
        String watch = "https://www.youtube.com/watch?v=" + vid + "&hl=es";
        String page = http(watch, null);
        if (page.contains("action=\"https://consent.youtube.com/s\"")) {
            Matcher m = Pattern.compile("name=\"v\" value=\"(.*?)\"").matcher(page);
            if (m.find()) { cookie = "CONSENT=YES+" + m.group(1); page = http(watch, null); }
        }
        Matcher k = Pattern.compile("\"INNERTUBE_API_KEY\":\\s*\"([a-zA-Z0-9_-]+)\"").matcher(page);
        if (!k.find()) throw new IOException(page.contains("g-recaptcha") ? "YouTube asked to confirm you're not a robot" : "player data not found");
        String[][] clients = {{"ANDROID", "20.10.38"}, {"WEB_EMBEDDED_PLAYER", "1.20241009.01.00"}};
        JSONArray tracks = null;
        String status = "";
        for (String[] cl : clients) {
            JSONObject ctx = new JSONObject().put("client", new JSONObject().put("clientName", cl[0]).put("clientVersion", cl[1]).put("hl", "es"));
            if (cl[0].startsWith("WEB_EMBEDDED")) ctx.put("thirdParty", new JSONObject().put("embedUrl", "https://timarjackson22.github.io/Ruta-dele/"));
            JSONObject body = new JSONObject().put("context", ctx).put("videoId", vid);
            JSONObject pr;
            try { pr = new JSONObject(http("https://www.youtube.com/youtubei/v1/player?key=" + k.group(1) + "&prettyPrint=false", body.toString())); }
            catch (Exception e) { status = e.getMessage(); continue; }
            status = pr.optJSONObject("playabilityStatus") == null ? "" : pr.optJSONObject("playabilityStatus").optString("status");
            JSONObject caps = pr.optJSONObject("captions");
            JSONObject tl = caps == null ? null : caps.optJSONObject("playerCaptionsTracklistRenderer");
            tracks = tl == null ? null : tl.optJSONArray("captionTracks");
            if (tracks != null && tracks.length() > 0) break;
        }
        if (tracks == null || tracks.length() == 0) return new JSONObject().put("none", true).put("status", status);
        JSONObject best = null;
        for (int i = 0; i < tracks.length(); i++) {
            JSONObject t = tracks.getJSONObject(i);
            if (!t.optString("languageCode").startsWith("es")) continue;
            boolean asr = "asr".equals(t.optString("kind"));
            if (best == null || ("asr".equals(best.optString("kind")) && !asr)) best = t;
        }
        if (best == null) return new JSONObject().put("none", true).put("status", "no Spanish track");
        String base = best.getString("baseUrl");
        String es = http(base, null);
        if (!es.contains("<text") && !es.contains("<p ")) es = http(base.replace("&fmt=srv3", ""), null);
        String en = "";
        if (best.optBoolean("isTranslatable", true)) {
            try { en = http(base.replace("&fmt=srv3", "") + "&tlang=en", null); } catch (Exception ignored) { }
        }
        return new JSONObject().put("lang", best.optString("languageCode")).put("kind", "asr".equals(best.optString("kind")) ? "asr" : "manual").put("es", es).put("en", en);
    }
}
