"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postRepository = void 0;
const database_1 = require("../config/database");
const TABLE = 'posts';
exports.postRepository = {
    async findList(params) {
        const page = Math.max(1, params.page ?? 1);
        const limit = Math.min(50, Math.max(1, params.limit ?? 20));
        const offset = (page - 1) * limit;
        const conditions = ['1=1'];
        const values = [];
        if (params.locationCode) {
            conditions.push('p.location_code = ?');
            values.push(params.locationCode);
        }
        if (params.status) {
            conditions.push('p.status = ?');
            values.push(params.status);
        }
        if (params.keyword && params.keyword.trim()) {
            conditions.push('(p.title LIKE ? OR p.content LIKE ?)');
            const term = `%${params.keyword.trim()}%`;
            values.push(term, term);
        }
        if (params.userId != null) {
            conditions.push('p.user_id = ?');
            values.push(params.userId);
        }
        const whereClause = conditions.join(' AND ');
        const countSql = `SELECT COUNT(*) AS total FROM ${TABLE} p WHERE ${whereClause}`;
        const countResult = await (0, database_1.query)(countSql, values);
        const total = Number(countResult[0]?.total ?? 0);
        // LIMIT/OFFSET는 검증된 정수만 사용하므로 직접 삽입 (mysql2 + MySQL 8.0.22+ 바인드 버그 회피)
        const limitNum = Number(limit) || 20;
        const offsetNum = Number(offset) || 0;
        const listSql = `
      SELECT p.id, p.title, p.price, p.status, p.category, p.location_name, p.image_urls,
             p.created_at, p.view_count, u.nickname AS user_nickname,
             (SELECT COUNT(*) FROM chat_rooms cr WHERE cr.post_id = p.id) AS chat_count,
             (SELECT COUNT(*) FROM favorites f WHERE f.post_id = p.id) AS favorite_count
      FROM ${TABLE} p
      INNER JOIN users u ON p.user_id = u.id
      WHERE ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT ${limitNum} OFFSET ${offsetNum}
    `;
        const rows = await (0, database_1.query)(listSql, values);
        return { rows: Array.isArray(rows) ? rows : [], total };
    },
    async findListByIds(postIds) {
        if (!Array.isArray(postIds) || postIds.length === 0)
            return [];
        const placeholders = postIds.map(() => '?').join(',');
        const sql = `
      SELECT p.id, p.title, p.price, p.status, p.category, p.location_name, p.image_urls,
             p.created_at, p.view_count, u.nickname AS user_nickname,
             (SELECT COUNT(*) FROM chat_rooms cr WHERE cr.post_id = p.id) AS chat_count,
             (SELECT COUNT(*) FROM favorites f WHERE f.post_id = p.id) AS favorite_count
      FROM ${TABLE} p
      INNER JOIN users u ON p.user_id = u.id
      WHERE p.id IN (${placeholders})
      ORDER BY FIELD(p.id, ${placeholders})
    `;
        const rows = await (0, database_1.query)(sql, [...postIds, ...postIds]);
        return Array.isArray(rows) ? rows : [];
    },
    async findById(id) {
        const sql = `
      SELECT p.id, p.user_id, p.title, p.content, p.price, p.status, p.category,
             p.location_name, p.location_code, p.image_urls, p.view_count,
             p.created_at, p.updated_at, u.nickname AS user_nickname
      FROM ${TABLE} p
      INNER JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `;
        const rows = await (0, database_1.query)(sql, [id]);
        if (!Array.isArray(rows) || rows.length === 0)
            return null;
        return rows[0];
    },
    async incrementViewCount(id) {
        await (0, database_1.query)(`UPDATE ${TABLE} SET view_count = view_count + 1 WHERE id = ?`, [id]);
    },
    async create(data) {
        const result = await (0, database_1.query)(`INSERT INTO ${TABLE} (user_id, title, content, price, status, category, location_name, location_code, image_urls)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            data.user_id,
            data.title,
            data.content,
            data.price,
            data.status,
            data.category,
            data.location_name,
            data.location_code,
            data.image_urls,
        ]);
        const header = result;
        return header.insertId;
    },
    async findUserIdById(id) {
        const rows = await (0, database_1.query)(`SELECT user_id FROM ${TABLE} WHERE id = ? LIMIT 1`, [id]);
        if (!Array.isArray(rows) || rows.length === 0)
            return null;
        return rows[0].user_id;
    },
    async update(id, data) {
        const fields = [];
        const values = [];
        if (data.title !== undefined) {
            fields.push('title = ?');
            values.push(data.title);
        }
        if (data.content !== undefined) {
            fields.push('content = ?');
            values.push(data.content);
        }
        if (data.price !== undefined) {
            fields.push('price = ?');
            values.push(data.price);
        }
        if (data.status !== undefined) {
            fields.push('status = ?');
            values.push(data.status);
        }
        if (data.category !== undefined) {
            fields.push('category = ?');
            values.push(data.category);
        }
        if (data.location_name !== undefined) {
            fields.push('location_name = ?');
            values.push(data.location_name);
        }
        if (data.location_code !== undefined) {
            fields.push('location_code = ?');
            values.push(data.location_code);
        }
        if (data.image_urls !== undefined) {
            fields.push('image_urls = ?');
            values.push(data.image_urls);
        }
        if (fields.length === 0)
            return true;
        values.push(id);
        const sql = `UPDATE ${TABLE} SET ${fields.join(', ')} WHERE id = ?`;
        const result = await (0, database_1.query)(sql, values);
        const header = result;
        return header.affectedRows > 0;
    },
    async delete(id) {
        const result = await (0, database_1.query)(`DELETE FROM ${TABLE} WHERE id = ?`, [id]);
        const header = result;
        return header.affectedRows > 0;
    },
};
//# sourceMappingURL=post.repository.js.map