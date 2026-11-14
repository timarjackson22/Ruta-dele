package app.rutadele;

import android.content.Intent;
import android.media.AudioFormat;
import android.media.AudioRecord;
import android.media.MediaRecorder;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.ParcelFileDescriptor;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.FileOutputStream;
import java.util.ArrayList;

/**
 * Exam speaking: record, then hand over the words (tools/EXAM_SPEAKING_V2_BRIEF.md).
 * While the learner speaks, the microphone audio is recorded and streamed to Android's ON-DEVICE recogniser, but nothing is shown:
 * the words are delivered once, when the learner stops (Stop, Next, time up). Nothing on screen changes while they speak.
 * The audio is kept in memory only until the words are delivered (a second pass re-reads it if the first pass failed), then discarded.
 * JavaScript: AndroidRec.status() ("ok" | "no-ondevice" | "no-mic"), AndroidRec.start(lang), AndroidRec.stop(), AndroidRec.cancel().
 * Events: window.__arec.ev(type, value): level (0..1, ~6 per second), state (recording | transcribing | error:<why>), done (the words).
 */
public class ExamRecBridge {
    static final int RATE = 16000;
    final MainActivity a;
    final WebView web;
    final Handler main = new Handler(Looper.getMainLooper());
    AudioRecord rec;
    SpeechRecognizer sr;
    ParcelFileDescriptor[] pipe;
    Thread pump;
    volatile boolean running = false;
    ByteArrayOutputStream pcm;
    final StringBuilder words = new StringBuilder();
    String lang = "es-US";
    boolean stopping = false, failed = false, delivered = false, secondPass = false;
    int gen = 0;

    ExamRecBridge(MainActivity a, WebView web) { this.a = a; this.web = web; }

    void ev(String type, String v) {
        final String t = v == null ? "null" : JSONObject.quote(v);
        main.post(() -> web.evaluateJavascript("window.__arec && __arec.ev('" + type + "'," + t + ")", null));
    }

    static boolean onDevice(MainActivity a) { return Build.VERSION.SDK_INT >= 33 && SpeechRecognizer.isOnDeviceRecognitionAvailable(a); }

    @JavascriptInterface
    public String status() { return !onDevice(a) ? "no-ondevice" : !a.hasMic() ? "no-mic" : "ok"; }

    @JavascriptInterface
    public void start(final String language) {
        main.post(() -> {
            if (running) return;
            lang = language == null || language.isEmpty() ? "es-US" : language;
            if (!onDevice(a)) { ev("state", "error:no-ondevice"); return; }
            if (!a.hasMic()) { ev("state", "error:no-mic"); return; }
            gen++; words.setLength(0); pcm = new ByteArrayOutputStream(); stopping = false; failed = false; delivered = false; secondPass = false;
            try {
                int buf = Math.max(AudioRecord.getMinBufferSize(RATE, AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_16BIT) * 4, RATE * 2);
                rec = new AudioRecord(MediaRecorder.AudioSource.VOICE_RECOGNITION, RATE, AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_16BIT, buf);
                pipe = ParcelFileDescriptor.createPipe();
                rec.startRecording();
                running = true;
                final AudioRecord r = rec; final ByteArrayOutputStream keep = pcm;
                final FileOutputStream out = new ParcelFileDescriptor.AutoCloseOutputStream(pipe[1]);
                pump = new Thread(() -> {
                    byte[] b = new byte[3200]; long last = 0; // 100 ms
                    try {
                        while (running) {
                            int n = r.read(b, 0, b.length); if (n <= 0) continue;
                            synchronized (keep) { keep.write(b, 0, n); }
                            try { out.write(b, 0, n); } catch (Exception ignored) { /* recogniser gone: keep recording, the second pass reads the copy */ }
                            long now = System.currentTimeMillis();
                            if (now - last > 160) { last = now; double s = 0; for (int i = 0; i + 1 < n; i += 2) { int v = (short) ((b[i] & 0xff) | (b[i + 1] << 8)); s += (double) v * v; } double rms = Math.sqrt(s / Math.max(1, n / 2)) / 32768.0; ev("level", String.format(java.util.Locale.US, "%.3f", Math.min(1, rms * 6))); }
                        }
                    } catch (Exception ignored) { }
                    try { out.close(); } catch (Exception ignored) { }
                }, "exam-rec");
                pump.start();
                recognise(pipe[0], gen);
                ev("state", "recording");
            } catch (SecurityException e) { cleanup(); ev("state", "error:no-mic"); }
            catch (Exception e) { cleanup(); ev("state", "error:" + e.getMessage()); }
        });
    }

    void recognise(ParcelFileDescriptor src, final int g) {
        try { if (sr != null) sr.destroy(); } catch (Exception ignored) { }
        sr = SpeechRecognizer.createOnDeviceSpeechRecognizer(a);
        sr.setRecognitionListener(new RecognitionListener() {
            String best(Bundle b) { ArrayList<String> r = b == null ? null : b.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION); return r == null || r.isEmpty() ? "" : r.get(0); }
            void add(String s) { if (s.isEmpty()) return; if (words.length() > 0) words.append(' '); words.append(s); }
            @Override public void onReadyForSpeech(Bundle p) { }
            @Override public void onBeginningOfSpeech() { }
            @Override public void onRmsChanged(float v) { }
            @Override public void onBufferReceived(byte[] b) { }
            @Override public void onEndOfSpeech() { }
            @Override public void onEvent(int t, Bundle p) { }
            @Override public void onPartialResults(Bundle b) { }
            @Override public void onSegmentResults(Bundle b) { if (g == gen) add(best(b)); }
            @Override public void onEndOfSegmentedSession() { if (g == gen) finish(); }
            @Override public void onResults(Bundle b) { if (g != gen) return; add(best(b)); if (stopping) finish(); else failed = true; /* the session ended early: the second pass will read the whole recording */ }
            @Override public void onError(int err) {
                if (g != gen) return;
                if (err == SpeechRecognizer.ERROR_LANGUAGE_NOT_SUPPORTED || err == SpeechRecognizer.ERROR_LANGUAGE_UNAVAILABLE) { cleanup(); ev("state", "error:no-lang"); return; }
                if (err == SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS) { cleanup(); ev("state", "error:no-mic"); return; }
                failed = true; if (stopping) finish();
            }
        });
        Intent i = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH)
                .putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                .putExtra(RecognizerIntent.EXTRA_LANGUAGE, lang)
                .putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, false)
                .putExtra(RecognizerIntent.EXTRA_PREFER_OFFLINE, true)
                .putExtra(RecognizerIntent.EXTRA_AUDIO_SOURCE, src)
                .putExtra(RecognizerIntent.EXTRA_AUDIO_SOURCE_ENCODING, AudioFormat.ENCODING_PCM_16BIT)
                .putExtra(RecognizerIntent.EXTRA_AUDIO_SOURCE_CHANNEL_COUNT, 1)
                .putExtra(RecognizerIntent.EXTRA_AUDIO_SOURCE_SAMPLING_RATE, RATE)
                .putExtra(RecognizerIntent.EXTRA_SEGMENTED_SESSION, RecognizerIntent.EXTRA_AUDIO_SOURCE);
        try { sr.startListening(i); } catch (Exception e) { failed = true; }
    }

    @JavascriptInterface
    public void stop() {
        main.post(() -> {
            if (!running) return;
            stopping = true; running = false; ev("state", "transcribing");
            try { rec.stop(); rec.release(); } catch (Exception ignored) { } rec = null;
            final int g = gen;
            // the recogniser finishes the last words once the stream closes; if it never reports back, deliver what we have
            main.postDelayed(() -> { if (g == gen && !delivered) finish(); }, 8000);
        });
    }

    void finish() {
        if (delivered) return;
        if ((failed || words.length() == 0) && !secondPass && pcm != null && pcm.size() > RATE) { secondPass = true; secondRead(); return; }
        delivered = true;
        final String out = words.toString().trim();
        cleanup();
        ev("done", out);
    }

    /** the live pass failed or heard nothing: read the whole recording again with a fresh recogniser */
    void secondRead() {
        try {
            final byte[] all; synchronized (pcm) { all = pcm.toByteArray(); }
            final ParcelFileDescriptor[] p2 = ParcelFileDescriptor.createPipe();
            words.setLength(0); failed = false; final int g = ++gen;
            new Thread(() -> { try (FileOutputStream o = new ParcelFileDescriptor.AutoCloseOutputStream(p2[1])) { for (int k = 0; k < all.length; k += 6400) o.write(all, k, Math.min(6400, all.length - k)); } catch (Exception ignored) { } }, "exam-reread").start();
            recognise(p2[0], g);
            main.postDelayed(() -> { if (g == gen && !delivered) { delivered = true; String out = words.toString().trim(); cleanup(); ev("done", out); } }, 8000 + all.length / 32);
        } catch (Exception e) { delivered = true; cleanup(); ev("done", words.toString().trim()); }
    }

    @JavascriptInterface
    public void cancel() { main.post(() -> { gen++; delivered = true; cleanup(); }); }

    void cleanup() {
        running = false;
        try { if (rec != null) { rec.stop(); rec.release(); } } catch (Exception ignored) { } rec = null;
        try { if (sr != null) { sr.cancel(); sr.destroy(); } } catch (Exception ignored) { } sr = null;
        try { if (pipe != null) pipe[0].close(); } catch (Exception ignored) { } pipe = null;
        pcm = null; // the recording is discarded: only the words are kept
    }

    void destroy() { cancel(); }
}
