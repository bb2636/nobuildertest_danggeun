# DB 마이그레이션

스키마 변경 시 버전별 SQL 파일을 이 디렉터리에 추가하고, 순서대로 적용합니다.

## 적용 방법

1. **최초 DB 생성**: 프로젝트 루트에서  
   `mysql -u root -p1234 < database/schema.sql`

2. **마이그레이션 적용**: 각 `*.sql` 파일을 생성 순서(파일명 번호)대로 실행  
   예:  
   `mysql -u root -p1234 danggeun < database/migrations/001_add_chat_messages_room_created_at_index.sql`

3. **이미 인덱스가 있는 경우**: `ALTER TABLE`에서 해당 인덱스가 있으면 에러가 날 수 있음.  
   필요 시 `SHOW INDEX FROM chat_messages;` 로 확인 후, 없을 때만 실행.

## 파일 명명

- `NNN_설명.sql` (예: `002_add_posts_category_index.sql`)
- NNN은 적용 순서를 나타내는 3자리 숫자
