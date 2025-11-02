import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq, like, or, desc } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth-server'
import { rateLimit } from '@/lib/rate-limit'

/**
 * 유저 목록 조회 (GET)
 * 관리자 권한 필요
 */
export async function GET(request: NextRequest) {
  // Rate Limiting: IP당 30회/분
  const rateLimitResult = rateLimit(30, 60000)(request)
  if (!rateLimitResult.allowed) {
    return NextResponse.json({
      success: false,
      message: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.',
    }, {
      status: 429,
      headers: {
        'X-RateLimit-Limit': '30',
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
      },
    })
  }

  try {
    // 관리자 권한 확인
    await requireAdmin(request)

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') // 'user', 'admin', 'coach', 'all'

    // 검색어 길이 제한
    if (search.length > 100) {
      return NextResponse.json({
        success: false,
        message: '검색어는 100자를 초과할 수 없습니다.'
      }, { status: 400 })
    }

    // 쿼리 빌드
    let query = db.select().from(users)

    // 필터 조건
    const conditions = []

    if (search) {
      conditions.push(
        or(
          like(users.email, `%${search}%`),
          like(users.username, `%${search}%`)
        )!
      )
    }

    if (role && role !== 'all') {
      conditions.push(eq(users.role, role))
    }

    if (conditions.length > 0) {
      query = query.where(or(...conditions)) as any
    }

    // 최신순 정렬
    const results = await query.orderBy(desc(users.createdAt))

    // 비밀번호는 응답에서 제외
    const formattedResults = results.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }))

    return NextResponse.json({
      success: true,
      data: formattedResults,
      totalCount: formattedResults.length
    }, { status: 200 })
  } catch (error: any) {
    console.error('Users GET error:', error)
    
    // requireAdmin에서 throw한 에러 처리
    if (error.message === '인증이 필요합니다.' || error.message === '관리자 권한이 필요합니다.') {
      return NextResponse.json({
        success: false,
        message: error.message
      }, { status: 403 })
    }
    
    return NextResponse.json({
      success: false,
      message: '유저 조회 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    }, { status: 500 })
  }
}

