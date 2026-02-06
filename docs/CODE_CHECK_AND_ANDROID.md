# 코드 점검 및 Android 래핑 요약

## 코드 점검 결과 (최근 점검 기준)

### ✅ 통과한 항목
- **백엔드 테스트**: 23개 전체 통과 (auth, post, favorite, chat, API 통합)
- **프론트엔드 빌드**: `npm run build --prefix frontend` 성공
- **타입/린트**: 수정한 파일 기준 오류 없음

### 🔧 수정한 항목 (이번 점검에서 반영)
1. **chat.service.test.ts**  
   - `sendMessage` 호출 시 4번째 인자 `messageType: 'text'`가 추가된 것에 맞춰 테스트 기대값 수정
2. **auth.service.ts**  
   - 회원가입 시 이메일 형식·비밀번호 6자 이상을 서비스 레이어에서 검증하고 400 반환하도록 추가 (validator와 이중 검증)

### ⚠️ 참고 사항
- 테스트 종료 시 `A worker process has failed to exit gracefully` 경고가 나올 수 있음.  
  - 열린 DB/타이머 등 정리 시점 이슈로, 테스트 결과에는 영향 없음.  
  - 필요 시 `jest --detectOpenHandles`로 원인 확인 가능.

### 구조·보안 요약
- **백엔드**: Controller → Service → Repository 구조, express-validator·JWT·rate limit 적용
- **프론트**: React Query 캐시, axios 인터셉터(토큰·401 처리), 환경 변수로 API URL 분리
- **이미지 URL**: 게시글 등록 시 `imageUrls` 없음/빈 배열 허용, 항목은 전체 URL 또는 `/`로 시작하는 경로 허용

---

## Android(Capacitor) 래핑 상태 및 사용 방법

### 현재 상태: ✅ 설정 완료
- `frontend/`에 `@capacitor/core`, `@capacitor/cli`, `@capacitor/android` 설치됨
- `frontend/capacitor.config.ts`: appId `com.danggeun.clone`, webDir `dist`
- `frontend/android/`: Android 프로젝트 존재, `MainActivity`는 `BridgeActivity` 상속

### 앱 빌드·실행 절차

1. **웹 빌드**
   ```bash
   npm run build --prefix frontend
   ```
   → `frontend/dist` 생성

2. **Capacitor 동기화**
   ```bash
   npm run cap:sync --prefix frontend
   ```
   또는 `cd frontend` 후 `npx cap sync android`  
   → `dist` 내용이 `android/app/src/main/assets/public` 등으로 복사됨

3. **Android Studio에서 열기**
   ```bash
   cd frontend
   npx cap open android
   ```
   → Android Studio에서 Run으로 에뮬레이터/실기기 실행

### ⚠️ 루트에서 실행할 때
- `npx cap sync`는 **frontend**에만 설치되어 있어, **루트(step2)에서는 동작하지 않습니다.**
- 반드시 다음 중 하나로 실행하세요.
  - `npm run cap:sync --prefix frontend`
  - 또는 `cd frontend` 후 `npx cap sync android`

### 앱에서 API(백엔드) 연결
- 앱이 사용하는 API 주소는 **빌드 시점**의 `frontend/.env`의 `VITE_API_URL`에 들어갑니다.
- **에뮬레이터**: `VITE_API_URL=http://10.0.2.2:3001` 로 설정 후 빌드
- **실기기**: PC와 같은 Wi‑Fi의 IP 사용 (예: `VITE_API_URL=http://192.168.0.10:3001`)
- 설정 변경 후에는 `npm run build --prefix frontend` → `cap sync` → 앱 다시 실행해야 반영됩니다.

### 요약
- Android 래핑은 **이미 되어 있으며**, 위 순서대로 빌드·sync·Android Studio Run만 하면 됩니다.
- 문제가 있으면 1) `frontend/dist`가 최신인지, 2) `cap sync`를 frontend 기준으로 실행했는지, 3) `VITE_API_URL`이 기기에서 접근 가능한 주소인지 확인하면 됩니다.
