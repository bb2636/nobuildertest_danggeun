-- 당근마켓 클론 DB 스키마 (MySQL)
-- 사용: mysql -u root -p1234 < database/schema.sql
-- 또는: mysql -u root -p1234 danggeun < database/schema.sql

CREATE DATABASE IF NOT EXISTS `danggeun` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `danggeun`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------
-- 사용자
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `nickname` VARCHAR(50) NOT NULL,
  `profile_image_url` VARCHAR(512) DEFAULT NULL,
  `location_name` VARCHAR(100) DEFAULT NULL COMMENT '동네 이름 (예: 역삼동)',
  `location_code` VARCHAR(20) DEFAULT NULL COMMENT '위치 기반 필터용 코드',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------
-- 게시글 (중고 거래)
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS `posts` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `title` VARCHAR(100) NOT NULL,
  `content` TEXT,
  `price` INT UNSIGNED DEFAULT NULL COMMENT '원 단위, null이면 무료나눔',
  `status` ENUM('SALE', 'RESERVED', 'SOLD') NOT NULL DEFAULT 'SALE' COMMENT '판매중/예약중/판매완료',
  `category` VARCHAR(50) DEFAULT NULL,
  `location_name` VARCHAR(100) DEFAULT NULL,
  `location_code` VARCHAR(20) DEFAULT NULL,
  `image_urls` JSON DEFAULT NULL COMMENT '["url1","url2"]',
  `view_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_posts_user_id` (`user_id`),
  KEY `idx_posts_status` (`status`),
  KEY `idx_posts_location_code` (`location_code`),
  KEY `idx_posts_created_at` (`created_at`),
  CONSTRAINT `fk_posts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------
-- 찜 (즐겨찾기)
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS `favorites` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `post_id` INT UNSIGNED NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_favorites_user_post` (`user_id`, `post_id`),
  KEY `idx_favorites_user_id` (`user_id`),
  CONSTRAINT `fk_favorites_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_favorites_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------
-- 채팅방 (게시물 단위 1:1 채팅)
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS `chat_rooms` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `post_id` INT UNSIGNED NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_chat_rooms_post_id` (`post_id`),
  CONSTRAINT `fk_chat_rooms_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------
-- 채팅방 참여자 (방당 2명: 판매자 + 구매자)
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS `chat_room_members` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `room_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_room_member` (`room_id`, `user_id`),
  CONSTRAINT `fk_room_members_room` FOREIGN KEY (`room_id`) REFERENCES `chat_rooms` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_room_members_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------
-- 채팅 메시지
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS `chat_messages` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `room_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `content` TEXT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_chat_messages_room_id` (`room_id`),
  CONSTRAINT `fk_chat_messages_room` FOREIGN KEY (`room_id`) REFERENCES `chat_rooms` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_chat_messages_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------
-- 동네생활 (자유게시판)
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS `community_posts` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `content` TEXT,
  `topic` VARCHAR(50) DEFAULT NULL COMMENT '주제 (맛집, 생활/편의, 분실/실종 등)',
  `location_name` VARCHAR(100) DEFAULT NULL,
  `location_code` VARCHAR(20) DEFAULT NULL,
  `view_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '조회수',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_community_posts_user_id` (`user_id`),
  KEY `idx_community_posts_topic` (`topic`),
  KEY `idx_community_posts_location_code` (`location_code`),
  KEY `idx_community_posts_created_at` (`created_at`),
  CONSTRAINT `fk_community_posts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------
-- 동네생활 댓글
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS `community_comments` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `post_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `content` TEXT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_community_comments_post_id` (`post_id`),
  KEY `idx_community_comments_user_id` (`user_id`),
  CONSTRAINT `fk_community_comments_post` FOREIGN KEY (`post_id`) REFERENCES `community_posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_community_comments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------
-- 동네생활 알림 읽음 (마이그레이션 003에서도 생성 가능)
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS `community_notification_read` (
  `user_id` INT UNSIGNED NOT NULL,
  `read_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_community_notification_read_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------
-- 시드 데이터 (개발용, 비밀번호: password123)
-- ----------------------------------------
-- 비밀번호는 모두 password123 (bcrypt 10 rounds)
-- 게시글(posts, community_posts)은 시드 없음 → 수동 등록만 가능
INSERT INTO `users` (`email`, `password`, `nickname`, `location_name`, `location_code`) VALUES
('test@example.com', '$2a$10$ckTIfw9SVm7KUtv.rJ/s2OGorLZKauE5xT8VimTWmuCjNgn5qjxYy', '테스트유저', '역삼동', '6035'),
('user2@example.com', '$2a$10$ckTIfw9SVm7KUtv.rJ/s2OGorLZKauE5xT8VimTWmuCjNgn5qjxYy', '동네이웃', '송도동', '6543'),
('demo@danggeun.com', '$2a$10$ckTIfw9SVm7KUtv.rJ/s2OGorLZKauE5xT8VimTWmuCjNgn5qjxYy', '당근유저', '역삼동', '6035')
ON DUPLICATE KEY UPDATE `updated_at` = CURRENT_TIMESTAMP, `password` = VALUES(`password`);

SET FOREIGN_KEY_CHECKS = 1;
