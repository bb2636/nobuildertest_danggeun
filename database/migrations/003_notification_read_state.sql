-- 알림 읽음 상태: 확인하면 배지가 사라지도록
-- 사용: mysql -u root -p1234 danggeun < database/migrations/003_notification_read_state.sql

USE `danggeun`;

SET FOREIGN_KEY_CHECKS = 0;

-- 채팅방별 마지막으로 읽은 메시지 ID (참여자당). 이미 있으면 에러 무시하고 다음 실행.
ALTER TABLE `chat_room_members`
  ADD COLUMN `last_read_message_id` INT UNSIGNED NULL DEFAULT NULL;

-- 동네생활 알림 마지막 확인 시각 (유저당 1행)
CREATE TABLE IF NOT EXISTS `community_notification_read` (
  `user_id` INT UNSIGNED NOT NULL,
  `read_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_community_notification_read_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
