# 코드 전체 검토 – 부족한 부분 / 추가 권장

전체 코드베이스를 기준으로 **수정이 필요한 부분**, **부족한 부분**, **추가하면 좋은 부분**을 정리했습니다.

---

## 1. 수정 필요 (버그/오류)

### 1.1 이미 반영된 항목
- **favorite.controller.ts**: `req.params.postId ?? req.params.postId` 중복 → `Number(req.params.postId)`로 통일 (수정 완료)

### 1.2 확인 권장
- **AuthContext**: 401 인터셉터에서 `localStorage.removeItem` 후 `window.location.href = '/login'`으로 이동하므로, 새로고침 시 토큰이 없어져서 괜찮음. 다만 `setToken(null)` / `setUser(null)`은 페이지 이동 전에 호출되지 않으므로, 전역 인터셉터에서 AuthContext의 logout을 호출할 수 없다는 점만 인지하면 됨.
- **채팅 소켓**: 로그아웃 시 `disconnectChatSocket()`을 호출하지 않음. 로그아웃 시 소켓을 끊어 두면 재로그인 시 깨끗한 연결을 유지하기 좋음.

---

## 2. 부족한 부분

### 2.1 백엔드

| 구분 | 내용 | 권장 조치 |
|------|------|------------|
| **채팅/찜 검증** | `chat.routes`, `favorite.routes`에 express-validator 미적용. `roomId`, `postId` 등은 컨트롤러에서만 검사. | `chat.validator.ts`, `favorite.validator.ts` 추가 후 `param('roomId').isInt({ min: 1 })` 등 적용. |
| **에러 메시지 노출** | 500 시 `err.message`를 그대로 클라이언트에 반환. DB/내부 에러가 그대로 노출될 수 있음. | production에서는 `message: '서버 오류가 발생했습니다.'` 등 고정 메시지로 통일, 상세는 로그만. |
| **요청 속도 제한** | 로그인/회원가입/API 전반에 rate limit 없음. | `express-rate-limit` 등으로 로그인·회원가입·일반 API 별 제한 적용. |
| **CORS** | `origin: true`로 모든 origin 허용. | production에서는 허용 origin 목록으로 제한. |
| **업로드 URL** | `API_BASE_URL`이 없으면 `http://localhost:3001` 고정. 프론트가 5173이면 이미지 URL이 3001로 나갈 수 있음. | 프론트와 동일 origin으로 서빙하거나, 프록시 사용 시 상대 경로 `/uploads/...` 반환 검토. |
| **.env.example** | `UPLOAD_DIR`, `API_BASE_URL` 없음. | README와 동일하게 .env.example에 추가. |

### 2.2 프론트엔드

| 구분 | 내용 | 권장 조치 |
|------|------|------------|
| **에러 바운더리** | 컴포넌트/라우트 단위 에러 바운더리 없음. | 최소한 라우트 또는 App 상단에 ErrorBoundary 추가해 크래시 시 안내 화면 표시. |
| **로딩/에러 상태** | FavoritesPage, ChatListPage 등에서 API 실패 시 빈 배열만 넣고 사용자에게 “실패” 안내 없음. | 실패 시 토스트/인라인 메시지로 “다시 시도” 안내. |
| **로그아웃 + 소켓** | 로그아웃 시 채팅 소켓 연결 유지. | `logout` 시 `disconnectChatSocket()` 호출. |
| **채팅 재연결** | 소켓 끊김 시 자동 재연결은 socket.io 기본 동작에 의존. | `connect_error` 등에서 토스트로 “연결이 끊겼습니다” 안내 시 UX 개선. |
| **이미지 로드 실패** | 게시글/찜 목록에서 `img` 로드 실패 시 빈 영역 또는 깨진 아이콘만 있을 수 있음. | `onError`에서 placeholder 또는 “이미지 없음” 처리. |
| **접근성** | 포커스 관리, 스크린 리더용 라벨은 일부만 적용. | 버튼/폼에 `aria-label`, 필수 필드에 `aria-required` 등 보강. |

### 2.3 DB/스키마

| 구분 | 내용 | 권장 조치 |
|------|------|------------|
| **인덱스** | `chat_messages(room_id, id)` 등 자주 쓰는 조합 인덱스는 있음. 채팅방 목록 쿼리에서 서브쿼리 사용. | 대량 메시지 시 `chat_messages(room_id, created_at DESC)` 복합 인덱스 검토. |
| **마이그레이션** | schema.sql만 있고 버전별 마이그레이션 없음. | 운영 시에는 knex/typeorm 마이그레이션 등 도입 검토. |

---

## 3. 추가하면 좋은 부분 (기능/운영)

### 3.1 기능

- **회원가입 시 동네 선택**: 스키마에 `location_name`, `location_code` 있으나 회원가입 폼에는 없음. 글쓰기에서 유저 위치 자동 사용하려면 가입/프로필에서 동네 설정 가능하게 하면 좋음.
- **채팅 목록 실시간 갱신**: 채팅방에서 새 메시지 올 때 채팅 목록의 `lastMessage`/`lastAt`은 REST로만 갱신. 소켓으로 “채팅 목록 갱신” 이벤트를 주면 목록을 다시 fetch하거나 특정 방만 갱신 가능.
- **게시글 검색**: 제목/내용 검색 API 및 홈에 검색창 추가.
- **무한 스크롤 / 페이지네이션**: 게시글 목록에 “더 보기” 또는 스크롤 시 다음 페이지 로드.

### 3.2 백엔드 운영/품질

- **헬스체크**: `/health`에 DB ping 이미 있음. 배포 시 로드밸런서/오케스트레이션에서 사용 가능.
- **구조화 로깅**: `logger.error`만 사용 중. 요청 ID, 사용자 ID, 응답 코드 등을 넣은 구조화 로그로 확장하면 디버깅/모니터링에 유리.
- **테스트**: auth.service, post.service 테스트는 있음. chat.service, favorite.service, 주요 API 통합 테스트 추가 권장.

### 3.3 프론트엔드 품질

- **API 레이어 타입**: `CreatePostBody` 등 타입은 잘 정의됨. 에러 응답 타입을 `{ message: string }` 등으로 공통화해 인터셉터/페이지에서 일관 사용 가능.
- **캐시/재검증**: 게시글 목록/상세는 매번 새로 불러옴. 필요 시 React Query 등으로 캐시 + 백그라운드 갱신 도입 검토.

### 3.4 문서/환경

- **README**: API 목록에 찜/채팅/업로드/WebSocket 설명 추가하면 좋음.
- **.env.example**: `UPLOAD_DIR`, `API_BASE_URL` 추가.
- **API 문서**: Swagger/OpenAPI 없음. 공개/협업 시 스펙 문서화 권장.

---

## 4. 잘 되어 있는 부분

- **3티어 구조**: Controller – Service – Repository 분리 유지.
- **인증**: JWT 미들웨어, 소켓 JWT 검증 적용.
- **권한**: 본인 글만 수정/삭제/상태 변경, 채팅방 멤버만 메시지 조회/전송.
- **SQL**: 파라미터 바인딩 사용으로 인젝션 방지.
- **프론트 라우팅**: `/posts/new`, `/posts/:id/edit`를 `:id`보다 먼저 배치해 충돌 방지.
- **채팅**: WebSocket(Socket.io)으로 실시간 송수신, 방 단위 브로드캐스트.
- **이미지**: 업로드 API + 글쓰기 폼 연동, 동네는 로그인 유저 기준 자동 설정.
- **UI**: Figma 컬러/타이포, 모바일 퍼스트, 하단 탭 + 플로팅 글쓰기 버튼 구성.

---

## 5. 우선 적용 추천 순서

1. **즉시**: production 시 500 에러 메시지 고정, CORS origin 제한, .env.example 보완.
2. **단기**: 채팅/찜 라우트에 param 검증(validator) 추가, 로그아웃 시 `disconnectChatSocket()` 호출, 목록 페이지 API 실패 시 사용자 안내.
3. **중기**: Rate limit, 에러 바운더리, 이미지 onError 처리, 회원가입 동네 선택.
4. **장기**: 채팅 목록 실시간 갱신, 검색/무한 스크롤, 테스트/로깅/API 문서 확장.

이 문서는 `CODE_REVIEW.md`를 확장한 전체 검토 결과이며, 필요에 따라 항목별로 이슈/태스크로 쪼개어 적용하면 됩니다.
