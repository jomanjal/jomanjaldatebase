import { NextResponse } from 'next/server'

/**
 * 에러 타입 정의
 */
export enum ErrorType {
  // 인증/인가 에러
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  
  // 입력 검증 에러
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
  
  // 리소스 에러
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  
  // 서버 에러
  DATABASE_ERROR = 'DATABASE_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}

/**
 * 커스텀 에러 클래스
 */
export class AppError extends Error {
  constructor(
    public type: ErrorType,
    public message: string,
    public statusCode: number,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'AppError'
  }
}

/**
 * 에러 타입별 HTTP 상태 코드 매핑
 */
const ERROR_STATUS_MAP: Record<ErrorType, number> = {
  [ErrorType.UNAUTHORIZED]: 401,
  [ErrorType.FORBIDDEN]: 403,
  [ErrorType.VALIDATION_ERROR]: 400,
  [ErrorType.BAD_REQUEST]: 400,
  [ErrorType.NOT_FOUND]: 404,
  [ErrorType.CONFLICT]: 409,
  [ErrorType.DATABASE_ERROR]: 503,
  [ErrorType.INTERNAL_ERROR]: 500,
  [ErrorType.SERVICE_UNAVAILABLE]: 503,
}

/**
 * 에러 타입별 사용자 친화적 메시지
 */
const ERROR_MESSAGES: Record<ErrorType, string> = {
  [ErrorType.UNAUTHORIZED]: '인증이 필요합니다.',
  [ErrorType.FORBIDDEN]: '권한이 없습니다.',
  [ErrorType.VALIDATION_ERROR]: '입력값이 올바르지 않습니다.',
  [ErrorType.BAD_REQUEST]: '잘못된 요청입니다.',
  [ErrorType.NOT_FOUND]: '요청한 리소스를 찾을 수 없습니다.',
  [ErrorType.CONFLICT]: '이미 존재하는 리소스입니다.',
  [ErrorType.DATABASE_ERROR]: '데이터베이스 연결에 실패했습니다. 잠시 후 다시 시도해주세요.',
  [ErrorType.INTERNAL_ERROR]: '처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  [ErrorType.SERVICE_UNAVAILABLE]: '서비스를 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.',
}

/**
 * 에러 로깅 인터페이스
 */
interface ErrorLog {
  type: ErrorType
  message: string
  statusCode: number
  code?: string
  stack?: string
  details?: any
  timestamp: string
  path?: string
  method?: string
}

/**
 * 구조화된 에러 로깅
 */
function logError(error: ErrorLog): void {
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  if (isDevelopment) {
    // 개발 환경: 상세한 에러 정보 로깅
    console.error('[ERROR]', {
      type: error.type,
      message: error.message,
      statusCode: error.statusCode,
      code: error.code,
      stack: error.stack,
      details: error.details,
      timestamp: error.timestamp,
      path: error.path,
      method: error.method,
    })
  } else {
    // 프로덕션 환경: 최소한의 정보만 로깅
    console.error('[ERROR]', {
      type: error.type,
      message: error.message,
      statusCode: error.statusCode,
      timestamp: error.timestamp,
      // 민감한 정보는 제외
    })
  }
  
  // TODO: 향후 Sentry 등 외부 로깅 서비스 연동
  // if (process.env.SENTRY_DSN) {
  //   Sentry.captureException(error)
  // }
}

/**
 * 에러를 AppError로 변환
 */
function normalizeError(error: unknown, context?: { path?: string; method?: string }): AppError {
  // 이미 AppError인 경우
  if (error instanceof AppError) {
    return error
  }
  
  // 일반 Error 객체인 경우
  if (error instanceof Error) {
    // 데이터베이스 연결 오류
    if (
      (error as any).code === 'ECONNREFUSED' ||
      (error as any).code === 'ENOTFOUND' ||
      error.message?.includes('connect')
    ) {
      return new AppError(
        ErrorType.DATABASE_ERROR,
        ERROR_MESSAGES[ErrorType.DATABASE_ERROR],
        ERROR_STATUS_MAP[ErrorType.DATABASE_ERROR],
        (error as any).code
      )
    }
    
    // PostgreSQL 에러 코드 처리
    const pgError = error as any
    if (pgError.code === '23505') {
      // 중복 키 오류
      let message = '이미 존재하는 리소스입니다.'
      if (pgError.message?.includes('email')) {
        message = '이미 사용 중인 이메일입니다.'
      } else if (pgError.message?.includes('username')) {
        message = '이미 사용 중인 닉네임입니다.'
      }
      return new AppError(
        ErrorType.CONFLICT,
        message,
        ERROR_STATUS_MAP[ErrorType.CONFLICT],
        pgError.code
      )
    }
    
    // 인증/인가 에러
    if (error.message === '인증이 필요합니다.') {
      return new AppError(
        ErrorType.UNAUTHORIZED,
        error.message,
        ERROR_STATUS_MAP[ErrorType.UNAUTHORIZED]
      )
    }
    
    if (error.message === '관리자 권한이 필요합니다.' || error.message.includes('권한')) {
      return new AppError(
        ErrorType.FORBIDDEN,
        error.message,
        ERROR_STATUS_MAP[ErrorType.FORBIDDEN]
      )
    }
    
    // 기타 에러
    return new AppError(
      ErrorType.INTERNAL_ERROR,
      ERROR_MESSAGES[ErrorType.INTERNAL_ERROR],
      ERROR_STATUS_MAP[ErrorType.INTERNAL_ERROR],
      undefined,
      { originalError: error.message }
    )
  }
  
  // 알 수 없는 에러
  return new AppError(
    ErrorType.INTERNAL_ERROR,
    ERROR_MESSAGES[ErrorType.INTERNAL_ERROR],
    ERROR_STATUS_MAP[ErrorType.INTERNAL_ERROR],
    undefined,
    { originalError: String(error) }
  )
}

/**
 * 에러를 NextResponse로 변환
 */
export function handleError(
  error: unknown,
  context?: { path?: string; method?: string }
): NextResponse {
  const appError = normalizeError(error, context)
  
  // 에러 로깅
  logError({
    type: appError.type,
    message: appError.message,
    statusCode: appError.statusCode,
    code: appError.code,
    stack: appError.stack,
    details: appError.details,
    timestamp: new Date().toISOString(),
    path: context?.path,
    method: context?.method,
  })
  
  // NextResponse 반환
  return NextResponse.json(
    {
      success: false,
      message: appError.message,
      // 개발 환경에서만 에러 타입 포함
      ...(process.env.NODE_ENV === 'development' && {
        error: {
          type: appError.type,
          code: appError.code,
        },
      }),
    },
    { status: appError.statusCode }
  )
}

/**
 * API 핸들러 래퍼 함수
 * 에러를 자동으로 처리하는 고차 함수
 */
export function withErrorHandler<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>,
  context?: { path?: string; method?: string }
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      return handleError(error, context)
    }
  }
}

/**
 * 편의 함수: 인증 에러
 */
export function unauthorizedError(message?: string): AppError {
  return new AppError(
    ErrorType.UNAUTHORIZED,
    message || ERROR_MESSAGES[ErrorType.UNAUTHORIZED],
    ERROR_STATUS_MAP[ErrorType.UNAUTHORIZED]
  )
}

/**
 * 편의 함수: 권한 에러
 */
export function forbiddenError(message?: string): AppError {
  return new AppError(
    ErrorType.FORBIDDEN,
    message || ERROR_MESSAGES[ErrorType.FORBIDDEN],
    ERROR_STATUS_MAP[ErrorType.FORBIDDEN]
  )
}

/**
 * 편의 함수: 검증 에러
 */
export function validationError(message: string): AppError {
  return new AppError(
    ErrorType.VALIDATION_ERROR,
    message,
    ERROR_STATUS_MAP[ErrorType.VALIDATION_ERROR]
  )
}

/**
 * 편의 함수: 리소스 없음 에러
 */
export function notFoundError(message?: string): AppError {
  return new AppError(
    ErrorType.NOT_FOUND,
    message || ERROR_MESSAGES[ErrorType.NOT_FOUND],
    ERROR_STATUS_MAP[ErrorType.NOT_FOUND]
  )
}

/**
 * 편의 함수: 충돌 에러
 */
export function conflictError(message: string): AppError {
  return new AppError(
    ErrorType.CONFLICT,
    message,
    ERROR_STATUS_MAP[ErrorType.CONFLICT]
  )
}



