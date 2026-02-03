# 전체 코드 점검 결과

점검 일자: 최근 변경분 포함 전체 검토

---

## 수정한 항목

### 1. ProfilePage – getApiErrorMessage import 누락
- **문제**: `getApiErrorMessage(err, '저장에 실패했습니다.')` 사용하는데 import 없음 → 런타임 ReferenceError 가능
- **조치**: `import { getApiErrorMessage } from '../utils/apiError'` 추가

### 2. HomePage – 미사용 변수 제거
- **문제**: `useInfiniteQuery`에서 `error: listError` 구조 분해 후 사용하지 않음
- **조치**: `error: listError` 제거하여 린트/미사용 변수 경고 방지

---

## 점검 통과 항목

### 프론트엔드
- **App.tsx**: ErrorBoundary import 및 루트·라우트 단위 적용 정상
- **MainLayout**: ErrorBoundary로 Outlet 감싸기, `role="main"`, nav `aria-label` / `aria-current` 적용
- **에러 메시지**: LoginPage, SignUpPage, PostFormPage, PostDetailPage, CommunityPostDetailPage, CommunityPostFormPage에서 getApiErrorMessage 사용처에 import 존재 (ProfilePage만 누락이었고 수정함)
- **api/client.ts**: ApiError 타입, ApiErrorResponse 사용
- **utils/apiError.ts**: ApiErrorResponse 기반 message 추출
- **types/api.ts**: ApiErrorResponse, isApiErrorResponse 정의
- **React Query**: main.tsx QueryClientProvider, HomePage useInfiniteQuery/useQuery, PostDetailPage useQuery, PostFormPage useQuery/useMutation
- **소켓**: lib/socket.ts 연결 상태 리스너, useSocketConnectionBanner 훅, ChatListPage/ChatRoomPage 배너
- **접근성**: LoginPage/SignUpPage/PostFormPage 필수 입력 `aria-required`, MainLayout nav `aria-label` / `aria-current="page"` 적용

### 백엔드
- **앱 분리**: app.ts에서 Express 앱·라우트·health·404 정의, index.ts는 서버·Socket.IO·listen만 수행
- **통합 테스트**: `__tests__/api/integration.test.ts`에서 `import { app } from '../../app'`로 app만 사용 (index 미참조)
- **업로드 URL**: upload.routes.ts에서 `config.upload.publicBaseUrl` 사용 (process.env 직접 참조 제거)
- **config/env.ts**: upload.publicBaseUrl, cors.allowedOrigins 정의
- **community.controller**: getList catch에서 logger.error에 LogContext(requestId, userId) 전달
- **logger**: error(message, err?, context?) 시그니처, LogContext 타입 export
- **에러 응답**: errorResponse.getPublicMessage에서 500·production 시 고정 메시지 + logger.error 호출
- **CORS**: index.ts 및 app.ts에서 production 시 allowedOrigins 또는 false 적용
- **채팅/찜**: roomIdParamValidator, postIdParamValidator 라우트 적용

### DB
- **마이그레이션**: migrations/001_add_chat_messages_room_created_at_index.sql, README 명시
- **스키마**: schema.sql 기존 구조 유지

### 기타
- **.gitignore**: 루트·frontend에 .env, .env.*, .env.local 등 env 패턴 및 !.env.example 반영
- **.env.example**: backend/frontend 주석으로 API_BASE_URL, CORS_ORIGIN, VITE_API_URL 설명

---

## 권장 사항 (선택)

1. **마이그레이션 001**: 이미 인덱스가 있으면 `ALTER TABLE ... ADD KEY`가 실패할 수 있음. 적용 전 `SHOW INDEX FROM chat_messages`로 확인하거나, 실패 시 무시하도록 스크립트 처리 가능.
2. **구조화 로깅**: 다른 컨트롤러 catch 블록에서도 `logger.error(..., err, { requestId: (req as any).requestId, userId: req.userId })` 형태로 확장하면 요청 추적에 유리함.
3. **통합 테스트**: DB 미기동 시 `/health`가 503이므로 테스트는 “200 또는 503 + body.ok/db 존재” 수준으로 완화해 두었음. 필요 시 CI에서 DB 띄운 뒤 실행 권장.

---

## 린트

- `frontend/src`, `backend/src` 대상 린트 에러 없음 (점검 시점 기준).
