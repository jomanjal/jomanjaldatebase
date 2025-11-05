import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { enrollments, coaches, users } from '@/lib/db/schema'
import { eq, and, desc, count, sql } from 'drizzle-orm'
import { getAuthenticatedUser } from '@/lib/auth-server'
import { enrollmentSchema, sanitizeSearchQuery } from '@/lib/validations'
import { verifyCsrfToken } from '@/lib/csrf'

/**
 * 수강 신청 목록 조회 (GET)
 */
export async function GET(request: NextRequest) {
  try {
    // 인증 확인
    const user = await getAuthenticatedUser(request)
    if (!user || !user.userId) {
      return NextResponse.json({
        success: false,
        message: '인증이 필요합니다.'
      }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const coachId = searchParams.get('coachId')
    const status = searchParams.get('status')
    const role = searchParams.get('role') // 'user' 또는 'coach'
    
    // 입력 검증 및 sanitization
    const validatedUserId = userId ? parseInt(userId, 10) : null
    const validatedCoachId = coachId ? parseInt(coachId, 10) : null
    
    if (userId && (isNaN(validatedUserId!) || validatedUserId! <= 0)) {
      return NextResponse.json({
        success: false,
        message: '유효하지 않은 사용자 ID입니다.'
      }, { status: 400 })
    }
    
    if (coachId && (isNaN(validatedCoachId!) || validatedCoachId! <= 0)) {
      return NextResponse.json({
        success: false,
        message: '유효하지 않은 코치 ID입니다.'
      }, { status: 400 })
    }
    
    // 페이지네이션 파라미터
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
    const offset = (page - 1) * limit

    // 권한 확인 및 필터 설정
    const conditions = []
    
    if (role === 'user' || (!role && user.role === 'user')) {
      // 일반 사용자는 자신의 신청만 조회
      if (!user.userId) {
        return NextResponse.json({
          success: false,
          message: '사용자 ID를 찾을 수 없습니다.'
        }, { status: 400 })
      }
      conditions.push(eq(enrollments.userId, user.userId))
    } else if (role === 'coach' || (!role && user.role === 'coach')) {
      // 코치는 자신의 코치 프로필에 대한 신청만 조회
      // 먼저 코치 ID를 찾아야 함
      const [coach] = await db.select()
        .from(coaches)
        .where(eq(coaches.userId, user.userId))
        .limit(1)
      
      if (!coach) {
        return NextResponse.json({
          success: false,
          message: '코치 프로필을 찾을 수 없습니다.'
        }, { status: 404 })
      }
      
      conditions.push(eq(enrollments.coachId, coach.id))
    } else if (user.role === 'admin') {
      // 관리자는 모든 신청 조회 가능
      if (validatedUserId) conditions.push(eq(enrollments.userId, validatedUserId))
      if (validatedCoachId) conditions.push(eq(enrollments.coachId, validatedCoachId))
    } else {
      // 다른 역할은 자신의 신청만
      conditions.push(eq(enrollments.userId, user.userId))
    }

    // 상태 필터 (검증)
    if (status) {
      const validStatuses = ['pending', 'approved', 'rejected', 'completed', 'cancelled']
      if (!validStatuses.includes(status)) {
        return NextResponse.json({
          success: false,
          message: '유효하지 않은 상태입니다.'
        }, { status: 400 })
      }
      conditions.push(eq(enrollments.status, status))
    }

    // 전체 개수 조회
    let countQuery = db.select({ count: count() }).from(enrollments)
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions)) as any
    }
    const countResult = await countQuery
    const totalCount = countResult.length > 0 ? Number(countResult[0].count) : 0

    // 데이터 조회 (JOIN으로 사용자 및 코치 정보 포함)
    let dataQuery = db.select({
      id: enrollments.id,
      userId: enrollments.userId,
      coachId: enrollments.coachId,
      status: enrollments.status,
      message: enrollments.message,
      coachMessage: enrollments.coachMessage,
      createdAt: enrollments.createdAt,
      updatedAt: enrollments.updatedAt,
      userName: users.username,
      userEmail: users.email,
      coachName: coaches.name,
      coachSpecialty: coaches.specialty,
    })
      .from(enrollments)
      .leftJoin(users, eq(enrollments.userId, users.id))
      .leftJoin(coaches, eq(enrollments.coachId, coaches.id))
      .orderBy(desc(enrollments.createdAt))
      .limit(limit)
      .offset(offset)

    if (conditions.length > 0) {
      // 조건을 enrollments 테이블에 직접 적용
      dataQuery = dataQuery.where(and(...conditions)) as any
    }

    const results = await dataQuery

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      success: true,
      data: results,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      }
    }, { status: 200 })
  } catch (error) {
    console.error('Enrollments GET error:', error)
    return NextResponse.json({
      success: false,
      message: '수강 신청 조회 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    }, { status: 500 })
  }
}

/**
 * 수강 신청 (POST)
 */
export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const user = await getAuthenticatedUser(request)
    if (!user || !user.userId) {
      return NextResponse.json({
        success: false,
        message: '인증이 필요합니다.'
      }, { status: 401 })
    }

    // 일반 사용자만 수강 신청 가능
    if (user.role !== 'user') {
      return NextResponse.json({
        success: false,
        message: '일반 사용자만 수강 신청이 가능합니다.'
      }, { status: 403 })
    }

    // CSRF 토큰 검증
    const csrfToken = request.headers.get('X-CSRF-Token')
    if (!await verifyCsrfToken(csrfToken)) {
      return NextResponse.json({
        success: false,
        message: 'CSRF 토큰이 유효하지 않습니다.'
      }, { status: 403 })
    }

    const body = await request.json()
    
    // Zod 스키마로 입력 검증
    const validationResult = enrollmentSchema.safeParse(body)
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0]
      return NextResponse.json({
        success: false,
        message: firstError.message || '입력값이 올바르지 않습니다.'
      }, { status: 400 })
    }

    const { coachId, message } = validationResult.data

    // 코치 존재 확인
    const [coach] = await db.select()
      .from(coaches)
      .where(eq(coaches.id, coachId))
      .limit(1)

    if (!coach) {
      return NextResponse.json({
        success: false,
        message: '코치를 찾을 수 없습니다.'
      }, { status: 404 })
    }

    // 중복 신청 체크 (같은 사용자가 같은 코치에게 이미 신청했는지 확인)
    const existingEnrollment = await db.select()
      .from(enrollments)
      .where(and(
        eq(enrollments.userId, user.userId),
        eq(enrollments.coachId, coachId),
        sql`${enrollments.status} IN ('pending', 'approved')`
      ))
      .limit(1)

    if (existingEnrollment.length > 0) {
      return NextResponse.json({
        success: false,
        message: '이미 이 코치에게 수강 신청을 하셨습니다.'
      }, { status: 400 })
    }

    // 수강 신청 추가
    const [newEnrollment] = await db.insert(enrollments).values({
      userId: user.userId,
      coachId: coachId,
      status: 'pending',
      message: message || null,
    }).returning()

    return NextResponse.json({
      success: true,
      data: newEnrollment,
      message: '수강 신청이 완료되었습니다.'
    }, { status: 201 })
  } catch (error: any) {
    console.error('Enrollments POST error:', error)
    
    return NextResponse.json({
      success: false,
      message: '수강 신청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    }, { status: 500 })
  }
}

