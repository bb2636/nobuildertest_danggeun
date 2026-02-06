package com.danggeun.clone;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    // capacitor:// 에서 http:// API 요청 허용 (개발용, 폰에서 노트북 백엔드 접속)
    applyMixedContentAllow();
    new Handler(Looper.getMainLooper()).postDelayed(this::applyMixedContentAllow, 300);
  }

  private void applyMixedContentAllow() {
    Bridge bridge = getBridge();
    if (bridge != null) {
      WebView webView = bridge.getWebView();
      if (webView != null && webView.getSettings() != null) {
        webView.getSettings().setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
      }
    }
  }
}
