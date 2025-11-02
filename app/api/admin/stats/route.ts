import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { coaches, reviews, waitlist, users } from '@/lib/db/schema'
import { getAuthenticatedUser } from '@/lib/auth-server'
import { sql, eq } from 'drizzle-orm'

/**
 * 관리자 대시보드 통계 조회
 * 관리자 권한 필요
 */
export async function GET(request: NextRequest) {
  try {
    // 인증 확인
    const user = await getAuthenticatedUser(request)
    if (!user || !user.isAdmin) {
      return NextResponse.json({ 
        success: false, 
        message: '관리자 권한이 필요합니다.' 
      }, { status: 403 })
    }

    // 총 코치 수
    const [coachCount] = await db.select({ count: sql<number>`count(*)` }).from(coaches)
    const totalCoaches = Number(coachCount?.count || 0)

    // 총 리뷰 수
    const [reviewCount] = await db.select({ count: sql<number>`count(*)` }).from(reviews)
    const totalReviews = Number(reviewCount?.count || 0)

    // 총 웨이팅 리스트 수
    const [waitlistCount] = await db.select({ count: sql<number>`count(*)` }).from(waitlist)
    const totalWaitlist = Number(waitlistCount?.count || 0)

    // 평균 평점 계산
    const [avgRating] = await db.select({ avg: sql<number>`avg(${reviews.rating})` }).from(reviews)
    const averageRating = Number(avgRating?.avg || 0).toFixed(1)

    // 최근 활동 (최근 5개)
    const recentCoaches = await db.select({
      id: coaches.id,
      name: coaches.name,
      specialty: coaches.specialty,
      createdAt: coaches.createdAt,
      type: sql<string>`'코치 등록'`,
    })
      .from(coaches)
      .orderBy(sql`${coaches.createdAt} DESC`)
      .limit(3)

    const recentReviews = await db.select({
      id: reviews.id,
      coachId: reviews.coachId,
      createdAt: reviews.createdAt,
      type: sql<string>`'리뷰 작성'`,
    })
      .from(reviews)
      .orderBy(sql`${reviews.createdAt} DESC`)
      .limit(2)

    // 코치 정보와 함께 리뷰 조인
    const recentReviewsWithCoach = await Promise.all(
      recentReviews.map(async (review) => {
        const [coach] = await db.select({
          name: coaches.name,
          specialty: coaches.specialty,
        })
          .from(coaches)
          .where(eq(coaches.id, review.coachId))
          .limit(1)

        return {
          id: review.id,
          name: coach?.name || '알 수 없음',
          game: coach?.specialty || '',
          type: '리뷰 작성',
          time: review.createdAt,
        }
      })
    )

    // 최근 활동 통합 및 정렬
    const recentActivities = [
      ...recentCoaches.map(c => ({
        type: '코치 등록',
        name: c.name,
        game: c.specialty || '',
        time: c.createdAt,
      })),
      ...recentReviewsWithCoach,
    ]
      .sort((a, b) => {
        const timeA = typeof a.time === 'string' ? new Date(a.time).getTime() : a.time.getTime()
        const timeB = typeof b.time === 'string' ? new Date(b.time).getTime() : b.time.getTime()
        return timeB - timeA
      })
      .slice(0, 5)
      .map(activity => ({
        ...activity,
        timeAgo: getTimeAgo(activity.time),
      }))

    return NextResponse.json({ 
      success: true, 
      data: {
        totalCoaches,
        totalReviews,
        totalWaitlist,
        averageRating,
        recentActivities,
      }
    }, { status: 200 })
  } catch (error) {
    console.error('Stats GET error:', error)
    return NextResponse.json({ 
      success: false, 
      message: '통계 조회 중 오류가 발생했습니다.' 
    }, { status: 500 })
  }
}

/**
 * 시간을 "X시간 전" 형식으로 변환
 */
function getTimeAgo(date: Date | string): string {
  const now = new Date()
  const past = typeof date === 'string' ? new Date(date) : date
  const diffMs = now.getTime() - past.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return '방금 전'
  if (diffMins < 60) return `${diffMins}분 전`
  if (diffHours < 24) return `${diffHours}시간 전`
  if (diffDays < 7) return `${diffDays}일 전`
  return past.toLocaleDateString('ko-KR')
}

