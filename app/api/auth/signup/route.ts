import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { signupSchema } from '@/lib/validations'
import { handleError, validationError, conflictError } from '@/lib/error-handler'

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
      throw validationError(firstError.message || '입력값이 올바르지 않습니다.')
    }

    const { email, nickname, password, game, level } = validationResult.data

    // 이메일 중복 확인
    const [existingEmail] = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (existingEmail) {
      throw conflictError('이미 사용 중인 이메일입니다.')
    }

    // 닉네임 중복 확인
    const [existingNickname] = await db.select()
      .from(users)
      .where(eq(users.username, nickname))
      .limit(1)

    if (existingNickname) {
      throw conflictError('이미 사용 중인 닉네임입니다.')
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
  } catch (error) {
    return handleError(error, {
      path: '/api/auth/signup',
      method: 'POST',
    })
  }
}

