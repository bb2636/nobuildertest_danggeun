"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.favoriteRepository = void 0;
const database_1 = require("../config/database");
const TABLE = 'favorites';
exports.favoriteRepository = {
    async add(userId, postId) {
        try {
            await (0, database_1.query)(`INSERT INTO ${TABLE} (user_id, post_id) VALUES (?, ?)`, [userId, postId]);
            return true;
        }
        catch {
            return false;
        }
    },
    async remove(userId, postId) {
        const result = await (0, database_1.query)(`DELETE FROM ${TABLE} WHERE user_id = ? AND post_id = ?`, [userId, postId]);
        const header = result;
        return header.affectedRows > 0;
    },
    async exists(userId, postId) {
        const rows = await (0, database_1.query)(`SELECT id FROM ${TABLE} WHERE user_id = ? AND post_id = ? LIMIT 1`, [userId, postId]);
        return Array.isArray(rows) && rows.length > 0;
    },
    async findPostIdsByUserId(userId) {
        const rows = await (0, database_1.query)(`SELECT post_id FROM ${TABLE} WHERE user_id = ? ORDER BY created_at DESC`, [userId]);
        if (!Array.isArray(rows))
            return [];
        return rows.map((r) => r.post_id);
    },
};
//# sourceMappingURL=favorite.repository.js.map