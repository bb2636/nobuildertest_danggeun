# 코드 리뷰 요약

## 0. 최근 점검 (에러·부족 부분 수정)

### 수정 완료 (이전)
- **favorite.controller.ts**: `getPublicMessage` 사용하지만 import 없음 → import 추가
- **CommunityPostDetailPage**: 댓글/삭제 실패 시 에러 표시 및 입력 복원
- **HomePage**: 더 불러오기 시 Spinner 표시
- **ChatListPage**: `fetchRooms`를 `useCallback` + 의존성 추가
- **CommunityPostFormPage**: 수정 모드 로드 실패 시 "글을 불러오지 못했습니다" + 뒤로가기만 표시
- **동네생활**: 무한 스크롤(IntersectionObserver) 추가
- **업로드**: 백엔드 크기·MIME 검증 주석·상수 정리, 프론트 `getApiErrorMessage` 유틸로 통일

### 수정 완료 (이번 점검)
- **CommunityPostDetailPage**: 댓글 catch에서 아직 수동 `response?.data?.message` 사용하던 한 곳 → `getApiErrorMessage`로 통일
- **AuthContext**: `refreshUser`가 value에만 있고 정의가 없어 런타임 에러 가능 → `refreshUser` 구현 추가
- **PostDetailPage**: 게시글 삭제 실패 시 에러 메시지 없음 → `deleteError` 상태 + `getApiErrorMessage`로 표시

### 개선 권장 (선택)
- **찜 토글 실패**: PostDetailPage에서 찜 해제/추가 실패 시 사용자에게 메시지 표시
- **동네생활 댓글**: 실시간 반영(소켓) 없음 → 필요 시 채팅처럼 소켓 도입

---

## 1. 수정 필요 → 적용 완료

### 1.1 백엔드
- **post.controller.ts**: `getList`에서 `Request` 타입 사용하지만 import 누락 → `Request` import 추가
- **인증 후 사용자 복원**: 새로고침 시 토큰만 있고 `user`가 null → `GET /api/auth/me` 추가 및 프론트에서 토큰 있을 때 호출
- **401 리다이렉트**: 로그인 실패(401) 시에도 인터셉터가 `/login`으로 보내서 에러 메시지가 사라짐 → 로그인/회원가입 API 요청 시에는 401 리다이렉트 스킵
- **전역 404**: 등록되지 않은 경로 요청 시 404 처리 없음 → 404 핸들러 추가
- **게시글 create/update**: `status`가 SALE/RESERVED/SOLD가 아닐 때 DB 에러 가능 → 서비스에서 enum 검증 추가
- **회원가입**: 이메일 형식·비밀번호 최소 길이 검증 없음 → 서비스/컨트롤러에서 검증 추가

### 1.2 프론트엔드
- **AuthContext**: 앱 로드 시 토큰만 복원하고 `user`는 복원 안 함 → 토큰 있으면 `GET /api/auth/me`로 user 설정
- **hooks/useAuth.ts**: 사용처 없음(AuthContext의 useAuth만 사용) → dead code 제거 또는 유지 시 주석으로 구분

---

## 2. 개선 권장 (선택)

### 2.1 백엔드
- **DB 헬스체크**: `/health`에서 DB 연결 확인(연결 실패 시 503 등)하면 배포/운영 시 유리
- **요청 검증**: express-validator 등으로 body/query 스키마 검증
- **에러 로깅**: 500 발생 시 로그 출력(console 또는 로거)
- **dotenv 중복**: `database.ts`와 `index.ts` 둘 다 dotenv 로드 → 한 곳에서만 로드

### 2.2 프론트엔드
- **수정 폼 조회 시 조회수**: 수정 페이지 진입 시 `getDetail` 호출로 조회수 +1 → 수정 전용 조회 API 또는 쿼리로 조회수 제외 고려
- **에러 메시지 통일**: API 에러 시 `message` 필드 사용 일관화(이미 대부분 적용됨)
- **로딩/빈 상태**: 목록/상세 로딩·빈 목록 UI는 있음; 개별 버튼 비활성화 등 추가 가능

### 2.3 공통
- **이미지 업로드**: 현재는 `imageUrls` 문자열 배열만 저장, 실제 업로드(멀티파트, S3 등) 없음 → 요구사항에 따라 추후 구현
- **테스트**: 단위/통합 테스트 없음 → 핵심 API·서비스부터 추가 권장
- **환경별 설정**: NODE_ENV에 따른 CORS·로그 레벨 등 분리

---

## 3. 잘 되어 있는 부분

- Controller–Service–Repository 3티어 구조 유지
- SQL 파라미터 바인딩으로 SQL 인젝션 방지
- JWT 미들웨어로 인증 필요 API 보호
- 본인 게시글만 수정/삭제/상태 변경 가능하도록 권한 체크
- 프론트 라우트 순서(`/posts/new`, `/posts/:id/edit` 후 `/posts/:id`)로 “new”가 id로 잡히지 않음
- Figma 컬러·폰트 반영, 모바일 퍼스트 레이아웃
