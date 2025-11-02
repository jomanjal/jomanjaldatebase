import { NextRequest } from 'next/server'
import { verifyToken, getTokenFromNextRequest } from './jwt'
import { db } from './db'
import { users, admins } from './db/schema'
import { eq } from 'drizzle-orm'

export interface AuthenticatedUser {
  userId: number
  username: string
  email: string
  role: string
  isAdmin: boolean
}

/**
 * 요청에서 인증된 사용자 정보 가져오기 (서버 사이드)
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    const token = getTokenFromNextRequest(request)
    
    if (!token) {
      return null
    }
    
    const payload = verifyToken(token)
    
    if (!payload) {
      return null
    }
    
    // 데이터베이스에서 사용자 정보 확인 (최신 정보 가져오기)
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, payload.userId))
      .limit(1)
    
    if (!user) {
      return null
    }
    
    // 관리자 여부 확인
    const [admin] = await db.select()
      .from(admins)
      .where(eq(admins.userId, user.id))
      .limit(1)
    
    return {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      isAdmin: !!admin || user.role === 'admin',
    }
  } catch (error) {
    console.error('getAuthenticatedUser error:', error)
    return null
  }
}

/**
 * 관리자 권한 확인
 */
export async function requireAdmin(request: NextRequest): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser(request)
  
  if (!user) {
    throw new Error('인증이 필요합니다.')
  }
  
  if (!user.isAdmin && user.role !== 'admin') {
    throw new Error('관리자 권한이 필요합니다.')
  }
  
  return user
}

