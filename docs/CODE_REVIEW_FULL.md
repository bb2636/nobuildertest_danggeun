# 전체 코드 점검 결과

점검 일자: 2025-02-03  
범위: 프론트엔드(frontend/src), 백엔드(backend/src), DB 스키마

---

## 1. 린트 / 타입

- **프론트엔드·백엔드**: 현재 린트 에러 없음.
- TypeScript 타입 사용은 전반적으로 일관됨.

---

## 2. 라우팅 및 레이아웃

- **App.tsx**: 로그인/회원가입은 공개, 나머지는 `ProtectedRoute`로 보호. `/posts/:id`, `/posts/:id/edit`, `/posts/new`, `/chat/:roomId`는 별도 `ErrorBoundary`로 감싸져 있음.
- **MainLayout**: 하단 탭 4개(홈, 동네생활, 채팅, 마이), 알림 배지(동네생활 댓글, 채팅 미읽음), 홈에서만 글쓰기 플로팅 버튼 노출.

---

## 3. 훅 사용 (React 규칙)

- **PostDetailPage**: 훅은 항상 상단에서 동일 순서로 호출됨. 게시글 없을 때도 콘텐츠 영역을 `hidden`으로만 숨기고 마운트를 유지해 `ImageGallery` 등 자식 훅 개수가 바뀌지 않도록 처리됨 → “Rendered more hooks” 이슈 방지에 적절함.
- **CommunityPage**: `fetchList`는 `useCallback`으로 정의된 뒤 `useEffect([fetchList])`에서만 사용됨. 훅 선언 순서 문제 없음.
- **MyPage**: `ImageWithFallback` 정상 import·사용. (과거 “ImageWithFallback is not defined”는 수정된 상태로 보임.)

---

## 4. API·네트워크

- **client.ts**: `VITE_API_URL` 기반 baseURL, `Authorization` Bearer 토큰 주입, 401 시 로그아웃 후 `/login` 이동. 로그인/회원가입 요청은 401 시 리다이렉트 제외.
- **프록시**: 프론트가 `localhost:5173`에서 `/api` 호출 시 500이 나온다면, Vite 프록시가 백엔드(예: 3000)로 넘기도록 `vite.config.ts` 설정 여부 확인 필요.

---

## 5. 검색·게시글

- **SearchPage**:  
  - 검색 시 중고거래 3개 + 동네생활 3개 미리보기, 각각 “더보기”로 전체 목록 전환.  
  - `view`: 'all' | 'posts' | 'community' 로 상태 분리.  
  - 키워드 하이라이트: `escapeRegex`로 특수문자 이스케이프 후 볼드 처리.  
  - `useInfiniteQuery`로 posts/community 각각 호출, 초기 뷰에서는 `slice(0, 3)`만 사용.
- **HomePage**: 검색창 클릭 시 `/search` 이동. 무한 스크롤·필터(동네·카테고리·키워드) 적용.
- **PostDetailPage**: 내 게시글일 때 “판매 물품”·“대화 중인 채팅 N” 버튼·상태 변경 버튼 노출. `chatApi.getRoomsByPostId`로 해당 글 채팅방 목록 조회.

---

## 6. 채팅

- **ChatRoomPage**:  
  - 전송 버튼: `disabled={sending || !input.trim()}` 로 빈 내용일 때 비활성화.  
  - 판매 상태 변경(바텀시트 + 확인 모달), 약속잡기(글 주인만), 채팅방 나가기, 이미지 전송 등 구현됨.
- **ChatListPage**: 방별 미읽음 배지, 알림 카운트 연동 확인 필요(백엔드 `/api/notifications/counts` 등).

---

## 7. 게시글 작성·수정

- **PostFormPage**:  
  - 제목/설명/가격 필수 검증, `fieldErrors`로 필드별 에러 메시지·빨간 테두리·AlertTriangle 아이콘 표시.  
  - 뒤로가기 시 내용 있으면 “작성 중인 판매 글을 나갈까요?” 팝업, 없으면 그냥 이탈.  
  - 이미지 업로드 후 URL 배열로 저장, 수정 시 기존 이미지 유지.

---

## 8. 백엔드

- **app.ts**: CORS, rate limit(auth 15분 30회, api 1분 120회), `/api/*` 라우트, `/uploads` 정적, `/health` DB 체크.
- **post.controller**: getList에 keyword/locationCode/status/category 등 쿼리 지원. 500 발생 시 DB/환경(테이블 없음, 연결 실패 등) 확인 필요.
- **community**: repository `findList`에 `keyword`(LIKE title/content) 지원. controller·service·validator에 keyword 전달됨.
- **chat**: getRoomList, getRoomsByPostId, getRoomDetail 등. 500 시 채팅 관련 테이블/마이그레이션 적용 여부 확인 필요.

---

## 9. DB·마이그레이션

- **schema.sql**: `users`, `posts`, `favorites`, `chat_rooms`, `chat_room_members`, `chat_messages`, `community_posts`, `community_comments` 정의. 시드 유저 3명(비밀번호 동일).
- **마이그레이션**:  
  - `001`: chat_messages 등 인덱스  
  - `002`: community 테이블  
  - `003`: 알림 읽음  
  - `004`: 채팅 메시지 타입·약속  
- **“Table community_posts doesn't exist”** 발생 시:  
  - 최신 `schema.sql`로 DB 초기화를 했는지,  
  - 또는 `002_add_community_tables.sql` 등 마이그레이션을 순서대로 적용했는지 확인 필요.

---

## 10. 개선 제안 (선택)

| 항목 | 내용 |
|------|------|
| PostDetailPage | `useEffect` 의존성 `[post?.status]` → `[post]` 로 두면 post 객체가 바뀔 때마다 status 동기화되어 더 안전할 수 있음. (현재도 동작에는 문제 없음.) |
| API 500 대응 | 백엔드 로그에 스택 트레이스가 남도록 되어 있는지 확인. 프론트에서는 500 시 “잠시 후 다시 시도해주세요” 등 공통 메시지 노출 권장. |
| 채팅 미읽음 | 방별/전체 미읽음 카운트가 백엔드와 일치하는지, 읽음 처리 시점(방 입장·메시지 로드 후 등)이 기획과 맞는지 한 번 더 확인. |
| 로그아웃 노출 | “로그아웃은 마이페이지에서만” 요구사항이면, MainLayout 등 다른 화면에 로그아웃 버튼이 없는지 확인됨. MyPage에만 있음. |

---

## 11. 요약

- **전체 구조·훅 사용·라우팅·검색·채팅·폼 검증·나가기 확인** 등은 요구사항에 맞게 구현된 상태로 보임.
- **이미 보고된 에러**  
  - `ImageWithFallback is not defined` → MyPage에 import 있음, 해결된 상태로 판단.  
  - `Cannot access 'fetchList' before initialization` → CommunityPage 훅 순서 정상, 해결된 상태로 판단.  
  - `Rendered more hooks` (PostDetailPage) → 조건부 훅 제거·hidden 유지로 해결된 구조.  
- **500 에러** (GET /api/posts, GET /api/chat/rooms 등)는 **DB 연결·테이블 존재·마이그레이션 적용**을 우선 확인하고, 백엔드 로그로 원인 확인하는 것을 권장.

이 점검으로 “지금까지 작업한 전체 코드”를 한 번 훑었고, 치명적인 구조 오류나 훅 위반은 보이지 않습니다.
