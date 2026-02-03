-- 채팅 메시지 목록 조회 시 room_id + created_at DESC 정렬에 사용
-- 기존 idx_chat_messages_room_id 보다 (room_id, created_at) 복합 인덱스가 효율적
USE `danggeun`;

ALTER TABLE `chat_messages`
  ADD KEY `idx_chat_messages_room_created` (`room_id`, `created_at`);
