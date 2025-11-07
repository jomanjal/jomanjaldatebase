import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getTokenFromNextRequest } from '@/lib/jwt'
import { handleError, unauthorizedError } from '@/lib/error-handler'

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromNextRequest(request)
    
    if (!token) {
      throw unauthorizedError('토큰이 제공되지 않았습니다.')
    }
    
    const payload = verifyToken(token)
    
    if (!payload) {
      throw unauthorizedError('유효하지 않은 토큰입니다.')
    }
    
    return NextResponse.json({ 
      success: true, 
      user: {
        id: payload.userId, // User 인터페이스에 맞게 id로 반환
        username: payload.username,
        role: payload.role,
        email: payload.email,
      }
    }, { status: 200 })
  } catch (error) {
    return handleError(error, {
      path: '/api/auth/verify',
      method: 'GET',
    })
  }
}

