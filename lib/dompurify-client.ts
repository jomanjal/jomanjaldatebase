/**
 * 클라이언트 사이드에서 사용할 DOMPurify 유틸리티
 * 서버 사이드에서는 사용할 수 없으므로 클라이언트 컴포넌트에서만 import
 */

import DOMPurify from 'dompurify'

/**
 * HTML을 sanitize하여 안전하게 렌더링
 * @param html - sanitize할 HTML 문자열
 * @param allowHtml - HTML 태그를 허용할지 여부 (기본값: false, 텍스트만)
 * @returns sanitize된 HTML 문자열
 */
export function sanitizeHtml(html: string | null | undefined, allowHtml: boolean = false): string {
  if (!html || typeof html !== 'string') {
    return ''
  }

  if (allowHtml) {
    // HTML 태그는 허용하되, 위험한 태그와 속성만 제거
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: ['href'],
      ALLOW_DATA_ATTR: false,
    })
  } else {
    // 텍스트만 허용 (모든 HTML 태그 제거)
    return DOMPurify.sanitize(html, { ALLOWED_TAGS: [] })
  }
}

/**
 * 텍스트만 sanitize (HTML 태그 완전 제거)
 */
export function sanitizeText(text: string | null | undefined): string {
  return sanitizeHtml(text, false)
}

