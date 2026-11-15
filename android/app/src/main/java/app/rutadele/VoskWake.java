package app.rutadele;

import android.content.Context;

import org.json.JSONArray;
import org.json.JSONObject;
import org.vosk.Model;
import org.vosk.Recognizer;
import org.vosk.android.RecognitionListener;
import org.vosk.android.SpeechService;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

/**
 * "Ok Profe" with a dedicated offline keyword listener (tools/PROFE_WAKE_BRIEF.md).
 * Best practice for wake words: a small on-device model streams the microphone continuously and only listens for the wake phrase;
 * full speech recognition starts only after it. Vosk (Apache 2.0) with a grammar: the wake phrases plus a few hundred everyday
 * Spanish words, so ordinary speech ("el profesor", "hoy profundizamos") is matched to those words rather than forced into "oye profe".
 * Tested on the real model in .github/workflows/vosk-model.yml. No restarts, no beeps, nothing leaves the phone.
 * The model (39 MB) is downloaded once from the app's GitHub release when hands-free is switched on.
 */
final class VoskWake {
    interface Ev { void on(String type, String text); }
    static final String URL_ES = "https://github.com/timarjackson22/Ruta-dele/releases/download/vosk/vosk-model-small-es.zip";
    static final String[] LEADS = { "ok", "okey", "oye", "hola" };
    static final String FILL = "de la que el en y a los se del las un por con no una su para es al lo como más pero sus le ya o este sí porque esta entre cuando muy sin sobre también me hasta hay donde quien desde todo nos durante todos uno les ni contra otros ese eso ante ellos e esto mí antes algunos qué unos yo otro otras otra él tanto esa estos mucho quienes nada muchos cual poco ella estar estas algunas algo nosotros mi mis tú te ti tu tus ellas nosotras vosotros os mío mía tuyo suyo nuestro ser estoy estás está estamos están he has ha hemos han soy eres somos son era fue tengo tiene tenemos tienen hago hace voy vas va vamos van puedo puede quiero quiere sé sabe digo dice creo bien mal bueno buena hoy ayer mañana ahora luego después siempre nunca aquí allí casa tiempo día año vez cosa hombre mujer vida mundo parte gente café té agua comida trabajo oficina escuela clase lección examen pregunta respuesta palabra frase español inglés gracias perdón favor claro vale okay pues mira oiga hey ey profesor profesora profesión profesional profundo profundizamos profundizar perfecto perfecta prefiero preferir probé probar problema programa pronto propio proyecto fe pro padre madre hijo amigo ciudad país calle tarde noche hora minuto llegó llega vemos sal pasas pasa menú ir venir ver hablar comer leer escribir escuchar repetir siguiente anterior cómo tal";
    static Model model; static boolean loading;

    final Context c; final Ev ev;
    SpeechService svc; Recognizer rec; boolean on; long lastWake;
    VoskWake(Context c, Ev ev) { this.c = c; this.ev = ev; }

    static File dir(Context c) { return new File(c.getFilesDir(), "vosk-es"); }
    static boolean ready(Context c) { return new File(dir(c), "ok").exists(); }
    static volatile String dl = "";
    static String state(Context c) { return ready(c) ? "ready" : dl.startsWith("progress") ? "downloading" : "missing"; }

    static String grammar() {
        JSONArray a = new JSONArray();
        for (String l : LEADS) a.put(l + " profe");
        for (String w : FILL.split(" ")) if (!w.isEmpty()) a.put(w);
        a.put("[unk]");
        return a.toString();
    }

    /** download and unpack the model in the background; events: vosk progress:N | ready | error:… */
    static void download(Context c, Ev ev) {
        if (dl.startsWith("progress")) return;
        dl = "progress:0";
        new Thread(() -> {
            File tmp = new File(c.getCacheDir(), "vosk-es.zip");
            try {
                HttpURLConnection h = (HttpURLConnection) new URL(URL_ES).openConnection(); h.setInstanceFollowRedirects(true); h.setConnectTimeout(20000); h.setReadTimeout(30000);
                int code = h.getResponseCode(); if (code / 100 == 3) { h = (HttpURLConnection) new URL(h.getHeaderField("Location")).openConnection(); code = h.getResponseCode(); }
                if (code != 200) throw new Exception("HTTP " + code);
                long len = h.getContentLengthLong(), got = 0; int last = -1;
                try (InputStream in = new BufferedInputStream(h.getInputStream()); OutputStream out = new FileOutputStream(tmp)) {
                    byte[] b = new byte[65536]; int n;
                    while ((n = in.read(b)) > 0) { out.write(b, 0, n); got += n; int p = len > 0 ? (int) (got * 100 / len) : 0; if (p != last && p % 5 == 0) { last = p; dl = "progress:" + p; ev.on("vosk", dl); } }
                }
                File d = dir(c), part = new File(c.getFilesDir(), "vosk-es.part"); del(part); part.mkdirs();
                try (ZipInputStream z = new ZipInputStream(new BufferedInputStream(new java.io.FileInputStream(tmp)))) {
                    ZipEntry e; byte[] b = new byte[65536];
                    while ((e = z.getNextEntry()) != null) {
                        String name = e.getName(); int i = name.indexOf('/'); if (i < 0) continue; name = name.substring(i + 1); if (name.isEmpty()) continue; // drop the top folder
                        File f = new File(part, name); if (!f.getCanonicalPath().startsWith(part.getCanonicalPath())) continue;
                        if (e.isDirectory()) { f.mkdirs(); continue; }
                        f.getParentFile().mkdirs(); try (OutputStream out = new FileOutputStream(f)) { int n; while ((n = z.read(b)) > 0) out.write(b, 0, n); }
                    }
                }
                del(d); if (!part.renameTo(d)) throw new Exception("couldn't save the model");
                new File(d, "ok").createNewFile(); tmp.delete(); dl = "ready"; ev.on("vosk", "ready");
            } catch (Exception ex) { tmp.delete(); dl = "error:" + ex.getMessage(); ev.on("vosk", dl); }
        }).start();
    }
    static void del(File f) { if (f.isDirectory()) { File[] l = f.listFiles(); if (l != null) for (File x : l) del(x); } f.delete(); }

    /** start listening; the model is loaded once (a second or two) and kept */
    void start() {
        if (on) return; on = true;
        if (model != null) { listen(); return; }
        if (loading) return; loading = true;
        new Thread(() -> {
            try { Model m = new Model(dir(c).getAbsolutePath()); model = m; }
            catch (Throwable t) { ev.on("state", "error"); ev.on("vosk", "error:load " + t.getMessage()); }
            loading = false;
            if (model != null && on) new android.os.Handler(android.os.Looper.getMainLooper()).post(this::listen);
        }).start();
    }

    void listen() {
        if (!on || model == null || svc != null) return;
        try {
            rec = new Recognizer(model, 16000.0f, grammar()); rec.setWords(true);
            svc = new SpeechService(rec, 16000.0f);
            svc.startListening(new RecognitionListener() {
                @Override public void onPartialResult(String h) { }
                @Override public void onResult(String h) { check(h); }
                @Override public void onFinalResult(String h) { check(h); }
                @Override public void onError(Exception e) { ev.on("vosk", "error:" + e.getMessage()); halt(); ev.on("state", "error"); }
                @Override public void onTimeout() { }
            });
            ev.on("state", "engine:vosk"); ev.on("state", "listening");
        } catch (Throwable t) { ev.on("vosk", "error:" + t.getMessage()); halt(); ev.on("state", "error"); }
    }

    /** a lead word right before "profe" (within 0.6 s) is the wake phrase */
    void check(String json) {
        if (!on) return;
        try {
            JSONObject o = new JSONObject(json); JSONArray r = o.optJSONArray("result"); String text = o.optString("text", "");
            if (r == null || !text.contains("profe")) return;
            JSONObject prev = null;
            for (int i = 0; i < r.length(); i++) {
                JSONObject w = r.getJSONObject(i); String wd = w.optString("word");
                if ("[unk]".equals(wd)) { prev = null; continue; }
                if ("profe".equals(wd) && prev != null && isLead(prev.optString("word")) && w.optDouble("start") - prev.optDouble("end") < 0.6) {
                    double conf = Math.min(w.optDouble("conf", 1), prev.optDouble("conf", 1));
                    long now = System.currentTimeMillis(); if (now - lastWake < 2000) return; lastWake = now;
                    ev.on("final", prev.optString("word") + " profe"); ev.on("vosk", "wake conf " + String.format(java.util.Locale.US, "%.2f", conf));
                    return;
                }
                prev = w;
            }
        } catch (Exception ignored) { }
    }
    static boolean isLead(String w) { for (String l : LEADS) if (l.equals(w)) return true; return false; }

    void halt() {
        on = false;
        if (svc != null) { try { svc.stop(); svc.shutdown(); } catch (Exception ignored) { } svc = null; }
        if (rec != null) { try { rec.close(); } catch (Exception ignored) { } rec = null; }
    }
}
