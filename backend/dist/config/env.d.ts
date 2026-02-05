/**
 * NODE_ENV별 설정
 * development: 로컬 개발 (상세 로그, CORS 넓게)
 * production: 배포 (에러만 로그, CORS 제한)
 */
export declare const config: {
    readonly env: string;
    readonly isDevelopment: boolean;
    readonly isProduction: boolean;
    readonly server: {
        readonly port: number;
    };
    readonly db: {
        readonly host: string;
        readonly port: number;
        readonly user: string;
        readonly password: string;
        readonly database: string;
    };
    readonly jwt: {
        readonly secret: string;
        readonly expiresIn: string;
    };
    readonly upload: {
        readonly dir: string;
        readonly maxFileSize: number;
        /** 업로드된 파일의 공개 URL 기준 (응답 url에 사용). 비우면 http://localhost:PORT */
        readonly publicBaseUrl: string;
    };
    readonly cors: {
        /** production에서 허용할 origin (쉼표 구분). 비어 있으면 CORS_ORIGIN 미설정 시 same-origin만 */
        readonly allowedOrigins: string[];
    };
};
//# sourceMappingURL=env.d.ts.map