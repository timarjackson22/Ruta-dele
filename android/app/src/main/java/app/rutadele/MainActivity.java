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

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Collections;

public class MainActivity extends Activity {
    static final String HOST = "timarjackson22.github.io";
    static final String URL = "https://" + HOST + "/Ruta-dele/";
    static final int REQ_MIC = 7, REQ_NOTIF = 8, REQ_FILE = 9;
    ValueCallback<Uri[]> fileCb;
    LlmBridge llm;
    TranslateBridge trb;

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
        s.setUserAgentString(s.getUserAgentString() + " RutaDELEApp/1");
        web.setRendererPriorityPolicy(WebView.RENDERER_PRIORITY_IMPORTANT, false);

        tts = new TtsBridge(this, web);
        stt = new SttBridge(this, web);
        web.addJavascriptInterface(tts, "AndroidTTS");
        web.addJavascriptInterface(stt, "AndroidSTT");
        llm = new LlmBridge(this, web);
        trb = new TranslateBridge(web);
        web.addJavascriptInterface(llm, "AndroidLLM");
        web.addJavascriptInterface(trb, "AndroidTR");

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
                try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception ignored) { }
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
                if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) request.grant(request.getResources());
                else request.deny();
            }

            // <input type="file"> (adding PDFs, Word files and texts to Mis lecturas)
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> cb, FileChooserParams params) {
                if (fileCb != null) fileCb.onReceiveValue(null);
                fileCb = cb;
                Intent i = new Intent(Intent.ACTION_OPEN_DOCUMENT);
                i.addCategory(Intent.CATEGORY_OPENABLE);
                i.setType("*/*");
                i.putExtra(Intent.EXTRA_MIME_TYPES, new String[]{"application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain", "text/html", "text/markdown", "application/x-subrip", "text/vtt", "application/octet-stream"});
                try { startActivityForResult(i, REQ_FILE); } catch (Exception e) { fileCb = null; return false; }
                return true;
            }
        });

        String shared = sharedUrl(getIntent());
        if (shared != null) web.loadUrl(shared);
        else if (saved != null) web.restoreState(saved);
        else web.loadUrl(URL);
    }

    // Text or links shared from other apps (Chrome's Share menu) open in Mis lecturas → Add a text
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
    }

    @Override
    protected void onActivityResult(int code, int result, Intent data) {
        super.onActivityResult(code, result, data);
        if (code == REQ_FILE && fileCb != null) {
            Uri[] r = null;
            if (result == RESULT_OK && data != null && data.getData() != null) r = new Uri[]{data.getData()};
            fileCb.onReceiveValue(r);
            fileCb = null;
        }
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
        if (code == REQ_MIC) stt.onPermission(res.length > 0 && res[0] == PackageManager.PERMISSION_GRANTED);
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
    protected void onDestroy() {
        stt.destroy();
        llm.destroy();
        trb.destroy();
        tts.shutdown();
        web.destroy();
        super.onDestroy();
    }
}
