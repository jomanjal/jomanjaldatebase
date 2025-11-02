import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { reviews, coaches, users } from '@/lib/db/schema'
import { eq, desc, and, like, or } from 'drizzle-orm'
import { getAuthenticatedUser } from '@/lib/auth-server'

/**
 * 리뷰 목록 조회 (GET)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const rating = searchParams.get('rating')
    const coachId = searchParams.get('coachId')
    const verified = searchParams.get('verified') // 'true', 'false', 또는 null
    const isAdmin = searchParams.get('admin') === 'true'

    // 검색어 길이 제한
    if (search.length > 100) {
      return NextResponse.json({
        success: false,
        message: '검색어는 100자를 초과할 수 없습니다.'
      }, { status: 400 })
    }

    // 관리자 권한 확인 (필요시)
    let user = null
    if (isAdmin) {
      user = await getAuthenticatedUser(request)
      if (!user || !user.isAdmin) {
        return NextResponse.json({ 
          success: false, 
          message: '관리자 권한이 필요합니다.' 
        }, { status: 403 })
      }
    }

    // 쿼리 빌드
    let query = db.select({
      id: reviews.id,
      coachId: reviews.coachId,
      userId: reviews.userId,
      rating: reviews.rating,
      comment: reviews.comment,
      verified: reviews.verified,
      createdAt: reviews.createdAt,
      updatedAt: reviews.updatedAt,
      coachName: coaches.name,
      coachSpecialty: coaches.specialty,
      userName: users.username,
      userEmail: users.email,
    })
      .from(reviews)
      .leftJoin(coaches, eq(reviews.coachId, coaches.id))
      .leftJoin(users, eq(reviews.userId, users.id))

    // 필터 조건
    const conditions = []
    
    if (search) {
      conditions.push(
        or(
          like(users.username, `%${search}%`),
          like(coaches.name, `%${search}%`)
        )!
      )
    }

    if (rating) {
      conditions.push(eq(reviews.rating, parseInt(rating)))
    }

    if (coachId) {
      conditions.push(eq(reviews.coachId, parseInt(coachId)))
    }

    if (verified === 'true') {
      conditions.push(eq(reviews.verified, true))
    } else if (verified === 'false') {
      conditions.push(eq(reviews.verified, false))
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any
    }

    // 최신순 정렬
    const results = await query.orderBy(desc(reviews.createdAt))

    // 사용자 정보 마스킹 (일부만 표시)
    const formattedResults = results.map(review => ({
      id: review.id,
      coachId: review.coachId,
      userId: review.userId,
      rating: review.rating,
      comment: review.comment || '',
      verified: review.verified,
      createdAt: review.createdAt,
      coachName: review.coachName || '알 수 없음',
      coachSpecialty: review.coachSpecialty || '',
      userName: review.userName ? `${review.userName.slice(0, 2)}**` : '익명',
      timeAgo: getTimeAgo(review.createdAt),
    }))

    return NextResponse.json({
      success: true,
      data: formattedResults,
      totalCount: formattedResults.length
    }, { status: 200 })
  } catch (error) {
    console.error('Reviews GET error:', error)
    return NextResponse.json({
      success: false,
      message: '리뷰 조회 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    }, { status: 500 })
  }
}

/**
 * 시간을 "X분 전" 형식으로 변환
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
