-- 중고물품(posts) 샘플 데이터
-- 실행: mysql -u root -p1234 danggeun < database/seed_posts.sql
-- 주의: users 테이블에 user_id=1 사용자가 있어야 합니다.

USE `danggeun`;
SET NAMES utf8mb4;

-- 필요 시 기존 샘플 삭제 (원하면 주석 해제)
-- DELETE FROM posts WHERE id <= 9999;

INSERT INTO `posts`
  (`user_id`, `title`, `content`, `price`, `status`, `category`, `location_name`, `location_code`, `image_urls`)
VALUES
  (1, '아이폰 케이스 거의 새거', '한 번 끼워보고 안 썼어요. 직거래 선호합니다.', 3000, 'SALE', '디지털기기', '역삼동', '6035', JSON_ARRAY('/uploads/1770167706491-dupcfs1e.jpg')),
  (1, '무선 마우스 팝니다', '사용감 조금 있어요. 동작 정상입니다.', 8000, 'SALE', '디지털기기', '역삼동', '6035', JSON_ARRAY('/uploads/1770169764125-enrg27il.jpeg')),
  (1, '키보드 (청축) 판매', '소리 큰 편이라 참고해주세요. 키캡 세척 완료.', 15000, 'SALE', '디지털기기', '역삼동', '6035', JSON_ARRAY('/uploads/1770169778553-po0w25tb.jpeg')),
  (1, '가습기 (미니)', '사무실에서 쓰던 미니 가습기입니다.', 7000, 'SALE', '생활용품', '역삼동', '6035', JSON_ARRAY('/uploads/1770176436461-vwmzcft8.jpeg')),
  (1, '원목 의자 1개', '이사 때문에 정리합니다. 생활감 있어요.', 12000, 'SALE', '가구/인테리어', '역삼동', '6035', JSON_ARRAY('/uploads/1770167231970-js3e5c0m.webp')),

  (1, '행거 급처', '분해해서 드려요. 조립 설명서 있어요.', 10000, 'SALE', '가구/인테리어', '역삼동', '6035', JSON_ARRAY('/uploads/1770167706491-dupcfs1e.jpg')),
  (1, '화분 (중형) 나눔', '식물 좋아하시는 분 가져가세요.', NULL, 'SALE', '식물', '역삼동', '6035', JSON_ARRAY('/uploads/1770169764125-enrg27il.jpeg')),
  (1, '세탁바구니', '깨끗합니다. 필요하신 분!', 2000, 'SALE', '생활용품', '역삼동', '6035', JSON_ARRAY('/uploads/1770169778553-po0w25tb.jpeg')),
  (1, '겨울 코트 (L)', '작년에 샀는데 사이즈가 안 맞아요.', 25000, 'SALE', '의류', '역삼동', '6035', JSON_ARRAY('/uploads/1770176436461-vwmzcft8.jpeg')),
  (1, '책상 스탠드', '밝기 조절 됩니다. 충전식.', 9000, 'SALE', '가구/인테리어', '역삼동', '6035', JSON_ARRAY('/uploads/1770167231970-js3e5c0m.webp')),

  (1, '텀블러 2개 일괄', '새 제품입니다. 선물 받았어요.', 6000, 'SALE', '생활용품', '역삼동', '6035', JSON_ARRAY('/uploads/1770167706491-dupcfs1e.jpg')),
  (1, '블루투스 스피커', '음량 좋고 배터리 오래가요.', 18000, 'SALE', '디지털기기', '역삼동', '6035', JSON_ARRAY('/uploads/1770169764125-enrg27il.jpeg')),
  (1, '러그 (베이지)', '사이즈 160x230 정도. 세탁 완료.', 22000, 'SALE', '가구/인테리어', '역삼동', '6035', JSON_ARRAY('/uploads/1770169778553-po0w25tb.jpeg')),
  (1, '주방 수납함', '주방 정리용 수납함입니다.', 5000, 'SALE', '생활용품', '역삼동', '6035', JSON_ARRAY('/uploads/1770176436461-vwmzcft8.jpeg')),
  (1, '운동용 요가매트', '두께감 있는 제품입니다.', 7000, 'SALE', '기타', '역삼동', '6035', JSON_ARRAY('/uploads/1770167231970-js3e5c0m.webp')),

  (1, '후드티 (M)', '세탁 후 보관만 했어요.', 8000, 'SALE', '의류', '역삼동', '6035', JSON_ARRAY('/uploads/1770167706491-dupcfs1e.jpg')),
  (1, '식기 건조대', '스테인리스 재질, 녹 없음.', 11000, 'SALE', '생활용품', '역삼동', '6035', JSON_ARRAY('/uploads/1770169764125-enrg27il.jpeg')),
  (1, '독서대', '각도 조절 가능합니다.', 6000, 'SALE', '기타', '역삼동', '6035', JSON_ARRAY('/uploads/1770169778553-po0w25tb.jpeg')),
  (1, '미니 선풍기', '충전식 미니 선풍기, 여름 대비', 4000, 'SALE', '생활용품', '역삼동', '6035', JSON_ARRAY('/uploads/1770176436461-vwmzcft8.jpeg')),
  (1, '거울 (전신)', '직거래만 가능합니다. 파손 주의.', 15000, 'RESERVED', '가구/인테리어', '역삼동', '6035', JSON_ARRAY('/uploads/1770167231970-js3e5c0m.webp'));

