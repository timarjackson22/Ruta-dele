package app.rutadele;

import android.os.Handler;
import android.os.Looper;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import com.google.mediapipe.tasks.genai.llminference.LlmInference;
import com.google.mediapipe.tasks.genai.llminference.LlmInferenceSession;

import org.json.JSONObject;

import com.google.ai.edge.litertlm.Backend;
import com.google.ai.edge.litertlm.Contents;
import com.google.ai.edge.litertlm.Conversation;
import com.google.ai.edge.litertlm.ConversationConfig;
import com.google.ai.edge.litertlm.Engine;
import com.google.ai.edge.litertlm.EngineConfig;
import com.google.ai.edge.litertlm.Message;
import com.google.ai.edge.litertlm.MessageCallback;
import com.google.ai.edge.litertlm.SamplerConfig;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * On-device AI for Profe inside the Android app (the WebView has no WebGPU).
 * Downloads one LiteRT model file once, then runs it on the phone with MediaPipe LLM Inference.
 * JavaScript: AndroidLLM.status(), download(url, name), remove(), generate(id, prompt, maxTokens, temp), cancel().
 * Events go to window.__allm.ev(type, id, data).
 */
public class LlmBridge {
    final MainActivity act;
    final WebView web;
    final Handler main = new Handler(Looper.getMainLooper());
    final ExecutorService dlExec = Executors.newSingleThreadExecutor();
    final ExecutorService runExec = Executors.newSingleThreadExecutor();
    volatile String state = "none"; // none | downloading | ready | loading | loaded | error
    volatile long got = 0, total = 0;
    volatile String error = "";
    volatile boolean cancelDl = false;
    LlmInference llm;
    volatile LlmInferenceSession cur;
    // context size follows the model file: "..._ekv1280.task" holds 1,280 tokens, "..._ekv4096.task" 4,096
    int maxTokens() { File f = modelFile(); return f != null && f.getName().contains("ekv1280") ? 1280 : 2048; }
    int chatCap() { return maxTokens() <= 1280 ? 2600 : 5200; }

    LlmBridge(MainActivity act, WebView web) {
        this.act = act;
        this.web = web;
        if (modelFile() != null) state = "ready";
    }

    File dir() { File d = new File(act.getFilesDir(), "models"); d.mkdirs(); return d; }

    File modelFile() {
        File[] fs = dir().listFiles();
        if (fs != null) for (File f : fs) if ((f.getName().endsWith(".task") || f.getName().endsWith(".litertlm")) && f.length() > 100_000_000L) return f;
        return null;
    }

    void js(final String code) { main.post(() -> web.evaluateJavascript(code, null)); }

    void ev(String type, String id, String data) {
        js("window.__allm && __allm.ev(" + JSONObject.quote(type) + "," + JSONObject.quote(id == null ? "" : id) + "," + JSONObject.quote(data == null ? "" : data) + ")");
    }

    @JavascriptInterface
    public String status() {
        try {
            JSONObject o = new JSONObject();
            o.put("state", state);
            o.put("got", got);
            o.put("total", total);
            o.put("error", error);
            File f = modelFile();
            o.put("model", f == null ? "" : f.getName());
            o.put("backend", lmBackend);
            o.put("size", f == null ? 0 : f.length());
            o.put("free", dir().getUsableSpace());
            return o.toString();
        } catch (Exception e) {
            return "{}";
        }
    }

    @JavascriptInterface
    public void download(final String url, final String name) {
        if ("downloading".equals(state)) return;
        cancelDl = false;
        state = "downloading";
        error = "";
        dlExec.execute(() -> {
            File part = new File(dir(), name + ".part"), done = new File(dir(), name);
            try {
                long have = part.exists() ? part.length() : 0;
                HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
                c.setInstanceFollowRedirects(true);
                c.setConnectTimeout(20000);
                c.setReadTimeout(60000);
                if (have > 0) c.setRequestProperty("Range", "bytes=" + have + "-");
                int code = c.getResponseCode();
                // follow cross-host redirects (Hugging Face sends files from a CDN)
                for (int i = 0; i < 5 && (code == 301 || code == 302 || code == 303 || code == 307 || code == 308); i++) {
                    String loc = c.getHeaderField("Location");
                    c.disconnect();
                    c = (HttpURLConnection) new URL(new URL(url), loc).openConnection();
                    c.setConnectTimeout(20000);
                    c.setReadTimeout(60000);
                    if (have > 0) c.setRequestProperty("Range", "bytes=" + have + "-");
                    code = c.getResponseCode();
                }
                if (code == 200) have = 0;
                else if (code != 206) throw new Exception("server answered " + code);
                long len = c.getContentLengthLong();
                total = len > 0 ? have + len : 0;
                got = have;
                if (total > 0 && dir().getUsableSpace() < (total - have) + 200_000_000L) throw new Exception("not enough free space on the phone");
                try (InputStream in = c.getInputStream(); FileOutputStream out = new FileOutputStream(part, have > 0)) {
                    byte[] b = new byte[1 << 16];
                    int n;
                    long last = 0;
                    while ((n = in.read(b)) > 0) {
                        if (cancelDl) throw new Exception("cancelled");
                        out.write(b, 0, n);
                        got += n;
                        long now = System.currentTimeMillis();
                        if (now - last > 500) { last = now; ev("dl", "", got + "/" + total); }
                    }
                }
                c.disconnect();
                if (total > 0 && part.length() < total) throw new Exception("download incomplete, tap again to resume");
                File[] old = dir().listFiles();
                if (old != null) for (File f : old) if ((f.getName().endsWith(".task") || f.getName().endsWith(".litertlm")) && !f.getName().equals(name)) f.delete();
                if (!part.renameTo(done)) throw new Exception("couldn't save the model");
                runExec.execute(() -> { try { if (chat != null) chat.close(); } catch (Exception ignored) { } chat = null; chatKey = ""; try { if (llm != null) llm.close(); } catch (Exception ignored) { } llm = null; lmClose(); });
                state = "ready";
                ev("dl", "", "done");
            } catch (Exception e) {
                state = modelFile() != null ? "ready" : "error";
                error = String.valueOf(e.getMessage());
                ev("dlerr", "", error);
            }
        });
    }

    @JavascriptInterface
    public void cancelDownload() { cancelDl = true; }

    @JavascriptInterface
    public void remove() {
        runExec.execute(() -> {
            try { if (llm != null) llm.close(); } catch (Exception ignored) { }
            llm = null;
            lmClose();
            File[] fs = dir().listFiles();
            if (fs != null) for (File f : fs) f.delete();
            state = "none";
            ev("removed", "", "");
        });
    }

    void ensureLoaded() throws Exception {
        File f = modelFile();
        if (f == null) throw new Exception("no model downloaded");
        if (f.getName().endsWith(".litertlm")) { lmLoad(f); return; }
        if (llm != null) return;
        state = "loading";
        ev("loading", "", "");
        LlmInference.LlmInferenceOptions o = LlmInference.LlmInferenceOptions.builder()
                .setModelPath(f.getAbsolutePath())
                .setMaxTokens(maxTokens())
                .setMaxTopK(40)
                .setPreferredBackend(LlmInference.Backend.CPU)
                .build();
        llm = LlmInference.createFromOptions(act.getApplicationContext(), o);
        state = "loaded";
        ev("loaded", "", "");
    }


    // ---------- LiteRT-LM (.litertlm models such as Gemma 4): the newer on-device engine ----------
    Engine lm;
    String lmPath = "", lmBackend = "";
    Conversation lmChat, lmCur;
    String lmKey = "", lmSys = "";
    float lmTemp = 0.35f;
    final List<Message> lmHist = new ArrayList<>();
    int lmChars = 0;

    boolean isLm() { File f = modelFile(); return f != null && f.getName().endsWith(".litertlm"); }

    void lmLoad(File f) throws Exception {
        if (lm != null && lmPath.equals(f.getAbsolutePath())) return;
        lmClose();
        state = "loading";
        ev("loading", "", "");
        String cache = act.getCacheDir().getPath();
        try {
            Engine e = new Engine(new EngineConfig(f.getAbsolutePath(), new Backend.GPU(), null, null, null, null, cache));
            e.initialize();
            lm = e; lmBackend = "GPU";
        } catch (Throwable gpu) {
            Engine e = new Engine(new EngineConfig(f.getAbsolutePath(), new Backend.CPU(), null, null, null, null, cache));
            e.initialize();
            lm = e; lmBackend = "CPU";
        }
        lmPath = f.getAbsolutePath();
        state = "loaded";
        ev("loaded", "", "");
    }

    void lmClose() {
        try { if (lmChat != null) lmChat.close(); } catch (Throwable ignored) { }
        lmChat = null; lmKey = ""; lmHist.clear(); lmChars = 0;
        try { if (lm != null) lm.close(); } catch (Throwable ignored) { }
        lm = null; lmPath = "";
    }

    Conversation lmConv(String system, List<Message> initial, float temp) {
        return lm.createConversation(new ConversationConfig(
                system == null || system.isEmpty() ? null : Contents.Companion.of(system),
                initial, new ArrayList<>(),
                new SamplerConfig(40, 0.9, (double) temp, (int) (System.currentTimeMillis() & 0x7fffffff))));
    }

    // streams the answer to JavaScript and returns it; stops at the character cap
    String lmSend(final Conversation c, String text, final String id, int maxTokens) throws Exception {
        final StringBuilder sb = new StringBuilder();
        final int cap = Math.max(32, maxTokens) * 4;
        final CountDownLatch latch = new CountDownLatch(1);
        final Throwable[] err = new Throwable[1];
        lmCur = c;
        c.sendMessageAsync(Message.Companion.user(text), new MessageCallback() {
            @Override public void onMessage(Message m) {
                String part = m.toString();
                if (part == null || part.isEmpty()) return;
                sb.append(part);
                ev("part", id, part);
                if (sb.length() > cap) try { c.cancelProcess(); } catch (Throwable ignored) { }
            }
            @Override public void onDone() { latch.countDown(); }
            @Override public void onError(Throwable t) { err[0] = t; latch.countDown(); }
        });
        latch.await();
        lmCur = null;
        if (err[0] != null && !String.valueOf(err[0].getMessage()).toLowerCase().contains("cancel")) throw new Exception(String.valueOf(err[0].getMessage()));
        return sb.toString();
    }

    void lmGenerate(String id, String prompt, int maxTokens, float temperature) {
        try {
            ensureLoaded();
            // one conversation at a time: pause the chat, answer, then restore the chat with its history
            try { if (lmChat != null) lmChat.close(); } catch (Throwable ignored) { }
            lmChat = null;
            Conversation c = lmConv(null, new ArrayList<>(), temperature);
            try { lmSend(c, prompt, id, maxTokens); } finally { try { c.close(); } catch (Throwable ignored) { } }
            if (!lmKey.isEmpty()) lmChat = lmConv(lmSys, new ArrayList<>(lmHist), lmTemp);
            ev("done", id, "");
        } catch (Throwable e) {
            String m = String.valueOf(e.getMessage());
            if (m.toLowerCase().contains("cancel")) ev("done", id, ""); else ev("err", id, m);
        }
    }

    void lmChatRun(String id, String key, String system, String user, int maxTokens, float temperature) {
        try {
            ensureLoaded();
            boolean fresh = lmChat == null || !key.equals(lmKey) || lmChars + user.length() > 12000;
            if (fresh) {
                try { if (lmChat != null) lmChat.close(); } catch (Throwable ignored) { }
                lmHist.clear(); lmChars = system.length();
                lmKey = key; lmSys = system; lmTemp = temperature;
                lmChat = lmConv(system, new ArrayList<>(), temperature);
            }
            String out = lmSend(lmChat, user, id, maxTokens);
            lmHist.add(Message.Companion.user(user)); lmHist.add(Message.Companion.model(out));
            lmChars += user.length() + out.length();
            ev("done", id, fresh ? "fresh" : "");
        } catch (Throwable e) {
            String m = String.valueOf(e.getMessage());
            if (m.toLowerCase().contains("cancel")) ev("done", id, "");
            else { try { if (lmChat != null) lmChat.close(); } catch (Throwable ignored) { } lmChat = null; lmKey = ""; ev("err", id, m); }
        }
    }

    // tells the web app that this app can run .litertlm models (Gemma 4)
    @JavascriptInterface
    public boolean canLm() { return true; }

    @JavascriptInterface
    public void preload() {
        runExec.execute(() -> { try { ensureLoaded(); } catch (Throwable e) { error = String.valueOf(e.getMessage()); state = modelFile() != null ? "ready" : "none"; ev("err", "", error); } });
    }

    @JavascriptInterface
    public int tokens(String text) {
        try { return llm != null ? llm.sizeInTokens(text) : -1; } catch (Exception e) { return -1; }
    }

    @JavascriptInterface
    public void generate(final String id, final String prompt, final int maxTokens, final float temperature) {
        if (isLm()) { runExec.execute(() -> lmGenerate(id, prompt, maxTokens, temperature)); return; }
        runExec.execute(() -> {
            LlmInferenceSession s = null;
            try {
                ensureLoaded();
                s = LlmInferenceSession.createFromOptions(llm, LlmInferenceSession.LlmInferenceSessionOptions.builder()
                        .setTopK(40).setTopP(0.95f).setTemperature(temperature).build());
                cur = s;
                s.addQueryChunk(prompt);
                final StringBuilder sb = new StringBuilder();
                final int cap = Math.max(32, maxTokens) * 4; // rough character cap for the answer
                final LlmInferenceSession sess = s;
                s.generateResponseAsync((partial, done) -> {
                    if (partial != null && !partial.isEmpty()) {
                        sb.append(partial);
                        ev("part", id, partial);
                        if (sb.length() > cap) try { sess.cancelGenerateResponseAsync(); } catch (Exception ignored) { }
                    }
                }).get();
                ev("done", id, "");
            } catch (Throwable e) {
                String m = String.valueOf(e.getMessage());
                if (m.toLowerCase().contains("cancel")) ev("done", id, "");
                else ev("err", id, m);
            } finally {
                cur = null;
                if (s != null) try { s.close(); } catch (Exception ignored) { }
            }
        });
    }

    // ---------- multi-turn chat: one session per conversation, so earlier turns stay in the model's memory ----------
    LlmInferenceSession chat;
    String chatKey = "";
    int chatChars = 0;

    @JavascriptInterface
    public boolean hasChat() { return true; }

    @JavascriptInterface
    public void resetChat() {
        runExec.execute(() -> { if (chat != null) try { chat.close(); } catch (Exception ignored) { } chat = null; chatKey = ""; chatChars = 0; });
    }

    @JavascriptInterface
    public void chat(final String id, final String key, final String system, final String user, final int maxTokens, final float temperature) {
        if (isLm()) { runExec.execute(() -> lmChatRun(id, key, system, user, maxTokens, temperature)); return; }
        runExec.execute(() -> {
            try {
                ensureLoaded();
                boolean fresh = chat == null || !key.equals(chatKey) || chatChars + user.length() > chatCap();
                if (fresh) {
                    if (chat != null) try { chat.close(); } catch (Exception ignored) { }
                    chat = LlmInferenceSession.createFromOptions(llm, LlmInferenceSession.LlmInferenceSessionOptions.builder()
                            .setTopK(40).setTopP(0.9f).setTemperature(temperature).setRandomSeed((int) (System.currentTimeMillis() & 0x7fffffff)).build());
                    chatKey = key;
                    chatChars = system.length();
                    chat.addQueryChunk(system + "\n\n" + user);
                } else {
                    chat.addQueryChunk(user);
                }
                chatChars += user.length();
                cur = chat;
                final StringBuilder sb = new StringBuilder();
                final int cap = Math.max(32, maxTokens) * 4;
                final LlmInferenceSession sess = chat;
                sess.generateResponseAsync((partial, done) -> {
                    if (partial != null && !partial.isEmpty()) {
                        sb.append(partial);
                        ev("part", id, partial);
                        if (sb.length() > cap) try { sess.cancelGenerateResponseAsync(); } catch (Exception ignored) { }
                    }
                }).get();
                chatChars += sb.length();
                ev("done", id, fresh ? "fresh" : "");
            } catch (Throwable e) {
                String m = String.valueOf(e.getMessage());
                if (m.toLowerCase().contains("cancel")) ev("done", id, "");
                else {
                    // a broken session is dropped so the next message starts clean
                    if (chat != null) try { chat.close(); } catch (Exception ignored) { }
                    chat = null; chatKey = "";
                    ev("err", id, m);
                }
            } finally {
                cur = null;
            }
        });
    }

    @JavascriptInterface
    public void cancel() {
        Conversation lc = lmCur;
        if (lc != null) try { lc.cancelProcess(); } catch (Throwable ignored) { }
        LlmInferenceSession s = cur;
        if (s != null) try { s.cancelGenerateResponseAsync(); } catch (Exception ignored) { }
    }

    void destroy() {
        try { if (chat != null) chat.close(); } catch (Exception ignored) { }
        try { if (llm != null) llm.close(); } catch (Exception ignored) { }
        lmClose();
        dlExec.shutdownNow();
        runExec.shutdownNow();
    }
}
