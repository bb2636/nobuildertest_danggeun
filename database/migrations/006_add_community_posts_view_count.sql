-- 동네생활 게시글 조회수 컬럼 추가
USE `danggeun`;

ALTER TABLE `community_posts`
  ADD COLUMN `view_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '조회수' AFTER `location_code`;
