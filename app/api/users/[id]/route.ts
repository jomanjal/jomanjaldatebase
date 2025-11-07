import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth-server'
import { rateLimit } from '@/lib/rate-limit'
import { handleError, validationError, notFoundError, forbiddenError, conflictError, rateLimitExceededError } from '@/lib/error-handler'

/**
 * 유저 상세 조회 (GET)
 * 관리자 권한 필요
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate Limiting: IP당 30회/분
    const rateLimitResult = rateLimit(30, 60000)(request)
    if (!rateLimitResult.allowed) {
      throw rateLimitExceededError()
    }

    // 관리자 권한 확인
    await requireAdmin(request)

    const id = parseInt(params.id)
    if (isNaN(id)) {
      throw validationError('유효하지 않은 ID입니다.')
    }

    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1)

    if (!user) {
      throw notFoundError('유저를 찾을 수 없습니다.')
    }

    // 비밀번호는 응답에서 제외
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      data: userWithoutPassword
    }, { status: 200 })
  } catch (error) {
    return handleError(error, {
      path: '/api/users/[id]',
      method: 'GET',
    })
  }
}

/**
 * 유저 수정 (PATCH)
 * 관리자 권한 필요
 * 역할 변경, 닉네임 변경 등
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate Limiting: IP당 20회/분
    const rateLimitResult = rateLimit(20, 60000)(request)
    if (!rateLimitResult.allowed) {
      throw rateLimitExceededError()
    }

    // 관리자 권한 확인
    await requireAdmin(request)

    const id = parseInt(params.id)
    if (isNaN(id)) {
      throw validationError('유효하지 않은 ID입니다.')
    }

    const body = await request.json()
    const { role, username, email } = body

    // 업데이트할 데이터 구성
    const updateData: any = {
      updatedAt: new Date(),
    }

    if (role !== undefined) {
      // 역할 유효성 검증
      if (!['user', 'admin', 'coach'].includes(role)) {
        throw validationError('유효하지 않은 역할입니다.')
      }
      updateData.role = role
    }

    if (username !== undefined) {
      // 닉네임 길이 검증
      if (username.length < 2 || username.length > 20) {
        throw validationError('닉네임은 2자 이상 20자 이하여야 합니다.')
      }
      updateData.username = username
    }

    if (email !== undefined) {
      // 이메일 형식 검증
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        throw validationError('올바른 이메일 형식을 입력해주세요.')
      }
      updateData.email = email
    }

    // 업데이트
    const [updated] = await db.update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning()

    if (!updated) {
      throw notFoundError('유저를 찾을 수 없습니다.')
    }

    // 비밀번호는 응답에서 제외
    const { password: _, ...userWithoutPassword } = updated

    return NextResponse.json({
      success: true,
      data: userWithoutPassword,
      message: '유저 정보가 업데이트되었습니다.'
    }, { status: 200 })
  } catch (error) {
    // 중복 키 오류 처리
    if (error instanceof Error && 'code' in error && error.code === '23505') {
      if (error.message.includes('email')) {
        throw conflictError('이미 사용 중인 이메일입니다.')
      }
      if (error.message.includes('username')) {
        throw conflictError('이미 사용 중인 닉네임입니다.')
      }
    }
    
    return handleError(error, {
      path: '/api/users/[id]',
      method: 'PATCH',
    })
  }
}

/**
 * 유저 삭제 (DELETE)
 * 관리자 권한 필요
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate Limiting: IP당 10회/분 (삭제는 더 엄격하게)
    const rateLimitResult = rateLimit(10, 60000)(request)
    if (!rateLimitResult.allowed) {
      throw rateLimitExceededError()
    }

    // 관리자 권한 확인
    const adminUser = await requireAdmin(request)

    const id = parseInt(params.id)
    if (isNaN(id)) {
      throw validationError('유효하지 않은 ID입니다.')
    }

    // 자기 자신은 삭제 불가
    if (id === adminUser.userId) {
      throw validationError('자기 자신은 삭제할 수 없습니다.')
    }

    // 삭제 전에 유저 존재 확인
    const [userToDelete] = await db.select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1)

    if (!userToDelete) {
      throw notFoundError('유저를 찾을 수 없습니다.')
    }

    // 유저 삭제
    await db.delete(users)
      .where(eq(users.id, id))

    return NextResponse.json({
      success: true,
      message: '유저가 삭제되었습니다.'
    }, { status: 200 })
  } catch (error) {
    return handleError(error, {
      path: '/api/users/[id]',
      method: 'DELETE',
    })
  }
}

