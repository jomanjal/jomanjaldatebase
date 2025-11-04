import { NextRequest, NextResponse } from 'next/server'
import { put, del } from '@vercel/blob'
import sharp from 'sharp'
import { getAuthenticatedUser } from '@/lib/auth-server'
import { db } from '@/lib/db'
import { uploadedImages } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { createHash } from 'crypto'

// 허용된 이미지 MIME 타입
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
]

// 허용된 파일 확장자
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif']

// 최대 이미지 크기 (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024

// 최대 해상도
const MAX_WIDTH = 1920
const MAX_HEIGHT = 1920

// 이미지 품질 설정
const WEBP_QUALITY = 85

/**
 * 파일 확장자 추출
 */
function getFileExtension(filename: string): string {
  const ext = filename.toLowerCase().slice(filename.lastIndexOf('.'))
  return ext
}

/**
 * MIME 타입에서 확장자 검증
 */
function isValidMimeType(mimeType: string, filename: string): boolean {
  const ext = getFileExtension(filename)
  return ALLOWED_MIME_TYPES.includes(mimeType) && ALLOWED_EXTENSIONS.includes(ext)
}

/**
 * 실제 이미지 파일인지 검증 (매직 넘버)
 */
async function isValidImageFile(buffer: Buffer): Promise<boolean> {
  try {
    // JPEG: FF D8 FF
    // PNG: 89 50 4E 47
    // WebP: 52 49 46 46 (RIFF) ... WEBP
    // GIF: 47 49 46 38 (GIF8)
    const header = buffer.slice(0, 12)
    const headerHex = header.toString('hex').toUpperCase()

    return (
      headerHex.startsWith('FFD8FF') || // JPEG
      headerHex.startsWith('89504E47') || // PNG
      headerHex.startsWith('52494646') || // RIFF (WebP, GIF 등)
      headerHex.startsWith('47494638') // GIF
    )
  } catch {
    return false
  }
}

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

    // 파일 크기 검증
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({
        success: false,
        message: `파일 크기는 ${MAX_FILE_SIZE / 1024 / 1024}MB 이하여야 합니다.`
      }, { status: 400 })
    }

    // MIME 타입 및 확장자 검증
    if (!isValidMimeType(file.type, file.name)) {
      return NextResponse.json({
        success: false,
        message: '지원하는 이미지 형식만 업로드할 수 있습니다. (JPG, PNG, WebP, GIF)'
      }, { status: 400 })
    }

    // 파일을 Buffer로 변환
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // 실제 이미지 파일인지 검증 (매직 넘버)
    if (!(await isValidImageFile(buffer))) {
      return NextResponse.json({
        success: false,
        message: '유효한 이미지 파일이 아닙니다.'
      }, { status: 400 })
    }

    // Sharp로 이미지 처리
    let processedBuffer: Buffer
    let outputFormat: 'webp' | 'jpeg' | 'png' = 'webp'

    try {
      // 이미지 메타데이터 확인
      const metadata = await sharp(buffer).metadata()
      
      // 이미지 리사이징 및 WebP 변환
      let sharpInstance = sharp(buffer)

      // 리사이징 (비율 유지)
      if (metadata.width && metadata.height) {
        if (metadata.width > MAX_WIDTH || metadata.height > MAX_HEIGHT) {
          sharpInstance = sharpInstance.resize(MAX_WIDTH, MAX_HEIGHT, {
            fit: 'inside',
            withoutEnlargement: true,
          })
        }
      }

      // WebP로 변환 (GIF는 제외)
      if (metadata.format === 'gif') {
        // GIF는 원본 유지 (애니메이션)
        processedBuffer = buffer
        outputFormat = 'png' // 확장자는 png로 (실제로는 gif)
      } else {
        // JPEG, PNG 등은 WebP로 변환
        processedBuffer = await sharpInstance
          .webp({ quality: WEBP_QUALITY })
          .toBuffer()
        outputFormat = 'webp'
      }
    } catch (error: any) {
      console.error('Image processing error:', error)
      return NextResponse.json({
        success: false,
        message: '이미지 처리 중 오류가 발생했습니다.'
      }, { status: 400 })
    }

    // 처리된 이미지의 SHA256 해시 계산 (중복 체크용)
    const fileHash = createHash('sha256').update(processedBuffer).digest('hex')

    // DB에서 중복 이미지 확인
    const existingImage = await db
      .select()
      .from(uploadedImages)
      .where(eq(uploadedImages.fileHash, fileHash))
      .limit(1)

    // 중복 이미지가 있으면 기존 URL 반환
    if (existingImage.length > 0) {
      return NextResponse.json({
        success: true,
        path: existingImage[0].blobUrl,
        message: '이미지가 업로드되었습니다. (기존 이미지 재사용)'
      }, { status: 200 })
    }

    // 파일명 생성 (타임스탬프 + 랜덤 문자열 + 확장자)
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').split('.')[0]
    const extension = outputFormat === 'webp' ? '.webp' : getFileExtension(file.name)
    const fileName = `${timestamp}_${randomStr}_${sanitizedFileName}${extension}`

    // Vercel Blob Storage에 업로드
    let blobUrl: string
    try {
      const blob = await put(fileName, processedBuffer, {
        access: 'public',
        contentType: outputFormat === 'webp' ? 'image/webp' : file.type,
      })
      blobUrl = blob.url
    } catch (error: any) {
      console.error('Blob upload error:', error)
      return NextResponse.json({
        success: false,
        message: '파일 업로드 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      }, { status: 500 })
    }

    // DB에 이미지 해시 및 URL 저장
    try {
      await db.insert(uploadedImages).values({
        fileHash,
        blobUrl,
      })
    } catch (error: any) {
      // DB 저장 실패 시 상세 에러 로깅
      console.error('[Image Upload] ❌ Failed to save image hash to DB:', error)
      console.error('[Image Upload] Error details:', {
        fileHash: fileHash.substring(0, 16) + '...',
        blobUrl,
        errorMessage: error.message,
      })
      // DB 저장 실패는 치명적이지 않지만, 다음 중복 체크가 작동하지 않을 수 있음
    }

    return NextResponse.json({
      success: true,
      path: blobUrl, // Vercel Blob URL 반환
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

/**
 * 이미지 파일 삭제 (DELETE)
 * 코치 권한 필요
 */
export async function DELETE(request: NextRequest) {
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
    const { url } = body

    if (!url || typeof url !== 'string') {
      return NextResponse.json({
        success: false,
        message: '이미지 URL이 필요합니다.'
      }, { status: 400 })
    }

    // Vercel Blob Storage URL인지 확인
    if (!url.includes('blob.vercel-storage.com')) {
      return NextResponse.json({
        success: false,
        message: '유효하지 않은 이미지 URL입니다.'
      }, { status: 400 })
    }

    // DB에서 해당 URL의 해시 레코드 찾기
    const imageRecord = await db
      .select()
      .from(uploadedImages)
      .where(eq(uploadedImages.blobUrl, url))
      .limit(1)

    // Vercel Blob Storage에서 파일 삭제
    try {
      await del(url)
    } catch (error: any) {
      console.error('[Image Delete] ❌ Failed to delete blob:', error)
      // Blob 삭제 실패해도 DB 레코드는 삭제 시도
    }

    // DB에서 해시 레코드 삭제 (존재하는 경우)
    if (imageRecord.length > 0) {
      try {
        await db
          .delete(uploadedImages)
          .where(eq(uploadedImages.fileHash, imageRecord[0].fileHash))
      } catch (error: any) {
        console.error('[Image Delete] ❌ Failed to delete hash record from DB:', error)
        // DB 삭제 실패는 치명적이지 않지만, 중복 체크에 영향을 줄 수 있음
      }
    }

    return NextResponse.json({
      success: true,
      message: '이미지가 삭제되었습니다.'
    }, { status: 200 })
  } catch (error: any) {
    console.error('Image delete error:', error)
    return NextResponse.json({
      success: false,
      message: '이미지 삭제 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    }, { status: 500 })
  }
}

