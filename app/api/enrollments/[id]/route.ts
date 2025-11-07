import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { enrollments, coaches } from '@/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { getAuthenticatedUser } from '@/lib/auth-server'
import { enrollmentStatusUpdateSchema, idSchema } from '@/lib/validations'
import { verifyCsrfToken } from '@/lib/csrf'
import { handleError, unauthorizedError, validationError, notFoundError, forbiddenError } from '@/lib/error-handler'

/**
 * 수강 신청 상세 조회 (GET)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 인증 확인
    const user = await getAuthenticatedUser(request)
    if (!user) {
      throw unauthorizedError()
    }

    // ID 검증
    const idValidation = idSchema.safeParse(params.id)
    if (!idValidation.success) {
      throw validationError('유효하지 않은 ID입니다.')
    }
    const id = idValidation.data

    const [enrollment] = await db.select()
      .from(enrollments)
      .where(eq(enrollments.id, id))
      .limit(1)

    if (!enrollment) {
      throw notFoundError('수강 신청을 찾을 수 없습니다.')
    }

    // 권한 확인: 자신의 신청이거나, 코치가 자신의 코치 프로필에 대한 신청이거나, 관리자
    if (user.role !== 'admin') {
      if (enrollment.userId !== user.userId) {
        // 코치인 경우 자신의 코치 프로필인지 확인
        if (user.role === 'coach') {
          const [coach] = await db.select()
            .from(coaches)
            .where(and(
              eq(coaches.userId, user.userId),
              eq(coaches.id, enrollment.coachId)
            ))
            .limit(1)
          
          if (!coach) {
            throw forbiddenError('권한이 없습니다.')
          }
        } else {
          throw forbiddenError('권한이 없습니다.')
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: enrollment
    }, { status: 200 })
  } catch (error) {
    return handleError(error, {
      path: '/api/enrollments/[id]',
      method: 'GET',
    })
  }
}

/**
 * 수강 신청 상태 변경 (PATCH)
 * - 승인/거절: 코치 또는 관리자
 * - 취소: 사용자
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 인증 확인
    const user = await getAuthenticatedUser(request)
    if (!user) {
      throw unauthorizedError()
    }

    // CSRF 토큰 검증
    const csrfToken = request.headers.get('X-CSRF-Token')
    if (!await verifyCsrfToken(csrfToken)) {
      throw forbiddenError('CSRF 토큰이 유효하지 않습니다.')
    }

    // ID 검증
    const idValidation = idSchema.safeParse(params.id)
    if (!idValidation.success) {
      throw validationError('유효하지 않은 ID입니다.')
    }
    const id = idValidation.data

    const body = await request.json()
    
    // Zod 스키마로 입력 검증
    const validationResult = enrollmentStatusUpdateSchema.safeParse(body)
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0]
      throw validationError(firstError.message || '입력값이 올바르지 않습니다.')
    }

    const { status, coachMessage } = validationResult.data

    // 수강 신청 조회
    const [enrollment] = await db.select()
      .from(enrollments)
      .where(eq(enrollments.id, id))
      .limit(1)

    if (!enrollment) {
      throw notFoundError('수강 신청을 찾을 수 없습니다.')
    }

    // 권한 및 상태 변경 검증
    let canUpdate = false
    let newStatus = status

    if (status === 'approved' || status === 'rejected') {
      // 승인/거절: 코치 또는 관리자만 가능
      if (user.role === 'admin') {
        canUpdate = true
      } else if (user.role === 'coach') {
        // 코치인 경우 자신의 코치 프로필인지 확인
        const [coach] = await db.select()
          .from(coaches)
          .where(and(
            eq(coaches.userId, user.userId),
            eq(coaches.id, enrollment.coachId)
          ))
          .limit(1)
        
        if (coach) {
          canUpdate = true
        }
      }
      
      if (!canUpdate) {
        throw forbiddenError('승인/거절 권한이 없습니다.')
      }

      // pending 상태에서만 승인/거절 가능
      if (enrollment.status !== 'pending') {
        throw validationError('대기 중인 신청만 승인/거절할 수 있습니다.')
      }
    } else if (status === 'cancelled') {
      // 취소: 사용자 본인, 관리자, 또는 코치(자신의 코치 프로필에 대한 신청)
      if (user.role === 'admin' || enrollment.userId === user.userId) {
        canUpdate = true
      } else if (user.role === 'coach') {
        // 코치인 경우 자신의 코치 프로필인지 확인
        const [coach] = await db.select()
          .from(coaches)
          .where(and(
            eq(coaches.userId, user.userId),
            eq(coaches.id, enrollment.coachId)
          ))
          .limit(1)
        
        if (coach) {
          canUpdate = true
        }
      }
      
      if (!canUpdate) {
        throw forbiddenError('취소 권한이 없습니다.')
      }

      // pending 또는 approved 상태에서만 취소 가능
      if (enrollment.status !== 'pending' && enrollment.status !== 'approved') {
        throw validationError('대기 중이거나 승인된 신청만 취소할 수 있습니다.')
      }
    } else if (status === 'completed') {
      // 완료: 관리자만 가능
      if (user.role === 'admin') {
        canUpdate = true
        newStatus = 'completed'
      } else {
        throw forbiddenError('완료 처리는 관리자만 가능합니다.')
      }
    } else {
      throw validationError('유효하지 않은 상태입니다.')
    }

    // 상태 업데이트
    const updateData: any = {
      updatedAt: new Date(),
    }
    
    if (newStatus) {
      updateData.status = newStatus
    }
    
    // 코치 메시지는 승인, 거절, 취소 시 모두 저장 가능
    if (coachMessage && (status === 'approved' || status === 'rejected' || status === 'cancelled')) {
      updateData.coachMessage = coachMessage
    }

    const [updated] = await db.update(enrollments)
      .set(updateData)
      .where(eq(enrollments.id, id))
      .returning()

    // 승인된 경우 코치의 students 수 증가
    if (status === 'approved') {
      await db.update(coaches)
        .set({
          students: sql`${coaches.students} + 1`,
        })
        .where(eq(coaches.id, enrollment.coachId))
    }

    // 취소된 경우 (이전에 승인되었던 경우) 코치의 students 수 감소
    if (status === 'cancelled' && enrollment.status === 'approved') {
      await db.update(coaches)
        .set({
          students: sql`GREATEST(${coaches.students} - 1, 0)`,
        })
        .where(eq(coaches.id, enrollment.coachId))
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: '수강 신청 상태가 변경되었습니다.'
    }, { status: 200 })
  } catch (error) {
    return handleError(error, {
      path: '/api/enrollments/[id]',
      method: 'PATCH',
    })
  }
}

