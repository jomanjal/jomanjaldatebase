import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { coachSchedules, coaches } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getAuthenticatedUser } from '@/lib/auth-server'
import { coachScheduleSchema } from '@/lib/validations'
import { verifyCsrfToken } from '@/lib/csrf'

/**
 * 코치 일정 조회 (GET)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user || !user.userId) {
      return NextResponse.json({
        success: false,
        message: '인증이 필요합니다.'
      }, { status: 401 })
    }

    if (user.role !== 'coach') {
      return NextResponse.json({
        success: false,
        message: '코치만 접근할 수 있습니다.'
      }, { status: 403 })
    }

    // 코치 프로필 조회
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

    // 코치 일정 조회
    const schedules = await db.select()
      .from(coachSchedules)
      .where(eq(coachSchedules.coachId, coach.id))
      .orderBy(coachSchedules.dayOfWeek)

    // 요일별로 정리 (0: 일요일 ~ 6: 토요일)
    const scheduleMap: Record<number, any> = {}
    for (let i = 0; i < 7; i++) {
      const schedule = schedules.find(s => s.dayOfWeek === i)
      scheduleMap[i] = schedule || {
        dayOfWeek: i,
        enabled: false,
        startTime: '00:00',
        endTime: '23:30',
      }
    }

    return NextResponse.json({
      success: true,
      data: Object.values(scheduleMap)
    }, { status: 200 })
  } catch (error) {
    console.error('Schedule GET error:', error)
    return NextResponse.json({
      success: false,
      message: '일정 조회 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}

/**
 * 코치 일정 저장 (POST/PUT)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user || !user.userId) {
      return NextResponse.json({
        success: false,
        message: '인증이 필요합니다.'
      }, { status: 401 })
    }

    if (user.role !== 'coach') {
      return NextResponse.json({
        success: false,
        message: '코치만 접근할 수 있습니다.'
      }, { status: 403 })
    }

    // 코치 프로필 조회
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
    const validationResult = coachScheduleSchema.safeParse(body)
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0]
      return NextResponse.json({
        success: false,
        message: firstError.message || '입력값이 올바르지 않습니다.'
      }, { status: 400 })
    }

    const { schedules } = validationResult.data

    // 기존 일정 삭제
    await db.delete(coachSchedules)
      .where(eq(coachSchedules.coachId, coach.id))

    // 새 일정 추가 (검증된 데이터 사용)
    const newSchedules = schedules.map((schedule) => ({
      coachId: coach.id,
      dayOfWeek: schedule.dayOfWeek,
      enabled: schedule.enabled,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
    }))

    if (newSchedules.length > 0) {
      await db.insert(coachSchedules).values(newSchedules)
    }

    return NextResponse.json({
      success: true,
      message: '일정이 저장되었습니다.'
    }, { status: 200 })
  } catch (error) {
    console.error('Schedule POST error:', error)
    return NextResponse.json({
      success: false,
      message: '일정 저장 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}

