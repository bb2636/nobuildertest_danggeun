"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = void 0;
const database_1 = require("../config/database");
const TABLE = 'users';
exports.userRepository = {
    async findByEmail(email) {
        const rows = await (0, database_1.query)(`SELECT * FROM ${TABLE} WHERE email = ? LIMIT 1`, [email]);
        return rows && rows.length > 0 ? rows[0] : null;
    },
    async findById(id) {
        const rows = await (0, database_1.query)(`SELECT * FROM ${TABLE} WHERE id = ? LIMIT 1`, [id]);
        return rows && rows.length > 0 ? rows[0] : null;
    },
    async create(data) {
        const result = await (0, database_1.query)(`INSERT INTO ${TABLE} (email, password, nickname, location_name, location_code)
       VALUES (?, ?, ?, ?, ?)`, [
            data.email,
            data.password,
            data.nickname,
            data.location_name ?? null,
            data.location_code ?? null,
        ]);
        const header = result;
        return header.insertId;
    },
    async update(userId, data) {
        const updates = [];
        const values = [];
        if (data.nickname !== undefined) {
            updates.push('nickname = ?');
            values.push(data.nickname);
        }
        if (data.location_name !== undefined) {
            updates.push('location_name = ?');
            values.push(data.location_name);
        }
        if (data.location_code !== undefined) {
            updates.push('location_code = ?');
            values.push(data.location_code);
        }
        if (data.profile_image_url !== undefined) {
            updates.push('profile_image_url = ?');
            values.push(data.profile_image_url);
        }
        if (updates.length === 0)
            return true;
        values.push(userId);
        const result = await (0, database_1.query)(`UPDATE ${TABLE} SET ${updates.join(', ')} WHERE id = ?`, values);
        const header = result;
        return (header?.affectedRows ?? 0) > 0;
    },
};
//# sourceMappingURL=user.repository.js.map