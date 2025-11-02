import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { generateToken } from '@/lib/jwt'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // 입력 검증
    if (!email || !password) {
      return NextResponse.json({ 
        success: false, 
        message: '이메일과 비밀번호를 입력해주세요.' 
      }, { status: 400 })
    }

    // 데이터베이스에서 사용자 조회 (이메일로)
    const [user] = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: '이메일 또는 비밀번호가 올바르지 않습니다.' 
      }, { status: 401 })
    }

    // 비밀번호 검증
    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    if (!isPasswordValid) {
      return NextResponse.json({ 
        success: false, 
        message: '이메일 또는 비밀번호가 올바르지 않습니다.' 
      }, { status: 401 })
    }

    // JWT 토큰 생성
    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role,
      email: user.email,
    })

    // 응답 생성
    const response = NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      message: '로그인 성공'
    }, { status: 200 })

    // 쿠키에 토큰 저장 (HttpOnly로 보안 강화)
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7일
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ 
      success: false, 
      message: '로그인 중 오류가 발생했습니다.' 
    }, { status: 500 })
  }
}

