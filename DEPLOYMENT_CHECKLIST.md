# 배포 체크리스트

## ✅ 빌드 테스트 완료
- [x] 로컬 빌드 성공 (`pnpm build`)
- [x] 경고 확인 (정상 동작 - 동적 라우트)

## 📋 배포 전 필수 확인사항

### 1. 환경 변수 설정 (Vercel Dashboard)

#### 필수 환경 변수
- [ ] `DATABASE_URL` - PostgreSQL 연결 문자열
  - 형식: `postgresql://username:password@host:port/database`
  - 예시: `postgresql://user:pass@host:5432/gamecoach`
  
- [ ] `JWT_SECRET` - JWT 토큰 서명용 시크릿 키
  - 최소 32자 이상의 랜덤 문자열
  - 예시: `your-super-secret-jwt-key-at-least-32-characters-long-1234567890`

#### 선택 환경 변수
- [ ] `NEXT_PUBLIC_KAKAO_CHAT_URL` - 카카오톡 오픈채팅 URL (기본값 있음)
- [ ] `NOTION_API_KEY` - 웨이팅 리스트용 (선택사항)
- [ ] `NOTION_DATABASE_ID` - 웨이팅 리스트용 (선택사항)

### 2. 데이터베이스 준비
- [ ] PostgreSQL 데이터베이스 생성 완료
- [ ] 데이터베이스 연결 문자열 확인
- [ ] Vercel에서 데이터베이스 접근 가능 여부 확인 (방화벽/IP 화이트리스트)

### 3. GitHub 푸시
- [ ] 모든 변경사항 커밋
- [ ] GitHub에 푸시 완료

## 🚀 배포 방법

### 방법 1: Vercel Dashboard (권장)

1. **Vercel Dashboard 접속**
   - https://vercel.com/dashboard

2. **프로젝트 추가**
   - "Add New Project" 클릭
   - GitHub 저장소 선택 및 임포트

3. **환경 변수 설정**
   - Project Settings → Environment Variables
   - 위의 모든 필수 환경 변수 추가
   - 각 환경(Production, Preview, Development)에 설정

4. **빌드 설정 확인**
   - Framework Preset: **Next.js** (자동 감지)
   - Build Command: `pnpm build` (기본값)
   - Output Directory: `.next` (기본값)
   - Install Command: `pnpm install` (기본값)

5. **배포 실행**
   - "Deploy" 버튼 클릭
   - 빌드 완료 대기

### 방법 2: Vercel CLI

```bash
# 1. Vercel CLI 설치 (없는 경우)
npm i -g vercel

# 2. 로그인
vercel login

# 3. 프로젝트 연결 (첫 배포 시)
vercel

# 4. 환경 변수 설정
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add NEXT_PUBLIC_KAKAO_CHAT_URL  # 선택사항

# 5. 프로덕션 배포
vercel --prod
```

## 🔍 배포 후 확인사항

### 1. 기본 기능 테스트
- [ ] 홈페이지 로드 확인
- [ ] 코치 목록 페이지 동작 확인
- [ ] 코치 상세 페이지 동작 확인
- [ ] 로그인/회원가입 기능 확인

### 2. API 엔드포인트 테스트
- [ ] `/api/auth/verify` - 인증 확인
- [ ] `/api/coaches` - 코치 목록 조회
- [ ] `/api/reviews` - 리뷰 목록 조회

### 3. 데이터베이스 확인
- [ ] 스키마가 정상적으로 생성되었는지 확인
  - Vercel Build Logs에서 확인
  - 또는 직접 DB 접속하여 확인
- [ ] 테이블 구조 확인

### 4. 관리자 계정 생성
- [ ] 로컬에서 관리자 계정 생성 후 DB에 직접 추가
- [ ] 또는 관리자 회원가입 API를 통해 생성

### 5. 보안 확인
- [ ] CSRF 토큰이 정상 동작하는지 확인
- [ ] 입력 검증이 정상 동작하는지 확인
- [ ] XSS 방지가 정상 동작하는지 확인

## 🐛 트러블슈팅

### 빌드 실패
- Vercel Build Logs 확인
- 로컬에서 `pnpm build` 재실행하여 오류 확인

### 데이터베이스 연결 실패
- `DATABASE_URL` 형식 확인
- 데이터베이스 호스트가 Vercel에서 접근 가능한지 확인
- 방화벽/IP 화이트리스트 설정 확인

### 스키마 배포 실패
- Vercel Build Logs에서 오류 메시지 확인
- 수동으로 스키마 배포: 로컬에서 `pnpm db:push` 실행

### CSRF 토큰 오류
- `/api/csrf-token` 엔드포인트가 정상 동작하는지 확인
- 클라이언트에서 `fetchWithCsrf` 사용 확인

## 📝 배포 완료 후

1. 배포 URL 확인 및 저장
2. 관리자 계정 생성
3. 기본 기능 테스트
4. 사용자 피드백 수집

---

**배포 날짜**: 2025-01-XX
**배포 환경**: Vercel Production
**배포 상태**: 준비 완료 ✅

