import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        host: true, // LAN 접근 허용 (예: http://172.30.1.82:5173)
        // 백엔드가 꺼져 있으면 ws proxy error (ECONNREFUSED) 발생 → 백엔드 실행 필요 (기본 3001 포트)
        proxy: {
            '/api': {
                target: 'http://localhost:3001',
                changeOrigin: true,
            },
            '/socket.io': {
                target: 'http://localhost:3001',
                ws: true,
            },
        },
    },
});
