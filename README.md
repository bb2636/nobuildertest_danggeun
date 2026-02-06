# 당근마켓 클론 (Danggeun Clone)

피그마 디자인을 기반으로 한 중고거래 풀스택 클론 프로젝트입니다.

## 기술 스택

- **Frontend**: React (Vite), TypeScript, Tailwind CSS, Lucide-react, Axios, React Router
- **Backend**: Node.js (Express), TypeScript
- **Database**: MySQL
- **Android**: Capacitor 8 (웹 래핑), Java 17 호환 

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
├── frontend/         # Vite + React, Capacitor Android
│   ├── android/      # Capacitor 네이티브 Android 프로젝트
│   └── src/
│       ├── api/      # Axios 클라이언트 (API_BASE, toAbsoluteImageUrl)
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

## Capacitor Android 앱 (래핑 완료 · 실기기 동작 확인됨)

웹 프로젝트를 Capacitor로 감싼 Android 앱으로 빌드·실행할 수 있으며, **실기기에서 로그인·회원가입·이미지 로드·채팅 이미지까지 정상 동작**합니다.

**사전 요구사항:** Android Studio, JDK 17+ (Java 21 미설치 시에도 빌드 가능하도록 프로젝트에서 Java 17로 통일됨)

### Android 래핑 작업 요약

| 구분 | 적용 내용 |
|------|-----------|
| **빌드** | `frontend/android/build.gradle`: 모든 서브프로젝트 Java 17로 통일 (Java 21 미지원 환경 대응) |
| **백엔드** | CORS `origin: '*'`, `0.0.0.0` listen, 업로드 응답은 상대 경로 `/uploads/...` 반환. `/uploads` 정적 파일에 CORS 헤더 명시 |
| **API 주소** | `VITE_API_URL` 없으면 빌드 시 기본 `http://172.30.1.71:3001` 사용. 노트북 IP는 `ipconfig`로 확인 후 `frontend/.env`에 설정 |
| **네트워크** | `network_security_config.xml`: 172.30.1.71, 172.30.1.82, localhost, 10.0.2.2 등 HTTP(cleartext) 허용 |
| **앱** | `AndroidManifest`: `usesCleartextTraffic="true"`, `MainActivity`: WebView `MIXED_CONTENT_ALWAYS_ALLOW` (capacitor → http API 요청 허용) |
| **이미지** | `toAbsoluteImageUrl`: DB의 localhost/127.0.0.1 URL → API_BASE 기준으로 치환. `ImageWithFallback`에서 **API 이미지는 fetch → blob URL**로 표시(WebView img 차단 우회). 채팅 전송 이미지도 동일 컴포넌트 사용 |
| **UI** | 상단 safe-area는 `#root`에 적용해 스크롤 시 위 빈 공간 없음. 하단 네비는 `--nav-safe-bottom`(32px 이상)으로 시스템 바에 가리지 않음. 폰트 Pretendard(CDN) 적용 |

### 초기 설정 (이미 완료된 상태)

- `frontend`에 `@capacitor/core`, `@capacitor/cli`, `@capacitor/android` 설치됨
- `frontend/capacitor.config.ts`: 앱 ID `com.danggeun.clone`, 앱 이름 `당근마켓 클론`, 웹 빌드 결과물 `dist`
- `frontend/android/`: 네이티브 Android 프로젝트

### Android 앱 빌드·실행

**권장: frontend 폴더에서 실행**

```bash
cd frontend
npm run build       # 웹 빌드 (dist 생성)
npx cap sync        # dist → android/assets 동기화
npx cap open android   # Android Studio에서 열기
# 또는 터미널에서 바로 실행: npx cap run android (frontend 폴더에서)
```

> ⚠️ `npx cap run android` / `npx cap sync`는 **반드시 frontend 디렉터리**에서 실행하세요. 루트(step2)에서 실행하면 `npm run build --prefix frontend` 후 `cd frontend && npx cap sync` 처럼 frontend 기준으로 해야 합니다.

Android Studio에서 **Run**으로 에뮬레이터 또는 실기기에서 실행합니다.

### 실기기에서 API 연결 (같은 Wi‑Fi)

1. **노트북 IP 확인**  
   백엔드를 실행하는 PC에서 `ipconfig`(Windows)로 **IPv4 주소** 확인 (예: 172.30.1.71).

2. **API 주소 설정**  
   - `frontend/.env`에 `VITE_API_URL=http://노트북IP:3001` (예: `http://172.30.1.71:3001`)  
   - 없으면 코드 기본값 `http://172.30.1.71:3001`이 빌드에 들어갑니다. PC IP가 다르면 `.env`로 맞추세요.

3. **백엔드 실행**  
   `cd backend && npm run dev` → 3001 포트에서 서버 실행 (LAN 접속을 위해 `0.0.0.0` listen).

4. **방화벽**  
   Windows에서 3001 포트 인바운드 허용. (관리자 PowerShell: `New-NetFirewallRule -DisplayName "Node 3001" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow`)

5. **앱 다시 빌드**  
   `.env` 또는 API 기본값을 바꾼 경우 반드시 `npm run build` → `npx cap sync` 후 앱을 다시 실행해야 합니다.

- **에뮬레이터**: `VITE_API_URL=http://10.0.2.2:3001` 로 설정 후 빌드·sync.

### 트러블슈팅

| 현상 | 확인·조치 |
|------|-----------|
| 로그인/회원가입 "서버에 연결할 수 없습니다" | 폰과 노트북이 같은 Wi‑Fi인지, 백엔드 실행 여부, 노트북 IP가 `.env`/기본값과 일치하는지 확인. 방화벽에서 3001 허용. |
| 이미지 안 나옴 | 앱에서는 API 이미지를 fetch → blob URL로 표시함. DB에 localhost로 저장된 기존 URL도 화면 표시 시 API_BASE로 치환됨. 같은 Wi‑Fi·백엔드 실행·방화벽 확인 후 앱 재빌드. |
| 하단 메뉴바가 시스템 바에 가림 | `--nav-safe-bottom`(최소 32px) 적용됨. 여전히 가리면 `frontend/src/index.css`에서 32px을 더 키워 보세요. |
| 맨 위로 스크롤 시 위에 빈 공간 | 상단 safe-area를 `#root`에 두어 스크롤 시 같이 올라가도록 되어 있음. `overscroll-behavior-y: none`으로 bounce 구간 최소화. |

### 프론트엔드 Capacitor 스크립트

| 스크립트 | 설명 |
|---------|------|
| `npm run cap:sync` | `dist` → Android 프로젝트로 동기화 (frontend 폴더에서 실행) |
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
- `API_BASE_URL`이 없으면 응답은 상대 경로 `/uploads/:filename`으로 반환되며, 앱에서 `API_BASE`를 붙여 로드합니다. 배포 시 `API_BASE_URL`을 설정하면 절대 URL로 반환할 수 있습니다.

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
- 모바일 퍼스트 UI (Figma 디자인 시스템, Pretendard 폰트)
- **Android 앱**: Capacitor 래핑, 실기기에서 동일 Wi‑Fi 노트북 백엔드 연결·이미지(목록/채팅) 로드·하단 네비 세이프 영역 · **실기기 동작 확인 완료**

결제 기능은 포함되어 있지 않습니다.

---

## 코드 점검 요약 (Android 래핑 기준)

| 영역 | 파일 | 점검 내용 |
|------|------|-----------|
| 백엔드 CORS·Listen | `backend/src/app.ts`, `backend/src/index.ts` | CORS `origin: '*'`, `server.listen(PORT, '0.0.0.0')` |
| 백엔드 업로드 URL | `backend/src/routes/upload.routes.ts` | `publicBaseUrl` 없을 때 상대 경로 `/uploads/...` 반환 |
| 프론트 API·이미지 | `frontend/src/api/client.ts`, `frontend/src/utils/image.ts`, `ImageWithFallback.tsx` | `API_BASE` 기본값(모바일용), `toAbsoluteImageUrl`(localhost/상대 → 절대 URL), API 이미지 fetch→blob 표시 |
| 프론트 레이아웃 | `frontend/src/index.css`, `frontend/src/components/MainLayout.tsx` | `#root`에만 상단 safe-area, 하단 `--nav-safe-bottom`, `overscroll-behavior-y: none` |
| Android 빌드 | `frontend/android/build.gradle` | 서브프로젝트 Java 17 통일 |
| Android 네트워크 | `frontend/android/.../network_security_config.xml`, `AndroidManifest.xml` | HTTP(cleartext) 허용 도메인, `usesCleartextTraffic` |
| Android WebView | `frontend/android/.../MainActivity.java` | `MIXED_CONTENT_ALWAYS_ALLOW` 적용 |
