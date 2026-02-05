-- uploads 폴더 이미지 기반 중고물품(posts) 샘플 데이터
-- 실행: mysql -u root -p1234 danggeun < database/seed_posts_from_uploads.sql
-- 전제: users 테이블에 id 1,2,3 유저가 존재해야 합니다.

USE `danggeun`;
SET NAMES utf8mb4;

-- 필요 시 기존 샘플 삭제 (원하면 주석 해제)
-- DELETE FROM posts WHERE id <= 9999;

INSERT INTO `posts`
  (`user_id`, `title`, `content`, `price`, `status`, `category`, `location_name`, `location_code`, `image_urls`)
VALUES
  (1, '자전거 팝니다', '출퇴근용으로 잠깐 탔고 상태 좋아요. 직거래만 합니다.', 120000, 'SALE', '기타', '역삼동', '6035', JSON_ARRAY('/uploads/bike.jpeg')),
  (2, '자전거 헬멧', '사이즈 M, 흠집 거의 없어요.', 25000, 'SALE', '기타', '송도동', '6543', JSON_ARRAY('/uploads/helmet.jpeg')),
  (3, '캐주얼 상의 1', '봄/가을에 입기 좋아요. 실측 문의 주세요.', 8000, 'SALE', '의류', '역삼동', '6035', JSON_ARRAY('/uploads/cloth1.jpeg')),
  (1, '캐주얼 상의 2', '세탁 후 보관만 했어요. 상태 양호.', 9000, 'SALE', '의류', '서초동', '6029', JSON_ARRAY('/uploads/cloth2.jpeg')),
  (2, '캐주얼 상의 3', '핏 예쁘게 떨어져요. 교환/환불 불가.', 7000, 'SALE', '의류', '신림동', '6044', JSON_ARRAY('/uploads/cloth3.jpeg')),
  (3, '아이콘 이미지(소품)', '디자인 소품/스티커용으로 구매했어요.', 3000, 'SALE', '기타', '역삼동', '6035', JSON_ARRAY('/uploads/images.png')),

  (1, '원목 의자 1개', '이사 때문에 정리합니다. 생활감 있어요.', 12000, 'SALE', '가구/인테리어', '역삼동', '6035', JSON_ARRAY('/uploads/1770167231970-js3e5c0m.webp')),
  (2, '책상 스탠드', '밝기 조절 됩니다. 충전식.', 9000, 'SALE', '가구/인테리어', '송도동', '6543', JSON_ARRAY('/uploads/1770167706491-dupcfs1e.jpg')),
  (3, '무선 마우스', '사용감 조금 있어요. 동작 정상입니다.', 8000, 'SALE', '디지털기기', '역삼동', '6035', JSON_ARRAY('/uploads/1770169764125-enrg27il.jpeg')),
  (1, '키보드 판매', '키캡 세척 완료. 소리 큰 편이라 참고해주세요.', 15000, 'SALE', '디지털기기', '서초동', '6029', JSON_ARRAY('/uploads/1770169778553-po0w25tb.jpeg')),
  (2, '미니 가습기', '사무실에서 쓰던 미니 가습기입니다.', 7000, 'SALE', '생활용품', '신림동', '6044', JSON_ARRAY('/uploads/1770176436461-vwmzcft8.jpeg'));

