# 전체 코드 점검 결과

점검 일자: 2025-02-03 (최종)  
범위: 프론트엔드(frontend/src), 백엔드(backend/src), DB 스키마

---

## 1. 린트 / 타입

- **프론트엔드·백엔드**: 현재 린트 에러 없음.
- TypeScript 타입 사용은 전반적으로 일관됨.

---

## 2. 라우팅 및 레이아웃

- **App.tsx**
  - 로그인/회원가입(`/login`, `/signup`)은 공개.
  - 나머지는 `ProtectedRoute` + `MainLayout` 내부에서 렌더.
  - **MainLayout 안에 포함된 라우트**: 홈, 검색, 동네생활, 마이, 찜, 채팅 목록·채팅방, 프로필, 내 게시글, 게시글별 채팅 목록, **게시글 상세(`posts/:id`)** → 하단 메뉴바 유지.
  - **MainLayout 밖** (별도 전체 화면): `/posts/new`, `/posts/:id/edit` (글쓰기/수정).
- **MainLayout**
  - 하단 탭 4개: 홈, 동네생활, 채팅, 마이.
  - 알림 배지: 동네생활 댓글, 채팅 미읽음.
  - 플로팅 글쓰기: **홈** → 중고상품 등록(`/posts/new`), **동네생활** → 동네생활 글쓰기(`/community/new`), 동일 위치·크기(메뉴바 바로 위 오른쪽).

---

## 3. 훅 사용 (React 규칙)

- **PostDetailPage**: 훅은 항상 상단에서 동일 순서로 호출. 콘텐츠는 `hidden`으로만 숨겨 훅 개수 유지.
- **CommunityPage**: `fetchList` useCallback → useEffect 순서 적절.
- **MyPage**: `ImageWithFallback` import·사용 정상.

---

## 4. API·네트워크

- **client.ts**: `VITE_API_URL` baseURL, Bearer 토큰, 401 시 로그아웃 후 `/login`. 로그인/회원가입 요청은 401 리다이렉트 제외.
- **vite.config.ts**: `/api` → `http://localhost:3001`, `/socket.io` → 동일 + `ws: true`. **백엔드가 3001에서 떠 있어야** 프록시·웹소켓 동작. `[vite] ws proxy error: ECONNREFUSED` 는 백엔드 미기동 또는 포트 불일치 시 발생.

---

## 5. 검색

- **SearchPage**
  - 검색 시 중고거래 3개 + 동네생활 3개 미리보기, 각각 "더보기"로 전체 목록.
  - `view`: 'all' | 'posts' | 'community'.
  - 키워드 하이라이트: `escapeRegex` 후 볼드.
  - **연관 검색어**: 입력 디바운스 300ms 후 `GET /api/search/suggestions?q=...` 호출, 제안 클릭 시 해당 키워드로 검색 실행.
- **search.service.ts (백엔드)**: `posts.title`, `community_posts.title` LIKE 검색, 중복 제거·길이 제한 후 반환. MySQL에서 `LIMIT ?` 사용 — mysql2는 지원하나, 이슈 시 고정 `LIMIT 10` 등으로 변경 가능.

---

## 6. 이미지 URL

- **utils/image.ts**: `toAbsoluteImageUrl(url)` — 상대 경로일 때 `VITE_API_URL` 붙여 절대 URL 반환. 채팅방·채팅 목록 게시물 이미지에 사용.
- **ChatRoomPage / ChatListPage**: `toAbsoluteImageUrl(roomDetail.postImageUrl)` 등으로 사용.

---

## 7. 채팅

- **ChatRoomPage**: 전송 버튼 빈 내용 시 비활성화. 판매 상태 변경(바텀시트+확인 모달), 약속잡기(글 주인만), 채팅방 나가기(헤더 오른쪽), 이미지 전송. 이미지 메시지는 "이미지를 보냈습니다." 문구 + 썸네일, URL 텍스트 미노출.
- **ChatListPage**: 방별 미읽음 배지, 마지막 메시지가 이미지 URL이면 "이미지를 보냈습니다." 표시.

---

## 8. 게시글·동네생활

- **PostFormPage**: 제목/설명/가격 필수, 필드별 에러 메시지·빨간 테두리·AlertTriangle. 뒤로가기 시 내용 있으면 "작성 중인 판매 글을 나갈까요?" 팝업.
- **formatRelativeTime**: 1분 미만 "방금 전", 1시간 미만 "N분 전", 24시간 미만 "N시간 전", 그 이상 "N일 전".

---

## 9. 백엔드

- **app.ts**: CORS, rate limit, `/api/auth`, `/api/favorites`, `/api/chat`, `/api/locations`, `/api/posts`, `/api/community`, `/api/upload`, `/api/notifications`, **`/api/search`**(searchRoutes) 등록. `searchRoutes` import 필수.
- **search**: `GET /api/search/suggestions?q=&limit=` → 검색 제안.
- **community**: `findList`에 `keyword` 지원.
- **chat**: getRoomList, getRoomsByPostId, getRoomDetail, 메시지·약속·나가기 등.

---

## 10. DB·마이그레이션

- **schema.sql**: users, posts, favorites, chat_rooms, chat_room_members, chat_messages, community_posts, community_comments. 시드 유저 3명.
- **마이그레이션**: 001~004 적용 여부 확인 (채팅 인덱스, 동네생활, 알림 읽음, 메시지 타입·약속).

---

## 11. 요약

| 항목 | 상태 |
|------|------|
| 린트/타입 | 에러 없음 |
| 라우팅 | MainLayout 내 게시글 상세·채팅방 → 하단 메뉴 유지 |
| 검색 | 연관 검색어 실시간 제안 + 중고/동네생활 섹션·더보기 |
| 이미지 | toAbsoluteImageUrl 유틸, 채팅 이미지 문구 처리 |
| 채팅 | 나가기 헤더 우측, 이미지 메시지 문구 표시 |
| 백엔드 search | searchRoutes import 및 /api/search 등록 확인 |

**ws proxy ECONNREFUSED**: 백엔드를 `config.server.port`(예: 3001)에서 실행 중인지 확인.
