import { query } from '../config/database';
import { PostListQueryDto } from '../dto/post.dto';
import { PostStatus } from '../types';

const TABLE = 'posts';

interface PostListRow {
  id: number;
  title: string;
  price: number | null;
  status: PostStatus;
  category: string | null;
  location_name: string | null;
  image_urls: string | null;
  created_at: Date;
  view_count: number;
  user_nickname: string;
}

export const postRepository = {
  async findList(params: PostListQueryDto): Promise<{ rows: PostListRow[]; total: number }> {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(50, Math.max(1, params.limit ?? 20));
    const offset = (page - 1) * limit;

    const conditions: string[] = ['1=1'];
    const values: (string | number)[] = [];

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

    const whereClause = conditions.join(' AND ');
    const countSql = `SELECT COUNT(*) AS total FROM ${TABLE} p WHERE ${whereClause}`;
    const countResult = await query<{ total: number }[]>(countSql, values);
    const total = Number(countResult[0]?.total ?? 0);

    const listSql = `
      SELECT p.id, p.title, p.price, p.status, p.category, p.location_name, p.image_urls,
             p.created_at, p.view_count, u.nickname AS user_nickname
      FROM ${TABLE} p
      INNER JOIN users u ON p.user_id = u.id
      WHERE ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const rows = await query<PostListRow[]>(listSql, [...values, limit, offset]);

    return { rows: Array.isArray(rows) ? rows : [], total };
  },

  async findListByIds(postIds: number[]): Promise<PostListRow[]> {
    if (!Array.isArray(postIds) || postIds.length === 0) return [];
    const placeholders = postIds.map(() => '?').join(',');
    const sql = `
      SELECT p.id, p.title, p.price, p.status, p.category, p.location_name, p.image_urls,
             p.created_at, p.view_count, u.nickname AS user_nickname
      FROM ${TABLE} p
      INNER JOIN users u ON p.user_id = u.id
      WHERE p.id IN (${placeholders})
      ORDER BY FIELD(p.id, ${placeholders})
    `;
    const rows = await query<PostListRow[]>(sql, [...postIds, ...postIds]);
    return Array.isArray(rows) ? rows : [];
  },

  async findById(id: number): Promise<PostDetailRow | null> {
    const sql = `
      SELECT p.id, p.user_id, p.title, p.content, p.price, p.status, p.category,
             p.location_name, p.location_code, p.image_urls, p.view_count,
             p.created_at, p.updated_at, u.nickname AS user_nickname
      FROM ${TABLE} p
      INNER JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `;
    const rows = await query<PostDetailRow[]>(sql, [id]);
    if (!Array.isArray(rows) || rows.length === 0) return null;
    return rows[0];
  },

  async incrementViewCount(id: number): Promise<void> {
    await query(`UPDATE ${TABLE} SET view_count = view_count + 1 WHERE id = ?`, [id]);
  },

  async create(data: {
    user_id: number;
    title: string;
    content: string | null;
    price: number | null;
    status: PostStatus;
    category: string | null;
    location_name: string | null;
    location_code: string | null;
    image_urls: string | null;
  }): Promise<number> {
    const result = await query<{ insertId: number }>(
      `INSERT INTO ${TABLE} (user_id, title, content, price, status, category, location_name, location_code, image_urls)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.user_id,
        data.title,
        data.content,
        data.price,
        data.status,
        data.category,
        data.location_name,
        data.location_code,
        data.image_urls,
      ]
    );
    const header = result as unknown as { insertId: number };
    return header.insertId;
  },

  async findUserIdById(id: number): Promise<number | null> {
    const rows = await query<{ user_id: number }[]>(
      `SELECT user_id FROM ${TABLE} WHERE id = ? LIMIT 1`,
      [id]
    );
    if (!Array.isArray(rows) || rows.length === 0) return null;
    return rows[0].user_id;
  },

  async update(
    id: number,
    data: {
      title?: string;
      content?: string | null;
      price?: number | null;
      status?: PostStatus;
      category?: string | null;
      location_name?: string | null;
      location_code?: string | null;
      image_urls?: string | null;
    }
  ): Promise<boolean> {
    const fields: string[] = [];
    const values: unknown[] = [];
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
    if (fields.length === 0) return true;
    values.push(id);
    const sql = `UPDATE ${TABLE} SET ${fields.join(', ')} WHERE id = ?`;
    const result = await query<{ affectedRows: number }>(sql, values);
    const header = result as unknown as { affectedRows: number };
    return header.affectedRows > 0;
  },

  async delete(id: number): Promise<boolean> {
    const result = await query<{ affectedRows: number }>(`DELETE FROM ${TABLE} WHERE id = ?`, [id]);
    const header = result as unknown as { affectedRows: number };
    return header.affectedRows > 0;
  },
};

interface PostDetailRow {
  id: number;
  user_id: number;
  title: string;
  content: string | null;
  price: number | null;
  status: PostStatus;
  category: string | null;
  location_name: string | null;
  location_code: string | null;
  image_urls: string | null;
  view_count: number;
  created_at: Date;
  updated_at: Date;
  user_nickname: string;
}
