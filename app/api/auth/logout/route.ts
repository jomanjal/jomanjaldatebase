import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ 
    success: true, 
    message: '로그아웃되었습니다.' 
  }, { status: 200 })

  // 쿠키에서 토큰 제거
  response.cookies.delete('auth-token')

  return response
}

