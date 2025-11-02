import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getTokenFromNextRequest } from '@/lib/jwt'

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromNextRequest(request)
    
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        message: '토큰이 제공되지 않았습니다.' 
      }, { status: 401 })
    }
    
    const payload = verifyToken(token)
    
    if (!payload) {
      return NextResponse.json({ 
        success: false, 
        message: '유효하지 않은 토큰입니다.' 
      }, { status: 401 })
    }
    
    return NextResponse.json({ 
      success: true, 
      user: {
        userId: payload.userId,
        username: payload.username,
        role: payload.role,
        email: payload.email,
      }
    }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: '토큰 검증 중 오류가 발생했습니다.' 
    }, { status: 500 })
  }
}

