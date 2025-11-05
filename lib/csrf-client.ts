/**
 * 클라이언트 사이드에서 CSRF 토큰을 가져오는 유틸리티
 */

/**
 * CSRF 토큰을 가져옵니다.
 * 서버에서 쿠키로 설정된 CSRF 토큰을 읽어옵니다.
 */
export async function getCsrfToken(): Promise<string | null> {
  try {
    const response = await fetch('/api/csrf-token', {
      method: 'GET',
      credentials: 'include',
    })
    
    if (!response.ok) {
      return null
    }
    
    const data = await response.json()
    return data.token || null
  } catch (error) {
    console.error('CSRF 토큰 가져오기 실패:', error)
    return null
  }
}

/**
 * API 요청에 CSRF 토큰을 포함시킵니다.
 */
export async function fetchWithCsrf(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getCsrfToken()
  
  const headers = new Headers(options.headers)
  if (token) {
    headers.set('X-CSRF-Token', token)
  }
  
  return fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  })
}

