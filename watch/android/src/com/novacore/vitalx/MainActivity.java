package com.novacore.vitalx;

import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.BatteryManager;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.provider.Settings;
import android.view.Gravity;
import android.view.KeyEvent;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

/** VITALX watch mode: full-screen, always-on, works as the phone's home screen. */
public class MainActivity extends Activity {
  private WebView web;
  private TextView clock, battery;
  private final Handler handler = new Handler();
  private final SimpleDateFormat fmt = new SimpleDateFormat("HH:mm", Locale.US);

  private final Runnable tick = new Runnable() {
    public void run() {
      clock.setText(fmt.format(new Date()));
      handler.postDelayed(this, 10000);
    }
  };

  private final BroadcastReceiver batt = new BroadcastReceiver() {
    public void onReceive(Context c, Intent i) {
      int lvl = i.getIntExtra(BatteryManager.EXTRA_LEVEL, -1), sc = i.getIntExtra(BatteryManager.EXTRA_SCALE, 100);
      int st = i.getIntExtra(BatteryManager.EXTRA_STATUS, 0);
      boolean chg = st == BatteryManager.BATTERY_STATUS_CHARGING || st == BatteryManager.BATTERY_STATUS_FULL;
      if (lvl >= 0) battery.setText((chg ? "⚡ " : "") + (lvl * 100 / sc) + "%");
    }
  };

  @Override protected void onCreate(Bundle b) {
    super.onCreate(b);
    requestWindowFeature(Window.FEATURE_NO_TITLE);
    getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
        | WindowManager.LayoutParams.FLAG_FULLSCREEN
        | WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED
        | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON);

    FrameLayout root = new FrameLayout(this);
    root.setBackgroundColor(Color.BLACK);

    web = new WebView(this);
    web.setBackgroundColor(Color.BLACK);
    WebSettings s = web.getSettings();
    s.setJavaScriptEnabled(true);
    s.setDomStorageEnabled(true);
    s.setAllowFileAccess(true);
    s.setMediaPlaybackRequiresUserGesture(false);
    web.setWebViewClient(new WebViewClient());
    web.setVerticalScrollBarEnabled(false);
    web.setHorizontalScrollBarEnabled(false);
    web.setOverScrollMode(View.OVER_SCROLL_NEVER);
    root.addView(web, new FrameLayout.LayoutParams(-1, -1));

    // شريط الساعة والبطارية أعلى الشاشة (خارج المربع الذي تعرضه الصفحة)
    LinearLayout bar = new LinearLayout(this);
    bar.setOrientation(LinearLayout.VERTICAL);
    bar.setGravity(Gravity.CENTER_HORIZONTAL);
    int pad = (int) (getResources().getDisplayMetrics().density * 18);
    bar.setPadding(0, pad, 0, 0);
    clock = new TextView(this);
    clock.setTextColor(Color.WHITE);
    clock.setTextSize(44);
    clock.setTypeface(Typeface.create("sans-serif-light", Typeface.NORMAL));
    clock.setGravity(Gravity.CENTER);
    battery = new TextView(this);
    battery.setTextColor(Color.rgb(149, 163, 192));
    battery.setTextSize(14);
    battery.setGravity(Gravity.CENTER);
    bar.addView(clock);
    bar.addView(battery);
    FrameLayout.LayoutParams lp = new FrameLayout.LayoutParams(-1, -2, Gravity.TOP);
    root.addView(bar, lp);

    setContentView(root);
    web.loadUrl("file:///android_asset/index.html");
    hideSystemUi();
  }

  private void hideSystemUi() {
    int f = View.SYSTEM_UI_FLAG_LAYOUT_STABLE | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
        | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_FULLSCREEN;
    if (Build.VERSION.SDK_INT >= 19) f |= 0x00001000; // SYSTEM_UI_FLAG_IMMERSIVE_STICKY
    getWindow().getDecorView().setSystemUiVisibility(f);
  }

  @Override public void onWindowFocusChanged(boolean has) {
    super.onWindowFocusChanged(has);
    if (has) hideSystemUi();
  }

  @Override protected void onResume() {
    super.onResume();
    registerReceiver(batt, new IntentFilter(Intent.ACTION_BATTERY_CHANGED));
    handler.removeCallbacks(tick);
    tick.run();
    web.onResume();
    hideSystemUi();
  }

  @Override protected void onPause() {
    super.onPause();
    handler.removeCallbacks(tick);
    try { unregisterReceiver(batt); } catch (Exception e) { /* */ }
    web.onPause();
  }

  // زر الرجوع لا يخرج من الساعة. ضغطة طويلة عليه تفتح الإعدادات (للخروج أو تغيير الشاشة الرئيسية).
  @Override public boolean onKeyDown(int code, KeyEvent e) {
    if (code == KeyEvent.KEYCODE_BACK) { e.startTracking(); return true; }
    return super.onKeyDown(code, e);
  }

  @Override public boolean onKeyLongPress(int code, KeyEvent e) {
    if (code == KeyEvent.KEYCODE_BACK) {
      Intent i = new Intent(Build.VERSION.SDK_INT >= 21 ? "android.settings.HOME_SETTINGS" : Settings.ACTION_SETTINGS);
      i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      try { startActivity(i); } catch (Exception ex) { startActivity(new Intent(Settings.ACTION_SETTINGS).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)); }
      return true;
    }
    return super.onKeyLongPress(code, e);
  }

  @Override public boolean onKeyUp(int code, KeyEvent e) {
    if (code == KeyEvent.KEYCODE_BACK) return true;
    return super.onKeyUp(code, e);
  }
}
