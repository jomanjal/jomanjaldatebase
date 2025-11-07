import { NextRequest, NextResponse } from 'next/server'
import { db, withRLSContext } from '@/lib/db'
import { coaches } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getAuthenticatedUser } from '@/lib/auth-server'
import { handleError, validationError, notFoundError, forbiddenError, unauthorizedError, conflictError } from '@/lib/error-handler'

/**
 * 코치 조회 (GET)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      throw validationError('유효하지 않은 ID입니다.')
    }

    // 공개 조회용 - 사용자 컨텍스트 확인 후 설정
    const user = await getAuthenticatedUser(request)
    
    // RLS 컨텍스트를 설정한 후 쿼리 실행
    const [coach] = await withRLSContext(
      user?.userId || null,
      user?.role || null,
      async (tx) => {
        return await tx.select()
          .from(coaches)
          .where(eq(coaches.id, id))
          .limit(1)
      }
    )

    if (!coach) {
      throw notFoundError('코치를 찾을 수 없습니다.')
    }

    // specialties, curriculumItems 파싱
    let curriculumItemsParsed: Array<{ title: string; duration: string }> = []
    if (coach.curriculumItems) {
      try {
        const parsed = JSON.parse(coach.curriculumItems)
        // 문자열 배열 형식 ("title|duration")인 경우 객체 배열로 변환
        if (Array.isArray(parsed)) {
          if (typeof parsed[0] === 'string') {
            // "title|duration" 형식
            curriculumItemsParsed = parsed.map((item: string) => {
              const [title, duration] = item.split('|')
              return { title: title || '', duration: duration || '' }
            })
          } else {
            // 이미 객체 배열 형식
            curriculumItemsParsed = parsed
          }
        }
      } catch {
        curriculumItemsParsed = []
      }
    }
    
    const formattedCoach = {
      ...coach,
      specialties: coach.specialties ? JSON.parse(coach.specialties) : [],
      curriculumItems: curriculumItemsParsed,
    }

    return NextResponse.json({
      success: true,
      data: formattedCoach
    }, { status: 200 })
  } catch (error) {
    return handleError(error, {
      path: '/api/coaches/[id]',
      method: 'GET',
    })
  }
}

/**
 * 코치 수정 (PUT)
 * 관리자 권한 또는 코치 본인만 수정 가능
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 인증 확인
    const user = await getAuthenticatedUser(request)
    if (!user) {
      throw unauthorizedError()
    }

    const id = parseInt(params.id)
    if (isNaN(id)) {
      throw validationError('유효하지 않은 ID입니다.')
    }

    // 코치 정보 조회
    const [coach] = await db.select()
      .from(coaches)
      .where(eq(coaches.id, id))
      .limit(1)

    if (!coach) {
      throw notFoundError('코치를 찾을 수 없습니다.')
    }

    // 권한 확인: 관리자이거나 본인 코치 프로필만 수정 가능
    const isOwnProfile = user.role === 'coach' && coach.userId === user.userId
    if (!user.isAdmin && !isOwnProfile) {
      throw forbiddenError('수정 권한이 없습니다.')
    }

    const body = await request.json()
    const {
      name,
      specialty,
      tier,
      experience,
      price,
      specialties,
      description,
      headline,
      thumbnailImage,
      profileImage,
      introductionImage,
      introductionContent,
      curriculumItems,
      totalCourseTime,
      verified, // 코치는 verified 수정 불가 (관리자만 가능)
      active, // 코치는 active 수정 불가 (관리자만 가능)
    } = body

    // 업데이트할 데이터 구성
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (specialty !== undefined) updateData.specialty = specialty
    if (tier !== undefined) updateData.tier = tier
    if (experience !== undefined) updateData.experience = experience
    if (price !== undefined) {
      // 가격을 숫자로 변환
      if (price === null || price === '') {
        updateData.price = null
      } else if (typeof price === 'number') {
        updateData.price = price
      } else {
        const parsed = parseInt(price.toString().replace(/,/g, ''), 10)
        updateData.price = isNaN(parsed) ? null : parsed
      }
    }
    if (specialties !== undefined) updateData.specialties = JSON.stringify(specialties)
    if (description !== undefined) updateData.description = description
    if (headline !== undefined) updateData.headline = headline
    if (thumbnailImage !== undefined) updateData.thumbnailImage = thumbnailImage
    if (profileImage !== undefined) updateData.profileImage = profileImage
    if (introductionImage !== undefined) updateData.introductionImage = introductionImage
    if (introductionContent !== undefined) updateData.introductionContent = introductionContent
    if (curriculumItems !== undefined) updateData.curriculumItems = JSON.stringify(curriculumItems)
    if (totalCourseTime !== undefined) updateData.totalCourseTime = totalCourseTime
    // verified와 active는 관리자만 수정 가능
    if (verified !== undefined && user.isAdmin) {
      updateData.verified = verified
    }
    if (active !== undefined && user.isAdmin) {
      updateData.active = active
    }
    updateData.updatedAt = new Date()

    // 업데이트
    const [updated] = await db.update(coaches)
      .set(updateData)
      .where(eq(coaches.id, id))
      .returning()

    if (!updated) {
      throw notFoundError('코치를 찾을 수 없습니다.')
    }

    // specialties, curriculumItems 파싱
    const formattedCoach = {
      ...updated,
      specialties: updated.specialties ? JSON.parse(updated.specialties) : [],
      curriculumItems: updated.curriculumItems ? JSON.parse(updated.curriculumItems) : [],
    }

    return NextResponse.json({
      success: true,
      data: formattedCoach,
      message: '코치 정보가 수정되었습니다.'
    }, { status: 200 })
  } catch (error) {
    return handleError(error, {
      path: '/api/coaches/[id]',
      method: 'PUT',
    })
  }
}

/**
 * 코치 삭제 (DELETE)
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
      throw forbiddenError('관리자 권한이 필요합니다.')
    }

    const id = parseInt(params.id)
    if (isNaN(id)) {
      throw validationError('유효하지 않은 ID입니다.')
    }

    // 삭제
    const [deleted] = await db.delete(coaches)
      .where(eq(coaches.id, id))
      .returning()

    if (!deleted) {
      throw notFoundError('코치를 찾을 수 없습니다.')
    }

    return NextResponse.json({
      success: true,
      message: '코치가 삭제되었습니다.'
    }, { status: 200 })
  } catch (error) {
    // 외래 키 제약 오류 (리뷰가 있는 경우)
    if (error instanceof Error && 'code' in error && error.code === '23503') {
      throw conflictError('관련 리뷰가 있어 삭제할 수 없습니다.')
    }
    
    return handleError(error, {
      path: '/api/coaches/[id]',
      method: 'DELETE',
    })
  }
}

