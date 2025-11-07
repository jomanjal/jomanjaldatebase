import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { waitlist } from '@/lib/db/schema'
import { eq, desc, or, like } from 'drizzle-orm'
import { getAuthenticatedUser } from '@/lib/auth-server'
import { handleError, forbiddenError, validationError } from '@/lib/error-handler'

/**
 * 웨이팅 리스트 조회 (GET)
 * 관리자 권한 필요
 */
export async function GET(request: NextRequest) {
  try {
    // 인증 확인
    const user = await getAuthenticatedUser(request)
    if (!user || !user.isAdmin) {
      throw forbiddenError('관리자 권한이 필요합니다.')
    }

    // 쿼리 파라미터
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const game = searchParams.get('game') || 'all'
    const contacted = searchParams.get('contacted') // 'true', 'false', 또는 null

    // 검색어 길이 제한
    if (search.length > 100) {
      throw validationError('검색어는 100자를 초과할 수 없습니다.')
    }

    // 쿼리 빌드
    let query = db.select().from(waitlist)

    // 검색 필터
    if (search) {
      query = query.where(
        or(
          like(waitlist.name, `%${search}%`),
          like(waitlist.email, `%${search}%`)
        )
      ) as any
    }

    // 게임 필터
    if (game !== 'all') {
      query = query.where(eq(waitlist.goal, game)) as any
    }

    // 연락 완료 필터
    if (contacted === 'true') {
      query = query.where(eq(waitlist.contacted, true)) as any
    } else if (contacted === 'false') {
      query = query.where(eq(waitlist.contacted, false)) as any
    }

    // 최신순 정렬
    const results = await query.orderBy(desc(waitlist.createdAt))

    return NextResponse.json({ 
      success: true, 
      data: results,
      count: results.length
    }, { status: 200 })
  } catch (error) {
    return handleError(error, {
      path: '/api/waitlist',
      method: 'GET',
    })
  }
}

