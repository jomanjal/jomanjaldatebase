# 보안 구현 가이드

이 문서는 GameCoach.AI 프로젝트의 보안 구현 가이드입니다. 새로운 기능을 추가할 때 이 가이드를 따라주세요.

## 1. 입력 검증 (Input Validation)

### 서버 사이드
모든 API 엔드포인트에서 **Zod 스키마**를 사용하여 입력을 검증해야 합니다.

**파일**: `lib/validations.ts`에 스키마 정의

**사용 예시**:
```typescript
import { enrollmentSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  // Zod 스키마로 입력 검증
  const validationResult = enrollmentSchema.safeParse(body)
  if (!validationResult.success) {
    const firstError = validationResult.error.errors[0]
    return NextResponse.json({
      success: false,
      message: firstError.message || '입력값이 올바르지 않습니다.'
    }, { status: 400 })
  }

  const { coachId, message } = validationResult.data
  // ... 나머지 로직
}
```

### 주요 스키마
- `loginSchema`: 로그인
- `signupSchema`: 회원가입
- `enrollmentSchema`: 수강 신청
- `enrollmentStatusUpdateSchema`: 수강 신청 상태 변경
- `reviewSchema`: 리뷰 작성
- `reviewStatusUpdateSchema`: 리뷰 상태 변경
- `coachScheduleSchema`: 코치 일정
- `coachSearchSchema`: 코치 검색
- `idSchema`: ID 검증
- `ratingSchema`: 평점 검증

## 2. SQL Injection 방지

### 원칙
- **항상 Drizzle ORM 사용** (파라미터화된 쿼리 자동 처리)
- 검색어는 `sanitizeSearchQuery()` 사용
- 직접 SQL 쿼리 작성 금지

**사용 예시**:
```typescript
import { sanitizeSearchQuery } from '@/lib/validations'

const search = searchParams.get('search') || ''
const sanitizedSearch = search ? sanitizeSearchQuery(search) : ''

// Drizzle ORM 사용
conditions.push(sql`${coaches.name} ILIKE ${`%${sanitizedSearch}%`}`)
```

## 3. XSS 방지 (DOMPurify)

### 클라이언트 사이드
모든 **사용자 입력을 렌더링**하는 경우 `sanitizeText()` 또는 `sanitizeHtml()`을 사용해야 합니다.

**파일**: `lib/dompurify-client.ts`

**사용 예시**:
```typescript
import { sanitizeText } from '@/lib/dompurify-client'

// 텍스트만 허용 (모든 HTML 태그 제거)
<p>{sanitizeText(userMessage)}</p>

// HTML 일부 허용 (필요한 경우)
import { sanitizeHtml } from '@/lib/dompurify-client'
<div dangerouslySetInnerHTML={{ __html: sanitizeHtml(content, true) }} />
```

### 적용 위치
- ✅ `app/my/enrollments/page.tsx`: enrollment.message, enrollment.coachMessage
- ✅ `app/my/students/page.tsx`: enrollment.message, enrollment.coachMessage
- ✅ `app/coaches/[id]/page.tsx`: review.comment
- ✅ `app/reviews/page.tsx`: review.comment
- ✅ `app/admin/reviews/page.tsx`: review.comment

## 4. CSRF 보호

### 서버 사이드
모든 **POST, PATCH, DELETE** 엔드포인트에 CSRF 토큰 검증을 추가해야 합니다.

**파일**: `lib/csrf.ts`

**사용 예시**:
```typescript
import { verifyCsrfToken } from '@/lib/csrf'

export async function POST(request: NextRequest) {
  // 인증 확인
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({
      success: false,
      message: '인증이 필요합니다.'
    }, { status: 401 })
  }

  // CSRF 토큰 검증 (인증 확인 후, body 읽기 전)
  const csrfToken = request.headers.get('X-CSRF-Token')
  if (!await verifyCsrfToken(csrfToken)) {
    return NextResponse.json({
      success: false,
      message: 'CSRF 토큰이 유효하지 않습니다.'
    }, { status: 403 })
  }

  const body = await request.json()
  // ... 나머지 로직
}
```

### 클라이언트 사이드
모든 **POST, PATCH, DELETE** 요청에서 `fetchWithCsrf`를 사용해야 합니다.

**파일**: `lib/csrf-client.ts`

**사용 예시**:
```typescript
import { fetchWithCsrf } from '@/lib/csrf-client'

// 일반 fetch 대신 fetchWithCsrf 사용
const response = await fetchWithCsrf('/api/enrollments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    coachId: coachId,
    message: message,
  }),
})
```

### CSRF 보호가 필요한 엔드포인트
- ✅ `POST /api/enrollments` (수강 신청)
- ✅ `PATCH /api/enrollments/[id]` (상태 변경)
- ✅ `POST /api/reviews` (리뷰 작성)
- ✅ `POST /api/coaches/my/schedule` (일정 저장)
- ⚠️ `POST /api/auth/login` (로그인 - 선택사항)
- ⚠️ `POST /api/auth/signup` (회원가입 - 선택사항)

### CSRF 보호가 필요 없는 엔드포인트
- `GET /api/*` (모든 GET 요청)
- `GET /api/csrf-token` (CSRF 토큰 조회)

## 5. 프로덕션 환경 디버깅 정보 제거

### 원칙
프로덕션 환경에서는 **상세한 에러 정보를 로깅하지 않습니다**.

**사용 예시**:
```typescript
} catch (error: any) {
  // 개발 환경에서만 상세 에러 로깅
  if (process.env.NODE_ENV === 'development') {
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    })
  } else {
    // 프로덕션에서는 민감한 정보 없이 로깅
    console.error('Error:', error.message)
  }
  
  return NextResponse.json({
    success: false,
    message: '처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
  }, { status: 500 })
}
```

## 6. 체크리스트

새로운 API 엔드포인트를 만들 때 다음을 확인하세요:

### POST/PATCH/DELETE API
- [ ] Zod 스키마로 입력 검증
- [ ] CSRF 토큰 검증 추가
- [ ] 프로덕션 환경 디버깅 정보 제거
- [ ] SQL Injection 방지 (Drizzle ORM 사용)

### GET API
- [ ] 입력 파라미터 검증 (idSchema, sanitizeSearchQuery 등)
- [ ] 프로덕션 환경 디버깅 정보 제거

### 클라이언트 사이드 렌더링
- [ ] 사용자 입력 렌더링 시 `sanitizeText()` 사용
- [ ] POST/PATCH/DELETE 요청 시 `fetchWithCsrf` 사용

## 7. 참고 파일

### 서버 사이드
- `lib/validations.ts`: 입력 검증 스키마
- `lib/csrf.ts`: CSRF 토큰 관리
- `lib/xss-protection.ts`: 서버 사이드 XSS 방지 (참고용)

### 클라이언트 사이드
- `lib/dompurify-client.ts`: 클라이언트 사이드 XSS 방지
- `lib/csrf-client.ts`: CSRF 토큰 전송

### API 엔드포인트 예시
- `app/api/enrollments/route.ts`: 수강 신청 (POST)
- `app/api/enrollments/[id]/route.ts`: 수강 신청 상태 변경 (PATCH)
- `app/api/coaches/my/schedule/route.ts`: 일정 저장 (POST)

## 8. 주의사항

1. **CSRF 토큰은 인증 확인 후, body 읽기 전에 검증**해야 합니다.
2. **GET 요청에는 CSRF 보호를 적용하지 않습니다** (보안상 불필요).
3. **DOMPurify는 클라이언트 컴포넌트에서만 사용** 가능합니다 (서버 컴포넌트에서는 사용 불가).
4. **모든 사용자 입력은 신뢰하지 않으며**, 서버와 클라이언트 양쪽에서 검증해야 합니다.

---

**최종 업데이트**: 2025-01-XX
**담당자**: AI Assistant (자동 참조용)

