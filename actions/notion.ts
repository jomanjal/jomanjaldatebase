'use server'

import { addToWaitlist, type WaitlistData } from '@/lib/notion'

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

    console.log('Notion API 호출 시작...')
    // Notion 데이터베이스에 데이터 추가
    const result = await addToWaitlist(data)
    console.log('Notion API 결과:', result)

    if (result.success) {
      return {
        success: true,
        message: '웨이팅 리스트 등록이 완료되었습니다!',
      }
    } else {
      return {
        success: false,
        error: result.error || '등록 중 오류가 발생했습니다.',
      }
    }
  } catch (error) {
    console.error('Server Action Error:', error)
    return {
      success: false,
      error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    }
  }
}
