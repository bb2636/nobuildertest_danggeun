import { query } from '../config/database';

const TABLE = 'favorites';

export const favoriteRepository = {
  async add(userId: number, postId: number): Promise<boolean> {
    try {
      await query(
        `INSERT INTO ${TABLE} (user_id, post_id) VALUES (?, ?)`,
        [userId, postId]
      );
      return true;
    } catch {
      return false;
    }
  },

  async remove(userId: number, postId: number): Promise<boolean> {
    const result = await query<{ affectedRows: number }>(
      `DELETE FROM ${TABLE} WHERE user_id = ? AND post_id = ?`,
      [userId, postId]
    );
    const header = result as unknown as { affectedRows: number };
    return header.affectedRows > 0;
  },

  async exists(userId: number, postId: number): Promise<boolean> {
    const rows = await query<{ id: number }[]>(
      `SELECT id FROM ${TABLE} WHERE user_id = ? AND post_id = ? LIMIT 1`,
      [userId, postId]
    );
    return Array.isArray(rows) && rows.length > 0;
  },

  async findPostIdsByUserId(userId: number): Promise<number[]> {
    const rows = await query<{ post_id: number }[]>(
      `SELECT post_id FROM ${TABLE} WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );
    if (!Array.isArray(rows)) return [];
    return rows.map((r) => r.post_id);
  },
};
