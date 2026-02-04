import { query } from '../config/database';
import { postRepository } from './post.repository';

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

  /** 상대가 보낸 메시지가 마지막이고, 아직 읽지 않은 방 개수 (알림용) */
  async countRoomsWithLastMessageFromOther(userId: number): Promise<number> {
    const rows = await query<{ room_id: number; last_sender_id: number | null; last_msg_id: number | null; last_read_message_id: number | null }[]>(
      `SELECT r.id AS room_id,
              (SELECT user_id FROM chat_messages WHERE room_id = r.id ORDER BY created_at DESC LIMIT 1) AS last_sender_id,
              (SELECT id FROM chat_messages WHERE room_id = r.id ORDER BY created_at DESC LIMIT 1) AS last_msg_id,
              m.last_read_message_id
       FROM chat_rooms r
       INNER JOIN chat_room_members m ON m.room_id = r.id AND m.user_id = ?`,
      [userId]
    );
    if (!Array.isArray(rows)) return 0;
    return rows.filter((row) => {
      if (row.last_sender_id == null || Number(row.last_sender_id) === Number(userId)) return false;
      const lastMsgId = row.last_msg_id != null ? Number(row.last_msg_id) : 0;
      const lastRead = row.last_read_message_id != null ? Number(row.last_read_message_id) : 0;
      return lastMsgId > lastRead;
    }).length;
  },

  /** 해당 방의 메시지 읽음 처리 (마지막 메시지 ID로 갱신) */
  async markRoomAsRead(roomId: number, userId: number): Promise<void> {
    const maxRows = await query<{ max_id: number }[]>(
      `SELECT COALESCE(MAX(id), 0) AS max_id FROM chat_messages WHERE room_id = ?`,
      [roomId]
    );
    const maxId = Array.isArray(maxRows) && maxRows[0] ? Number(maxRows[0].max_id) : 0;
    await query(
      `UPDATE chat_room_members SET last_read_message_id = ? WHERE room_id = ? AND user_id = ?`,
      [maxId || null, roomId, userId]
    );
  },

  async findRoomsByUserId(userId: number): Promise<{ roomId: number; postId: number; postTitle: string; postImageUrl: string | null; postPrice: number | null; postStatus: string; otherNickname: string; otherUserId: number; lastMessage: string | null; lastAt: Date | null; unreadCount: number }[]> {
    const baseSql = `SELECT r.id AS room_id, r.post_id, p.title AS post_title, p.image_urls AS post_image_urls,
              p.price AS post_price, p.status AS post_status,
              u.nickname AS other_nickname, u.id AS other_user_id,
              (SELECT content FROM chat_messages WHERE room_id = r.id ORDER BY created_at DESC LIMIT 1) AS last_content,
              (SELECT created_at FROM chat_messages WHERE room_id = r.id ORDER BY created_at DESC LIMIT 1) AS last_at`;
    const withUnread = ` (SELECT COUNT(*) FROM chat_messages msg
               WHERE msg.room_id = r.id AND msg.user_id != ?
                 AND (me.last_read_message_id IS NULL OR msg.id > me.last_read_message_id)) AS unread_count`;
    const fromPart = ` FROM chat_rooms r
       INNER JOIN chat_room_members me ON me.room_id = r.id AND me.user_id = ?
       INNER JOIN chat_room_members other ON other.room_id = r.id AND other.user_id != ?
       INNER JOIN users u ON u.id = other.user_id
       INNER JOIN posts p ON p.id = r.post_id
       ORDER BY last_at DESC, r.id DESC`;

    let rows: { room_id: number; post_id: number; post_title: string; post_image_urls: string | null; post_price: number | null; post_status: string; other_nickname: string; other_user_id: number; last_content: string | null; last_at: Date | null; unread_count?: number }[];
    try {
      rows = await query<(typeof rows)[0][]>(
        baseSql + ',' + withUnread + fromPart,
        [userId, userId, userId]
      );
    } catch {
      rows = await query<(typeof rows)[0][]>(baseSql + fromPart, [userId, userId]);
    }
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
        unreadCount: Number(row.unread_count ?? 0),
      };
    });
  },

  async findRoomByIdWithPost(roomId: number, userId: number): Promise<{ roomId: number; postId: number; postTitle: string; postImageUrl: string | null; postPrice: number | null; postStatus: string; postOwnerId: number; otherNickname: string; otherUserId: number } | null> {
    const rows = await query<{ room_id: number; post_id: number; post_title: string; post_image_urls: string | null; post_price: number | null; post_status: string; post_owner_id: number; other_nickname: string; other_user_id: number }[]>(
      `SELECT r.id AS room_id, r.post_id, p.title AS post_title, p.image_urls AS post_image_urls,
              p.price AS post_price, p.status AS post_status, p.user_id AS post_owner_id,
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
      postOwnerId: row.post_owner_id,
      otherNickname: row.other_nickname,
      otherUserId: row.other_user_id,
    };
  },

  /** 채팅방 나가기: 멤버에서 제거 */
  async removeMember(roomId: number, userId: number): Promise<void> {
    await query(
      `DELETE FROM chat_room_members WHERE room_id = ? AND user_id = ?`,
      [roomId, userId]
    );
  },

  /** 해당 게시글에 대한 채팅방 목록 (판매자는 모든 방, 구매자는 본인 참여 방만) */
  async findRoomsByPostId(postId: number, userId: number): Promise<{ roomId: number; otherNickname: string; otherUserId: number; lastMessage: string | null; lastAt: Date | null }[]> {
    const postOwnerId = await postRepository.findUserIdById(postId);
    if (!postOwnerId) return [];
    const isPostOwner = Number(postOwnerId) === Number(userId);
    if (isPostOwner) {
      const rows = await query<{ room_id: number; other_nickname: string; other_user_id: number; last_content: string | null; last_at: Date | null }[]>(
        `SELECT r.id AS room_id, u.nickname AS other_nickname, u.id AS other_user_id,
                (SELECT content FROM chat_messages WHERE room_id = r.id ORDER BY created_at DESC LIMIT 1) AS last_content,
                (SELECT created_at FROM chat_messages WHERE room_id = r.id ORDER BY created_at DESC LIMIT 1) AS last_at
         FROM chat_rooms r
         INNER JOIN chat_room_members m ON m.room_id = r.id AND m.user_id != ?
         INNER JOIN users u ON u.id = m.user_id
         WHERE r.post_id = ?
         ORDER BY last_at DESC, r.id DESC`,
        [userId, postId]
      );
      if (!Array.isArray(rows)) return [];
      return rows.map((row) => ({
        roomId: row.room_id,
        otherNickname: row.other_nickname,
        otherUserId: row.other_user_id,
        lastMessage: row.last_content,
        lastAt: row.last_at,
      }));
    }
    const roomId = await this.findRoomByPostAndMembers(postId, userId, postOwnerId);
    if (roomId == null) return [];
    const rows = await query<{ other_nickname: string; other_user_id: number; last_content: string | null; last_at: Date | null }[]>(
      `SELECT u.nickname AS other_nickname, u.id AS other_user_id,
              (SELECT content FROM chat_messages WHERE room_id = r.id ORDER BY created_at DESC LIMIT 1) AS last_content,
              (SELECT created_at FROM chat_messages WHERE room_id = r.id ORDER BY created_at DESC LIMIT 1) AS last_at
       FROM chat_rooms r
       INNER JOIN chat_room_members m ON m.room_id = r.id AND m.user_id != ?
       INNER JOIN users u ON u.id = m.user_id
       WHERE r.id = ? LIMIT 1`,
      [userId, roomId]
    );
    if (!Array.isArray(rows) || rows.length === 0) return [];
    return [{ roomId, otherNickname: rows[0].other_nickname, otherUserId: rows[0].other_user_id, lastMessage: rows[0].last_content, lastAt: rows[0].last_at }];
  },

  async findMessages(roomId: number, limit: number, beforeId?: number): Promise<{ id: number; userId: number; nickname: string; content: string; messageType: string; createdAt: Date }[]> {
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 50));
    const hasType = await this._chatMessagesHasTypeColumn();
    const typeSelect = hasType ? 'm.message_type' : "'text' AS message_type";
    let sql = `
      SELECT m.id, m.user_id, u.nickname, m.content, ${typeSelect} AS message_type, m.created_at
      FROM chat_messages m
      INNER JOIN users u ON u.id = m.user_id
      WHERE m.room_id = ?
    `;
    const params: number[] = [roomId];
    if (beforeId != null && Number.isInteger(beforeId) && beforeId >= 1) {
      sql += ` AND m.id < ?`;
      params.push(beforeId);
    }
    sql += ` ORDER BY m.id DESC LIMIT ${limitNum}`;
    const rows = await query<{ id: number; user_id: number; nickname: string; content: string; message_type: string; created_at: Date }[]>(sql, params);
    if (!Array.isArray(rows)) return [];
    return rows.reverse().map((row) => ({
      id: row.id,
      userId: row.user_id,
      nickname: row.nickname,
      content: row.content,
      messageType: row.message_type || 'text',
      createdAt: row.created_at,
    }));
  },

  async _chatMessagesHasTypeColumn(): Promise<boolean> {
    try {
      const r = await query<{ c: number }[]>(`SELECT 1 AS c FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'chat_messages' AND COLUMN_NAME = 'message_type' LIMIT 1`, []);
      return Array.isArray(r) && r.length > 0;
    } catch {
      return false;
    }
  },

  async createMessage(roomId: number, userId: number, content: string, messageType: string = 'text'): Promise<number> {
    const hasType = await this._chatMessagesHasTypeColumn();
    if (hasType) {
      const result = await query<{ insertId: number }>(
        `INSERT INTO chat_messages (room_id, user_id, message_type, content) VALUES (?, ?, ?, ?)`,
        [roomId, userId, messageType === 'image' || messageType === 'appointment' ? messageType : 'text', content]
      );
      const header = result as unknown as { insertId: number };
      return header.insertId;
    }
    const result = await query<{ insertId: number }>(
      `INSERT INTO chat_messages (room_id, user_id, content) VALUES (?, ?, ?)`,
      [roomId, userId, content]
    );
    const header = result as unknown as { insertId: number };
    return header.insertId;
  },

  async findMessageById(messageId: number): Promise<{ id: number; userId: number; nickname: string; content: string; messageType: string; createdAt: Date } | null> {
    const hasType = await this._chatMessagesHasTypeColumn();
    const typeSelect = hasType ? 'm.message_type' : "'text' AS message_type";
    const rows = await query<{ id: number; user_id: number; nickname: string; content: string; message_type: string; created_at: Date }[]>(
      `SELECT m.id, m.user_id, u.nickname, m.content, ${typeSelect} AS message_type, m.created_at
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
      messageType: row.message_type || 'text',
      createdAt: row.created_at,
    };
  },
};
