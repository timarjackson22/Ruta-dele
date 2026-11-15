package app.rutadele;

import android.content.Intent;
import android.os.Build;
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

/**
 * "Ok Profe" wake listening for hands-free mode (tools/PROFE_HANDSFREE_BRIEF.md).
 * Uses Android's ON-DEVICE recogniser only: no audio leaves the phone while it waits for the wake phrase.
 * If the phone has no on-device recognition it reports "no-ondevice" and the app falls back to tap-to-talk.
 * The page decides what is a wake phrase (it receives the recognised text); it stops this listener before
 * Profe speaks (so Profe never wakes itself) and before the normal recogniser takes a command.
 * JavaScript: AndroidWake.status(), AndroidWake.start(lang), AndroidWake.stop().
 * Events: window.__awake.ev(type, text): state (listening | stopped | no-ondevice | no-mic | no-lang | error), partial, final.
 */
public class WakeBridge {
    final MainActivity a;
    final WebView web;
    final Handler main = new Handler(Looper.getMainLooper());
    SpeechRecognizer sr;
    boolean on = false;
    String lang = "es-US";
    int errs = 0, gen = 0;

    WakeBridge(MainActivity a, WebView web) { this.a = a; this.web = web; }

    void ev(String type, String text) {
        final String t = text == null ? "null" : JSONObject.quote(text);
        main.post(() -> web.evaluateJavascript("window.__awake && __awake.ev('" + type + "'," + t + ")", null));
    }

    static boolean onDevice(MainActivity a) { return Build.VERSION.SDK_INT >= 31 && SpeechRecognizer.isOnDeviceRecognitionAvailable(a); }

    boolean online = false, pendingMic = false;
    void onPermission(boolean ok) { if (!pendingMic) return; pendingMic = false; if (ok) { on = true; errs = 0; gen++; listen(); } else ev("state", "no-mic"); }
    /** ok: on-device listening; online: only an online recogniser (Google's or the phone's) is available, used if the learner allows it */
    @JavascriptInterface
    public String status() { return !a.hasMic() ? "no-mic" : onDevice(a) ? "ok" : (Recog.hasGoogle(a) || SpeechRecognizer.isRecognitionAvailable(a)) ? "online" : "no-ondevice"; }

    @JavascriptInterface
    public String info() { return Recog.info(a); }

    /** start, allowing an online recogniser when the phone has no on-device one (the learner agreed in Settings) */
    @JavascriptInterface
    public void startOnline(final String language) { begin(language, true); }

    @JavascriptInterface
    public void start(final String language) { begin(language, false); }

    void begin(final String language, final boolean allowOnline) {
        main.post(() -> {
            if (!on) online = allowOnline;
            lang = language == null || language.isEmpty() ? "es-US" : language;
            if (!onDevice(a) && !online) { ev("state", "no-ondevice"); return; }
            if (!a.hasMic()) { pendingMic = true; a.askMic(); return; } // ask; onPermission() carries on
            if (on) return;
            on = true; errs = 0; gen++;
            listen();
        });
    }

    @JavascriptInterface
    public void stop() { main.post(this::halt); }

    /** the app went to the background: always release the microphone */
    void pause() { if (on) { halt(); } }

    void halt() {
        boolean was = on; on = false; gen++;
        if (sr != null) { try { sr.cancel(); sr.destroy(); } catch (Exception ignored) { } sr = null; }
        if (was) ev("state", "stopped");
    }

    void retry(long ms) { final int g = gen; main.postDelayed(() -> { if (on && g == gen) listen(); }, ms); }

    void listen() {
        if (!on) return;
        if (sr == null) {
            Object[] rc = Recog.create(a, online);
            if (rc == null) { halt(); ev("state", "no-ondevice"); return; }
            sr = (SpeechRecognizer) rc[0]; ev("state", "engine:" + rc[1]);
            sr.setRecognitionListener(new RecognitionListener() {
                String best(Bundle b) { ArrayList<String> r = b == null ? null : b.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION); return r == null || r.isEmpty() ? "" : r.get(0); }
                @Override public void onReadyForSpeech(Bundle b) { errs = 0; }
                @Override public void onBeginningOfSpeech() { }
                @Override public void onRmsChanged(float v) { }
                @Override public void onBufferReceived(byte[] b) { }
                @Override public void onEndOfSpeech() { }
                @Override public void onEvent(int t, Bundle b) { }
                @Override public void onPartialResults(Bundle b) { if (!on) return; String t = best(b); if (!t.isEmpty()) ev("partial", t); }
                @Override public void onResults(Bundle b) { if (!on) return; String t = best(b); if (!t.isEmpty()) ev("final", t); retry(120); }
                @Override public void onError(int e) {
                    if (!on) return;
                    if (e == SpeechRecognizer.ERROR_NO_MATCH || e == SpeechRecognizer.ERROR_SPEECH_TIMEOUT) { retry(150); return; }
                    if (e == SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS) { halt(); ev("state", "no-mic"); return; }
                    if (e == 12 || e == 13) { halt(); ev("state", "no-lang"); return; } // language not supported / not downloaded
                    // busy, client or audio errors: start again with a fresh recogniser, backing off; give up after 6 in a row
                    if (++errs > 6) { halt(); ev("state", "error"); return; }
                    if (sr != null) { try { sr.destroy(); } catch (Exception ignored) { } sr = null; }
                    retry(Math.min(4000, 400L * errs));
                }
            });
        }
        Intent i = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        i.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        i.putExtra(RecognizerIntent.EXTRA_LANGUAGE, lang);
        i.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);
        i.putExtra(RecognizerIntent.EXTRA_PREFER_OFFLINE, true);
        i.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1);
        // keep each session long so the recogniser restarts (and possibly chimes) as rarely as possible
        i.putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_MINIMUM_LENGTH_MILLIS, 15000);
        i.putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS, 2500);
        i.putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS, 2500);
        try { sr.startListening(i); ev("state", "listening"); }
        catch (Exception ex) { if (++errs > 6) { halt(); ev("state", "error"); } else { if (sr != null) { try { sr.destroy(); } catch (Exception ignored) { } sr = null; } retry(600); } }
    }

    void destroy() { halt(); }
}
