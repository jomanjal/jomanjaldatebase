import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { coaches } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getAuthenticatedUser } from '@/lib/auth-server'

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
      return NextResponse.json({
        success: false,
        message: '유효하지 않은 ID입니다.'
      }, { status: 400 })
    }

    const [coach] = await db.select()
      .from(coaches)
      .where(eq(coaches.id, id))
      .limit(1)

    if (!coach) {
      return NextResponse.json({
        success: false,
        message: '코치를 찾을 수 없습니다.'
      }, { status: 404 })
    }

    // specialties 파싱
    const formattedCoach = {
      ...coach,
      specialties: coach.specialties ? JSON.parse(coach.specialties) : [],
    }

    return NextResponse.json({
      success: true,
      data: formattedCoach
    }, { status: 200 })
  } catch (error) {
    console.error('Coach GET error:', error)
    return NextResponse.json({
      success: false,
      message: '코치 조회 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    }, { status: 500 })
  }
}

/**
 * 코치 수정 (PUT)
 * 관리자 권한 필요
 */
export async function PUT(
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
    const {
      name,
      specialty,
      tier,
      experience,
      price,
      specialties,
      description,
      verified,
    } = body

    // 업데이트할 데이터 구성
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (specialty !== undefined) updateData.specialty = specialty
    if (tier !== undefined) updateData.tier = tier
    if (experience !== undefined) updateData.experience = experience
    if (price !== undefined) updateData.price = price
    if (specialties !== undefined) updateData.specialties = JSON.stringify(specialties)
    if (description !== undefined) updateData.description = description
    if (verified !== undefined) updateData.verified = verified
    updateData.updatedAt = new Date()

    // 업데이트
    const [updated] = await db.update(coaches)
      .set(updateData)
      .where(eq(coaches.id, id))
      .returning()

    if (!updated) {
      return NextResponse.json({
        success: false,
        message: '코치를 찾을 수 없습니다.'
      }, { status: 404 })
    }

    // specialties 파싱
    const formattedCoach = {
      ...updated,
      specialties: updated.specialties ? JSON.parse(updated.specialties) : [],
    }

    return NextResponse.json({
      success: true,
      data: formattedCoach,
      message: '코치 정보가 수정되었습니다.'
    }, { status: 200 })
  } catch (error) {
    console.error('Coach PUT error:', error)
    return NextResponse.json({
      success: false,
      message: '코치 수정 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    }, { status: 500 })
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
    const [deleted] = await db.delete(coaches)
      .where(eq(coaches.id, id))
      .returning()

    if (!deleted) {
      return NextResponse.json({
        success: false,
        message: '코치를 찾을 수 없습니다.'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: '코치가 삭제되었습니다.'
    }, { status: 200 })
  } catch (error: any) {
    console.error('Coach DELETE error:', error)
    
    // 외래 키 제약 오류 (리뷰가 있는 경우)
    if (error.code === '23503') {
      return NextResponse.json({
        success: false,
        message: '관련 리뷰가 있어 삭제할 수 없습니다.'
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      message: '코치 삭제 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    }, { status: 500 })
  }
}

