/**
 * CSRF 보호 유틸리티
 * Next.js App Router에서 CSRF 토큰 생성 및 검증
 */

import { cookies } from 'next/headers'
import crypto from 'crypto'

const CSRF_TOKEN_NAME = 'csrf-token'
const CSRF_TOKEN_EXPIRY = 60 * 60 * 24 // 24시간

/**
 * CSRF 토큰 생성
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * CSRF 토큰을 쿠키에 저장
 */
export async function setCsrfToken(): Promise<string> {
  const token = generateCsrfToken()
  const cookieStore = await cookies()
  
  cookieStore.set(CSRF_TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: CSRF_TOKEN_EXPIRY,
    path: '/',
  })
  
  return token
}

/**
 * 쿠키에서 CSRF 토큰 조회
 */
export async function getCsrfToken(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(CSRF_TOKEN_NAME)
  return token?.value || null
}

/**
 * CSRF 토큰 검증
 * @param requestToken - 요청에서 받은 토큰 (헤더 또는 body)
 * @returns 검증 성공 여부
 */
export async function verifyCsrfToken(requestToken: string | null): Promise<boolean> {
  if (!requestToken) {
    return false
  }
  
  const cookieToken = await getCsrfToken()
  
  if (!cookieToken) {
    return false
  }
  
  // 타임싱 어택 방지를 위한 constant-time 비교
  // 토큰 길이가 다르면 false 반환
  if (requestToken.length !== cookieToken.length) {
    return false
  }
  
  try {
    return crypto.timingSafeEqual(
      Buffer.from(requestToken),
      Buffer.from(cookieToken)
    )
  } catch {
    return false
  }
}

/**
 * CSRF 토큰 삭제
 */
export async function clearCsrfToken(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(CSRF_TOKEN_NAME)
}

