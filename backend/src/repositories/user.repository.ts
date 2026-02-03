import { query } from '../config/database';
import { UserWithPassword } from '../types';

const TABLE = 'users';

export const userRepository = {
  async findByEmail(email: string): Promise<UserWithPassword | null> {
    const rows = await query<(UserWithPassword & { password: string })[]>(
      `SELECT * FROM ${TABLE} WHERE email = ? LIMIT 1`,
      [email]
    );
    return rows && rows.length > 0 ? rows[0] : null;
  },

  async findById(id: number): Promise<UserWithPassword | null> {
    const rows = await query<(UserWithPassword & { password: string })[]>(
      `SELECT * FROM ${TABLE} WHERE id = ? LIMIT 1`,
      [id]
    );
    return rows && rows.length > 0 ? rows[0] : null;
  },

  async create(data: {
    email: string;
    password: string;
    nickname: string;
    location_name?: string;
    location_code?: string;
  }): Promise<number> {
    const result = await query<{ insertId: number }>(
      `INSERT INTO ${TABLE} (email, password, nickname, location_name, location_code)
       VALUES (?, ?, ?, ?, ?)`,
      [
        data.email,
        data.password,
        data.nickname,
        data.location_name ?? null,
        data.location_code ?? null,
      ]
    );
    const header = result as unknown as { insertId: number };
    return header.insertId;
  },

  async update(
    userId: number,
    data: {
      nickname?: string;
      location_name?: string | null;
      location_code?: string | null;
      profile_image_url?: string | null;
    }
  ): Promise<boolean> {
    const updates: string[] = [];
    const values: (string | number | null)[] = [];
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
    if (updates.length === 0) return true;
    values.push(userId);
    const result = await query<{ affectedRows: number }>(
      `UPDATE ${TABLE} SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    const header = result as unknown as { affectedRows: number };
    return (header?.affectedRows ?? 0) > 0;
  },
};
