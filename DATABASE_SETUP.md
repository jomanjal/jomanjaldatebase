# PostgreSQL 데이터베이스 설정 가이드

## 1. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# PostgreSQL 연결 정보
DATABASE_URL="postgresql://username:password@localhost:5432/gamecoach_ai"

# JWT 시크릿 키 (인증용) - 프로덕션에서는 반드시 변경하세요
JWT_SECRET="your-super-secret-key-here-change-in-production"
```

### PostgreSQL 연결 문자열 형식:
```
postgresql://[사용자명]:[비밀번호]@[호스트]:[포트]/[데이터베이스명]
```

예시:
```env
DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/gamecoach_ai"
```

## 2. 데이터베이스 생성

PostgreSQL에 데이터베이스를 생성하세요:

```sql
CREATE DATABASE gamecoach_ai;
```

또는 psql 명령어로:
```bash
psql -U postgres
CREATE DATABASE gamecoach_ai;
```

## 3. 마이그레이션 실행

### 스키마 생성 (마이그레이션 파일 생성)
```bash
pnpm db:generate
```

### 데이터베이스에 적용
```bash
pnpm db:push
```

또는 마이그레이션 파일로 적용:
```bash
pnpm db:migrate
```

## 4. Drizzle Studio 실행 (선택사항)

데이터베이스를 시각적으로 확인하고 관리하려면:
```bash
pnpm db:studio
```

브라우저에서 `http://localhost:4983`로 접속하면 됩니다.

## 5. 초기 관리자 계정 생성

데이터베이스가 생성된 후, 초기 관리자 계정을 생성하려면 별도의 스크립트를 실행하거나 관리자 페이지에서 회원가입 기능을 사용하세요.

## 트러블슈팅

### 연결 오류가 발생하는 경우
1. PostgreSQL 서비스가 실행 중인지 확인
2. `.env.local` 파일의 DATABASE_URL이 올바른지 확인
3. 사용자 권한 확인 (데이터베이스 생성/접근 권한)

### 마이그레이션 오류
- 기존 테이블과 충돌하는 경우: 데이터베이스를 드롭하고 다시 생성하거나 수동으로 스키마를 수정하세요

