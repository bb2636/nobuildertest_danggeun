import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { config } from './env';

dotenv.config();

const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
});

export async function query<T = unknown>(sql: string, params?: unknown[]): Promise<T> {
  const [rows] = await pool.execute(sql, params);
  return rows as T;
}

/** 헬스체크용: DB 연결 가능 여부 */
export async function ping(): Promise<boolean> {
  try {
    const conn = await pool.getConnection();
    conn.release();
    return true;
  } catch {
    return false;
  }
}

export default pool;
