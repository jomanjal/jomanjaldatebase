import { NextRequest, NextResponse } from 'next/server'

// MVP용 하드코딩된 계정 정보 (서버에만 존재)
const VALID_CREDENTIALS = {
  username: "admin112",
  password: "admin119"
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // 로그인 검증 (서버에서만 실행됨)
    if (username === VALID_CREDENTIALS.username && password === VALID_CREDENTIALS.password) {
      // 로그인 성공
      // 실제 프로덕션에서는 JWT 토큰을 생성해야 함
      return NextResponse.json({ 
        success: true, 
        user: { username },
        message: "로그인 성공"
      }, { status: 200 })
    } else {
      // 로그인 실패
      return NextResponse.json({ 
        success: false, 
        message: "아이디 또는 비밀번호가 올바르지 않습니다." 
      }, { status: 401 })
    }
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: "로그인 중 오류가 발생했습니다." 
    }, { status: 500 })
  }
}

