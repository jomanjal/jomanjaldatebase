import { NextResponse } from 'next/server'
import { handleError } from '@/lib/error-handler'

export async function POST() {
  try {
    const response = NextResponse.json({ 
      success: true, 
      message: '로그아웃되었습니다.' 
    }, { status: 200 })

    // 쿠키에서 토큰 제거
    response.cookies.delete('auth-token')

    return response
  } catch (error) {
    return handleError(error, {
      path: '/api/auth/logout',
      method: 'POST',
    })
  }
}

