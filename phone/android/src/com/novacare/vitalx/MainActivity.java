package com.novacare.vitalx;

import android.app.Activity;
import android.app.admin.DevicePolicyManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.PowerManager;
import android.view.KeyEvent;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/**
 * VITALX للهاتف: شاشة اختيار، ثم ساعة الرائد (عمودي) أو لوحة الأرض (أفقي).
 * وضع القفل: التطبيق يصبح الشاشة الرئيسية، يخفي أشرطة النظام، ويعود للمقدمة إذا خرج منه أحد.
 * الخروج فقط: ضغطة مطوّلة على زر الرجوع ثم الرمز 12345.
 * قفل كامل اختياري (بدون أي مخرج من النظام): adb shell dpm set-device-owner com.novacare.vitalx/.AdminReceiver
 */
public class MainActivity extends Activity {
  private static final String PIN = "12345";
  private WebView web;
  private volatile String mode = "menu";
  private volatile boolean pinOk = false;
  private boolean unlocked = false, resumed = false, longPress = false;
  private final Handler h = new Handler();

  public class Bridge {
    @JavascriptInterface public void setMode(final String m) {
      mode = m;
      runOnUiThread(new Runnable() { public void run() {
        setRequestedOrientation("ground".equals(m) ? ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE : ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
        hideSystemUi();
      } });
    }
    /** يتحقق من الرمز هنا (وليس في الصفحة). */
    @JavascriptInterface public boolean tryPin(String code) { pinOk = PIN.equals(code); return pinOk; }
    @JavascriptInterface public boolean isOwner() { return isDeviceOwner(); }
    @JavascriptInterface public void exit(final boolean clearOwner) {
      if (!pinOk) return;
      runOnUiThread(new Runnable() { public void run() { unlockAndExit(clearOwner); } });
    }
    @JavascriptInterface public void pinClosed() { pinOk = false; }
  }

  @Override protected void onCreate(Bundle b) {
    super.onCreate(b);
    requestWindowFeature(Window.FEATURE_NO_TITLE);
    getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON | WindowManager.LayoutParams.FLAG_FULLSCREEN
        | WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED | WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD);
    web = new WebView(this);
    web.setBackgroundColor(Color.BLACK);
    WebSettings s = web.getSettings();
    s.setJavaScriptEnabled(true);
    s.setDomStorageEnabled(true);
    s.setAllowFileAccess(true);
    web.addJavascriptInterface(new Bridge(), "Android");
    web.setWebViewClient(new WebViewClient());
    web.setVerticalScrollBarEnabled(false);
    web.setHorizontalScrollBarEnabled(false);
    web.setOverScrollMode(View.OVER_SCROLL_NEVER);
    web.setLongClickable(false);
    setContentView(web);
    web.loadUrl("file:///android_asset/index.html");
    hideSystemUi();
  }

  // ---------- القفل ----------
  private ComponentName admin() { return new ComponentName(this, AdminReceiver.class); }
  private boolean isDeviceOwner() {
    if (Build.VERSION.SDK_INT < 21) return false;
    DevicePolicyManager dpm = (DevicePolicyManager) getSystemService(Context.DEVICE_POLICY_SERVICE);
    return dpm != null && dpm.isDeviceOwnerApp(getPackageName());
  }
  private void setHome(boolean on) {
    getPackageManager().setComponentEnabledSetting(new ComponentName(this, getPackageName() + ".HomeAlias"),
        on ? PackageManager.COMPONENT_ENABLED_STATE_ENABLED : PackageManager.COMPONENT_ENABLED_STATE_DISABLED, PackageManager.DONT_KILL_APP);
  }
  private void lockIn() {
    unlocked = false;
    setHome(true);
    if (isDeviceOwner()) {
      try {
        DevicePolicyManager dpm = (DevicePolicyManager) getSystemService(Context.DEVICE_POLICY_SERVICE);
        dpm.setLockTaskPackages(admin(), new String[] { getPackageName() });
        if (Build.VERSION.SDK_INT >= 23) dpm.setStatusBarDisabled(admin(), true);
        startLockTask();
      } catch (Exception e) { /* يبقى القفل العادي */ }
    }
  }
  private void unlockAndExit(boolean clearOwner) {
    unlocked = true;
    h.removeCallbacksAndMessages(null);
    if (Build.VERSION.SDK_INT >= 21) { try { stopLockTask(); } catch (Exception e) { /* */ } }
    if (isDeviceOwner()) {
      try {
        DevicePolicyManager dpm = (DevicePolicyManager) getSystemService(Context.DEVICE_POLICY_SERVICE);
        if (Build.VERSION.SDK_INT >= 23) dpm.setStatusBarDisabled(admin(), false);
        if (clearOwner) dpm.clearDeviceOwnerApp(getPackageName());
      } catch (Exception e) { /* */ }
    }
    setHome(false);
    getWindow().getDecorView().setSystemUiVisibility(0);
    try {
      Intent home = new Intent(Intent.ACTION_MAIN);
      home.addCategory(Intent.CATEGORY_HOME);
      home.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      startActivity(home);
    } catch (Exception e) { /* */ }
    if (Build.VERSION.SDK_INT >= 21) finishAndRemoveTask(); else finish();
  }
  private boolean screenOn() {
    PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
    if (pm == null) return true;
    return Build.VERSION.SDK_INT >= 20 ? pm.isInteractive() : pm.isScreenOn();
  }
  private final Runnable bringBack = new Runnable() { public void run() {
    if (unlocked || resumed || isFinishing() || !screenOn()) return;
    Intent i = new Intent(MainActivity.this, MainActivity.class);
    i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
    startActivity(i);
  } };

  private void hideSystemUi() {
    if (unlocked) return;
    int f = View.SYSTEM_UI_FLAG_LAYOUT_STABLE | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
        | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_FULLSCREEN
        | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY;
    getWindow().getDecorView().setSystemUiVisibility(f);
  }

  @Override public void onWindowFocusChanged(boolean has) {
    super.onWindowFocusChanged(has);
    if (has) hideSystemUi();
    else if (!unlocked) {
      // يغلق شريط الإشعارات إذا سُحب (أندرويد القديم)
      try { sendBroadcast(new Intent(Intent.ACTION_CLOSE_SYSTEM_DIALOGS)); } catch (Exception e) { /* */ }
    }
  }
  @Override protected void onResume() { super.onResume(); resumed = true; h.removeCallbacks(bringBack); web.onResume(); lockIn(); hideSystemUi(); }
  @Override protected void onPause() {
    super.onPause(); resumed = false; web.onPause();
    if (!unlocked) { h.postDelayed(bringBack, 350); h.postDelayed(bringBack, 1500); }
  }
  @Override protected void onUserLeaveHint() { super.onUserLeaveHint(); if (!unlocked) h.postDelayed(bringBack, 200); }

  // ---------- زر الرجوع: قصير = رجوع داخل التطبيق، مطوّل = لوحة الرمز ----------
  @Override public boolean onKeyDown(int code, KeyEvent e) {
    if (code == KeyEvent.KEYCODE_BACK) { if (e.getRepeatCount() == 0) { longPress = false; e.startTracking(); } return true; }
    return super.onKeyDown(code, e);
  }
  @Override public boolean onKeyLongPress(int code, KeyEvent e) {
    if (code == KeyEvent.KEYCODE_BACK) { longPress = true; web.loadUrl("javascript:window.vxPin&&window.vxPin()"); return true; }
    return super.onKeyLongPress(code, e);
  }
  @Override public boolean onKeyUp(int code, KeyEvent e) {
    if (code == KeyEvent.KEYCODE_BACK) {
      if (!longPress && !e.isCanceled()) web.loadUrl("javascript:window.vxBack&&window.vxBack()");
      longPress = false;
      return true;
    }
    return super.onKeyUp(code, e);
  }
  @Override public void onBackPressed() { /* لا خروج بالرجوع */ }
}
