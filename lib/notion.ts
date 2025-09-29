import { Client } from '@notionhq/client'

// Notion 클라이언트 초기화
export const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

// 데이터베이스 ID
export const DATABASE_ID = process.env.NOTION_DATABASE_ID

// 웨이팅 리스트 데이터 타입
export interface WaitlistData {
  name: string
  email: string
  goal?: string
  tier?: string
  importantPoint?: string
}

// Notion 데이터베이스에 데이터 추가
export async function addToWaitlist(data: WaitlistData) {
  console.log('addToWaitlist 호출됨:', data)
  console.log('DATABASE_ID:', DATABASE_ID)
  
  try {
    console.log('Notion API 요청 데이터:', {
      parent: { database_id: DATABASE_ID },
      properties: {
        이름: { title: [{ text: { content: data.name } }] },
        이메일: { email: data.email },
        ...(data.goal && { 목표: { rich_text: [{ text: { content: data.goal } }] } }),
        ...(data.tier && { 선택: { select: { name: data.tier } } }),
        ...(data.importantPoint && { 우선순위: { rich_text: [{ text: { content: data.importantPoint } }] } }),
      }
    })

    const response = await notion.pages.create({
      parent: {
        database_id: DATABASE_ID!,
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
          목표: {
            rich_text: [
              {
                text: {
                  content: data.goal,
                },
              },
            ],
          },
        }),
        ...(data.tier && {
          선택: {
            select: {
              name: data.tier,
            },
          },
        }),
        ...(data.importantPoint && {
          우선순위: {
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
