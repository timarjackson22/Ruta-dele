package app.rutadele;

import android.Manifest;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.media.AudioAttributes;
import android.media.AudioFormat;
import android.media.AudioPlaybackCaptureConfiguration;
import android.media.AudioRecord;
import android.media.projection.MediaProjectionManager;
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

import java.io.FileOutputStream;
import java.util.ArrayList;

/**
 * Practice › Videos, "Captions from the audio" (Android 13+). Records the app's own playback sound (the YouTube video
 * playing in the page; Android asks permission each session) and feeds it to the phone's speech recogniser, on-device
 * when available, free. Nothing leaves the phone except what the recogniser itself does.
 * JavaScript: AndroidAud.available(), AndroidAud.start(lang), AndroidAud.stop().
 * Events: window.__aaud.ev(type, text): type = state (asking | listening | stopped | error), partial, final.
 */
public class AudioCapBridge {
    static final int REQ_PROJ = 21, REQ_MIC2 = 22;
    static final int RATE = 16000;
    final Activity a;
    final WebView web;
    final Handler main = new Handler(Looper.getMainLooper());
    volatile boolean running = false;
    String lang = "es-ES";
    AudioRecord rec;
    ParcelFileDescriptor[] pipe;
    Thread pump;
    SpeechRecognizer sr;

    AudioCapBridge(Activity a, WebView web) { this.a = a; this.web = web; }

    void ev(String type, String text) {
        final String code = "window.__aaud && __aaud.ev(" + JSONObject.quote(type) + "," + JSONObject.quote(text == null ? "" : text) + ")";
        main.post(() -> web.evaluateJavascript(code, null));
    }

    @JavascriptInterface
    public boolean available() { return Build.VERSION.SDK_INT >= 33 && SpeechRecognizer.isRecognitionAvailable(a); }

    @JavascriptInterface
    public void start(String language) {
        main.post(() -> {
            if (!available()) { ev("state", "error:This needs Android 13 or newer with speech recognition."); return; }
            if (running) { ev("state", "listening"); return; }
            if (language != null && language.matches("es(-[A-Z]{2})?")) lang = language;
            if (a.checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) { a.requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, REQ_MIC2); return; }
            askProjection();
        });
    }

    void askProjection() {
        ev("state", "asking");
        MediaProjectionManager mpm = (MediaProjectionManager) a.getSystemService(Context.MEDIA_PROJECTION_SERVICE);
        a.startActivityForResult(mpm.createScreenCaptureIntent(), REQ_PROJ);
    }

    void onMic(boolean ok) { if (ok) askProjection(); else ev("state", "error:Ruta DELE needs the microphone permission to record the video's sound."); }

    void onProjection(int result, Intent data) {
        if (result != Activity.RESULT_OK || data == null) { ev("state", "error:Not allowed. Tap Captions from the audio again and choose Start."); return; }
        CaptureService.start(a, result, data, () -> main.post(this::begin));
    }

    @JavascriptInterface
    public void stop() { main.post(this::end); }

    void begin() {
        if (CaptureService.projection == null) { ev("state", "error:Android didn't start the recording."); CaptureService.stop(a); return; }
        try {
            AudioPlaybackCaptureConfiguration cfg = new AudioPlaybackCaptureConfiguration.Builder(CaptureService.projection)
                    .addMatchingUsage(AudioAttributes.USAGE_MEDIA).addMatchingUsage(AudioAttributes.USAGE_UNKNOWN).addMatchingUsage(AudioAttributes.USAGE_GAME).build();
            AudioFormat fmt = new AudioFormat.Builder().setEncoding(AudioFormat.ENCODING_PCM_16BIT).setSampleRate(RATE).setChannelMask(AudioFormat.CHANNEL_IN_MONO).build();
            int buf = Math.max(AudioRecord.getMinBufferSize(RATE, AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_16BIT) * 4, RATE * 2);
            rec = new AudioRecord.Builder().setAudioFormat(fmt).setBufferSizeInBytes(buf).setAudioPlaybackCaptureConfig(cfg).build();
            pipe = ParcelFileDescriptor.createPipe();
            rec.startRecording();
            running = true;
            final AudioRecord r = rec;
            final FileOutputStream out = new ParcelFileDescriptor.AutoCloseOutputStream(pipe[1]);
            pump = new Thread(() -> {
                byte[] b = new byte[3200]; // 100 ms
                try { while (running) { int n = r.read(b, 0, b.length); if (n > 0) out.write(b, 0, n); } } catch (Exception ignored) { }
                try { out.close(); } catch (Exception ignored) { }
            }, "video-audio");
            pump.start();
            listen();
            ev("state", "listening");
        } catch (SecurityException e) {
            ev("state", "error:Ruta DELE needs the microphone permission to record the video's sound."); end();
        } catch (Exception e) {
            ev("state", "error:" + e.getMessage()); end();
        }
    }

    void listen() {
        if (!running) return;
        try { if (sr != null) sr.destroy(); } catch (Exception ignored) { }
        sr = Build.VERSION.SDK_INT >= 31 && SpeechRecognizer.isOnDeviceRecognitionAvailable(a) ? SpeechRecognizer.createOnDeviceSpeechRecognizer(a) : SpeechRecognizer.createSpeechRecognizer(a);
        sr.setRecognitionListener(new RecognitionListener() {
            String best(Bundle b) { ArrayList<String> r = b == null ? null : b.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION); return r == null || r.isEmpty() ? "" : r.get(0); }
            @Override public void onReadyForSpeech(Bundle p) { }
            @Override public void onBeginningOfSpeech() { }
            @Override public void onRmsChanged(float v) { }
            @Override public void onBufferReceived(byte[] b) { }
            @Override public void onEndOfSpeech() { }
            @Override public void onEvent(int t, Bundle p) { }
            @Override public void onPartialResults(Bundle b) { String s = best(b); if (!s.isEmpty()) ev("partial", s); }
            @Override public void onSegmentResults(Bundle b) { String s = best(b); if (!s.isEmpty()) ev("final", s); }
            @Override public void onEndOfSegmentedSession() { main.postDelayed(AudioCapBridge.this::listen, 200); }
            @Override public void onResults(Bundle b) { String s = best(b); if (!s.isEmpty()) ev("final", s); main.postDelayed(AudioCapBridge.this::listen, 100); }
            @Override public void onError(int err) {
                if (!running) return;
                if (err == SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS) { ev("state", "error:Speech recognition isn't allowed."); end(); return; }
                if (err == SpeechRecognizer.ERROR_LANGUAGE_NOT_SUPPORTED || err == SpeechRecognizer.ERROR_LANGUAGE_UNAVAILABLE) { ev("state", "error:Spanish speech recognition isn't installed on this phone (Settings › Google › Voice › Offline speech recognition)."); end(); return; }
                main.postDelayed(AudioCapBridge.this::listen, err == SpeechRecognizer.ERROR_RECOGNIZER_BUSY ? 800 : 250);
            }
        });
        Intent i = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH)
                .putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                .putExtra(RecognizerIntent.EXTRA_LANGUAGE, lang)
                .putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
                .putExtra(RecognizerIntent.EXTRA_PREFER_OFFLINE, true)
                .putExtra(RecognizerIntent.EXTRA_AUDIO_SOURCE, pipe[0])
                .putExtra(RecognizerIntent.EXTRA_AUDIO_SOURCE_ENCODING, AudioFormat.ENCODING_PCM_16BIT)
                .putExtra(RecognizerIntent.EXTRA_AUDIO_SOURCE_CHANNEL_COUNT, 1)
                .putExtra(RecognizerIntent.EXTRA_AUDIO_SOURCE_SAMPLING_RATE, RATE)
                .putExtra(RecognizerIntent.EXTRA_SEGMENTED_SESSION, RecognizerIntent.EXTRA_AUDIO_SOURCE);
        try { sr.startListening(i); } catch (Exception e) { ev("state", "error:" + e.getMessage()); end(); }
    }

    void end() {
        boolean was = running;
        running = false;
        try { if (sr != null) { sr.cancel(); sr.destroy(); } } catch (Exception ignored) { }
        sr = null;
        try { if (rec != null) { rec.stop(); rec.release(); } } catch (Exception ignored) { }
        rec = null;
        try { if (pipe != null) pipe[0].close(); } catch (Exception ignored) { }
        pipe = null;
        CaptureService.stop(a);
        if (was) ev("state", "stopped");
    }
}
