package app.rutadele;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import org.json.JSONObject;

import java.util.ArrayList;

/** Native speech recognition for the web app (Android WebView has no SpeechRecognition). */
public class SttBridge {
    final MainActivity act;
    final WebView web;
    final Handler main = new Handler(Looper.getMainLooper());
    SpeechRecognizer rec;
    String lang = "es-US";
    boolean interim = true, continuous = false, active = false, pending = false, ended = true;
    // the last words shown while speaking; some phones end a segment with "no match" instead of a result, so they are kept
    String lastPartial = "";

    SttBridge(MainActivity act, WebView web) { this.act = act; this.web = web; }

    void end() { if (ended) return; ended = true; js("end", null); }

    void js(String type, String arg) {
        String a = arg == null ? "null" : JSONObject.quote(arg);
        main.post(() -> web.evaluateJavascript("window.__astt && __astt.ev('" + type + "'," + a + ")", null));
    }

    @JavascriptInterface
    public boolean available() { return SpeechRecognizer.isRecognitionAvailable(act); }

    @JavascriptInterface
    public void start(final String lang, final boolean interim, final boolean continuous) {
        main.post(() -> {
            this.lang = lang == null || lang.isEmpty() ? "es-US" : lang;
            this.interim = interim;
            this.continuous = continuous;
            this.ended = false;
            if (!SpeechRecognizer.isRecognitionAvailable(act)) { js("error", "service-not-allowed"); end(); return; }
            if (!act.hasMic()) { pending = true; act.askMic(); return; }
            active = true;
            begin();
        });
    }

    void onPermission(boolean ok) {
        if (!pending) return;
        pending = false;
        if (ok) { active = true; begin(); }
        else { js("error", "not-allowed"); end(); }
    }

    void begin() {
        if (rec == null) {
            rec = SpeechRecognizer.createSpeechRecognizer(act);
            rec.setRecognitionListener(new RecognitionListener() {
                @Override public void onReadyForSpeech(Bundle b) { js("start", null); }
                @Override public void onBeginningOfSpeech() { }
                @Override public void onRmsChanged(float v) { }
                @Override public void onBufferReceived(byte[] b) { }
                @Override public void onEndOfSpeech() { }
                @Override public void onEvent(int t, Bundle b) { }
                @Override public void onPartialResults(Bundle b) {
                    ArrayList<String> r = b.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                    if (r != null && !r.isEmpty() && !r.get(0).isEmpty()) { lastPartial = r.get(0); if (interim) js("partial", r.get(0)); }
                }
                @Override public void onResults(Bundle b) {
                    ArrayList<String> r = b.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                    if (r != null && !r.isEmpty() && !r.get(0).isEmpty()) js("final", r.get(0));
                    else if (!lastPartial.isEmpty()) js("final", lastPartial);
                    lastPartial = "";
                    if (continuous && active) { main.postDelayed(() -> { if (active) listenOnce(); }, 150); }
                    else { active = false; end(); }
                }
                @Override public void onError(int e) {
                    if (ended) return;
                    if (!lastPartial.isEmpty() && (e == SpeechRecognizer.ERROR_NO_MATCH || e == SpeechRecognizer.ERROR_SPEECH_TIMEOUT)) { js("final", lastPartial); lastPartial = ""; if (!continuous || !active) { active = false; end(); return; } }
                    if (!active && (e == SpeechRecognizer.ERROR_NO_MATCH || e == SpeechRecognizer.ERROR_SPEECH_TIMEOUT || e == SpeechRecognizer.ERROR_CLIENT)) { end(); return; }
                    if (continuous && active && (e == SpeechRecognizer.ERROR_NO_MATCH || e == SpeechRecognizer.ERROR_SPEECH_TIMEOUT)) {
                        main.postDelayed(() -> { if (active) listenOnce(); }, 150);
                        return;
                    }
                    active = false;
                    js("error", code(e));
                    end();
                }
            });
        }
        listenOnce();
    }

    // words the recognizer should favour (the conversation and the page the learner is on)
    final ArrayList<String> bias = new ArrayList<>();

    @JavascriptInterface
    public void setBias(String json) {
        main.post(() -> {
            bias.clear();
            try { org.json.JSONArray a = new org.json.JSONArray(json); for (int k = 0; k < a.length() && k < 100; k++) bias.add(a.getString(k)); } catch (Exception ignored) { }
        });
    }

    void listenOnce() {
        lastPartial = "";
        Intent i = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        if (android.os.Build.VERSION.SDK_INT >= 33 && !bias.isEmpty()) i.putStringArrayListExtra(RecognizerIntent.EXTRA_BIASING_STRINGS, new ArrayList<>(bias));
        i.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        i.putExtra(RecognizerIntent.EXTRA_LANGUAGE, lang);
        i.putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, lang);
        i.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, interim);
        i.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1);
        i.putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS, continuous ? 3500 : 2000);
        try { rec.startListening(i); } catch (Exception e) { active = false; js("error", "aborted"); end(); }
    }

    static String code(int e) {
        switch (e) {
            case SpeechRecognizer.ERROR_NO_MATCH:
            case SpeechRecognizer.ERROR_SPEECH_TIMEOUT: return "no-speech";
            case SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS: return "not-allowed";
            case SpeechRecognizer.ERROR_NETWORK:
            case SpeechRecognizer.ERROR_NETWORK_TIMEOUT:
            case SpeechRecognizer.ERROR_SERVER: return "network";
            case SpeechRecognizer.ERROR_AUDIO: return "audio-capture";
            case 12: case 13: return "language-not-supported";
            default: return "aborted";
        }
    }

    @JavascriptInterface
    public void stop() {
        main.post(() -> {
            if (rec == null) return;
            active = false;
            rec.stopListening();
            main.postDelayed(this::end, 2500);
        });
    }

    @JavascriptInterface
    public void cancel() {
        main.post(() -> {
            active = false;
            if (rec != null) rec.cancel();
            end();
        });
    }

    void destroy() { if (rec != null) { rec.destroy(); rec = null; } }
}
