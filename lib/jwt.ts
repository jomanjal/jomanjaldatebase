import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = '7d' // 7일

export interface JWTPayload {
  userId: number
  username: string
  role: string
  email: string
}

/**
 * JWT 토큰 생성
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  })
}

/**
 * JWT 토큰 검증
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    return null
  }
}

/**
 * 요청에서 JWT 토큰 추출
 */
export function getTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  return null
}

/**
 * Next.js Request에서 JWT 토큰 추출 (쿠키 또는 헤더)
 */
export function getTokenFromNextRequest(request: { cookies?: { get: (name: string) => { value: string } | undefined }, headers: { get: (name: string) => string | null } }): string | null {
  // 먼저 쿠키에서 확인
  const cookieToken = request.cookies?.get('auth-token')
  if (cookieToken?.value) {
    return cookieToken.value
  }
  
  // 그 다음 Authorization 헤더에서 확인
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  return null
}

