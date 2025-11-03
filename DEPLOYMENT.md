# GameCoach.AI 배포 가이드

## 🚀 배포 준비

### 1. 빌드 테스트 (로컬)

```bash
pnpm build
```

빌드가 성공적으로 완료되는지 확인합니다.

### 2. 필수 환경 변수

Vercel 배포 시 다음 환경 변수들을 설정해야 합니다:

#### 데이터베이스
- `DATABASE_URL` - PostgreSQL 연결 문자열
  - 형식: `postgresql://username:password@host:port/database`
  - 예시: `postgresql://user:pass@localhost:5432/gamecoach`

#### JWT 인증
- `JWT_SECRET` - JWT 토큰 서명용 시크릿 키
  - 최소 32자 이상의 랜덤 문자열 권장
  - 예시: `your-super-secret-jwt-key-at-least-32-characters-long`

#### Notion API (선택사항 - 웨이팅 리스트용)
- `NOTION_API_KEY` - Notion Integration API Key
- `NOTION_DATABASE_ID` - Notion Database ID

## 📦 Vercel 배포 방법

### 방법 1: GitHub 연동 (권장)

1. **GitHub에 코드 푸시**
   ```bash
   git add .
   git commit -m "배포 준비"
   git push origin main
   ```

2. **Vercel에 프로젝트 연결**
   - [Vercel Dashboard](https://vercel.com/dashboard) 접속
   - "Add New Project" 클릭
   - GitHub 저장소 선택
   - 프로젝트 임포트

3. **환경 변수 설정**
   - Project Settings → Environment Variables
   - 위의 모든 환경 변수 추가
   - 각 환경별로 설정 (Production, Preview, Development)

4. **빌드 설정**
   - Framework Preset: **Next.js**
   - Build Command: `pnpm build` (기본값)
   - Output Directory: `.next` (기본값)
   - Install Command: `pnpm install` (기본값)

5. **배포**
   - "Deploy" 버튼 클릭
   - 빌드 완료 대기
   - 배포 완료 후 URL 확인

### 방법 2: Vercel CLI

1. **Vercel CLI 설치**
   ```bash
   npm i -g vercel
   ```

2. **로그인**
   ```bash
   vercel login
   ```

3. **프로젝트 배포**
   ```bash
   vercel
   ```

4. **환경 변수 설정**
   ```bash
   vercel env add DATABASE_URL
   vercel env add JWT_SECRET
   vercel env add NOTION_API_KEY
   vercel env add NOTION_DATABASE_ID
   ```

5. **프로덕션 배포**
   ```bash
   vercel --prod
   ```

## ⚙️ Vercel 설정 파일 (선택사항)

프로젝트 루트에 `vercel.json` 파일을 생성하여 추가 설정 가능:

```json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["icn1"]
}
```

## 🔄 자동 배포 스키마 마이그레이션

프로젝트는 빌드 후 자동으로 데이터베이스 스키마를 푸시합니다:
- `package.json`의 `postbuild` 스크립트 실행
- `scripts/deploy-schema.ts` 실행
- `drizzle-kit push`를 통해 스키마 업데이트

**주의**: 
- 첫 배포 시 데이터베이스가 비어있어야 합니다
- 또는 기존 데이터베이스와 호환되는 스키마여야 합니다

## 📋 배포 전 체크리스트

### 필수 체크
- [ ] 빌드 테스트 통과 (`pnpm build`)
- [ ] 환경 변수 모두 설정 완료
- [ ] 데이터베이스 연결 확인
- [ ] JWT_SECRET 설정 (충분히 긴 랜덤 문자열)
- [ ] PostgreSQL 데이터베이스 준비 완료

### 선택 체크
- [ ] Notion API 키 설정 (웨이팅 리스트 기능 사용 시)
- [ ] 커스텀 도메인 연결 (필요한 경우)
- [ ] SSL 인증서 확인 (Vercel 자동 처리)

## 🌐 배포 후 확인사항

### 1. 기본 기능 테스트
- [ ] 홈페이지 로드 확인
- [ ] 코치 목록 페이지 동작 확인
- [ ] 코치 상세 페이지 동작 확인
- [ ] 로그인/회원가입 기능 확인

### 2. API 엔드포인트 테스트
- [ ] `/api/auth/verify` - 인증 확인
- [ ] `/api/coaches` - 코치 목록 조회
- [ ] `/api/reviews` - 리뷰 목록 조회

### 3. 관리자 기능 테스트
- [ ] 관리자 로그인 가능 여부
- [ ] 관리자 대시보드 접근 가능 여부
- [ ] 코치/리뷰 관리 기능 동작 확인

### 4. 데이터베이스 확인
- [ ] 스키마가 정상적으로 생성되었는지 확인
- [ ] 테이블 구조 확인 (`drizzle-kit studio` 또는 직접 DB 접속)
- [ ] 기본 관리자 계정 생성 여부 확인

## 🔧 트러블슈팅

### 빌드 실패

**문제**: 빌드 중 오류 발생
**해결책**:
1. 로컬에서 `pnpm build` 실행하여 오류 확인
2. 환경 변수 누락 확인
3. 의존성 설치 확인 (`pnpm install`)

### 데이터베이스 연결 실패

**문제**: 배포 후 데이터베이스 연결 오류
**해결책**:
1. `DATABASE_URL` 환경 변수 형식 확인
2. 데이터베이스 호스트가 Vercel에서 접근 가능한지 확인
3. 방화벽 설정 확인 (일부 클라우드 DB는 IP 화이트리스트 필요)

### 스키마 마이그레이션 실패

**문제**: 배포 후 스키마 자동 배포 실패
**해결책**:
1. 로그 확인: Vercel Build Logs에서 오류 메시지 확인
2. 수동 실행: Vercel CLI 또는 로컬에서 수동으로 `pnpm db:push` 실행
3. 스키마 충돌 확인: 기존 스키마와의 충돌 여부 확인

### 환경 변수 누락

**문제**: 특정 기능이 동작하지 않음
**해결책**:
1. Vercel Dashboard에서 환경 변수 확인
2. 모든 환경(Production, Preview, Development)에 설정되어 있는지 확인
3. 환경 변수 이름 오타 확인

## 📊 모니터링

### Vercel Analytics
- 프로젝트에 이미 `@vercel/analytics` 패키지 포함
- 자동으로 페이지뷰 및 성능 데이터 수집

### 로그 확인
- Vercel Dashboard → Project → Logs
- 실시간 로그 스트림 확인 가능

## 🔒 보안 체크리스트

- [ ] `JWT_SECRET`이 충분히 강력한 랜덤 문자열인지 확인
- [ ] 환경 변수가 Git에 커밋되지 않았는지 확인 (`.gitignore` 확인)
- [ ] 데이터베이스 연결 문자열에 민감한 정보가 노출되지 않았는지 확인
- [ ] API Rate Limiting이 정상 동작하는지 확인

## 📝 추가 리소스

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)

