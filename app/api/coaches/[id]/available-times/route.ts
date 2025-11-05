import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { coaches, coachSchedules } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { idSchema } from '@/lib/validations'

/**
 * 코치의 특정 날짜에 예약 가능한 시간 조회 (GET)
 * 공개 API (인증 불필요)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // ID 검증
    const idValidation = idSchema.safeParse(params.id)
    if (!idValidation.success) {
      return NextResponse.json({
        success: false,
        message: '유효하지 않은 코치 ID입니다.'
      }, { status: 400 })
    }
    const coachId = idValidation.data

    const searchParams = request.nextUrl.searchParams
    const date = searchParams.get('date') // YYYY-MM-DD 형식

    if (!date) {
      return NextResponse.json({
        success: false,
        message: '날짜가 필요합니다.'
      }, { status: 400 })
    }

    // 날짜 형식 검증 (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(date)) {
      return NextResponse.json({
        success: false,
        message: '유효하지 않은 날짜 형식입니다. (YYYY-MM-DD 형식이어야 합니다.)'
      }, { status: 400 })
    }

    // 날짜 유효성 검사
    const selectedDate = new Date(date + 'T00:00:00')
    if (isNaN(selectedDate.getTime())) {
      return NextResponse.json({
        success: false,
        message: '유효하지 않은 날짜입니다.'
      }, { status: 400 })
    }

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

    // 선택한 날짜의 시작 시간과 종료 시간
    const startOfDay = new Date(selectedDate)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(selectedDate)
    endOfDay.setHours(23, 59, 59, 999)

    // 선택한 날짜의 요일 계산 (0: 일요일, 1: 월요일, ..., 6: 토요일)
    const dayOfWeek = selectedDate.getDay()

    // 코치의 해당 요일 일정 설정 조회
    const [schedule] = await db.select()
      .from(coachSchedules)
      .where(
        and(
          eq(coachSchedules.coachId, coachId),
          eq(coachSchedules.dayOfWeek, dayOfWeek)
        )
      )
      .limit(1)

    // 일정이 설정되지 않았거나 비활성화된 경우 빈 배열 반환
    if (!schedule || !schedule.enabled) {
      return NextResponse.json({
        success: true,
        data: {
          date,
          availableSlots: [],
          bookedCount: 0,
        }
      }, { status: 200 })
    }

    // 시작/종료 시간 파싱
    const [startHour, startMinute] = schedule.startTime.split(':').map(Number)
    const [endHour, endMinute] = schedule.endTime.split(':').map(Number)

    // 코치가 설정한 시간 범위 내에서 예약 가능한 시간대 생성 (30분 단위)
    const availableSlots: string[] = []
    
    // 시작 시간부터 종료 시간까지 30분 간격으로 생성
    const startTimeMinutes = startHour * 60 + startMinute
    const endTimeMinutes = endHour * 60 + endMinute
    
    for (let timeMinutes = startTimeMinutes; timeMinutes < endTimeMinutes; timeMinutes += 30) {
      const hour = Math.floor(timeMinutes / 60)
      const minute = timeMinutes % 60
      const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
      const slotTime = new Date(selectedDate)
      slotTime.setHours(hour, minute, 0, 0)

      // 과거 시간은 제외
      if (slotTime < new Date()) {
        continue
      }

      availableSlots.push(timeString)
    }

    return NextResponse.json({
      success: true,
      data: {
        date,
        availableSlots,
        bookedCount: 0,
      }
    }, { status: 200 })
  } catch (error) {
    console.error('Available times GET error:', error)
    return NextResponse.json({
      success: false,
      message: '예약 가능한 시간 조회 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    }, { status: 500 })
  }
}

