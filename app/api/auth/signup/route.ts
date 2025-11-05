import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { signupSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  // Rate Limiting: IP당 3회/시간
  const ip = getClientIp(request)
  const rateLimitResult = rateLimit(3, 3600000)(request) // 3회/1시간
  
  if (!rateLimitResult.allowed) {
    return NextResponse.json({
      success: false,
      message: '너무 많은 요청이 발생했습니다. 1시간 후 다시 시도해주세요.',
    }, {
      status: 429,
      headers: {
        'X-RateLimit-Limit': '3',
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
      },
    })
  }

  try {
    const body = await request.json()
    
    // Zod 스키마로 입력 검증
    const validationResult = signupSchema.safeParse(body)
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0]
      return NextResponse.json({
        success: false,
        message: firstError.message || '입력값이 올바르지 않습니다.'
      }, { status: 400 })
    }

    const { email, nickname, password, game, level } = validationResult.data

    // 이메일 중복 확인
    const [existingEmail] = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (existingEmail) {
      return NextResponse.json({
        success: false,
        message: '이미 사용 중인 이메일입니다.'
      }, { status: 409 })
    }

    // 닉네임 중복 확인
    const [existingNickname] = await db.select()
      .from(users)
      .where(eq(users.username, nickname))
      .limit(1)

    if (existingNickname) {
      return NextResponse.json({
        success: false,
        message: '이미 사용 중인 닉네임입니다.'
      }, { status: 409 })
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10)

    // 사용자 생성
    const [newUser] = await db.insert(users).values({
      username: nickname,
      email: email,
      password: hashedPassword,
      role: 'user',
    }).returning()

    // 비밀번호는 응답에서 제외
    const { password: _, ...userWithoutPassword } = newUser

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      message: '회원가입이 완료되었습니다.'
    }, { status: 201 })
  } catch (error: any) {
    // 개발 환경에서만 상세 에러 로깅
    if (process.env.NODE_ENV === 'development') {
      console.error('Signup error:', error)
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack,
      })
    } else {
      // 프로덕션에서는 민감한 정보 없이 로깅
      console.error('Signup error:', error.message)
    }

    // 데이터베이스 연결 오류
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.message?.includes('connect')) {
      return NextResponse.json({
        success: false,
        message: '데이터베이스 연결에 실패했습니다. 잠시 후 다시 시도해주세요.'
      }, { status: 503 })
    }

    // 중복 키 오류 처리
    if (error.code === '23505') {
      if (error.message.includes('email')) {
        return NextResponse.json({
          success: false,
          message: '이미 사용 중인 이메일입니다.'
        }, { status: 409 })
      }
      if (error.message.includes('username')) {
        return NextResponse.json({
          success: false,
          message: '이미 사용 중인 닉네임입니다.'
        }, { status: 409 })
      }
    }

    return NextResponse.json({
      success: false,
      message: '회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    }, { status: 500 })
  }
}

