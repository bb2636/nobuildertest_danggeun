# 당근마켓 클론 (Danggeun Clone)

피그마 디자인을 기반으로 한 중고거래 풀스택 클론 프로젝트입니다.

## 기술 스택

- **Frontend**: React (Vite), TypeScript, Tailwind CSS, Lucide-react, Axios, React Router
- **Backend**: Node.js (Express), TypeScript
- **Database**: MySQL 

## 프로젝트 구조

```
step2/
├── backend/          # Express API (3티어: Controller-Service-Repository)
│   └── src/
│       ├── config/   # DB 연결
│       ├── controllers/
│       ├── services/
│       ├── repositories/
│       ├── dto/
│       ├── middleware/  # JWT 인증
│       ├── routes/
│       ├── data/     # Mock (동네 목록 등)
│       └── types/
├── frontend/         # Vite + React
│   └── src/
│       ├── api/      # Axios 클라이언트
│       ├── contexts/
│       ├── pages/
│       └── ...
├── database/
│   └── schema.sql    # MySQL 스키마 및 시드
└── README.md
```

## 사전 요구사항

- Node.js 18+
- MySQL 8+ 

## 실행 방법

### 1. 데이터베이스 설정

시드 사용자 비밀번호: `password123`  
(예: test@example.com / password123)

### 2. 래핑 실행 (step2 루트에서 한 번에)

```bash
cd step2
npm install
npm run dev
```

- 백엔드 API: http://localhost:3001  
- 프론트엔드: http://localhost:5173  
- `/api` 요청은 Vite 프록시로 백엔드(3001)로 전달됩니다.

**래핑 스크립트:**  
| 스크립트 | 설명 |
|---------|------|
| `npm run dev` | 백엔드·프론트엔드 동시 실행 |
| `npm run dev:backend` | 백엔드만 실행 |
| `npm run dev:frontend` | 프론트엔드만 실행 |
| `npm run install:all` | 루트 + backend + frontend 의존성 설치 |
| `npm run build` | 백엔드·프론트엔드 빌드 |
| `npm run test` | 백엔드 단위 테스트 |

### 3. 개별 실행 (backend / frontend만)

**백엔드만:**

```bash
cd backend
npm install
cp .env.example .env   # 필요 시 .env 수정
npm run dev
```

- API 서버: http://localhost:3001

**프론트엔드만:**

```bash
cd frontend
npm install
npm run dev
```

- 웹 앱: http://localhost:5173

## Capacitor Android 앱

웹 프로젝트를 Capacitor로 감싸 Android 앱으로 빌드할 수 있습니다.

**사전 요구사항:** Android Studio, JDK 17+

### 초기 설정 (이미 완료된 상태)

- `frontend`에 `@capacitor/core`, `@capacitor/cli`, `@capacitor/android` 설치됨
- `frontend/capacitor.config.ts`: 앱 ID `com.danggeun.clone`, 앱 이름 `당근마켓 클론`, 웹 빌드 결과물 `dist`
- `frontend/android/`: 네이티브 Android 프로젝트

### Android 앱 빌드·실행

```bash
cd frontend
npm run build          # 웹 빌드 (dist 생성)
npx cap sync           # dist 내용을 android/assets로 복사
npx cap open android   # Android Studio에서 열기
```

Android Studio에서 **Run**으로 에뮬레이터 또는 실기기에서 실행합니다.

### 실기기/에뮬레이터에서 API 연결

앱에서 백엔드 API를 쓰려면 `capacitor.config.ts`의 `server.url`을 설정합니다.

- **에뮬레이터**: `http://10.0.2.2:3001` (Android 에뮬레이터의 localhost)
- **실기기**: PC와 같은 Wi‑Fi의 IP 사용 (예: `http://192.168.0.10:3001`)

설정 후 `npx cap sync` 한 번 더 실행한 뒤 앱을 다시 빌드하세요.

### 프론트엔드 Capacitor 스크립트

| 스크립트 | 설명 |
|---------|------|
| `npm run cap:sync` | `dist` → Android/iOS 프로젝트로 동기화 |
| `npm run cap:android` | Android 플랫폼 추가 (이미 추가됨) |
| `npm run cap:open:android` | Android Studio에서 android 프로젝트 열기 |

## API 목록

### 인증

| Method | Path | 인증 | 설명 |
|--------|------|------|------|
| POST | /api/auth/signup | - | 회원가입 (이메일 형식·비밀번호 6자 이상·동네 선택) |
| POST | /api/auth/login | - | 로그인 (JWT 발급) |
| GET | /api/auth/me | Bearer | 현재 로그인 사용자 정보 (토큰 복원용) |
| PATCH | /api/auth/me | Bearer | 프로필 수정 (nickname, locationName, locationCode) |

### 게시글

| Method | Path | 인증 | 설명 |
|--------|------|------|------|
| GET | /api/posts | - | 목록 (page, limit, locationCode, status, **keyword** 검색) |
| GET | /api/posts/:id | - | 상세 (조회수 +1) |
| POST | /api/posts | Bearer | 작성 |
| PUT | /api/posts/:id | Bearer | 수정 (본인만) |
| DELETE | /api/posts/:id | Bearer | 삭제 (본인만) |
| PATCH | /api/posts/:id/status | Bearer | 상태 변경 SALE/RESERVED/SOLD (본인만) |

### 찜 (즐겨찾기)

| Method | Path | 인증 | 설명 |
|--------|------|------|------|
| GET | /api/favorites | Bearer | 찜한 게시글 목록 |
| GET | /api/favorites/check/:postId | Bearer | 해당 글 찜 여부 |
| POST | /api/favorites/toggle/:postId | Bearer | 찜 추가/해제 토글 |

### 채팅

| Method | Path | 인증 | 설명 |
|--------|------|------|------|
| POST | /api/chat/rooms | Bearer | 채팅방 생성 또는 기존 방 ID 반환 (body: postId) |
| GET | /api/chat/rooms | Bearer | 내 채팅방 목록 |
| GET | /api/chat/rooms/:roomId/messages | Bearer | 메시지 목록 (query: limit, beforeId) |
| POST | /api/chat/rooms/:roomId/messages | Bearer | 메시지 전송 (body: content) |

**실시간 채팅**: Socket.io WebSocket (`/socket.io`) 연결 후, `auth.token`으로 인증하고 `join_room`(roomId), `send_message`(roomId, content) 이벤트 사용. 서버는 `new_message`, `chat_list_updated` 이벤트를 전송합니다.

### 이미지 업로드

| Method | Path | 인증 | 설명 |
|--------|------|------|------|
| POST | /api/upload | Bearer | 단일 이미지 업로드 (multipart, field: `image`). 응답: `{ url }` |

- 업로드된 파일은 `uploads/` 디렉터리에 저장되며, `GET /uploads/:filename`으로 제공됩니다.
- `API_BASE_URL` 환경 변수로 반환 URL 기준 주소를 지정할 수 있습니다.

### 위치 (Mock)

| Method | Path | 설명 |
|--------|------|------|
| GET | /api/locations | 동네 목록 (필터용) |

## 환경 변수 (백엔드 .env)

- `PORT`: 서버 포트 (기본 3001)
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`: MySQL 연결
- `JWT_SECRET`, `JWT_EXPIRES_IN`: JWT 설정
- `NODE_ENV`: development | production (config/env.ts에서 사용)
- `UPLOAD_DIR`: 업로드 저장 폴더 (기본 `uploads`)
- `API_BASE_URL`: 업로드 URL 반환 시 기준 URL (기본 `http://localhost:3001`)
- `CORS_ORIGIN`: production에서 허용할 origin (쉼표 구분). 비어 있으면 CORS는 제한 없음

## 검증·로깅·테스트

- **요청 검증**: express-validator로 회원가입/로그인/게시글·**채팅·찜** body/param 검증
- **Rate limit**: `/api/auth` 15분당 30회, `/api` 1분당 120회 (express-rate-limit)
- **500 응답**: production에서는 상세 메시지 비노출, 고정 문구 사용
- **구조화 로깅**: 요청별 requestId, method, path, statusCode, durationMs, userId (JSON 한 줄)
- **단위 테스트**: `backend`에서 `npm test` (Jest: auth.service, post.service, **favorite.service**, **chat.service**)

## 주요 기능

- 로그인 / 회원가입 (JWT), **프로필 수정 (동네·닉네임)**
- 게시글 CRUD, **검색(keyword)**, **무한 스크롤**, 상품 상태 변경
- **찜** (추가/해제/목록)
- **채팅** (방 생성, 목록, 메시지 조회/전송), **WebSocket 실시간 메시지·채팅 목록 갱신**
- **이미지 업로드** (글쓰기/수정 시)
- 동네(위치) 기반 필터링 (Mock 데이터)
- 모바일 퍼스트 UI (Figma 디자인 시스템 반영)

결제 기능은 포함되어 있지 않습니다.
