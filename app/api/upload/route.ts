import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { getAuthenticatedUser } from '@/lib/auth-server'

/**
 * 이미지 파일 업로드 (POST)
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

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({
        success: false,
        message: '파일이 없습니다.'
      }, { status: 400 })
    }

    // 파일 타입 검증 (이미지만 허용)
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({
        success: false,
        message: '이미지 파일만 업로드할 수 있습니다.'
      }, { status: 400 })
    }

    // 파일 크기 검증 (최대 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({
        success: false,
        message: '파일 크기는 5MB 이하여야 합니다.'
      }, { status: 400 })
    }

    // 파일명 생성 (타임스탬프 + 원본 파일명)
    const timestamp = Date.now()
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${timestamp}_${sanitizedFileName}`
    
    // 업로드 디렉토리 생성 (public/uploads/coaches)
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'coaches')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // 파일 저장
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filePath = join(uploadDir, fileName)
    
    await writeFile(filePath, buffer)

    // 웹 경로 반환
    const webPath = `/uploads/coaches/${fileName}`

    return NextResponse.json({
      success: true,
      path: webPath,
      message: '파일이 업로드되었습니다.'
    }, { status: 200 })
  } catch (error: any) {
    console.error('File upload error:', error)
    return NextResponse.json({
      success: false,
      message: '파일 업로드 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    }, { status: 500 })
  }
}

