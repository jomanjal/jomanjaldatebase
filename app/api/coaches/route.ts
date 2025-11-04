import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { coaches } from '@/lib/db/schema'
import { eq, like, desc, asc, and } from 'drizzle-orm'
import { getAuthenticatedUser } from '@/lib/auth-server'

/**
 * 코치 목록 조회 (GET)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const specialty = searchParams.get('specialty') || 'all'
    const tier = searchParams.get('tier') || 'all'
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const sortBy = searchParams.get('sortBy') || 'latest' // latest, rating-high, rating-low, price-high, price-low, students
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
    const conditions = []

    // 검색 필터
    if (search) {
      conditions.push(like(coaches.name, `%${search}%`))
    }

    // 전문 분야 필터
    if (specialty !== 'all') {
      conditions.push(eq(coaches.specialty, specialty))
    }

    // 티어 필터
    if (tier !== 'all') {
      conditions.push(eq(coaches.tier, tier))
    }

    // 가격 필터 (가격 파싱 필요)
    // price 필드는 "30,000원/시간" 같은 형식이므로, 숫자만 추출하여 비교
    if (minPrice) {
      const minPriceNum = parseInt(minPrice, 10)
      if (!isNaN(minPriceNum)) {
        // price 필드에서 숫자 추출하여 비교
        // SQL에서 정규식이나 CAST를 사용해야 하지만, Drizzle에서는 제한적
        // 일단 클라이언트 사이드에서도 필터링할 수 있도록 주석 처리
        // 또는 price 필드를 별도 숫자 필드로 저장하는 것이 좋음
      }
    }

    // 일반 사용자는 verified되고 active인 코치만 보기
    if (!isAdmin) {
      conditions.push(eq(coaches.verified, true))
      conditions.push(eq(coaches.active, true))
    }

    // 정렬 옵션
    let orderByClause
    switch (sortBy) {
      case 'rating-high':
        orderByClause = desc(coaches.rating)
        break
      case 'rating-low':
        orderByClause = asc(coaches.rating)
        break
      case 'price-high':
        orderByClause = desc(coaches.price)
        break
      case 'price-low':
        orderByClause = asc(coaches.price)
        break
      case 'students':
        orderByClause = desc(coaches.students)
        break
      case 'latest':
      default:
        orderByClause = desc(coaches.createdAt)
        break
    }

    // 조건 적용
    let baseQuery = db.select().from(coaches)
    if (conditions.length > 0) {
      baseQuery = baseQuery.where(and(...conditions)) as any
    }

    // 전체 개수 조회 (페이지네이션용) 및 가격 필터 적용
    let allResults = await baseQuery.orderBy(orderByClause)

    // 가격 필터 적용 (할인 포함)
    if (minPrice || maxPrice) {
      allResults = allResults.filter(coach => {
        if (!coach.price) return false
        const priceNum = typeof coach.price === 'number' ? coach.price : (coach.price ? parseInt(String(coach.price).replace(/,/g, '')) : null)
        if (priceNum === null) return false
        // 할인 적용된 가격 계산
        let finalPrice = priceNum
        if (coach.discount && coach.discount > 0) {
          finalPrice = Math.round(priceNum * (1 - coach.discount / 100))
        }
        if (minPrice && finalPrice < parseInt(minPrice, 10)) return false
        if (maxPrice && finalPrice > parseInt(maxPrice, 10)) return false
        return true
      })
    }
    const totalCount = allResults.length

    // 정렬 및 페이지네이션 적용
    // 가격 필터가 있는 경우 이미 필터링된 결과에서 정렬 적용
    let results = allResults
      .slice(offset, offset + limit)

    // specialties를 JSON 파싱
    const formattedResults = results.map(coach => ({
      ...coach,
      specialties: coach.specialties ? JSON.parse(coach.specialties) : [],
    }))

    // 총 페이지 수 계산
    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      success: true,
      data: formattedResults,
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
    console.error('Coaches GET error:', error)
    return NextResponse.json({
      success: false,
      message: '코치 조회 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
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
      active = true,
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

    // 가격을 숫자로 변환
    let priceNum: number | null = null
    if (price !== undefined && price !== null && price !== '') {
      if (typeof price === 'number') {
        priceNum = price
      } else {
        const parsed = parseInt(price.toString().replace(/,/g, ''), 10)
        priceNum = isNaN(parsed) ? null : parsed
      }
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
      price: priceNum,
      specialties: specialties ? JSON.stringify(specialties) : JSON.stringify([]),
      description: description || null,
      verified: verified,
      active: active,
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
      message: '코치 추가 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    }, { status: 500 })
  }
}
