import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { waitlist } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getAuthenticatedUser } from '@/lib/auth-server'

/**
 * 웨이팅 리스트 항목 연락 완료 표시 (PATCH)
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

    const { contacted } = await request.json()

    // 업데이트
    const [updated] = await db.update(waitlist)
      .set({ contacted: contacted === true })
      .where(eq(waitlist.id, id))
      .returning()

    if (!updated) {
      return NextResponse.json({ 
        success: false, 
        message: '웨이팅 리스트 항목을 찾을 수 없습니다.' 
      }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      data: updated,
      message: '업데이트되었습니다.'
    }, { status: 200 })
  } catch (error) {
    console.error('Waitlist PATCH error:', error)
    return NextResponse.json({ 
      success: false, 
      message: '업데이트 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' 
    }, { status: 500 })
  }
}

/**
 * 웨이팅 리스트 항목 삭제 (DELETE)
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

    // 삭제
    const [deleted] = await db.delete(waitlist)
      .where(eq(waitlist.id, id))
      .returning()

    if (!deleted) {
      return NextResponse.json({ 
        success: false, 
        message: '웨이팅 리스트 항목을 찾을 수 없습니다.' 
      }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      message: '삭제되었습니다.'
    }, { status: 200 })
  } catch (error) {
    console.error('Waitlist DELETE error:', error)
    return NextResponse.json({ 
      success: false, 
      message: '삭제 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' 
    }, { status: 500 })
  }
}

