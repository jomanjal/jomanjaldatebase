import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { reviews, coaches, users } from '@/lib/db/schema'
import { eq, desc, and, like, or } from 'drizzle-orm'
import { getAuthenticatedUser, requireAdmin } from '@/lib/auth-server'
import { sql } from 'drizzle-orm'

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
    
    // 페이지네이션 파라미터
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10))) // 최대 100개, 기본 20개
    const offset = (page - 1) * limit

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

    // 전체 개수 조회 (페이지네이션용)
    const allResults = await query.orderBy(desc(reviews.createdAt))
    const totalCount = allResults.length

    // 페이지네이션 적용
    const results = await query
      .orderBy(desc(reviews.createdAt))
      .limit(limit)
      .offset(offset)

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

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      success: true,
      data: formattedResults,
      totalCount,
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
    console.error('Reviews GET error:', error)
    return NextResponse.json({
      success: false,
      message: '리뷰 조회 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    }, { status: 500 })
  }
}

/**
 * 리뷰 작성 (POST)
 * 관리자 권한 필요
 */
export async function POST(request: NextRequest) {
  try {
    // 관리자 권한 확인
    await requireAdmin(request)

    const body = await request.json()
    const { coachId, userId, rating, comment, verified = false } = body

    // 필수 필드 검증
    if (!coachId || !userId || !rating) {
      return NextResponse.json({
        success: false,
        message: '코치 ID, 사용자 ID, 평점은 필수 입력 항목입니다.'
      }, { status: 400 })
    }

    // 평점 범위 검증 (1-5)
    if (rating < 1 || rating > 5) {
      return NextResponse.json({
        success: false,
        message: '평점은 1부터 5까지 입력할 수 있습니다.'
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

    // 사용자 존재 확인
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!user) {
      return NextResponse.json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      }, { status: 404 })
    }

    // 리뷰 추가
    const [newReview] = await db.insert(reviews).values({
      coachId: parseInt(coachId),
      userId: parseInt(userId),
      rating: parseInt(rating),
      comment: comment || null,
      verified: verified === true,
    }).returning()

    // 리뷰가 승인된 경우 코치 평점 업데이트
    if (verified) {
      // 코치의 평균 평점 계산
      const [coachStats] = await db.select({
        avgRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`,
        reviewCount: sql<number>`COUNT(*)`,
      })
        .from(reviews)
        .where(and(
          eq(reviews.coachId, coachId),
          eq(reviews.verified, true)
        ))

      // 코치 평점 업데이트
      await db.update(coaches)
        .set({
          rating: Number(coachStats.avgRating),
          reviews: Number(coachStats.reviewCount),
        })
        .where(eq(coaches.id, coachId))
    }

    return NextResponse.json({
      success: true,
      data: newReview,
      message: '리뷰가 추가되었습니다.'
    }, { status: 201 })
  } catch (error: any) {
    console.error('Reviews POST error:', error)
    
    // requireAdmin에서 throw한 에러 처리
    if (error.message === '인증이 필요합니다.' || error.message === '관리자 권한이 필요합니다.') {
      return NextResponse.json({
        success: false,
        message: error.message
      }, { status: 403 })
    }

    return NextResponse.json({
      success: false,
      message: '리뷰 추가 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
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
