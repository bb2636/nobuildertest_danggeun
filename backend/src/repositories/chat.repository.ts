import { query } from '../config/database';

export const chatRepository = {
  async findRoomByPostAndMembers(postId: number, userId1: number, userId2: number): Promise<number | null> {
    const rows = await query<{ id: number }[]>(
      `SELECT r.id FROM chat_rooms r
       INNER JOIN chat_room_members m1 ON m1.room_id = r.id AND m1.user_id = ?
       INNER JOIN chat_room_members m2 ON m2.room_id = r.id AND m2.user_id = ?
       WHERE r.post_id = ?
       LIMIT 1`,
      [userId1, userId2, postId]
    );
    if (!Array.isArray(rows) || rows.length === 0) return null;
    return rows[0].id;
  },

  async createRoom(postId: number): Promise<number> {
    const result = await query<{ insertId: number }>(
      `INSERT INTO chat_rooms (post_id) VALUES (?)`,
      [postId]
    );
    const header = result as unknown as { insertId: number };
    return header.insertId;
  },

  async addMember(roomId: number, userId: number): Promise<void> {
    await query(
      `INSERT INTO chat_room_members (room_id, user_id) VALUES (?, ?)`,
      [roomId, userId]
    );
  },

  async isMember(roomId: number, userId: number): Promise<boolean> {
    const rows = await query<{ id: number }[]>(
      `SELECT id FROM chat_room_members WHERE room_id = ? AND user_id = ? LIMIT 1`,
      [roomId, userId]
    );
    return Array.isArray(rows) && rows.length > 0;
  },

  async getMemberUserIds(roomId: number): Promise<number[]> {
    const rows = await query<{ user_id: number }[]>(
      `SELECT user_id FROM chat_room_members WHERE room_id = ?`,
      [roomId]
    );
    if (!Array.isArray(rows)) return [];
    return rows.map((r) => r.user_id);
  },

  async findRoomsByUserId(userId: number): Promise<{ roomId: number; postId: number; postTitle: string; postImageUrl: string | null; postPrice: number | null; postStatus: string; otherNickname: string; otherUserId: number; lastMessage: string | null; lastAt: Date | null }[]> {
    const rows = await query<{ room_id: number; post_id: number; post_title: string; post_image_urls: string | null; post_price: number | null; post_status: string; other_nickname: string; other_user_id: number; last_content: string | null; last_at: Date | null }[]>(
      `SELECT r.id AS room_id, r.post_id, p.title AS post_title, p.image_urls AS post_image_urls,
              p.price AS post_price, p.status AS post_status,
              u.nickname AS other_nickname, u.id AS other_user_id,
              (SELECT content FROM chat_messages WHERE room_id = r.id ORDER BY created_at DESC LIMIT 1) AS last_content,
              (SELECT created_at FROM chat_messages WHERE room_id = r.id ORDER BY created_at DESC LIMIT 1) AS last_at
       FROM chat_rooms r
       INNER JOIN chat_room_members me ON me.room_id = r.id AND me.user_id = ?
       INNER JOIN chat_room_members other ON other.room_id = r.id AND other.user_id != ?
       INNER JOIN users u ON u.id = other.user_id
       INNER JOIN posts p ON p.id = r.post_id
       ORDER BY last_at DESC, r.id DESC`,
      [userId, userId]
    );
    if (!Array.isArray(rows)) return [];
    return rows.map((row) => {
      let postImageUrl: string | null = null;
      if (row.post_image_urls) {
        try {
          const arr = JSON.parse(row.post_image_urls);
          if (Array.isArray(arr) && arr[0]) postImageUrl = arr[0];
        } catch {
          // ignore
        }
      }
      return {
        roomId: row.room_id,
        postId: row.post_id,
        postTitle: row.post_title,
        postImageUrl,
        postPrice: row.post_price,
        postStatus: row.post_status,
        otherNickname: row.other_nickname,
        otherUserId: row.other_user_id,
        lastMessage: row.last_content,
        lastAt: row.last_at,
      };
    });
  },

  async findRoomByIdWithPost(roomId: number, userId: number): Promise<{ roomId: number; postId: number; postTitle: string; postImageUrl: string | null; postPrice: number | null; postStatus: string; otherNickname: string; otherUserId: number } | null> {
    const rows = await query<{ room_id: number; post_id: number; post_title: string; post_image_urls: string | null; post_price: number | null; post_status: string; other_nickname: string; other_user_id: number }[]>(
      `SELECT r.id AS room_id, r.post_id, p.title AS post_title, p.image_urls AS post_image_urls,
              p.price AS post_price, p.status AS post_status,
              u.nickname AS other_nickname, u.id AS other_user_id
       FROM chat_rooms r
       INNER JOIN chat_room_members me ON me.room_id = r.id AND me.user_id = ?
       INNER JOIN chat_room_members other ON other.room_id = r.id AND other.user_id != ?
       INNER JOIN users u ON u.id = other.user_id
       INNER JOIN posts p ON p.id = r.post_id
       WHERE r.id = ?
       LIMIT 1`,
      [userId, userId, roomId]
    );
    if (!Array.isArray(rows) || rows.length === 0) return null;
    const row = rows[0];
    let postImageUrl: string | null = null;
    if (row.post_image_urls) {
      try {
        const arr = JSON.parse(row.post_image_urls);
        if (Array.isArray(arr) && arr[0]) postImageUrl = arr[0];
      } catch {
        // ignore
      }
    }
    return {
      roomId: row.room_id,
      postId: row.post_id,
      postTitle: row.post_title,
      postImageUrl,
      postPrice: row.post_price,
      postStatus: row.post_status,
      otherNickname: row.other_nickname,
      otherUserId: row.other_user_id,
    };
  },

  async findMessages(roomId: number, limit: number, beforeId?: number): Promise<{ id: number; userId: number; nickname: string; content: string; createdAt: Date }[]> {
    let sql = `
      SELECT m.id, m.user_id, u.nickname, m.content, m.created_at
      FROM chat_messages m
      INNER JOIN users u ON u.id = m.user_id
      WHERE m.room_id = ?
    `;
    const params: (number | undefined)[] = [roomId];
    if (beforeId != null) {
      sql += ` AND m.id < ?`;
      params.push(beforeId);
    }
    sql += ` ORDER BY m.id DESC LIMIT ?`;
    params.push(limit);
    const rows = await query<{ id: number; user_id: number; nickname: string; content: string; created_at: Date }[]>(sql, params);
    if (!Array.isArray(rows)) return [];
    return rows.reverse().map((row) => ({
      id: row.id,
      userId: row.user_id,
      nickname: row.nickname,
      content: row.content,
      createdAt: row.created_at,
    }));
  },

  async createMessage(roomId: number, userId: number, content: string): Promise<number> {
    const result = await query<{ insertId: number }>(
      `INSERT INTO chat_messages (room_id, user_id, content) VALUES (?, ?, ?)`,
      [roomId, userId, content]
    );
    const header = result as unknown as { insertId: number };
    return header.insertId;
  },

  async findMessageById(messageId: number): Promise<{ id: number; userId: number; nickname: string; content: string; createdAt: Date } | null> {
    const rows = await query<{ id: number; user_id: number; nickname: string; content: string; created_at: Date }[]>(
      `SELECT m.id, m.user_id, u.nickname, m.content, m.created_at
       FROM chat_messages m
       INNER JOIN users u ON u.id = m.user_id
       WHERE m.id = ? LIMIT 1`,
      [messageId]
    );
    if (!Array.isArray(rows) || rows.length === 0) return null;
    const row = rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      nickname: row.nickname,
      content: row.content,
      createdAt: row.created_at,
    };
  },
};
