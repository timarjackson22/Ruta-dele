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
            for (ResolveInfo r : l) { String pk = r.serviceInfo.packageName; if (!pk.startsWith("com.google.android")) continue; ComponentName cn = new ComponentName(pk, r.serviceInfo.name); if (pk.equals(GOOGLE.getPackageName())) return cn; if (best == null) best = cn; }
            return best;
        } catch (Exception e) { return null; }
    }
    static boolean hasGoogle(Context c) { return google(c) != null; }

    /** returns [recogniser, label] or null when nothing allowed is available */
    static Object[] create(Context c, boolean allowOnline) {
        if (onDevice(c)) return new Object[]{ SpeechRecognizer.createOnDeviceSpeechRecognizer(c), "on-device" };
        if (!allowOnline) return null;
        ComponentName g = google(c); if (g != null) return new Object[]{ SpeechRecognizer.createSpeechRecognizer(c, g), "google" };
        if (SpeechRecognizer.isRecognitionAvailable(c)) return new Object[]{ SpeechRecognizer.createSpeechRecognizer(c), "default" };
        return null;
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
