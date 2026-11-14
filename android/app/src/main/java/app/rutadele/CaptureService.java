package app.rutadele;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.media.projection.MediaProjection;
import android.media.projection.MediaProjectionManager;
import android.os.Build;
import android.os.IBinder;

import androidx.core.app.NotificationCompat;
import androidx.core.app.ServiceCompat;

/**
 * Practice › Videos, "Captions from the audio": Android only lets an app record its own playback sound from a
 * foreground service of type mediaProjection, started right after you allow it. The service holds the projection
 * while the captions are being made and shows a notification; AudioCapBridge does the recording and recognising.
 */
public class CaptureService extends Service {
    static final String CH = "capture";
    static MediaProjection projection;
    static Runnable onReady;

    static void start(Context c, int result, Intent data, Runnable ready) {
        onReady = ready;
        Intent i = new Intent(c, CaptureService.class).putExtra("result", result).putExtra("data", data);
        if (Build.VERSION.SDK_INT >= 26) c.startForegroundService(i); else c.startService(i);
    }

    static void stop(Context c) {
        try { if (projection != null) projection.stop(); } catch (Exception ignored) { }
        projection = null;
        c.stopService(new Intent(c, CaptureService.class));
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        if (Build.VERSION.SDK_INT >= 26 && nm.getNotificationChannel(CH) == null)
            nm.createNotificationChannel(new NotificationChannel(CH, "Video captions", NotificationManager.IMPORTANCE_LOW));
        Notification n = new NotificationCompat.Builder(this, CH)
                .setSmallIcon(android.R.drawable.ic_btn_speak_now)
                .setContentTitle("Making captions from the video")
                .setContentText("Ruta DELE is listening to the video it's playing")
                .setOngoing(true).build();
        ServiceCompat.startForeground(this, 42, n, Build.VERSION.SDK_INT >= 29 ? ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PROJECTION : 0);
        try {
            Intent data = intent.getParcelableExtra("data");
            MediaProjectionManager mpm = (MediaProjectionManager) getSystemService(MEDIA_PROJECTION_SERVICE);
            projection = mpm.getMediaProjection(intent.getIntExtra("result", 0), data);
            if (projection != null) projection.registerCallback(new MediaProjection.Callback() {
                @Override public void onStop() { projection = null; }
            }, null);
        } catch (Exception e) { projection = null; }
        Runnable r = onReady; onReady = null;
        if (r != null) r.run();
        return START_NOT_STICKY;
    }

    @Override
    public IBinder onBind(Intent intent) { return null; }
}
