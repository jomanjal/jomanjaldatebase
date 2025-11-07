import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getTokenFromNextRequest } from '@/lib/jwt'
import { handleError } from '@/lib/error-handler'

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromNextRequest(request)
    
    // 토큰이 없는 경우는 정상적인 상황 (로그인하지 않은 사용자)
    // 에러를 던지지 않고 success: false를 반환
    if (!token) {
      return NextResponse.json({ 
        success: false,
        message: '토큰이 제공되지 않았습니다.'
      }, { status: 200 })
    }
    
    const payload = verifyToken(token)
    
    // 유효하지 않은 토큰인 경우도 정상 응답으로 처리
    if (!payload) {
      return NextResponse.json({ 
        success: false,
        message: '유효하지 않은 토큰입니다.'
      }, { status: 200 })
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
    // 예상치 못한 에러만 handleError로 처리
    return handleError(error, {
      path: '/api/auth/verify',
      method: 'GET',
    })
  }
}

