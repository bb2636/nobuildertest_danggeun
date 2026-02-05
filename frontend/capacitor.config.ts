import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.danggeun.clone',
  appName: '당근마켓 클론',
  webDir: 'dist',
  server: {
    // 앱에서 API 요청 시 실제 백엔드 주소 (개발 시 localhost 대신 본인 PC IP 등 사용)
    // android: 'http://10.0.2.2:3001' (에뮬레이터)
    // android: 'http://YOUR_IP:3001' (실기기)
  },
}

export default config
