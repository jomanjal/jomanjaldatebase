# 에러 처리 가이드

이 문서는 GameCoach.AI 프로젝트의 중앙화된 에러 처리 시스템 사용 가이드입니다.

## 개요

모든 API 엔드포인트에서 일관된 에러 처리를 위해 `lib/error-handler.ts`를 사용합니다.

## 기본 사용법

### 1. 에러 처리 함수 import

```typescript
import { handleError, validationError, conflictError, notFoundError } from '@/lib/error-handler'
```

### 2. try-catch 블록에서 사용

```typescript
export async function POST(request: NextRequest) {
  try {
    // API 로직
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    return handleError(error, {
      path: '/api/your-endpoint',
      method: 'POST',
    })
  }
}
```

## 에러 타입별 처리

### 검증 에러 (400)

```typescript
import { validationError } from '@/lib/error-handler'

// Zod 검증 실패 시
const validationResult = schema.safeParse(body)
if (!validationResult.success) {
  const firstError = validationResult.error.errors[0]
  throw validationError(firstError.message)
}
```

### 충돌 에러 (409)

```typescript
import { conflictError } from '@/lib/error-handler'

// 중복 리소스 체크
if (existingResource) {
  throw conflictError('이미 사용 중인 이메일입니다.')
}
```

### 리소스 없음 (404)

```typescript
import { notFoundError } from '@/lib/error-handler'

// 리소스 조회 실패
if (!resource) {
  throw notFoundError('코치를 찾을 수 없습니다.')
}
```

### 인증/인가 에러

```typescript
import { unauthorizedError, forbiddenError } from '@/lib/error-handler'

// 인증 실패
if (!user) {
  throw unauthorizedError()
}

// 권한 없음
if (!user.isAdmin) {
  throw forbiddenError('관리자 권한이 필요합니다.')
}
```

## 자동 에러 처리

`handleError` 함수는 다음을 자동으로 처리합니다:

1. **에러 타입 감지**: 데이터베이스 연결 오류, PostgreSQL 에러 코드 등
2. **에러 로깅**: 개발/프로덕션 환경에 맞는 로깅
3. **HTTP 상태 코드**: 에러 타입에 맞는 상태 코드 반환
4. **사용자 친화적 메시지**: 에러 타입별 기본 메시지 제공

## 에러 타입

- `UNAUTHORIZED` (401): 인증 필요
- `FORBIDDEN` (403): 권한 없음
- `VALIDATION_ERROR` (400): 입력 검증 실패
- `BAD_REQUEST` (400): 잘못된 요청
- `NOT_FOUND` (404): 리소스 없음
- `CONFLICT` (409): 리소스 충돌
- `DATABASE_ERROR` (503): 데이터베이스 연결 오류
- `INTERNAL_ERROR` (500): 내부 서버 오류
- `SERVICE_UNAVAILABLE` (503): 서비스 사용 불가

## 마이그레이션 가이드

### Before (기존 방식)

```typescript
try {
  // 로직
} catch (error: any) {
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', error)
  } else {
    console.error('Error:', error.message)
  }
  
  if (error.code === 'ECONNREFUSED') {
    return NextResponse.json({
      success: false,
      message: '데이터베이스 연결 실패'
    }, { status: 503 })
  }
  
  return NextResponse.json({
    success: false,
    message: '오류 발생'
  }, { status: 500 })
}
```

### After (새 방식)

```typescript
try {
  // 로직
} catch (error) {
  return handleError(error, {
    path: '/api/endpoint',
    method: 'POST',
  })
}
```

## 예시: 완전한 API 엔드포인트

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { handleError, validationError, notFoundError } from '@/lib/error-handler'
import { someSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 입력 검증
    const validationResult = someSchema.safeParse(body)
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0]
      throw validationError(firstError.message)
    }
    
    // 비즈니스 로직
    const result = await someBusinessLogic(validationResult.data)
    
    if (!result) {
      throw notFoundError('리소스를 찾을 수 없습니다.')
    }
    
    return NextResponse.json({
      success: true,
      data: result,
    }, { status: 200 })
  } catch (error) {
    return handleError(error, {
      path: '/api/your-endpoint',
      method: 'POST',
    })
  }
}
```

## 주의사항

1. **에러는 throw로 던지기**: `return` 대신 `throw`를 사용하여 에러를 전파합니다.
2. **컨텍스트 제공**: `handleError`에 path와 method를 제공하면 로깅이 더 정확해집니다.
3. **커스텀 메시지**: 필요시 에러 함수에 커스텀 메시지를 전달할 수 있습니다.

## 향후 개선 사항

- [ ] Sentry 등 외부 로깅 서비스 연동
- [ ] 에러 메트릭 수집
- [ ] 에러 알림 시스템



