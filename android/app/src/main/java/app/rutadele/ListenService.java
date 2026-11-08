package app.rutadele;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;

import androidx.core.app.NotificationCompat;
import androidx.core.app.ServiceCompat;

/** Keeps the app alive while listen mode plays with the screen off, and shows a notification with Stop. */
public class ListenService extends Service {
    static final String CH = "listen", STOP = "app.rutadele.STOP", UPDATE = "app.rutadele.UPDATE";
    static boolean running = false;
    PowerManager.WakeLock lock;

    static void start(Context c, String text) {
        Intent i = new Intent(c, ListenService.class).putExtra("text", text);
        try {
            if (Build.VERSION.SDK_INT >= 26) c.startForegroundService(i); else c.startService(i);
        } catch (Exception ignored) { }
    }

    static void update(Context c, String text) {
        if (!running) return;
        try { c.startService(new Intent(c, ListenService.class).setAction(UPDATE).putExtra("text", text)); } catch (Exception ignored) { }
    }

    static void stop(Context c) {
        if (!running) return;
        c.stopService(new Intent(c, ListenService.class));
    }

    Notification build(String text) {
        NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        if (Build.VERSION.SDK_INT >= 26 && nm.getNotificationChannel(CH) == null) {
            NotificationChannel ch = new NotificationChannel(CH, "Listen mode", NotificationManager.IMPORTANCE_LOW);
            ch.setShowBadge(false);
            nm.createNotificationChannel(ch);
        }
        PendingIntent open = PendingIntent.getActivity(this, 0, new Intent(this, MainActivity.class).setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP), PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        PendingIntent stop = PendingIntent.getService(this, 1, new Intent(this, ListenService.class).setAction(STOP), PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        return new NotificationCompat.Builder(this, CH)
                .setSmallIcon(android.R.drawable.ic_media_play)
                .setContentTitle("Ruta DELE · Listening")
                .setContentText(text == null ? "" : text)
                .setContentIntent(open)
                .setOngoing(true)
                .setOnlyAlertOnce(true)
                .setSilent(true)
                .setCategory(NotificationCompat.CATEGORY_TRANSPORT)
                .addAction(android.R.drawable.ic_media_pause, "Stop", stop)
                .build();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        String action = intent == null ? null : intent.getAction();
        if (STOP.equals(action)) {
            TtsBridge.stopFromNotification();
            stopSelf();
            return START_NOT_STICKY;
        }
        String text = intent == null ? "" : intent.getStringExtra("text");
        Notification n = build(text);
        if (UPDATE.equals(action) && running) {
            ((NotificationManager) getSystemService(NOTIFICATION_SERVICE)).notify(1, n);
            return START_NOT_STICKY;
        }
        ServiceCompat.startForeground(this, 1, n, Build.VERSION.SDK_INT >= 29 ? ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK : 0);
        running = true;
        if (lock == null) {
            PowerManager pm = (PowerManager) getSystemService(POWER_SERVICE);
            lock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "rutadele:listen");
            lock.acquire(4 * 60 * 60 * 1000L);
        }
        return START_NOT_STICKY;
    }

    @Override
    public void onDestroy() {
        running = false;
        if (lock != null && lock.isHeld()) lock.release();
        lock = null;
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) { return null; }
}
