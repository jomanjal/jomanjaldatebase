/**
 * 간단한 메모리 기반 Rate Limiter
 * 프로덕션 환경에서는 Redis 등을 사용하는 것을 권장합니다.
 */

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

/**
 * Rate Limit 체크
 * @param key - 요청을 구분할 키 (보통 IP 주소)
 * @param maxRequests - 최대 요청 수
 * @param windowMs - 시간 윈도우 (밀리초)
 * @returns 허용 여부와 남은 요청 수
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const record = store[key]

  // 기록이 없거나 윈도우가 만료된 경우
  if (!record || now > record.resetTime) {
    store[key] = {
      count: 1,
      resetTime: now + windowMs,
    }
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs,
    }
  }

  // 요청 수가 초과한 경우
  if (record.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    }
  }

  // 요청 수 증가
  record.count++
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetTime: record.resetTime,
  }
}

/**
 * IP 주소 추출 (프록시 헤더 고려)
 */
export function getClientIp(request: Request | { headers: Headers }): string {
  // Next.js의 headers에서 IP 추출
  const headers = 'headers' in request ? request.headers : (request as any).headers
  const forwarded = headers.get('x-forwarded-for')
  const realIp = headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIp) {
    return realIp.trim()
  }
  
  return 'unknown'
}

/**
 * Rate Limit 미들웨어 (Next.js API Routes용)
 */
export function rateLimit(
  maxRequests: number,
  windowMs: number,
  getKey?: (request: Request | { headers: Headers }) => string
) {
  return (request: Request | { headers: Headers }): { allowed: boolean; remaining: number; resetTime: number } => {
    const key = getKey ? getKey(request) : getClientIp(request)
    return checkRateLimit(key, maxRequests, windowMs)
  }
}

// 정기적으로 오래된 기록 정리 (메모리 누수 방지)
// Next.js 서버리스 환경에서는 제한적으로 작동할 수 있음
// 프로덕션에서는 Redis 등의 외부 저장소 사용 권장
if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
  // 개발 환경에서만 setInterval 사용
  if (typeof setInterval !== 'undefined') {
    setInterval(() => {
      const now = Date.now()
      Object.keys(store).forEach(key => {
        if (store[key].resetTime < now) {
          delete store[key]
        }
      })
    }, 60000) // 1분마다 정리
  }
}

