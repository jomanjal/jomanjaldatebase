import { NextRequest, NextResponse } from 'next/server'
import { db, withRLSContext } from '@/lib/db'
import { coaches } from '@/lib/db/schema'
import { eq, desc, asc, and, sql, count } from 'drizzle-orm'
import { getAuthenticatedUser } from '@/lib/auth-server'
import { coachSearchSchema, sanitizeSearchQuery } from '@/lib/validations'
import { handleError } from '@/lib/error-handler'

/**
 * 코치 목록 조회 (GET)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // 입력 검증 및 sanitization
    const search = searchParams.get('search') || ''
    const sanitizedSearch = search ? sanitizeSearchQuery(search) : ''
    
    // Zod 스키마로 입력 검증
    const validationResult = coachSearchSchema.safeParse({
      search: sanitizedSearch,
      specialty: searchParams.get('specialty') || 'all',
      tier: searchParams.get('tier') || 'all',
      minPrice: searchParams.get('minPrice'),
      maxPrice: searchParams.get('maxPrice'),
      sortBy: searchParams.get('sortBy') || 'latest',
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
    })
    
    if (!validationResult.success) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Validation error:', validationResult.error.errors)
      }
      const firstError = validationResult.error.errors[0]
      return NextResponse.json({
        success: false,
        message: firstError.message || '입력값이 올바르지 않습니다.'
      }, { status: 400 })
    }
    
    const { search: validatedSearch, specialty, tier, minPrice, maxPrice, sortBy, page, limit } = validationResult.data
    const offset = (page - 1) * limit
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
    } else {
      // 공개 조회용 - 사용자 컨텍스트 확인
      user = await getAuthenticatedUser(request)
    }

    // RLS 컨텍스트를 설정한 후 쿼리 실행
    const { countResult, results } = await withRLSContext(
      user?.userId || null,
      user?.role || null,
      async (tx) => {
        // 쿼리 빌드
        const conditions = []

        // 검색 필터 (ILIKE 사용 - 대소문자 구분 없음, 인덱스 활용을 위해 prefix 검색도 고려)
        // PostgreSQL의 B-tree 인덱스는 prefix 검색에 최적화되어 있음
        if (validatedSearch && validatedSearch.trim() !== '') {
          // sanitized search 사용 (SQL Injection 방지)
          conditions.push(
            sql`${coaches.name} ILIKE ${`%${validatedSearch}%`}`
          )
        }

        // 전문 분야 필터
        if (specialty !== 'all') {
          conditions.push(eq(coaches.specialty, specialty))
        }

        // 티어 필터
        if (tier !== 'all') {
          conditions.push(eq(coaches.tier, tier))
        }

        // 가격 필터 (DB 레벨에서 처리)
        // 할인을 고려한 최종 가격 계산: price * (1 - discount / 100)
        if (minPrice || maxPrice) {
          const minPriceNum = minPrice ? parseInt(minPrice, 10) : null
          const maxPriceNum = maxPrice ? parseInt(maxPrice, 10) : null
          
          if (minPriceNum !== null && !isNaN(minPriceNum)) {
            // 최소 가격: 할인을 고려한 최종 가격이 minPriceNum 이상이어야 함
            // 즉, price * (1 - discount / 100) >= minPriceNum
            // 또는 price >= minPriceNum / (1 - discount / 100)
            // 하지만 discount가 NULL일 수 있으므로, CASE 문을 사용
            conditions.push(
              sql`CASE 
                WHEN ${coaches.discount} IS NULL OR ${coaches.discount} = 0 
                THEN ${coaches.price} >= ${minPriceNum}
                ELSE ${coaches.price} * (1 - ${coaches.discount}::float / 100) >= ${minPriceNum}
              END`
            )
          }
          
          if (maxPriceNum !== null && !isNaN(maxPriceNum)) {
            // 최대 가격: 할인을 고려한 최종 가격이 maxPriceNum 이하여야 함
            conditions.push(
              sql`CASE 
                WHEN ${coaches.discount} IS NULL OR ${coaches.discount} = 0 
                THEN ${coaches.price} <= ${maxPriceNum}
                ELSE ${coaches.price} * (1 - ${coaches.discount}::float / 100) <= ${maxPriceNum}
              END`
            )
          }
          
          // 가격이 NULL이 아닌 코치만
          conditions.push(sql`${coaches.price} IS NOT NULL`)
        }

        // 일반 사용자는 verified되고 active인 코치만 보기
        if (!isAdmin) {
          conditions.push(eq(coaches.verified, true))
          conditions.push(eq(coaches.active, true))
        }

        // 정렬 옵션
        let orderByClause
        switch (sortBy) {
          case 'ranking':
            // 랭킹순: 평점 높은순
            orderByClause = desc(coaches.rating)
            break
          case 'reviews':
            // 후기순: 리뷰 수 많은순
            orderByClause = desc(coaches.reviews)
            break
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
        let baseQuery = tx.select().from(coaches)
        if (conditions.length > 0) {
          baseQuery = baseQuery.where(and(...conditions)) as any
        }

        // 전체 개수 조회 (COUNT 쿼리로 최적화 - 전체 데이터를 가져오지 않음)
        let countQuery = tx.select({ count: count() }).from(coaches)
        if (conditions.length > 0) {
          countQuery = countQuery.where(and(...conditions)) as any
        }
        const countResult = await countQuery

        // 정렬 및 페이지네이션 적용 (DB 레벨에서 처리)
        const results = await baseQuery
          .orderBy(orderByClause)
          .limit(limit)
          .offset(offset)

        return { countResult, results }
      }
    )

    const totalCountNum = countResult.length > 0 ? Number(countResult[0].count) : 0

    // specialties를 JSON 파싱
    const formattedResults = results.map(coach => ({
      ...coach,
      specialties: coach.specialties ? JSON.parse(coach.specialties) : [],
    }))

    // 총 페이지 수 계산
    const totalPages = Math.ceil(totalCountNum / limit)

    return NextResponse.json({
      success: true,
      data: formattedResults,
      pagination: {
        page,
        limit,
        totalCount: totalCountNum,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      }
    }, { status: 200 })
  } catch (error) {
    return handleError(error, {
      path: '/api/coaches',
      method: 'GET',
    })
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
