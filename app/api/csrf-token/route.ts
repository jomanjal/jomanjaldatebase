import { NextRequest, NextResponse } from 'next/server'
import { getCsrfToken, setCsrfToken } from '@/lib/csrf'

/**
 * CSRF 토큰 조회 (GET)
 * 클라이언트에서 CSRF 토큰을 가져올 수 있도록 제공
 */
export async function GET(request: NextRequest) {
  try {
    // 기존 토큰이 있으면 반환, 없으면 새로 생성
    let token = await getCsrfToken()
    
    if (!token) {
      token = await setCsrfToken()
    }
    
    return NextResponse.json({
      success: true,
      token: token,
    }, { status: 200 })
  } catch (error) {
    console.error('CSRF 토큰 조회 오류:', error)
    return NextResponse.json({
      success: false,
      message: 'CSRF 토큰 조회 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}

