import mysql from 'mysql2/promise';
declare const pool: mysql.Pool;
export declare function query<T = unknown>(sql: string, params?: unknown[]): Promise<T>;
/** 헬스체크용: DB 연결 가능 여부 */
export declare function ping(): Promise<boolean>;
export default pool;
//# sourceMappingURL=database.d.ts.map