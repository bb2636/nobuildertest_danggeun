-- 동네생활 게시글 주제(topic) 컬럼 추가 (이미 있으면 수동으로 스킵)
USE `danggeun`;

ALTER TABLE `community_posts`
  ADD COLUMN `topic` VARCHAR(50) DEFAULT NULL COMMENT '주제 (맛집, 생활/편의, 분실/실종 등)' AFTER `content`;

ALTER TABLE `community_posts`
  ADD KEY `idx_community_posts_topic` (`topic`);
