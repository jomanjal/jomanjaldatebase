import { Client } from '@notionhq/client'

// 환경 변수 확인 (디버깅용)
console.log('Environment check:')
console.log('NOTION_API_KEY exists:', !!process.env.NOTION_API_KEY)
console.log('NOTION_API_KEY length:', process.env.NOTION_API_KEY?.length || 0)
console.log('NOTION_API_KEY starts with secret_:', process.env.NOTION_API_KEY?.startsWith('secret_') || false)
console.log('NOTION_API_KEY starts with ntn_:', process.env.NOTION_API_KEY?.startsWith('ntn_') || false)
console.log('DATABASE_ID exists:', !!process.env.NOTION_DATABASE_ID)
console.log('DATABASE_ID length:', process.env.NOTION_DATABASE_ID?.length || 0)

// 환경 변수 전처리: 개행/공백 제거
const NOTION_API_KEY = (process.env.NOTION_API_KEY || '').trim()
let DATABASE_ID_RAW = (process.env.NOTION_DATABASE_ID || '').trim()

// Notion 클라이언트 초기화
export const notion = new Client({
  auth: NOTION_API_KEY,
})

// 데이터베이스 ID (하이픈 보정 전 원본)
export const DATABASE_ID = DATABASE_ID_RAW

// 웨이팅 리스트 데이터 타입
export interface WaitlistData {
  name: string
  email: string
  goal?: string  // 게임
  tier?: string
  importantPoint?: string  // 매칭 스타일
}

// Notion 데이터베이스에 데이터 추가
export async function addToWaitlist(data: WaitlistData) {
  console.log('addToWaitlist 호출됨:', data)
  console.log('DATABASE_ID:', DATABASE_ID)
  console.log('API Key check:', process.env.NOTION_API_KEY ? 'Present' : 'Missing')
  
  // API 키 확인
  if (!NOTION_API_KEY) {
    return { 
      success: false, 
      error: 'NOTION_API_KEY가 설정되지 않았습니다. .env.local 파일을 확인하세요.' 
    }
  }
  
  if (!DATABASE_ID_RAW) {
    return { 
      success: false, 
      error: 'NOTION_DATABASE_ID가 설정되지 않았습니다. .env.local 파일을 확인하세요.' 
    }
  }
  
  try {
    // Database ID 형식 확인 및 변환
    let databaseId = DATABASE_ID_RAW!
    
    // 하이픈이 없으면 추가 (UUID 형식으로)
    if (databaseId && !databaseId.includes('-') && databaseId.length === 32) {
      databaseId = [
        databaseId.substring(0, 8),
        databaseId.substring(8, 12),
        databaseId.substring(12, 16),
        databaseId.substring(16, 20),
        databaseId.substring(20, 32)
      ].join('-')
      console.log('Database ID converted:', databaseId)
    }
    
    console.log('Notion API 요청 데이터:', {
      parent: { database_id: databaseId },
      properties: {
        이름: { title: [{ text: { content: data.name } }] },
        이메일: { email: data.email },
        ...(data.goal && { 게임: { select: { name: data.goal } } }),
        ...(data.tier && { 티어: { select: { name: data.tier } } }),
        ...(data.importantPoint && { 매칭스타일: { rich_text: [{ text: { content: data.importantPoint } }] } }),
      }
    })

    const response = await notion.pages.create({
      parent: {
        database_id: databaseId,
      },
      properties: {
        이름: {
          title: [
            {
              text: {
                content: data.name,
              },
            },
          ],
        },
        이메일: {
          email: data.email,
        },
        ...(data.goal && {
          게임: {
            select: {
              name: data.goal,
            },
          },
        }),
        ...(data.tier && {
          티어: {
            select: {
              name: data.tier,
            },
          },
        }),
        ...(data.importantPoint && {
          매칭스타일: {
            rich_text: [
              {
                text: {
                  content: data.importantPoint,
                },
              },
            ],
          },
        }),
      },
    })

    console.log('Notion API 응답:', response)
    return { success: true, pageId: response.id }
  } catch (error) {
    console.error('Notion API Error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
