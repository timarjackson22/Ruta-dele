package app.rutadele;

import android.app.Activity;
import android.app.NotificationManager;
import android.content.ContentValues;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Build;
import android.provider.MediaStore;
import android.webkit.JavascriptInterface;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

/** Files and the daily reminder, for the web app. */
public class AppBridge {
    final Activity a;
    AppBridge(Activity a) { this.a = a; }

    /** the installed app's version and when it was installed or last updated (shown in Settings) */
    @android.webkit.JavascriptInterface
    public String version() {
        try { android.content.pm.PackageInfo p = a.getPackageManager().getPackageInfo(a.getPackageName(), 0);
            return "{\"name\":\"" + p.versionName + "\",\"code\":" + p.getLongVersionCode() + ",\"updated\":" + p.lastUpdateTime + "}"; }
        catch (Exception e) { return "{}"; }
    }

    /** Save a text file (a progress backup) to Downloads. Returns where it went, or "ERR:…". */
    @JavascriptInterface
    public String saveText(String name, String text) {
        try {
            byte[] b = text.getBytes(StandardCharsets.UTF_8);
            if (Build.VERSION.SDK_INT >= 29) {
                ContentValues v = new ContentValues();
                v.put(MediaStore.Downloads.DISPLAY_NAME, name);
                v.put(MediaStore.Downloads.MIME_TYPE, "application/json");
                v.put(MediaStore.Downloads.IS_PENDING, 1);
                Uri u = a.getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, v);
                if (u == null) return "ERR:no access";
                try (OutputStream o = a.getContentResolver().openOutputStream(u)) { o.write(b); }
                v.clear(); v.put(MediaStore.Downloads.IS_PENDING, 0);
                a.getContentResolver().update(u, v, null, null);
                return "Downloads/" + name;
            }
            File f = new File(a.getExternalFilesDir(null), name);
            try (FileOutputStream o = new FileOutputStream(f)) { o.write(b); }
            return f.getAbsolutePath();
        } catch (Exception e) {
            return "ERR:" + e.getMessage();
        }
    }

    /** Daily reminder at hour:minute (local time). */
    @JavascriptInterface
    public void setReminder(int hour, int minute, String title, String text) {
        prefs().edit().putBoolean("on", true).putInt("h", hour).putInt("m", minute).putString("title", title).putString("text", text).apply();
        ReminderReceiver.schedule(a);
        if (a instanceof MainActivity) a.runOnUiThread(() -> ((MainActivity) a).askNotifications());
    }

    /** Study-plan reminders: replaces all of them with this JSON list. Returns "OK n" or "ERR". Asks for notification permission if needed. */
    @JavascriptInterface
    public String setPlanReminders(String json) {
        int n = PlanReminderReceiver.setAll(a, json);
        if (n > 0 && a instanceof MainActivity) a.runOnUiThread(() -> ((MainActivity) a).askNotifications());
        return n < 0 ? "ERR bad list" : "OK " + n;
    }

    @JavascriptInterface
    public void cancelReminder() {
        prefs().edit().putBoolean("on", false).apply();
        ReminderReceiver.cancel(a);
    }

    /** Tell the reminder you practised today (it then stays quiet), and update its text. */
    @JavascriptInterface
    public void practised(String day, String text) {
        SharedPreferences.Editor e = prefs().edit().putString("done", day);
        if (text != null && !text.isEmpty()) e.putString("text", text);
        e.apply();
    }

    @JavascriptInterface
    public boolean notificationsAllowed() {
        NotificationManager nm = (NotificationManager) a.getSystemService(Activity.NOTIFICATION_SERVICE);
        return nm == null || nm.areNotificationsEnabled();
    }

    SharedPreferences prefs() { return a.getSharedPreferences("rd-reminder", 0); }
}
