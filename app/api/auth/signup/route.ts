import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

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
    const { email, nickname, password, game, level } = await request.json()

    // 입력 검증
    if (!email || !nickname || !password) {
      return NextResponse.json({
        success: false,
        message: '이메일, 닉네임, 비밀번호는 필수 입력 항목입니다.'
      }, { status: 400 })
    }

    // 이메일 길이 검증
    if (email.length > 255) {
      return NextResponse.json({
        success: false,
        message: '이메일은 255자를 초과할 수 없습니다.'
      }, { status: 400 })
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        message: '올바른 이메일 형식을 입력해주세요.'
      }, { status: 400 })
    }

    // 비밀번호 검증 (최소 8자, 영문+숫자+특수문자 포함)
    if (password.length < 8) {
      return NextResponse.json({
        success: false,
        message: '비밀번호는 최소 8자 이상이어야 합니다.'
      }, { status: 400 })
    }

    if (!/(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) {
      return NextResponse.json({
        success: false,
        message: '비밀번호는 영문, 숫자, 특수문자를 각각 1개 이상 포함해야 합니다.'
      }, { status: 400 })
    }

    // 닉네임 검증 (2-20자)
    if (nickname.length < 2 || nickname.length > 20) {
      return NextResponse.json({
        success: false,
        message: '닉네임은 2자 이상 20자 이하여야 합니다.'
      }, { status: 400 })
    }

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
    console.error('Signup error:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    })

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

