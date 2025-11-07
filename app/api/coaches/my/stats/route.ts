import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { coaches, enrollments } from '@/lib/db/schema'
import { eq, and, sql, count, gte, lte } from 'drizzle-orm'
import { getAuthenticatedUser } from '@/lib/auth-server'

/**
 * 코치 통계 조회 (GET)
 * 코치 권한 필요
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

    // 코치 권한 확인
    if (user.role !== 'coach') {
      return NextResponse.json({
        success: false,
        message: '코치 권한이 필요합니다.'
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

    // 오늘 날짜 범위 계산
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // 상태별 enrollments 개수 조회
    const [pendingCount] = await db.select({ count: count() })
      .from(enrollments)
      .where(and(
        eq(enrollments.coachId, coach.id),
        eq(enrollments.status, 'pending')
      ))

    const [approvedCount] = await db.select({ count: count() })
      .from(enrollments)
      .where(and(
        eq(enrollments.coachId, coach.id),
        eq(enrollments.status, 'approved')
      ))

    const [completedCount] = await db.select({ count: count() })
      .from(enrollments)
      .where(and(
        eq(enrollments.coachId, coach.id),
        eq(enrollments.status, 'completed')
      ))

    const [cancelledCount] = await db.select({ count: count() })
      .from(enrollments)
      .where(and(
        eq(enrollments.coachId, coach.id),
        eq(enrollments.status, 'cancelled')
      ))

    // 금일 enrollments 조회
    const [todayEnrollmentsCount] = await db.select({ count: count() })
      .from(enrollments)
      .where(and(
        eq(enrollments.coachId, coach.id),
        gte(enrollments.createdAt, today),
        lte(enrollments.createdAt, tomorrow)
      ))

    // 금일 수익금 계산 (금일 생성된 completed 상태의 enrollments 기준)
    const todayCompletedEnrollments = await db.select()
      .from(enrollments)
      .where(and(
        eq(enrollments.coachId, coach.id),
        eq(enrollments.status, 'completed'),
        gte(enrollments.updatedAt, today),
        lte(enrollments.updatedAt, tomorrow)
      ))

    const todayRevenue = todayCompletedEnrollments.length * (coach.price || 0)

    // 누적 수익금 계산 (completed 상태의 enrollments 기준)
    const allCompletedEnrollments = await db.select()
      .from(enrollments)
      .where(and(
        eq(enrollments.coachId, coach.id),
        eq(enrollments.status, 'completed')
      ))

    const totalRevenue = allCompletedEnrollments.length * (coach.price || 0)

    // 메시지 응답률 계산 (coachMessage가 있는 enrollments 비율)
    const [totalEnrollmentsCount] = await db.select({ count: count() })
      .from(enrollments)
      .where(eq(enrollments.coachId, coach.id))

    const [respondedEnrollmentsCount] = await db.select({ count: count() })
      .from(enrollments)
      .where(and(
        eq(enrollments.coachId, coach.id),
        sql`${enrollments.coachMessage} IS NOT NULL AND ${enrollments.coachMessage} != ''`
      ))

    const messageResponseRate = totalEnrollmentsCount.count > 0
      ? Math.round((respondedEnrollmentsCount.count / totalEnrollmentsCount.count) * 100)
      : 0

    // 일정 준수율 계산 (approved 상태에서 completed로 전환된 비율)
    // 간단히 approved 상태 중 completed 비율로 계산
    const scheduleComplianceRate = approvedCount.count > 0
      ? Math.round((completedCount.count / (approvedCount.count + completedCount.count)) * 100)
      : 100

    // 주문 성공률 계산 (completed / (completed + cancelled))
    const totalProcessed = completedCount.count + cancelledCount.count
    const orderSuccessRate = totalProcessed > 0
      ? Math.round((completedCount.count / totalProcessed) * 100)
      : 100

    return NextResponse.json({
      success: true,
      data: {
        // 강의 만족도
        satisfaction: {
          rating: coach.rating, // 0-5 점수
          messageResponseRate, // 메시지 응답률 (%)
          scheduleComplianceRate, // 일정 준수율 (%)
          orderSuccessRate, // 주문 성공률 (%)
        },
        // 매출 현황
        revenue: {
          totalRevenue, // 누적 수익금
          totalSales: coach.students, // 누적 판매 건
          todayRevenue, // 금일 수익금
          todaySales: todayEnrollmentsCount.count, // 금일 판매 건
        },
        // 판매 현황
        sales: {
          pending: pendingCount.count, // 대기
          approved: approvedCount.count, // 일정 확정 (approved)
          inProgress: approvedCount.count, // 진행 중 (approved와 동일)
          completed: completedCount.count, // 완료
          confirmed: completedCount.count, // 확정 (completed와 동일)
          cancelled: cancelledCount.count, // 취소
        },
      }
    }, { status: 200 })
  } catch (error) {
    console.error('Coach Stats GET error:', error)
    return NextResponse.json({
      success: false,
      message: '통계 조회 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    }, { status: 500 })
  }
}



