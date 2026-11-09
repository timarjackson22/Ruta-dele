package app.rutadele;

import android.os.Handler;
import android.os.Looper;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import com.google.mlkit.common.model.DownloadConditions;
import com.google.mlkit.nl.translate.TranslateLanguage;
import com.google.mlkit.nl.translate.Translation;
import com.google.mlkit.nl.translate.Translator;
import com.google.mlkit.nl.translate.TranslatorOptions;

import org.json.JSONObject;

/**
 * Offline Spanish → English translation (Google ML Kit, about 30 MB downloaded once).
 * JavaScript: AndroidTR.translate(id, text). Results arrive at window.__atr.ev(id, text, error).
 */
public class TranslateBridge {
    final WebView web;
    final Handler main = new Handler(Looper.getMainLooper());
    final Translator tr;
    volatile boolean ready = false;

    TranslateBridge(WebView web) {
        this.web = web;
        tr = Translation.getClient(new TranslatorOptions.Builder()
                .setSourceLanguage(TranslateLanguage.SPANISH)
                .setTargetLanguage(TranslateLanguage.ENGLISH)
                .build());
    }

    void reply(String id, String text, String err) {
        final String code = "window.__atr && __atr.ev(" + JSONObject.quote(id) + "," + JSONObject.quote(text == null ? "" : text) + "," + JSONObject.quote(err == null ? "" : err) + ")";
        main.post(() -> web.evaluateJavascript(code, null));
    }

    @JavascriptInterface
    public boolean available() { return true; }

    @JavascriptInterface
    public void translate(final String id, final String text) {
        main.post(() -> {
            Runnable go = () -> tr.translate(text)
                    .addOnSuccessListener(t -> reply(id, t, null))
                    .addOnFailureListener(e -> reply(id, null, String.valueOf(e.getMessage())));
            if (ready) { go.run(); return; }
            tr.downloadModelIfNeeded(new DownloadConditions.Builder().build())
                    .addOnSuccessListener(v -> { ready = true; go.run(); })
                    .addOnFailureListener(e -> reply(id, null, "The offline translator needs the internet once to download (about 30 MB). " + e.getMessage()));
        });
    }

    void destroy() { try { tr.close(); } catch (Exception ignored) { } }
}
