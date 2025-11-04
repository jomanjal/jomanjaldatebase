import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import sharp from 'sharp'
import { getAuthenticatedUser } from '@/lib/auth-server'

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

