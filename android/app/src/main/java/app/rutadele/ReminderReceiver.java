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

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;

/** The daily practice reminder: shows a notification unless you already practised today, then sets the next one. */
public class ReminderReceiver extends BroadcastReceiver {
    static final String CH = "daily";
    static final String FIRE = "app.rutadele.REMIND";

    @Override
    public void onReceive(Context c, Intent i) {
        SharedPreferences p = c.getSharedPreferences("rd-reminder", 0);
        if (!p.getBoolean("on", false)) return;
        if (FIRE.equals(i.getAction())) {
            String today = new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());
            if (!today.equals(p.getString("done", ""))) show(c, p.getString("title", "Ruta DELE"), p.getString("text", "10 minutos de español hoy 💪"));
        }
        schedule(c); // the next one (also after a restart or an app update)
    }

    static void show(Context c, String title, String text) {
        NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;
        if (Build.VERSION.SDK_INT >= 26 && nm.getNotificationChannel(CH) == null) {
            NotificationChannel ch = new NotificationChannel(CH, "Daily reminder", NotificationManager.IMPORTANCE_DEFAULT);
            ch.setDescription("A daily nudge to practise");
            nm.createNotificationChannel(ch);
        }
        Intent open = new Intent(c, MainActivity.class).setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP).putExtra("hash", "hoy");
        PendingIntent pi = PendingIntent.getActivity(c, 3, open, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        nm.notify(2, new NotificationCompat.Builder(c, CH)
                .setSmallIcon(android.R.drawable.ic_popup_reminder)
                .setContentTitle(title)
                .setContentText(text)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(text))
                .setContentIntent(pi)
                .setAutoCancel(true)
                .setCategory(NotificationCompat.CATEGORY_REMINDER)
                .build());
    }

    static PendingIntent pending(Context c) {
        return PendingIntent.getBroadcast(c, 4, new Intent(c, ReminderReceiver.class).setAction(FIRE), PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
    }

    static void schedule(Context c) {
        SharedPreferences p = c.getSharedPreferences("rd-reminder", 0);
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        if (am == null || !p.getBoolean("on", false)) return;
        Calendar t = Calendar.getInstance();
        t.set(Calendar.HOUR_OF_DAY, p.getInt("h", 19)); t.set(Calendar.MINUTE, p.getInt("m", 0)); t.set(Calendar.SECOND, 0); t.set(Calendar.MILLISECOND, 0);
        if (t.getTimeInMillis() <= System.currentTimeMillis() + 30000) t.add(Calendar.DAY_OF_MONTH, 1);
        // inexact but delivered even in battery saving; no special permission needed
        am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, t.getTimeInMillis(), pending(c));
    }

    static void cancel(Context c) {
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        if (am != null) am.cancel(pending(c));
    }
}
