import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { coaches } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getAuthenticatedUser } from '@/lib/auth-server'

/**
 * 현재 로그인한 코치의 프로필 조회 (GET)
 * 코치 권한 필요
 */
export async function GET(request: NextRequest) {
  try {
    // 인증 확인
    const user = await getAuthenticatedUser(request)
    if (!user) {
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

    // userId로 코치 찾기
    const [coach] = await db.select()
      .from(coaches)
      .where(eq(coaches.userId, user.userId))
      .limit(1)

    if (!coach) {
      return NextResponse.json({
        success: false,
        message: '코치 프로필을 찾을 수 없습니다. 먼저 코치 프로필을 생성해주세요.',
        hasProfile: false
      }, { status: 404 })
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
      data: formattedCoach,
      hasProfile: true
    }, { status: 200 })
  } catch (error) {
    console.error('My Coach GET error:', error)
    return NextResponse.json({
      success: false,
      message: '코치 프로필 조회 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    }, { status: 500 })
  }
}

/**
 * 현재 로그인한 코치의 프로필 생성/수정 (POST/PUT)
 * 코치 권한 필요
 */
export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const user = await getAuthenticatedUser(request)
    if (!user) {
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

    const body = await request.json()
    const {
      name,
      specialty,
      tier,
      experience,
      price,
      discount,
      specialties,
      description,
      thumbnailImage,
      headline,
      introductionImage,
      introductionContent,
      curriculumItems,
      totalCourseTime,
    } = body

    // 필수 필드 검증
    if (!name || !specialty || !tier || !experience) {
      return NextResponse.json({
        success: false,
        message: '이름, 전문 분야, 티어, 경력은 필수 입력 항목입니다.'
      }, { status: 400 })
    }

    // 기존 프로필 확인
    const [existingCoach] = await db.select()
      .from(coaches)
      .where(eq(coaches.userId, user.userId))
      .limit(1)

    if (existingCoach) {
      // 수정
      const [updated] = await db.update(coaches)
        .set({
          name,
          specialty,
          tier,
          experience,
          price: price || null,
          discount: discount || null,
          specialties: specialties ? JSON.stringify(specialties) : JSON.stringify([]),
          description: description || null,
          thumbnailImage: thumbnailImage || null,
          headline: headline || null,
          introductionImage: introductionImage || null,
          introductionContent: introductionContent || null,
          curriculumItems: curriculumItems ? JSON.stringify(curriculumItems) : JSON.stringify([]),
          totalCourseTime: totalCourseTime || null,
          updatedAt: new Date(),
        })
        .where(eq(coaches.userId, user.userId))
        .returning()

      // curriculumItems 파싱 (문자열 배열 또는 객체 배열)
      let curriculumItemsParsed: Array<{ title: string; duration: string }> = []
      if (updated.curriculumItems) {
        try {
          const parsed = JSON.parse(updated.curriculumItems)
          if (Array.isArray(parsed)) {
            if (typeof parsed[0] === 'string') {
              curriculumItemsParsed = parsed.map((item: string) => {
                const [title, duration] = item.split('|')
                return { title: title || '', duration: duration || '' }
              })
            } else {
              curriculumItemsParsed = parsed
            }
          }
        } catch {
          curriculumItemsParsed = []
        }
      }
      
      const formattedCoach = {
        ...updated,
        specialties: updated.specialties ? JSON.parse(updated.specialties) : [],
        curriculumItems: curriculumItemsParsed,
      }

      return NextResponse.json({
        success: true,
        data: formattedCoach,
        message: '코치 프로필이 수정되었습니다.'
      }, { status: 200 })
    } else {
      // 생성
      const [newCoach] = await db.insert(coaches).values({
        userId: user.userId,
        name,
        specialty,
        tier,
        experience,
        rating: 0,
        reviews: 0,
        students: 0,
        price: price || null,
        discount: discount || null,
        specialties: specialties ? JSON.stringify(specialties) : JSON.stringify([]),
        description: description || null,
        thumbnailImage: thumbnailImage || null,
        headline: headline || null,
        introductionImage: introductionImage || null,
        introductionContent: introductionContent || null,
        curriculumItems: curriculumItems ? JSON.stringify(curriculumItems) : JSON.stringify([]),
        totalCourseTime: totalCourseTime || null,
        verified: false, // 관리자 승인 필요
      }).returning()

      // curriculumItems 파싱 (문자열 배열 또는 객체 배열)
      let curriculumItemsParsed: Array<{ title: string; duration: string }> = []
      if (newCoach.curriculumItems) {
        try {
          const parsed = JSON.parse(newCoach.curriculumItems)
          if (Array.isArray(parsed)) {
            if (typeof parsed[0] === 'string') {
              curriculumItemsParsed = parsed.map((item: string) => {
                const [title, duration] = item.split('|')
                return { title: title || '', duration: duration || '' }
              })
            } else {
              curriculumItemsParsed = parsed
            }
          }
        } catch {
          curriculumItemsParsed = []
        }
      }
      
      const formattedCoach = {
        ...newCoach,
        specialties: newCoach.specialties ? JSON.parse(newCoach.specialties) : [],
        curriculumItems: curriculumItemsParsed,
      }

      return NextResponse.json({
        success: true,
        data: formattedCoach,
        message: '코치 프로필이 생성되었습니다. 관리자 승인 후 공개됩니다.'
      }, { status: 201 })
    }
  } catch (error: any) {
    console.error('My Coach POST error:', error)
    
    return NextResponse.json({
      success: false,
      message: '코치 프로필 저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    }, { status: 500 })
  }
}

/**
 * 활성화 상태 업데이트 (PATCH)
 * 코치 권한 필요
 */
export async function PATCH(request: NextRequest) {
  try {
    // 인증 확인
    const user = await getAuthenticatedUser(request)
    if (!user) {
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

    const body = await request.json()
    const { active } = body

    if (typeof active !== 'boolean') {
      return NextResponse.json({
        success: false,
        message: '활성화 상태는 boolean 값이어야 합니다.'
      }, { status: 400 })
    }

    // 활성화 상태 업데이트
    const [updated] = await db.update(coaches)
      .set({
        active,
        updatedAt: new Date(),
      })
      .where(eq(coaches.userId, user.userId))
      .returning()

    if (!updated) {
      return NextResponse.json({
        success: false,
        message: '코치 프로필을 찾을 수 없습니다.'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: active ? '강의가 활성화되었습니다.' : '강의가 비활성화되었습니다.'
    }, { status: 200 })
  } catch (error: any) {
    console.error('My Coach PATCH error:', error)
    
    return NextResponse.json({
      success: false,
      message: '활성화 상태 업데이트 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    }, { status: 500 })
  }
}

