package app.rutadele;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.os.Build;
import android.speech.RecognitionService;
import android.speech.SpeechRecognizer;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.List;

/**
 * Picks a speech recogniser that can do the job (tools/VOICE_FIX_BRIEF.md). Some phones' default service (e.g. Samsung's) has no
 * on-device mode and ignores a recorded audio source, so features that rely on those got nothing. Order:
 *   1. Android's on-device recogniser (nothing leaves the phone),
 *   2. Google's recognition service, if installed (works with recorded audio; may use the network unless the offline pack is installed),
 *   3. the phone's default service.
 * "online" choices are only used when the caller allows them.
 */
final class Recog {
    static final ComponentName GOOGLE = new ComponentName("com.google.android.googlequicksearchbox", "com.google.android.voicesearch.serviceapi.GoogleRecognitionService");

    static boolean onDevice(Context c) { return Build.VERSION.SDK_INT >= 31 && SpeechRecognizer.isOnDeviceRecognitionAvailable(c); }

    /** a Google speech recognition service on this phone, whatever its internal name (the Google app or Speech Services by Google) */
    static ComponentName google(Context c) {
        try {
            List<ResolveInfo> l = c.getPackageManager().queryIntentServices(new Intent(RecognitionService.SERVICE_INTERFACE), 0);
            ComponentName best = null;
            // the online Google services: the Google app, or Speech Services by Google (com.google.android.tts); never Android System
            // Intelligence (com.google.android.as), which is the on-device one and needs the same language model
            ComponentName tts = null;
            for (ResolveInfo r : l) { String pk = r.serviceInfo.packageName; ComponentName cn = new ComponentName(pk, r.serviceInfo.name);
                if (pk.equals(GOOGLE.getPackageName())) return cn; if (pk.equals("com.google.android.tts")) tts = cn; else if (best == null && pk.startsWith("com.google.android") && !pk.equals("com.google.android.as")) best = cn; }
            return tts != null ? tts : best;
        } catch (Exception e) { return null; }
    }
    static boolean hasGoogle(Context c) { return google(c) != null; }

    /** returns [recogniser, label] or null when nothing allowed is available */
    static Object[] create(Context c, boolean allowOnline) { return create(c, allowOnline, false); }
    /** skipOnDevice: the on-device recogniser said the language isn't installed, so use an online one */
    static Object[] create(Context c, boolean allowOnline, boolean skipOnDevice) {
        if (onDevice(c) && !skipOnDevice) return new Object[]{ SpeechRecognizer.createOnDeviceSpeechRecognizer(c), "on-device" };
        if (!allowOnline) return null;
        ComponentName g = google(c); if (g != null) return new Object[]{ SpeechRecognizer.createSpeechRecognizer(c, g), "google" };
        if (SpeechRecognizer.isRecognitionAvailable(c)) return new Object[]{ SpeechRecognizer.createSpeechRecognizer(c), "default" };
        return null;
    }

    /** Spanish (or any language) for the ON-DEVICE recogniser: is it installed, and download it (Android 13+). Results go to cb. */
    interface Cb { void on(String type, String json); }
    static void modelInfo(Context c, String lang, Cb cb) {
        if (Build.VERSION.SDK_INT < 33 || !onDevice(c)) { cb.on("model", "{\"lang\":\"" + lang + "\",\"state\":\"unsupported\"}"); return; }
        try {
            final SpeechRecognizer r = SpeechRecognizer.createOnDeviceSpeechRecognizer(c);
            Intent i = new Intent(android.speech.RecognizerIntent.ACTION_RECOGNIZE_SPEECH).putExtra(android.speech.RecognizerIntent.EXTRA_LANGUAGE, lang);
            r.checkRecognitionSupport(i, c.getMainExecutor(), new android.speech.RecognitionSupportCallback() {
                @Override public void onSupportResult(android.speech.RecognitionSupport s) {
                    String st = has(s.getInstalledOnDeviceLanguages(), lang) ? "installed" : has(s.getPendingOnDeviceLanguages(), lang) ? "downloading" : has(s.getSupportedOnDeviceLanguages(), lang) ? "available" : "unsupported";
                    cb.on("model", "{\"lang\":\"" + lang + "\",\"state\":\"" + st + "\"}"); try { r.destroy(); } catch (Exception ignored) { } }
                @Override public void onError(int e) { cb.on("model", "{\"lang\":\"" + lang + "\",\"state\":\"unknown\",\"err\":" + e + "}"); try { r.destroy(); } catch (Exception ignored) { } }
            });
        } catch (Exception e) { cb.on("model", "{\"lang\":\"" + lang + "\",\"state\":\"unknown\"}"); }
    }
    static boolean has(List<String> l, String lang) { if (l == null) return false; String b = lang.split("-")[0]; for (String x : l) if (x.equalsIgnoreCase(lang) || x.replace('_', '-').equalsIgnoreCase(lang)) return true; return false; }
    static void modelDownload(Context c, String lang, Cb cb) {
        if (Build.VERSION.SDK_INT < 33 || !onDevice(c)) { cb.on("model-dl", "unsupported"); return; }
        try {
            final SpeechRecognizer r = SpeechRecognizer.createOnDeviceSpeechRecognizer(c);
            Intent i = new Intent(android.speech.RecognizerIntent.ACTION_RECOGNIZE_SPEECH).putExtra(android.speech.RecognizerIntent.EXTRA_LANGUAGE, lang);
            if (Build.VERSION.SDK_INT >= 34) {
                r.triggerModelDownload(i, c.getMainExecutor(), new android.speech.ModelDownloadListener() {
                    @Override public void onProgress(int p) { cb.on("model-dl", "progress:" + p); }
                    @Override public void onSuccess() { cb.on("model-dl", "done"); try { r.destroy(); } catch (Exception ignored) { } }
                    @Override public void onScheduled() { cb.on("model-dl", "scheduled"); try { r.destroy(); } catch (Exception ignored) { } }
                    @Override public void onError(int e) { cb.on("model-dl", "error:" + e); try { r.destroy(); } catch (Exception ignored) { } }
                });
            } else { r.triggerModelDownload(i); cb.on("model-dl", "started"); }
        } catch (Exception e) { cb.on("model-dl", "error:" + e.getMessage()); }
    }

    /** what this phone offers, for Mic diagnostics */
    static String info(Context c) {
        try {
            JSONObject o = new JSONObject();
            o.put("android", Build.VERSION.SDK_INT); o.put("phone", Build.MANUFACTURER + " " + Build.MODEL);
            o.put("onDevice", onDevice(c)); ComponentName g = google(c); o.put("google", g == null ? "none" : g.flattenToShortString()); o.put("any", SpeechRecognizer.isRecognitionAvailable(c));
            JSONArray a = new JSONArray();
            List<ResolveInfo> l = c.getPackageManager().queryIntentServices(new Intent(RecognitionService.SERVICE_INTERFACE), PackageManager.GET_META_DATA);
            for (ResolveInfo r : l) a.put(r.serviceInfo.packageName + "/" + r.serviceInfo.name);
            o.put("services", a);
            try { String d = android.provider.Settings.Secure.getString(c.getContentResolver(), "voice_recognition_service"); o.put("default", d == null ? "" : d); } catch (Exception ignored) { }
            o.put("mic", c.checkSelfPermission(android.Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED);
            return o.toString();
        } catch (Exception e) { return "{\"error\":\"" + e.getMessage() + "\"}"; }
    }
}
