"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = query;
exports.ping = ping;
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
const env_1 = require("./env");
dotenv_1.default.config();
const pool = promise_1.default.createPool({
    host: env_1.config.db.host,
    port: env_1.config.db.port,
    user: env_1.config.db.user,
    password: env_1.config.db.password,
    database: env_1.config.db.database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4',
});
async function query(sql, params) {
    const [rows] = await pool.execute(sql, params);
    return rows;
}
/** 헬스체크용: DB 연결 가능 여부 */
async function ping() {
    try {
        const conn = await pool.getConnection();
        conn.release();
        return true;
    }
    catch {
        return false;
    }
}
exports.default = pool;
//# sourceMappingURL=database.js.map