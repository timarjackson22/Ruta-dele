package app.rutadele;

import android.app.AlarmManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;

import androidx.core.app.NotificationCompat;

import org.json.JSONArray;
import org.json.JSONObject;

/** Study-plan reminders (sessions, missed sessions, revision, mocks, booking, exam day).
 *  The web app computes the list (quiet hours, time zone, per-day limit, opt-outs) and hands it over; this only schedules and shows it. */
public class PlanReminderReceiver extends BroadcastReceiver {
    static final String CH = "plan";
    static final String FIRE = "app.rutadele.PLAN_REMIND";
    static final int MAX = 80;

    static SharedPreferences prefs(Context c) { return c.getSharedPreferences("rd-plan", 0); }

    /** Replace all plan reminders with this list ([{id, at, title, text, hash}]). Returns how many were scheduled. */
    static int setAll(Context c, String json) {
        cancelAll(c);
        int n = 0;
        try {
            JSONArray in = new JSONArray(json == null ? "[]" : json), keep = new JSONArray();
            long now = System.currentTimeMillis();
            for (int i = 0; i < in.length() && n < MAX; i++) {
                JSONObject o = in.getJSONObject(i);
                if (o.optLong("at") <= now + 30000) continue;
                keep.put(o); n++;
            }
            prefs(c).edit().putString("list", keep.toString()).apply();
            scheduleAll(c);
        } catch (Exception e) { prefs(c).edit().putString("list", "[]").apply(); return -1; }
        return n;
    }

    static PendingIntent pending(Context c, int i, JSONObject o) {
        Intent it = new Intent(c, PlanReminderReceiver.class).setAction(FIRE).putExtra("i", i);
        if (o != null) it.putExtra("title", o.optString("title")).putExtra("text", o.optString("text")).putExtra("hash", o.optString("hash", "plan"));
        return PendingIntent.getBroadcast(c, 1000 + i, it, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
    }

    static void scheduleAll(Context c) {
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE); if (am == null) return;
        try {
            JSONArray L = new JSONArray(prefs(c).getString("list", "[]")); long now = System.currentTimeMillis();
            for (int i = 0; i < L.length(); i++) { JSONObject o = L.getJSONObject(i); long at = o.optLong("at"); if (at > now) am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pending(c, i, o)); }
            prefs(c).edit().putInt("n", L.length()).apply();
        } catch (Exception ignored) {}
    }

    static void cancelAll(Context c) {
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE); if (am == null) return;
        int n = Math.max(prefs(c).getInt("n", 0), MAX);
        for (int i = 0; i < n; i++) am.cancel(pending(c, i, null));
        prefs(c).edit().putInt("n", 0).apply();
    }

    @Override
    public void onReceive(Context c, Intent i) {
        if (FIRE.equals(i.getAction())) { show(c, i.getStringExtra("title"), i.getStringExtra("text"), i.getStringExtra("hash"), i.getIntExtra("i", 0)); return; }
        scheduleAll(c); // after a restart or an app update the alarms are gone: set the future ones again
    }

    static void show(Context c, String title, String text, String hash, int id) {
        NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null || !nm.areNotificationsEnabled()) return;
        if (Build.VERSION.SDK_INT >= 26 && nm.getNotificationChannel(CH) == null) {
            NotificationChannel ch = new NotificationChannel(CH, "Study plan", NotificationManager.IMPORTANCE_DEFAULT);
            ch.setDescription("Reminders for your scheduled study sessions, mocks and exam day");
            nm.createNotificationChannel(ch);
        }
        Intent open = new Intent(c, MainActivity.class).setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP).putExtra("hash", hash == null || hash.isEmpty() ? "plan" : hash.replaceFirst("^#", ""));
        PendingIntent pi = PendingIntent.getActivity(c, 5000 + id, open, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        nm.notify(100 + (id % 50), new NotificationCompat.Builder(c, CH)
                .setSmallIcon(android.R.drawable.ic_popup_reminder)
                .setContentTitle(title == null ? "Ruta DELE" : title)
                .setContentText(text)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(text))
                .setContentIntent(pi)
                .setAutoCancel(true)
                .setCategory(NotificationCompat.CATEGORY_REMINDER)
                .build());
    }
}
