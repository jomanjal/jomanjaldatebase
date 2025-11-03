# Vercel 수동 배포 가이드

## 1. Git 푸시 완료 ✅
변경사항이 GitHub에 성공적으로 푸시되었습니다.

## 2. Vercel CLI 배포 절차

### 2-1. Vercel 로그인 확인
```bash
vercel whoami
```

로그인되어 있지 않다면:
```bash
vercel login
```

### 2-2. 프로젝트 연결 확인

기존 프로젝트가 있다면:
```bash
vercel link
```

새 프로젝트를 만들려면:
```bash
vercel
```
- 프로젝트 이름 입력
- 디렉토리 설정 (현재 디렉토리 선택)
- 배포 설정 확인

### 2-3. 환경 변수 설정 (필수!)

Vercel Dashboard 또는 CLI로 환경 변수를 설정해야 합니다:

**CLI 방법:**
```bash
vercel env add DATABASE_URL
# 입력 프롬프트에서 값 입력 (프로덕션 환경 선택)

vercel env add JWT_SECRET
# 입력 프롬프트에서 값 입력 (프로덕션 환경 선택)

vercel env add NOTION_API_KEY
# 선택사항 - 웨이팅 리스트 기능 사용 시

vercel env add NOTION_DATABASE_ID
# 선택사항 - 웨이팅 리스트 기능 사용 시
```

**또는 Vercel Dashboard에서:**
1. https://vercel.com/dashboard 접속
2. 프로젝트 선택 → Settings → Environment Variables
3. 각 환경 변수 추가:
   - `DATABASE_URL` (Production, Preview, Development)
   - `JWT_SECRET` (Production, Preview, Development)
   - `NOTION_API_KEY` (선택사항)
   - `NOTION_DATABASE_ID` (선택사항)

### 2-4. 프로덕션 배포

```bash
vercel --prod
```

또는 특정 환경으로:
```bash
vercel --prod --env DATABASE_URL=your-value
```

## 3. 배포 확인

배포가 완료되면:
- 배포 URL이 표시됩니다 (예: `https://your-project.vercel.app`)
- Vercel Dashboard에서 배포 상태 확인 가능

## 4. 배포 후 확인사항

### 데이터베이스 스키마 확인
배포 후 자동으로 스키마가 푸시되지만, 확인하려면:
```bash
# 로컬에서 환경 변수 설정 후
pnpm db:push
```

### 기본 기능 테스트
- [ ] 홈페이지 로드 확인
- [ ] 코치 목록 페이지 동작 확인
- [ ] 로그인/회원가입 기능 확인
- [ ] API 엔드포인트 테스트

### 관리자 계정 생성
배포된 환경에서는 스크립트를 직접 실행할 수 없으므로:
1. 로컬에서 관리자 계정 생성 후 DB에 직접 추가
2. 또는 관리자 회원가입 API를 통해 생성 (개발 필요)

## 5. 문제 해결

### 빌드 실패
```bash
# 로컬에서 빌드 테스트
pnpm build
```

### 환경 변수 오류
```bash
# 현재 설정된 환경 변수 확인
vercel env ls
```

### 데이터베이스 연결 오류
- `DATABASE_URL` 형식 확인
- 데이터베이스 호스트가 Vercel에서 접근 가능한지 확인
- 방화벽/IP 화이트리스트 설정 확인


