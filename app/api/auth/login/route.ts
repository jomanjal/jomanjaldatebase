import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { generateToken } from '@/lib/jwt'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { loginSchema } from '@/lib/validations'
import { handleError, validationError } from '@/lib/error-handler'

export async function POST(request: NextRequest) {
  // Rate Limiting: IP당 5회/분
  const ip = getClientIp(request)
  const rateLimitResult = rateLimit(5, 60000)(request) // 5회/1분
  
  if (!rateLimitResult.allowed) {
    return NextResponse.json({
      success: false,
      message: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.',
    }, {
      status: 429,
      headers: {
        'X-RateLimit-Limit': '5',
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
      },
    })
  }

  try {
    const body = await request.json()
    
    // Zod 스키마로 입력 검증
    const validationResult = loginSchema.safeParse(body)
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0]
      throw validationError(firstError.message || '입력값이 올바르지 않습니다.')
    }

    const { email, password } = validationResult.data

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
    return handleError(error, {
      path: '/api/auth/login',
      method: 'POST',
    })
  }
}

