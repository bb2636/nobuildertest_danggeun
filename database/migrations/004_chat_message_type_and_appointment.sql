-- 채팅 메시지 타입 (text, image, appointment) 지원
-- 사용: mysql -u root -p danggeun < database/migrations/004_chat_message_type_and_appointment.sql

USE `danggeun`;

-- message_type 미존재 시에만 추가 (재실행 시 에러 나면 무시)
ALTER TABLE `chat_messages`
  ADD COLUMN `message_type` VARCHAR(20) NOT NULL DEFAULT 'text'
  COMMENT 'text | image | appointment'
  AFTER `user_id`;
