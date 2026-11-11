package app.rutadele;

import android.content.Intent;
import android.media.AudioAttributes;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.speech.tts.Voice;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.HashSet;
import java.util.Locale;
import java.util.Set;

/** Native text-to-speech for the web app: a speechSynthesis replacement plus a background "listen" queue. */
public class TtsBridge implements TextToSpeech.OnInitListener {
    static TtsBridge instance;
    final MainActivity act;
    final WebView web;
    final Handler main = new Handler(Looper.getMainLooper());
    TextToSpeech tts;
    volatile boolean ready = false;

    // listen queue
    int gen = 0;
    JSONArray qItems;
    int qNext = 0, qReps = 3, qGapMs = 1500;
    float qRate = 0.85f;
    boolean qEn = true;
    String esLang = "es-US", enLang = "en-US", esVoice = "", enVoice = "";
    static final int CHUNK = 25;

    TtsBridge(MainActivity act, WebView web) {
        this.act = act;
        this.web = web;
        instance = this;
        tts = new TextToSpeech(act.getApplicationContext(), this);
    }

    @Override
    public void onInit(int status) {
        if (status != TextToSpeech.SUCCESS) return;
        tts.setAudioAttributes(new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_MEDIA).setContentType(AudioAttributes.CONTENT_TYPE_SPEECH).build());
        tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
            @Override public void onStart(String id) { event(id, "start"); }
            @Override public void onDone(String id) { event(id, "end"); }
            @Override public void onError(String id) { event(id, "error"); }
            @Override public void onError(String id, int code) { event(id, "error"); }
        });
        ready = true;
        js("window.__atts && __atts.voices()");
    }

    void js(final String code) { main.post(() -> web.evaluateJavascript(code, null)); }

    void event(String id, String type) {
        if (id == null) return;
        if (id.startsWith("u:")) { js("window.__atts && __atts.ev('" + type + "','" + id.substring(2).replaceAll("[^0-9]", "") + "')"); return; }
        if (!id.startsWith("q:")) return;
        String[] p = id.split(":");
        if (p.length < 4) return;
        final int g = Integer.parseInt(p[1]), i = Integer.parseInt(p[2]);
        final String k = p[3];
        main.post(() -> {
            if (g != gen) return;
            if ("start".equals(type) && !"end".equals(k)) {
                web.evaluateJavascript("window.__gpNative && __gpNative('pos'," + i + "," + k + ")", null);
                if ("0".equals(k) || (!qEn && "1".equals(k))) ListenService.update(act, word(i));
            } else if (!"start".equals(type) && "end".equals(k)) {
                if (qItems == null) return;
                if (i >= qItems.length() - 1) { finishQueue("done"); return; }
                if (qNext < qItems.length() && i >= qNext - 3) enqueue();
            }
        });
    }

    String word(int i) {
        try { JSONObject o = qItems.getJSONObject(i); return o.optString("show", o.optString("es")) + " · " + o.optString("en"); } catch (Exception e) { return ""; }
    }

    void setVoice(String name, String lang) {
        if (name != null && !name.isEmpty()) {
            try { for (Voice v : tts.getVoices()) if (v.getName().equals(name)) { tts.setVoice(v); return; } } catch (Exception ignored) { }
        }
        tts.setLanguage(Locale.forLanguageTag(lang == null || lang.isEmpty() ? "es-US" : lang));
    }

    /** Opens Android's text-to-speech settings, where more (and more natural) voices can be downloaded. */
    @JavascriptInterface
    public void openSettings() {
        main.post(() -> {
            try {
                Intent i = new Intent(TextToSpeech.Engine.ACTION_INSTALL_TTS_DATA);
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                act.startActivity(i);
            } catch (Exception e) {
                try { Intent j = new Intent("com.android.settings.TTS_SETTINGS"); j.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK); act.startActivity(j); } catch (Exception ignored) { }
            }
        });
    }

    @JavascriptInterface
    public void refreshVoices() { js("window.__atts && __atts.voices()"); }

    // ---------- speechSynthesis replacement ----------
    @JavascriptInterface
    public String voices() {
        if (!ready) return "[]";
        JSONArray out = new JSONArray();
        try {
            Set<String> seen = new HashSet<>();
            for (Voice v : tts.getVoices()) {
                String lang = v.getLocale().toLanguageTag();
                if (!(lang.startsWith("es") || lang.startsWith("en"))) continue;
                if (v.getFeatures() != null && v.getFeatures().contains(TextToSpeech.Engine.KEY_FEATURE_NOT_INSTALLED)) continue;
                // every distinct voice (Google has several per accent, male and female); skip legacy low-quality ones
                if (seen.contains(v.getName())) continue;
                seen.add(v.getName());
                if (v.getQuality() < Voice.QUALITY_NORMAL) continue;
                JSONObject o = new JSONObject();
                o.put("name", v.getName());
                o.put("lang", lang);
                o.put("network", v.isNetworkConnectionRequired());
                o.put("quality", v.getQuality());
                out.put(o);
            }
        } catch (Exception ignored) { }
        return out.toString();
    }

    @JavascriptInterface
    public void speak(final String id, final String text, final String lang, final float rate, final float pitch, final String voice) {
        main.post(() -> {
            if (!ready) { web.evaluateJavascript("window.__atts && __atts.ev('error','" + id.replaceAll("[^0-9]", "") + "')", null); return; }
            stopQueueSilently();
            setVoice(voice, lang);
            tts.setSpeechRate(rate <= 0 ? 1f : rate);
            tts.setPitch(pitch <= 0 ? 1f : pitch);
            tts.speak(text, TextToSpeech.QUEUE_FLUSH, new Bundle(), "u:" + id);
        });
    }

    @JavascriptInterface
    public void stop() { main.post(() -> { if (ready && qItems == null) tts.stop(); }); }

    @JavascriptInterface
    public boolean speaking() { return ready && tts.isSpeaking(); }

    // ---------- listen queue (keeps playing with the screen off) ----------
    @JavascriptInterface
    public boolean hasQueue() { return true; }

    @JavascriptInterface
    public void queue(final String json) {
        main.post(() -> {
            try {
                JSONObject o = new JSONObject(json);
                gen++;
                qItems = o.getJSONArray("items");
                qNext = o.optInt("start", 0);
                qReps = Math.max(1, o.optInt("reps", 3));
                qGapMs = (int) Math.round(o.optDouble("gap", 1.5) * 1000);
                qRate = (float) o.optDouble("rate", 0.85);
                qEn = o.optBoolean("en", true);
                esLang = o.optString("esLang", "es-US");
                enLang = o.optString("enLang", "en-US");
                esVoice = o.optString("esVoice", "");
                enVoice = o.optString("enVoice", "");
                if (!ready) { finishQueue("stopped"); return; }
                tts.stop();
                act.askNotifications();
                ListenService.start(act, word(qNext));
                enqueue();
            } catch (Exception e) {
                finishQueue("stopped");
            }
        });
    }

    void enqueue() {
        if (qItems == null) return;
        int end = Math.min(qItems.length(), qNext + CHUNK);
        for (int i = qNext; i < end; i++) {
            JSONObject it = qItems.optJSONObject(i);
            if (it == null) continue;
            String pre = "q:" + gen + ":" + i + ":";
            if (qEn) {
                setVoice(enVoice, enLang);
                tts.setSpeechRate(0.95f);
                tts.speak(it.optString("en"), TextToSpeech.QUEUE_ADD, new Bundle(), pre + "0");
                tts.playSilentUtterance(700, TextToSpeech.QUEUE_ADD, pre + "s0");
            }
            setVoice(esVoice, esLang);
            tts.setSpeechRate(qRate);
            for (int r = 1; r <= qReps; r++) {
                tts.speak(it.optString("es"), TextToSpeech.QUEUE_ADD, new Bundle(), pre + r);
                if (r < qReps) tts.playSilentUtterance(qGapMs, TextToSpeech.QUEUE_ADD, pre + "s" + r);
            }
            tts.playSilentUtterance(qGapMs + 800, TextToSpeech.QUEUE_ADD, pre + "end");
        }
        qNext = end;
    }

    @JavascriptInterface
    public void stopQueue() { main.post(this::stopQueueSilently); }

    void stopQueueSilently() {
        if (qItems == null) return;
        gen++;
        qItems = null;
        if (ready) tts.stop();
        ListenService.stop(act);
    }

    void finishQueue(String why) {
        stopQueueSilently();
        web.evaluateJavascript("window.__gpNative && __gpNative('" + why + "')", null);
    }

    /** Called from the notification's Stop button. */
    static void stopFromNotification() {
        if (instance != null) instance.main.post(() -> instance.finishQueue("stopped"));
    }

    void shutdown() {
        stopQueueSilently();
        try { tts.shutdown(); } catch (Exception ignored) { }
    }
}
