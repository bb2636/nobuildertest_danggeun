import { query } from '../config/database';

const POSTS_TABLE = 'community_posts';
const COMMENTS_TABLE = 'community_comments';

interface CommunityPostRow {
  id: number;
  user_id: number;
  title: string;
  content: string | null;
  location_name: string | null;
  location_code: string | null;
  created_at: Date;
  updated_at: Date;
  user_nickname: string;
  comment_count: number;
}

export const communityRepository = {
  async findList(params: { locationCode?: string; page?: number; limit?: number; userId?: number; keyword?: string }): Promise<{ rows: CommunityPostRow[]; total: number }> {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(50, Math.max(1, params.limit ?? 20));
    const offset = (page - 1) * limit;
    const conditions: string[] = ['1=1'];
    const values: (string | number)[] = [];
    if (params.locationCode && params.locationCode.trim()) {
      conditions.push('p.location_code = ?');
      values.push(params.locationCode.trim());
    }
    if (params.userId != null) {
      conditions.push('p.user_id = ?');
      values.push(params.userId);
    }
    if (params.keyword && params.keyword.trim()) {
      conditions.push('(p.title LIKE ? OR p.content LIKE ?)');
      const term = `%${params.keyword.trim()}%`;
      values.push(term, term);
    }
    const whereClause = conditions.join(' AND ');
    const countSql = `SELECT COUNT(*) AS total FROM ${POSTS_TABLE} p WHERE ${whereClause}`;
    const countResult = await query<{ total: number }[]>(countSql, values);
    const total = Number(countResult[0]?.total ?? 0);

    const limitNum = Number(limit) || 20;
    const offsetNum = Number(offset) || 0;
    const listSql = `
      SELECT p.id, p.user_id, p.title, p.content, p.location_name, p.location_code,
             p.created_at, p.updated_at, u.nickname AS user_nickname,
             (SELECT COUNT(*) FROM ${COMMENTS_TABLE} c WHERE c.post_id = p.id) AS comment_count
      FROM ${POSTS_TABLE} p
      INNER JOIN users u ON p.user_id = u.id
      WHERE ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT ${limitNum} OFFSET ${offsetNum}
    `;
    const rows = await query<CommunityPostRow[]>(listSql, values);
    return { rows: Array.isArray(rows) ? rows : [], total };
  },

  async findById(id: number): Promise<(CommunityPostRow & { updated_at: Date }) | null> {
    const sql = `
      SELECT p.id, p.user_id, p.title, p.content, p.location_name, p.location_code,
             p.created_at, p.updated_at, u.nickname AS user_nickname,
             (SELECT COUNT(*) FROM ${COMMENTS_TABLE} c WHERE c.post_id = p.id) AS comment_count
      FROM ${POSTS_TABLE} p
      INNER JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `;
    const rows = await query<(CommunityPostRow & { updated_at: Date })[]>(sql, [id]);
    if (!Array.isArray(rows) || rows.length === 0) return null;
    return rows[0];
  },

  async create(data: {
    user_id: number;
    title: string;
    content: string | null;
    location_name: string | null;
    location_code: string | null;
  }): Promise<number> {
    const result = await query<{ insertId: number }>(
      `INSERT INTO ${POSTS_TABLE} (user_id, title, content, location_name, location_code)
       VALUES (?, ?, ?, ?, ?)`,
      [data.user_id, data.title, data.content, data.location_name, data.location_code]
    );
    const header = result as unknown as { insertId: number };
    return header.insertId;
  },

  async update(id: number, data: { title?: string; content?: string | null }): Promise<boolean> {
    const updates: string[] = [];
    const values: (string | number)[] = [];
    if (data.title !== undefined) {
      updates.push('title = ?');
      values.push(data.title);
    }
    if (data.content !== undefined) {
      updates.push('content = ?');
      values.push(data.content);
    }
    if (updates.length === 0) return true;
    values.push(id);
    const result = await query<{ affectedRows: number }>(
      `UPDATE ${POSTS_TABLE} SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    const header = result as unknown as { affectedRows: number };
    return (header?.affectedRows ?? 0) > 0;
  },

  async delete(id: number): Promise<boolean> {
    const result = await query<{ affectedRows: number }>(`DELETE FROM ${POSTS_TABLE} WHERE id = ?`, [id]);
    const header = result as unknown as { affectedRows: number };
    return (header?.affectedRows ?? 0) > 0;
  },

  async findUserIdByPostId(postId: number): Promise<number | null> {
    const rows = await query<{ user_id: number }[]>(
      `SELECT user_id FROM ${POSTS_TABLE} WHERE id = ? LIMIT 1`,
      [postId]
    );
    if (!Array.isArray(rows) || rows.length === 0) return null;
    return rows[0].user_id;
  },

  async findCommentsByPostId(postId: number, limit: number): Promise<{ id: number; user_id: number; nickname: string; content: string; created_at: Date }[]> {
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 50));
    const sql = `
      SELECT c.id, c.user_id, u.nickname, c.content, c.created_at
      FROM ${COMMENTS_TABLE} c
      INNER JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
      LIMIT ${limitNum}
    `;
    const rows = await query<{ id: number; user_id: number; nickname: string; content: string; created_at: Date }[]>(sql, [postId]);
    return Array.isArray(rows) ? rows : [];
  },

  async createComment(postId: number, userId: number, content: string): Promise<number> {
    const result = await query<{ insertId: number }>(
      `INSERT INTO ${COMMENTS_TABLE} (post_id, user_id, content) VALUES (?, ?, ?)`,
      [postId, userId, content]
    );
    const header = result as unknown as { insertId: number };
    return header.insertId;
  },

  async findCommentsByUserId(
    userId: number,
    limit: number,
    offset: number
  ): Promise<{ id: number; post_id: number; post_title: string; content: string; created_at: Date }[]> {
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 50));
    const offsetNum = Math.max(0, Number(offset) || 0);
    const sql = `
      SELECT c.id, c.post_id, p.title AS post_title, c.content, c.created_at
      FROM ${COMMENTS_TABLE} c
      INNER JOIN ${POSTS_TABLE} p ON p.id = c.post_id
      WHERE c.user_id = ?
      ORDER BY c.created_at DESC
      LIMIT ${limitNum} OFFSET ${offsetNum}
    `;
    const rows = await query<{ id: number; post_id: number; post_title: string; content: string; created_at: Date }[]>(sql, [userId]);
    return Array.isArray(rows) ? rows : [];
  },

  async countCommentsByUserId(userId: number): Promise<number> {
    const rows = await query<{ total: number }[]>(
      `SELECT COUNT(*) AS total FROM ${COMMENTS_TABLE} WHERE user_id = ?`,
      [userId]
    );
    return Array.isArray(rows) && rows[0] ? Number(rows[0].total) : 0;
  },

  /** 내 게시글에 다른 사람이 달린 댓글 수 (알림용). 읽음 처리한 시각 이후만 카운트 */
  async countCommentsOnMyPostsByOthers(userId: number): Promise<number> {
    const rows = await query<{ total: number }[]>(
      `SELECT COUNT(*) AS total FROM ${COMMENTS_TABLE} c
       INNER JOIN ${POSTS_TABLE} p ON p.id = c.post_id
       LEFT JOIN community_notification_read r ON r.user_id = ?
       WHERE p.user_id = ? AND c.user_id != ?
         AND (r.read_at IS NULL OR c.created_at > r.read_at)`,
      [userId, userId, userId]
    );
    return Array.isArray(rows) && rows[0] ? Number(rows[0].total) : 0;
  },

  /** 동네생활 알림 확인 처리 (이후 댓글은 읽은 것으로 간주) */
  async markCommunityNotificationsRead(userId: number): Promise<void> {
    await query(
      `INSERT INTO community_notification_read (user_id, read_at) VALUES (?, NOW())
       ON DUPLICATE KEY UPDATE read_at = NOW()`,
      [userId]
    );
  },

  async findCommentById(commentId: number): Promise<{ id: number; user_id: number; nickname: string; content: string; created_at: Date } | null> {
    const rows = await query<{ id: number; user_id: number; nickname: string; content: string; created_at: Date }[]>(
      `SELECT c.id, c.user_id, u.nickname, c.content, c.created_at
       FROM ${COMMENTS_TABLE} c
       INNER JOIN users u ON c.user_id = u.id
       WHERE c.id = ? LIMIT 1`,
      [commentId]
    );
    if (!Array.isArray(rows) || rows.length === 0) return null;
    return rows[0];
  },
};
