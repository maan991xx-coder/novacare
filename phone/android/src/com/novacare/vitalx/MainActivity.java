package com.novacare.vitalx;

import android.app.Activity;
import android.content.pm.ActivityInfo;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/**
 * VITALX للهاتف: شاشة اختيار، ثم ساعة الرائد (عمودي) أو لوحة الأرض (أفقي).
 * ملء الشاشة بالكامل: لا شريط علوي ولا أزرار نظام. زر الرجوع: من الواجهة إلى شاشة الاختيار، ومن شاشة الاختيار خروج.
 */
public class MainActivity extends Activity {
  private WebView web;
  private volatile String mode = "menu";

  public class Bridge {
    @JavascriptInterface public void setMode(final String m) {
      mode = m;
      runOnUiThread(new Runnable() { public void run() {
        setRequestedOrientation("ground".equals(m) ? ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE : ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
        hideSystemUi();
      } });
    }
  }

  @Override protected void onCreate(Bundle b) {
    super.onCreate(b);
    requestWindowFeature(Window.FEATURE_NO_TITLE);
    getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON | WindowManager.LayoutParams.FLAG_FULLSCREEN);
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
    setContentView(web);
    web.loadUrl("file:///android_asset/index.html");
    hideSystemUi();
  }

  private void hideSystemUi() {
    int f = View.SYSTEM_UI_FLAG_LAYOUT_STABLE | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
        | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_FULLSCREEN
        | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY;
    getWindow().getDecorView().setSystemUiVisibility(f);
  }

  @Override public void onWindowFocusChanged(boolean has) { super.onWindowFocusChanged(has); if (has) hideSystemUi(); }
  @Override protected void onResume() { super.onResume(); web.onResume(); hideSystemUi(); }
  @Override protected void onPause() { super.onPause(); web.onPause(); }

  @Override public void onBackPressed() {
    if ("menu".equals(mode)) { finish(); return; }
    mode = "menu";
    web.loadUrl("javascript:window.vxBack&&window.vxBack()");
  }
}
