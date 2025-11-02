'use server'

import { db } from '@/lib/db'
import { waitlist } from '@/lib/db/schema'

// 웨이팅 리스트 데이터 타입
export interface WaitlistData {
  name: string
  email: string
  goal?: string  // 게임
  tier?: string
  importantPoint?: string  // 매칭 스타일
}

/**
 * 웨이팅 리스트 등록 (PostgreSQL)
 */
export async function submitWaitlist(data: WaitlistData) {
  console.log('submitWaitlist 호출됨:', data)
  
  try {
    // 입력 데이터 검증
    if (!data.name || !data.email) {
      console.log('필수 필드 누락:', { name: data.name, email: data.email })
      return {
        success: false,
        error: '이름과 이메일은 필수 입력 항목입니다.',
      }
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      console.log('이메일 형식 오류:', data.email)
      return {
        success: false,
        error: '올바른 이메일 형식을 입력해주세요.',
      }
    }

    // PostgreSQL 데이터베이스에 데이터 추가
    const [result] = await db.insert(waitlist).values({
      name: data.name,
      email: data.email,
      goal: data.goal || null,
      tier: data.tier || null,
      importantPoint: data.importantPoint || null,
      contacted: false,
    }).returning()

    console.log('PostgreSQL 저장 완료:', result)

    return {
      success: true,
      message: '웨이팅 리스트 등록이 완료되었습니다!',
      data: result,
    }
  } catch (error: any) {
    console.error('Server Action Error:', error)
    
    // 중복 이메일 오류 처리
    if (error.code === '23505' || error.message?.includes('unique')) {
      return {
        success: false,
        error: '이미 등록된 이메일입니다.',
      }
    }

    return {
      success: false,
      error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    }
  }
}
