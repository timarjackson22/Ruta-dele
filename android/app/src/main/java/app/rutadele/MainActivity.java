package app.rutadele;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.MediaStore;
import android.view.View;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.webkit.WebViewCompat;
import androidx.webkit.WebViewFeature;

import androidx.core.content.FileProvider;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Collections;

public class MainActivity extends Activity {
    static final String HOST = "timarjackson22.github.io";
    static final String URL = "https://" + HOST + "/Ruta-dele/";
    static final int REQ_MIC = 7, REQ_NOTIF = 8, REQ_FILE = 9, REQ_CAM = 10, REQ_SHOT = 11, REQ_SHOTP = 12;
    Uri shotUri = null; boolean camShotPending = false;
    PermissionRequest camReq = null;
    ValueCallback<Uri[]> fileCb;
    LlmBridge llm;
    TranslateBridge trb;
    AudioCapBridge aud;
    WakeBridge wake;
    ExamRecBridge erec;

    WebView web;
    TtsBridge tts;
    SttBridge stt;
    String bridgeJs = "";
    boolean docStart = false;

    @SuppressLint({"SetJavaScriptEnabled", "AddJavascriptInterface"})
    @Override
    protected void onCreate(Bundle saved) {
        super.onCreate(saved);
        web = new WebView(this);
        web.setBackgroundColor(Color.WHITE);
        web.setOverScrollMode(View.OVER_SCROLL_NEVER);
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        // Android's font-size setting would enlarge only the text (not spacing or icons) and break the layout's proportions.
        // Keep the web view at 100% and pass the setting to the app, which scales the whole layout evenly.
        float fs = getResources().getConfiguration().fontScale;
        s.setTextZoom(100);
        s.setUserAgentString(s.getUserAgentString() + " RutaDELEApp/1 RDFont/" + String.format(java.util.Locale.US, "%.2f", fs));
        web.setRendererPriorityPolicy(WebView.RENDERER_PRIORITY_IMPORTANT, false);

        tts = new TtsBridge(this, web);
        stt = new SttBridge(this, web);
        web.addJavascriptInterface(tts, "AndroidTTS");
        web.addJavascriptInterface(stt, "AndroidSTT");
        llm = new LlmBridge(this, web);
        trb = new TranslateBridge(web);
        web.addJavascriptInterface(llm, "AndroidLLM");
        web.addJavascriptInterface(trb, "AndroidTR");
        web.addJavascriptInterface(new AppBridge(this), "AndroidApp");
        web.addJavascriptInterface(new CaptionBridge(web), "AndroidCap"); // Practice › Videos caption window
        aud = new AudioCapBridge(this, web);
        web.addJavascriptInterface(aud, "AndroidAud"); // Practice › Videos: captions from the audio
        wake = new WakeBridge(this, web);
        web.addJavascriptInterface(wake, "AndroidWake"); // hands-free: "Ok Profe", on-device only
        erec = new ExamRecBridge(this, web);
        web.addJavascriptInterface(erec, "AndroidRec"); // exam speaking: record, words delivered when you stop
        ReminderReceiver.schedule(this); // keep the daily reminder set after updates

        bridgeJs = readAsset("bridge.js");
        if (WebViewFeature.isFeatureSupported(WebViewFeature.DOCUMENT_START_SCRIPT)) {
            WebViewCompat.addDocumentStartJavaScript(web, bridgeJs, Collections.singleton("https://" + HOST));
            docStart = true;
        }

        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
                Uri u = req.getUrl();
                if (HOST.equals(u.getHost())) return false;
                // the embedded YouTube player (Practice › Videos) loads inside its frame; anything else it opens goes to the YouTube app
                if (!req.isForMainFrame() && u.getHost() != null && u.getHost().contains("youtube") && u.getPath() != null && u.getPath().startsWith("/embed/")) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception ignored) { }
                return true;
            }

            @Override
            public boolean onRenderProcessGone(WebView view, android.webkit.RenderProcessGoneDetail detail) {
                // the page's renderer crashed or was killed: start again instead of showing a blank screen
                try { recreate(); } catch (Exception ignored) { }
                return true;
            }

            @Override
            public void onPageStarted(WebView view, String url, android.graphics.Bitmap favicon) {
                if (!docStart) view.evaluateJavascript(bridgeJs, null);
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(PermissionRequest request) {
                // v228: the learner's own camera in a Profe video call (off by default; asked only when they turn it on;
                // shown on their screen only, never sent anywhere)
                boolean wantsCam = false; for (String r : request.getResources()) if (PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(r)) wantsCam = true;
                if (wantsCam) {
                    if (checkSelfPermission(Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) { request.grant(request.getResources()); return; }
                    camReq = request; requestPermissions(new String[]{Manifest.permission.CAMERA}, REQ_CAM); return;
                }
                if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) request.grant(request.getResources());
                else request.deny();
            }

            // <input type="file"> (adding PDFs, Word files and texts to Mis lecturas)
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> cb, FileChooserParams params) {
                if (fileCb != null) fileCb.onReceiveValue(null);
                fileCb = cb;
                // v263: the page says what it wants: a camera photo (capture), photos from the gallery (image/*), or a document
                boolean images = false;
                for (String a : params.getAcceptTypes()) if (a != null && a.startsWith("image/")) images = true;
                boolean onlyImages = images;
                for (String a : params.getAcceptTypes()) if (a != null && !a.isEmpty() && !a.startsWith("image/")) onlyImages = false;
                boolean multi = params.getMode() == FileChooserParams.MODE_OPEN_MULTIPLE;
                if (onlyImages && params.isCaptureEnabled()) {
                    if (checkSelfPermission(Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) { camShotPending = true; requestPermissions(new String[]{Manifest.permission.CAMERA}, REQ_SHOT); return true; }
                    if (openCamera()) return true;
                }
                Intent i;
                if (onlyImages && Build.VERSION.SDK_INT >= 33) { // Android's photo picker: the gallery / albums
                    i = new Intent(MediaStore.ACTION_PICK_IMAGES);
                    if (multi) i.putExtra(MediaStore.EXTRA_PICK_IMAGES_MAX, 20);
                } else if (onlyImages) {
                    i = new Intent(Intent.ACTION_GET_CONTENT); i.addCategory(Intent.CATEGORY_OPENABLE); i.setType("image/*");
                    if (multi) i.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
                } else {
                    i = new Intent(Intent.ACTION_OPEN_DOCUMENT);
                    i.addCategory(Intent.CATEGORY_OPENABLE);
                    i.setType("*/*");
                    i.putExtra(Intent.EXTRA_MIME_TYPES, new String[]{"application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain", "text/html", "text/markdown", "application/x-subrip", "text/vtt", "application/octet-stream", "image/*"});
                    if (multi) i.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
                }
                try { startActivityForResult(i, REQ_FILE); } catch (Exception e) {
                    try { Intent g = new Intent(Intent.ACTION_GET_CONTENT); g.addCategory(Intent.CATEGORY_OPENABLE); g.setType(onlyImages ? "image/*" : "*/*"); startActivityForResult(g, REQ_FILE); } catch (Exception e2) { fileCb.onReceiveValue(null); fileCb = null; }
                }
                return true;
            }
        });

        String shared = sharedUrl(getIntent());
        String hash = getIntent() == null ? null : getIntent().getStringExtra("hash");
        if (shared != null) web.loadUrl(shared);
        else if (hash != null) web.loadUrl(URL + "#" + hash); // from the daily reminder
        else if (saved != null) web.restoreState(saved);
        else web.loadUrl(URL);
    }

    // Text or links shared from other apps open in Mis lecturas → Add a text; YouTube links open in Practice › Videos (handled in the page)
    String sharedUrl(Intent in) {
        if (in == null || !Intent.ACTION_SEND.equals(in.getAction())) return null;
        String text = in.getStringExtra(Intent.EXTRA_TEXT), title = in.getStringExtra(Intent.EXTRA_SUBJECT);
        if (text == null || text.trim().isEmpty()) return null;
        return URL + "?text=" + Uri.encode(text) + (title != null ? "&title=" + Uri.encode(title) : "") + "#leer-add";
    }

    @Override
    protected void onNewIntent(Intent in) {
        super.onNewIntent(in);
        String shared = sharedUrl(in);
        if (shared != null) web.loadUrl(shared);
        else if (in != null && in.getStringExtra("hash") != null) web.evaluateJavascript("location.hash='" + in.getStringExtra("hash").replaceAll("[^a-z0-9-]", "") + "'", null);
    }

    @Override
    protected void onActivityResult(int code, int result, Intent data) {
        super.onActivityResult(code, result, data);
        if (code == AudioCapBridge.REQ_PROJ && aud != null) { aud.onProjection(result, data); return; }
        if (code == REQ_FILE && fileCb != null) {
            Uri[] r = null;
            if (result == RESULT_OK && data != null) {
                if (data.getClipData() != null && data.getClipData().getItemCount() > 0) { int n = data.getClipData().getItemCount(); r = new Uri[n]; for (int k = 0; k < n; k++) r[k] = data.getClipData().getItemAt(k).getUri(); }
                else if (data.getData() != null) r = new Uri[]{data.getData()};
            }
            fileCb.onReceiveValue(r);
            fileCb = null;
        }
        if (code == REQ_SHOTP && fileCb != null) { // the camera saved the photo into our file
            fileCb.onReceiveValue(result == RESULT_OK && shotUri != null ? new Uri[]{shotUri} : null);
            fileCb = null; shotUri = null;
        }
    }

    // v263: «Take a photo» → the camera writes a full-size picture into the app's cache (shared through the FileProvider)
    boolean openCamera() {
        try {
            File dir = new File(getCacheDir(), "shots"); dir.mkdirs();
            File[] old = dir.listFiles(); if (old != null) for (File f : old) if (System.currentTimeMillis() - f.lastModified() > 86400000L) f.delete();
            File f = new File(dir, "page-" + System.currentTimeMillis() + ".jpg");
            shotUri = FileProvider.getUriForFile(this, getPackageName() + ".files", f);
            Intent c = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
            c.putExtra(MediaStore.EXTRA_OUTPUT, shotUri);
            c.addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION | Intent.FLAG_GRANT_READ_URI_PERMISSION);
            startActivityForResult(c, REQ_SHOTP);
            return true;
        } catch (Exception e) { shotUri = null; return false; }
    }

    void askNotifications() {
        if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, REQ_NOTIF);
        }
    }

    boolean hasMic() { return checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED; }

    void askMic() { requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, REQ_MIC); }

    @Override
    public void onRequestPermissionsResult(int code, String[] perms, int[] res) {
        if (code == REQ_MIC) { boolean ok = res.length > 0 && res[0] == PackageManager.PERMISSION_GRANTED; stt.onPermission(ok); if (wake != null) wake.onPermission(ok); }
        if (code == AudioCapBridge.REQ_MIC2 && aud != null) aud.onMic(res.length > 0 && res[0] == PackageManager.PERMISSION_GRANTED);
        if (code == REQ_SHOT && camShotPending) { camShotPending = false; boolean ok = res.length > 0 && res[0] == PackageManager.PERMISSION_GRANTED; if (!(ok && openCamera()) && fileCb != null) { fileCb.onReceiveValue(null); fileCb = null; } }
        if (code == REQ_CAM && camReq != null) { PermissionRequest r = camReq; camReq = null; if (res.length > 0 && res[0] == PackageManager.PERMISSION_GRANTED) r.grant(r.getResources()); else r.deny(); }
    }

    String readAsset(String name) {
        try (InputStream in = getAssets().open(name)) {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            byte[] b = new byte[8192];
            int n;
            while ((n = in.read(b)) > 0) out.write(b, 0, n);
            return out.toString(StandardCharsets.UTF_8.name());
        } catch (Exception e) {
            return "";
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    @Override
    public void onBackPressed() {
        if (web.canGoBack()) web.goBack();
        else moveTaskToBack(true);
    }

    @Override
    protected void onResume() {
        super.onResume();
        // pick up voices downloaded in Android's text-to-speech settings
        if (tts != null) tts.refreshVoices();
    }

    @Override
    protected void onPause() {
        // hands-free: never keep the microphone while the app isn't in front; the page restarts it when it's visible again
        if (wake != null) wake.pause();
        if (erec != null && erec.running) erec.stop(); // leaving mid-answer: keep what was said
        super.onPause();
    }

    @Override
    protected void onDestroy() {
        if (wake != null) wake.destroy();
        if (erec != null) erec.destroy();
        if (aud != null) aud.end();
        stt.destroy();
        llm.destroy();
        trb.destroy();
        tts.shutdown();
        web.destroy();
        super.onDestroy();
    }
}
