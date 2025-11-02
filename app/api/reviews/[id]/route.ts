import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { reviews, coaches } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getAuthenticatedUser } from '@/lib/auth-server'
import { sql } from 'drizzle-orm'

/**
 * 리뷰 조회 (GET)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({
        success: false,
        message: '유효하지 않은 ID입니다.'
      }, { status: 400 })
    }

    const [review] = await db.select({
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
    })
      .from(reviews)
      .leftJoin(coaches, eq(reviews.coachId, coaches.id))
      .where(eq(reviews.id, id))
      .limit(1)

    if (!review) {
      return NextResponse.json({
        success: false,
        message: '리뷰를 찾을 수 없습니다.'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: review
    }, { status: 200 })
  } catch (error) {
    console.error('Review GET error:', error)
    return NextResponse.json({
      success: false,
      message: '리뷰 조회 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    }, { status: 500 })
  }
}

/**
 * 리뷰 승인/수정 (PATCH)
 * 관리자 권한 필요
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 인증 확인
    const user = await getAuthenticatedUser(request)
    if (!user || !user.isAdmin) {
      return NextResponse.json({
        success: false,
        message: '관리자 권한이 필요합니다.'
      }, { status: 403 })
    }

    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({
        success: false,
        message: '유효하지 않은 ID입니다.'
      }, { status: 400 })
    }

    const body = await request.json()
    const { verified, comment, rating } = body

    // 업데이트할 데이터 구성
    const updateData: any = {
      updatedAt: new Date(),
    }
    
    if (verified !== undefined) updateData.verified = verified === true
    if (comment !== undefined) updateData.comment = comment
    if (rating !== undefined) updateData.rating = rating

    // 업데이트
    const [updated] = await db.update(reviews)
      .set(updateData)
      .where(eq(reviews.id, id))
      .returning()

    if (!updated) {
      return NextResponse.json({
        success: false,
        message: '리뷰를 찾을 수 없습니다.'
      }, { status: 404 })
    }

    // 리뷰가 승인되면 코치의 평점 업데이트
    if (verified === true && updated.verified) {
      // 코치의 평균 평점 계산
      const [coachStats] = await db.select({
        avgRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`,
        reviewCount: sql<number>`COUNT(*)`,
      })
        .from(reviews)
        .where(and(
          eq(reviews.coachId, updated.coachId),
          eq(reviews.verified, true)
        ))

      // 코치 평점 업데이트
      await db.update(coaches)
        .set({
          rating: Number(coachStats.avgRating),
          reviews: Number(coachStats.reviewCount),
        })
        .where(eq(coaches.id, updated.coachId))
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: '리뷰가 업데이트되었습니다.'
    }, { status: 200 })
  } catch (error) {
    console.error('Review PATCH error:', error)
    return NextResponse.json({
      success: false,
      message: '리뷰 수정 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    }, { status: 500 })
  }
}

/**
 * 리뷰 삭제 (DELETE)
 * 관리자 권한 필요
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 인증 확인
    const user = await getAuthenticatedUser(request)
    if (!user || !user.isAdmin) {
      return NextResponse.json({
        success: false,
        message: '관리자 권한이 필요합니다.'
      }, { status: 403 })
    }

    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({
        success: false,
        message: '유효하지 않은 ID입니다.'
      }, { status: 400 })
    }

    // 삭제 전에 코치 ID 가져오기
    const [reviewToDelete] = await db.select({
      coachId: reviews.coachId,
    })
      .from(reviews)
      .where(eq(reviews.id, id))
      .limit(1)

    if (!reviewToDelete) {
      return NextResponse.json({
        success: false,
        message: '리뷰를 찾을 수 없습니다.'
      }, { status: 404 })
    }

    // 리뷰 삭제
    await db.delete(reviews)
      .where(eq(reviews.id, id))

    // 코치 평점 재계산
    const [coachStats] = await db.select({
      avgRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`,
      reviewCount: sql<number>`COUNT(*)`,
    })
      .from(reviews)
      .where(and(
        eq(reviews.coachId, reviewToDelete.coachId),
        eq(reviews.verified, true)
      ))

    // 코치 평점 업데이트
    await db.update(coaches)
      .set({
        rating: Number(coachStats.avgRating),
        reviews: Number(coachStats.reviewCount),
      })
      .where(eq(coaches.id, reviewToDelete.coachId))

    return NextResponse.json({
      success: true,
      message: '리뷰가 삭제되었습니다.'
    }, { status: 200 })
  } catch (error) {
    console.error('Review DELETE error:', error)
    return NextResponse.json({
      success: false,
      message: '리뷰 삭제 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    }, { status: 500 })
  }
}

