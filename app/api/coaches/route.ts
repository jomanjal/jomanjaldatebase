import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { coaches } from '@/lib/db/schema'
import { eq, like, desc } from 'drizzle-orm'
import { getAuthenticatedUser } from '@/lib/auth-server'

/**
 * 코치 목록 조회 (GET)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const specialty = searchParams.get('specialty') || 'all'
    const isAdmin = searchParams.get('admin') === 'true'

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
    let query = db.select().from(coaches)

    // 검색 필터
    if (search) {
      query = query.where(like(coaches.name, `%${search}%`)) as any
    }

    // 전문 분야 필터
    if (specialty !== 'all') {
      query = query.where(eq(coaches.specialty, specialty)) as any
    }

    // 최신순 정렬
    const results = await query.orderBy(desc(coaches.createdAt))

    // specialties를 JSON 파싱
    const formattedResults = results.map(coach => ({
      ...coach,
      specialties: coach.specialties ? JSON.parse(coach.specialties) : [],
    }))

    return NextResponse.json({
      success: true,
      data: formattedResults,
      totalCount: formattedResults.length
    }, { status: 200 })
  } catch (error) {
    console.error('Coaches GET error:', error)
    return NextResponse.json({
      success: false,
      message: '코치 조회 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}

/**
 * 코치 추가 (POST)
 * 관리자 권한 필요
 */
export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const user = await getAuthenticatedUser(request)
    if (!user || !user.isAdmin) {
      return NextResponse.json({
        success: false,
        message: '관리자 권한이 필요합니다.'
      }, { status: 403 })
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
      verified = false,
      // userId는 나중에 사용자 시스템과 연동할 때 사용
      userId = null,
    } = body

    // 필수 필드 검증
    if (!name || !specialty || !tier || !experience) {
      return NextResponse.json({
        success: false,
        message: '이름, 전문 분야, 티어, 경력은 필수 입력 항목입니다.'
      }, { status: 400 })
    }

    // 코치 추가
    const [newCoach] = await db.insert(coaches).values({
      userId: userId || undefined, // null 대신 undefined로 전달
      name,
      specialty,
      tier,
      experience,
      rating: 0,
      reviews: 0,
      students: 0,
      price: price || null,
      specialties: specialties ? JSON.stringify(specialties) : JSON.stringify([]),
      description: description || null,
      verified: verified,
    }).returning()

    // specialties 파싱
    const formattedCoach = {
      ...newCoach,
      specialties: newCoach.specialties ? JSON.parse(newCoach.specialties) : [],
    }

    return NextResponse.json({
      success: true,
      data: formattedCoach,
      message: '코치가 추가되었습니다.'
    }, { status: 201 })
  } catch (error: any) {
    console.error('Coaches POST error:', error)
    
    // 중복 오류 처리
    if (error.code === '23505') {
      return NextResponse.json({
        success: false,
        message: '이미 등록된 코치입니다.'
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      message: '코치 추가 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}
