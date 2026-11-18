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
    // each start() is a new session: late events from the previous one (a delayed end, an error from cancelling it) are ignored
    int sid = 0; boolean stale = false, ready = false, retried = false;
    // the last words shown while speaking; some phones end a segment with "no match" instead of a result, so they are kept
    String lastPartial = "";

    SttBridge(MainActivity act, WebView web) { this.act = act; this.web = web; main.postDelayed(() -> { try { if (act.hasMic()) ensure(); } catch (Exception ignored) { } }, 1500); }

    void end() { if (ended) return; ended = true; js("end", null); }

    void js(String type, String arg) {
        String a = arg == null ? "null" : JSONObject.quote(arg);
        final int s = sid; // the session this event belongs to: the page ignores events from an older session
        main.post(() -> web.evaluateJavascript("window.__astt && __astt.ev('" + type + "'," + a + "," + s + ")", null));
    }

    /** this version understands "en-US|es-US" (several languages, auto-switching on Android 14+) */
    @JavascriptInterface
    public boolean multiLang() { return true; }

    @JavascriptInterface
    public boolean available() { return SpeechRecognizer.isRecognitionAvailable(act); }

    @JavascriptInterface
    public void start(final String lang, final boolean interim, final boolean continuous) {
        main.post(() -> {
            this.lang = lang == null || lang.isEmpty() ? "es-US" : lang;
            this.interim = interim;
            this.continuous = continuous;
            wasOpen = !this.ended; // a session still open: cancel it and give the service a moment before the next one
            sid++; ready = false; retried = false; tries = 0;
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

    int tries = 0;
    /*
     * v222 (S24 log, 17 Nov 2026: "retry 1 after error 11" on nearly every tap, then the start of the sentence lost).
     * Root cause: a new SpeechRecognizer was created (and the old one destroyed) for every session. Google's recognition
     * service drops a client that binds right after the previous one unbinds (ERROR_SERVER_DISCONNECTED = 11), so the
     * first try failed and the retry opened the mic ~0.5-1 s late, while the page already said "Listening".
     * Now: ONE recogniser, created and bound when the app starts and reused for every session. Each session gets its own
     * listener (late events from an older session are ignored by its session id). The recogniser is rebuilt only when the
     * service really dropped it (error 11 / client error), after a pause so the old connection is gone.
     * Continuous listening uses a segmented session on Android 13+: one session across pauses, no restart, no beep, no gap.
     */
    void ensure() {
        if (rec != null) return;
        rec = SpeechRecognizer.createSpeechRecognizer(act);
        warm();
    }
    /** bind the recognition service now, so the first tap does not pay for it */
    void warm() {
        if (android.os.Build.VERSION.SDK_INT < 33 || rec == null) return;
        try {
            Intent i = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH); i.putExtra(RecognizerIntent.EXTRA_LANGUAGE, lang.split("\\|")[0]);
            rec.checkRecognitionSupport(i, act.getMainExecutor(), new android.speech.RecognitionSupportCallback() {
                @Override public void onSupportResult(android.speech.RecognitionSupport r) { }
                @Override public void onError(int e) { }
            });
        } catch (Throwable ignored) { }
    }
    void rebuild() { if (rec != null) { try { rec.cancel(); rec.destroy(); } catch (Exception ignored) { } rec = null; } }
    boolean segmented = false, gotSegment = false, wasOpen = false;

    void begin() {
        final int my = sid;
        ensure();
        final boolean settle = wasOpen; wasOpen = false;
        if (settle) { try { rec.cancel(); } catch (Exception ignored) { } } // end what the previous session left open; same connection
        rec.setRecognitionListener(new RecognitionListener() {
            boolean mine() { return my == sid; }
            @Override public void onReadyForSpeech(Bundle b) { if (!mine()) return; boolean first = !ready; ready = true; tries = 0; if (first) js("start", null); }
            @Override public void onBeginningOfSpeech() { }
            @Override public void onRmsChanged(float v) { }
            @Override public void onBufferReceived(byte[] b) { }
            @Override public void onEndOfSpeech() { }
            @Override public void onEvent(int t, Bundle b) { }
            @Override public void onPartialResults(Bundle b) {
                if (!mine()) return;
                ArrayList<String> r = b.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                if (r != null && !r.isEmpty() && !r.get(0).isEmpty()) { lastPartial = r.get(0); if (interim) js("partial", r.get(0)); }
            }
            // segmented session (Android 13+): each pause gives a segment; the session (and the mic) stays open
            @Override public void onSegmentResults(Bundle b) {
                if (!mine()) return; gotSegment = true;
                ArrayList<String> r = b.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                if (r != null && !r.isEmpty() && !r.get(0).isEmpty()) js("final", r.get(0));
                else if (!lastPartial.isEmpty()) js("final", lastPartial);
                lastPartial = "";
            }
            @Override public void onEndOfSegmentedSession() {
                if (!mine()) return;
                if (!lastPartial.isEmpty()) { js("final", lastPartial); lastPartial = ""; }
                if (continuous && active) { main.postDelayed(() -> { if (active && my == sid) listenOnce(); }, 60); }
                else { active = false; end(); }
            }
            @Override public void onResults(Bundle b) {
                if (!mine()) return;
                ArrayList<String> r = b.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                if (r != null && !r.isEmpty() && !r.get(0).isEmpty()) js("final", r.get(0));
                else if (!lastPartial.isEmpty()) js("final", lastPartial);
                lastPartial = "";
                if (continuous && active) { main.postDelayed(() -> { if (active && my == sid) listenOnce(); }, 60); }
                else { active = false; end(); }
            }
            @Override public void onError(int e) {
                if (!mine() || ended) return;
                // the service dropped this client: rebuild the recogniser once the old connection has gone, then try again (silently)
                // a "client" error right at the start is usually the echo of cancelling the previous session: just start again
                if (e == SpeechRecognizer.ERROR_CLIENT && !ready && active && tries == 0) { tries++; main.postDelayed(() -> { if (sid == my && active) listenOnce(); }, 200); return; }
                if ((e == 11 || e == SpeechRecognizer.ERROR_CLIENT) && active && tries < 3) {
                    tries++; js("note", "rebuild " + tries + " after error " + e + (ready ? " (mid-session)" : ""));
                    rebuild(); main.postDelayed(() -> { if (sid == my && active) { ensure(); begin(); } }, 350L * tries);
                    return;
                }
                // the microphone is still held (wake listener, Profe's voice ending): same recogniser, short wait
                if ((e == SpeechRecognizer.ERROR_RECOGNIZER_BUSY || e == SpeechRecognizer.ERROR_AUDIO) && !ready && active && tries < 4) {
                    tries++; js("note", "retry " + tries + " after error " + e);
                    main.postDelayed(() -> { if (sid == my && active) listenOnce(); }, 200L * tries);
                    return;
                }
                // the segmented session isn't supported by this recogniser: plain sessions from now on
                if (segmented && !gotSegment && !ready && active && (e == SpeechRecognizer.ERROR_LANGUAGE_UNAVAILABLE || e == 14 || e == 15)) { noSeg = true; main.post(() -> { if (sid == my && active) listenOnce(); }); return; }
                if (!lastPartial.isEmpty() && (e == SpeechRecognizer.ERROR_NO_MATCH || e == SpeechRecognizer.ERROR_SPEECH_TIMEOUT)) { js("final", lastPartial); lastPartial = ""; if (!continuous || !active) { active = false; end(); return; } }
                if (!active && (e == SpeechRecognizer.ERROR_NO_MATCH || e == SpeechRecognizer.ERROR_SPEECH_TIMEOUT || e == SpeechRecognizer.ERROR_CLIENT)) { end(); return; }
                if (continuous && active && ready && (e == SpeechRecognizer.ERROR_NO_MATCH || e == SpeechRecognizer.ERROR_SPEECH_TIMEOUT)) {
                    main.postDelayed(() -> { if (active && my == sid) listenOnce(); }, 60);
                    return;
                }
                active = false;
                js("error", code(e) + (ready ? "" : " (before the mic opened, code " + e + ")"));
                end();
            }
        });
        if (settle) main.postDelayed(() -> { if (my == sid && active) listenOnce(); }, 150); else listenOnce();
    }
    boolean noSeg = false;

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
        // "en-US|es-US": listen for the first language and, on Android 14+, also detect and switch to the others
        // (hands-free commands are often English while practice is Spanish; the Spanish recogniser turned «level A1» into «Levy One»)
        String[] langs = lang.split("\\|"); String primary = langs[0];
        i.putExtra(RecognizerIntent.EXTRA_LANGUAGE, primary);
        i.putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, primary);
        if (langs.length > 1 && android.os.Build.VERSION.SDK_INT >= 34) {
            ArrayList<String> all = new ArrayList<>(java.util.Arrays.asList(langs));
            i.putExtra(RecognizerIntent.EXTRA_ENABLE_LANGUAGE_DETECTION, true);
            i.putStringArrayListExtra(RecognizerIntent.EXTRA_LANGUAGE_DETECTION_ALLOWED_LANGUAGES, all);
            i.putExtra(RecognizerIntent.EXTRA_ENABLE_LANGUAGE_SWITCH, RecognizerIntent.LANGUAGE_SWITCH_BALANCED);
            i.putStringArrayListExtra(RecognizerIntent.EXTRA_LANGUAGE_SWITCH_ALLOWED_LANGUAGES, all);
        }
        i.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, interim);
        i.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1);
        i.putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS, continuous ? 3500 : 2000);
        segmented = false; gotSegment = false;
        if (continuous && !noSeg && android.os.Build.VERSION.SDK_INT >= 33) {
            // one session through the learner's pauses (the page decides when they have finished and stops it)
            segmented = true;
            i.putExtra(RecognizerIntent.EXTRA_SEGMENTED_SESSION, RecognizerIntent.EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS);
            i.putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS, 1200);
        }
        try { rec.startListening(i); }
        catch (Exception e) { rebuild(); final int my = sid; main.postDelayed(() -> { if (sid == my && active) { ensure(); begin(); } }, 350); }
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
            final int my = sid;
            // the recogniser never sent a result after Stop: the words shown so far become the final result instead of being lost
            main.postDelayed(() -> { if (sid == my && !ended) { if (!lastPartial.isEmpty()) { js("final", lastPartial); lastPartial = ""; } end(); } }, 2500);
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
