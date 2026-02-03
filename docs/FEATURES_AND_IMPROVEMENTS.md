# 당근마켓 클론 – 구현 기능 정리 및 개선 항목

## 1. 구현 완료된 기능 (항목별)

### 1.1 인증·회원

| 구분 | 내용 |
|------|------|
| **회원가입** | 이메일·비밀번호·닉네임, 이메일 형식·비밀번호 최소 길이 검증, JWT 발급 |
| **로그인** | 이메일·비밀번호 검증, JWT 발급 및 클라이언트 저장 |
| **내 정보** | `GET /api/auth/me`로 로그인 유저 조회, 토큰 복원 시 user 복구 |
| **프로필 수정** | `PATCH /api/auth/me`로 닉네임·동네·프로필 이미지 수정 |
| **프로필 이미지 업로드** | 업로드 API 연동, 미리보기, MyPage·홈 헤더에 프로필 이미지 표시 |
| **동네 설정** | 회원가입/프로필에서 동네 선택 가능, 글쓰기 시 유저 동네 자동 사용 |

### 1.2 게시글 (중고 거래)

| 구분 | 내용 |
|------|------|
| **목록** | 페이지네이션, 동네·카테고리·검색(keyword) 필터, 무한 스크롤(IntersectionObserver) |
| **상세** | 이미지 갤러리(스와이프·인디케이터), 가격·상태·조회수·작성일, 본문 |
| **작성** | 제목·내용·가격·카테고리·상태·이미지 URL, 동네 자동 설정, 이미지 업로드 UI |
| **수정** | 본인 글만 수정, 폼 prefill |
| **삭제** | 본인 글만 삭제, 실패 시 에러 메시지 표시 |
| **상태 변경** | 판매중/예약중/판매완료, 본인 글만 변경 |
| **카테고리** | 목록·상세·작성 폼에서 카테고리 표시/필터/선택 |
| **검색** | `GET /api/posts?keyword=` 제목/내용 검색, 홈 검색 연동 |
| **내 게시글** | `GET /api/posts?my=1`, MyPostsPage 및 라우트 `/posts/mine` |

### 1.3 이미지·UI 보조

| 구분 | 내용 |
|------|------|
| **이미지 갤러리** | PostDetailPage 가로 스와이프·스냅·인디케이터(ImageGallery) |
| **이미지 로드 실패** | ImageWithFallback으로 placeholder/“이미지 없음” 처리 (상세·홈·찜·글쓰기) |
| **로딩** | Spinner, PostListSkeleton; 상세·목록·찜·채팅·내 게시글·동네생활 로딩 처리 |
| **빈 상태** | EmptyState 컴포넌트 – 홈·찜·채팅 목록·내 게시글·동네생활 빈 목록 |
| **공통 유틸** | formatPrice, formatRelativeTime, STATUS_LABEL, CATEGORY_OPTIONS, getApiErrorMessage |

### 1.4 찜(즐겨찾기)

| 구분 | 내용 |
|------|------|
| **토글** | 게시글 상세에서 찜하기/찜 해제, 실패 시 인라인 에러 메시지 표시 |
| **목록** | FavoritesPage, 찜한 게시글 목록·카드 표시 |
| **API** | check, toggle, getList |

### 1.5 채팅

| 구분 | 내용 |
|------|------|
| **채팅방 생성·목록** | 게시글 기준 1:1 방 생성, 목록에 게시글 썸네일·가격·마지막 메시지 |
| **채팅방 상세** | 게시글 정보(썸네일·제목·가격)·링크, 메시지 목록·전송 |
| **실시간** | Socket.IO – join_room/leave_room, send_message, new_message |
| **채팅 목록 실시간** | 새 메시지 시 `chat_list_updated` 이벤트로 목록 재조회 |
| **시간 표시** | formatRelativeTime, formatMessageTime 적용 |

### 1.6 동네생활(자유게시판)

| 구분 | 내용 |
|------|------|
| **목록** | 동네 필터, 글쓰기 버튼, 작성자·상대 시간·댓글 수, 무한 스크롤 |
| **상세** | 제목·내용·작성자·동네·상대 시간, 댓글 목록·댓글 작성 |
| **글쓰기/수정** | 제목·내용, 수정 모드 로드 실패 시 에러·뒤로가기 처리 |
| **댓글** | 댓글 목록·작성, 실패 시 에러 메시지·입력 복원 |
| **실시간 댓글** | 소켓 `join_community_post` / `leave_community_post`, `community_comment_added`로 새 댓글 실시간 반영 |
| **권한** | 본인 글만 수정·삭제 |

### 1.7 마이페이지·레이아웃

| 구분 | 내용 |
|------|------|
| **마이** | 하단 탭 “마이”(/my), 프로필 수정·내 게시글·찜 목록 링크 |
| **레이아웃** | MainLayout 하단 탭(홈·동네생활·글쓰기·채팅·마이), 플로팅 글쓰기(중고) |
| **라우팅** | React Router v6, 보호 라우트(로그인 필요), 404 → `/` 리다이렉트 |

### 1.8 백엔드·인프라

| 구분 | 내용 |
|------|------|
| **구조** | 3티어(Controller – Service – Repository), MySQL 연결 |
| **인증** | JWT 미들웨어, 소켓 JWT 검증, optionalAuth(목록·내 게시글) |
| **검증** | express-validator (auth, post, community 등), multer 업로드 크기·MIME 검증 |
| **업로드** | 이미지 업로드 API, multer, 설정 기반 제한 |
| **헬스체크** | `/health` + DB ping(실패 시 503) |
| **Rate limit** | 로그인·회원가입·일반 API 별 제한(express-rate-limit) |
| **로깅** | requestLogger, logger.error 등 |
| **테스트** | Jest – auth.service, post.service, chat.service, favorite.service 단위 테스트 |

---

## 2. 부족하거나 개선해야 할 기능

### 2.1 수정·보완 권장 (우선순위 높음)

| 구분 | 내용 | 권장 조치 |
|------|------|------------|
| **500 에러 메시지** | 500 시 `err.message`가 그대로 노출될 수 있음 | production에서는 고정 메시지(예: "서버 오류가 발생했습니다."), 상세는 로그만 |
| **CORS** | 개발 시 `origin: true` 등으로 완화 가능 | production에서는 허용 origin 목록으로 제한 |
| **채팅/찜 라우트 검증** | roomId, postId 등은 컨트롤러에서만 검사 | express-validator로 param 검증 추가(chat.validator, favorite.validator에 param 체인) |
| **목록 API 실패 안내** | FavoritesPage, ChatListPage 등에서 실패 시 빈 배열만 두고 안내 없음 | 실패 시 토스트/인라인 "다시 시도" 메시지 표시 |

### 2.2 개선 권장 (단기)

| 구분 | 내용 | 권장 조치 |
|------|------|------------|
| **로그아웃 + 소켓** | 로그아웃 시 `disconnectChatSocket()` 호출 여부 | AuthContext에서 로그아웃 시 이미 호출 중이면 유지, 미호출이면 추가 |
| **채팅 재연결** | 소켓 끊김 시 안내 없음 | `connect_error` 등에서 "연결이 끊겼습니다" 토스트 등 UX 보완 |
| **업로드 URL** | API_BASE_URL 없을 때 localhost:3001 고정 등 | 프록시 사용 시 상대 경로 `/uploads/...` 반환 또는 .env 안내 보강 |
| **.env.example** | UPLOAD_DIR, API_BASE_URL 등 누락 가능 | README와 맞춰 .env.example에 필수 항목 명시 |

### 2.3 품질·운영 (중장기)

| 구분 | 내용 | 권장 조치 |
|------|------|------------|
| **에러 바운더리** | App 루트에만 적용 | 라우트/섹션 단위 ErrorBoundary로 세분화 가능 |
| **접근성** | 포커스·스크린 리더 지원 일부 | 버튼/폼에 aria-label, 필수 필드 aria-required 등 보강 |
| **DB 인덱스** | 채팅 등 대량 데이터 대비 | chat_messages(room_id, created_at DESC) 등 복합 인덱스 검토 |
| **마이그레이션** | schema.sql만 존재 | 운영 시 knex/typeorm 등 버전별 마이그레이션 도입 검토 |
| **구조화 로깅** | logger.error 위주 | 요청 ID, 사용자 ID, 응답 코드 등 포함한 구조화 로그 확장 |
| **테스트** | 서비스 단위 테스트 있음 | 채팅/커뮤니티 등 주요 API 통합 테스트 추가 |
| **API 문서** | Swagger/OpenAPI 없음 | 공개/협업 시 스펙 문서화 검토 |

### 2.4 선택 기능 (있으면 좋은 것)

| 구분 | 내용 |
|------|------|
| **수정 폼 조회수** | 수정 페이지 진입 시 getDetail로 조회수 +1 → 수정 전용 조회 API 또는 조회수 제외 옵션 |
| **캐시/재검증** | 목록/상세 매번 재요청 → React Query 등으로 캐시·백그라운드 갱신 검토 |
| **에러 응답 타입** | `{ message: string }` 등 공통 타입으로 인터셉터·페이지 일관 사용 |

---

## 3. 참고 – 이미 반영된 개선

- favorite.controller: getPublicMessage import 및 param 처리 정리  
- CommunityPostDetailPage: 댓글/삭제 실패 시 에러 표시·입력 복원  
- HomePage: 더 불러오기 시 Spinner  
- ChatListPage: fetchRooms useCallback·의존성 정리  
- CommunityPostFormPage: 수정 모드 로드 실패 시 에러·뒤로가기만 표시  
- 동네생활 목록 무한 스크롤  
- 업로드 검증 주석·상수 정리, getApiErrorMessage 통일  
- AuthContext: refreshUser 구현  
- PostDetailPage: 삭제 실패 시 deleteError 표시  
- PostDetailPage: 찜 토글 실패 시 favoriteError 표시  
- 동네생활 댓글 실시간 반영(소켓)  
- App 루트 ErrorBoundary 적용  
- 로그아웃 시 disconnectChatSocket 호출(AuthContext)

이 문서는 현재 코드베이스와 docs(CODE_REVIEW.md, CODE_REVIEW_FULL.md)를 기준으로 정리했으며, 필요에 따라 이슈/태스크로 나누어 적용하면 됩니다.
