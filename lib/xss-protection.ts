/**
 * XSS 방지 유틸리티
 * 클라이언트 사이드에서 사용자 입력을 sanitize하기 위한 헬퍼 함수
 */

// 서버 사이드에서는 DOMPurify를 직접 사용할 수 없으므로,
// 기본적인 sanitization을 수행합니다.
// 클라이언트 사이드에서는 DOMPurify를 사용하는 것을 권장합니다.

export function sanitizeHtml(input: string): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  // HTML 태그 제거
  let sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // <script> 태그 제거
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // <iframe> 태그 제거
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '') // <object> 태그 제거
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '') // <embed> 태그 제거
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // 이벤트 핸들러 제거 (onclick, onerror 등)
    .replace(/javascript:/gi, '') // javascript: 프로토콜 제거
    .replace(/data:text\/html/gi, '') // data URI 제거
    .trim()

  return sanitized
}

export function sanitizeText(input: string): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  // 모든 HTML 태그 제거
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/&[^;]+;/g, '')
    .trim()
}

// URL 검증
export function sanitizeUrl(url: string): string | null {
  if (!url || typeof url !== 'string') {
    return null
  }

  try {
    const parsed = new URL(url)
    // 허용된 프로토콜만 허용
    const allowedProtocols = ['http:', 'https:']
    if (!allowedProtocols.includes(parsed.protocol)) {
      return null
    }
    return parsed.toString()
  } catch {
    return null
  }
}

