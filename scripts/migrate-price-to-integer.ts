/**
 * 가격 필드를 varchar에서 integer로 변환하는 마이그레이션 스크립트
 * 
 * 사용법: pnpm tsx scripts/migrate-price-to-integer.ts
 */

// 환경 변수 로드
import { config } from 'dotenv'
import path from 'path'

// .env.local 파일 로드
config({ path: path.resolve(process.cwd(), '.env.local') })

async function migratePriceToInteger() {
  try {
    console.log('🔄 가격 필드 마이그레이션 시작...\n')

    // 환경 변수 확인
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL 환경 변수가 설정되지 않았습니다.')
      console.log('💡 .env.local 파일이 프로젝트 루트에 있는지 확인하세요.')
      process.exit(1)
    }

    // 환경 변수 로드 후에 동적으로 모듈 import
    const { db } = await import('../lib/db')
    const { coaches } = await import('../lib/db/schema')
    const { sql } = await import('drizzle-orm')

    // 1. 먼저 기존 데이터 확인
    const existingCoaches = await db.select({
      id: coaches.id,
      price: coaches.price,
    }).from(coaches)

    console.log(`📊 총 ${existingCoaches.length}개의 코치 데이터 확인\n`)

    // 2. price 컬럼을 integer로 변환 (PostgreSQL ALTER COLUMN 사용)
    // 기존 varchar 값을 숫자로 변환
    console.log('🔧 price 컬럼을 integer로 변환 중...')
    
    await db.execute(sql`
      ALTER TABLE coaches 
      ALTER COLUMN price TYPE integer 
      USING CASE 
        WHEN price IS NULL THEN NULL
        WHEN price ~ '^[0-9,]+' THEN 
          CAST(REGEXP_REPLACE(price, '[^0-9]', '', 'g') AS integer)
        ELSE NULL
      END
    `)

    console.log('✅ 가격 필드 마이그레이션 완료!\n')

    // 3. 변환된 데이터 확인
    const migratedCoaches = await db.select({
      id: coaches.id,
      price: coaches.price,
    }).from(coaches)

    const withPrice = migratedCoaches.filter(c => c.price !== null).length
    console.log(`📊 변환 완료: ${withPrice}개의 코치에 가격 정보가 있습니다.\n`)

    // 변환된 가격 샘플 출력
    if (migratedCoaches.length > 0) {
      console.log('샘플 데이터:')
      migratedCoaches.slice(0, 5).forEach(coach => {
        console.log(`  코치 ID ${coach.id}: ${coach.price ? coach.price.toLocaleString() + '원' : '가격 없음'}`)
      })
    }

    console.log('\n✅ 마이그레이션 완료!')
  } catch (error: any) {
    console.error('❌ 마이그레이션 실패:', error.message)
    
    if (error.code === '42704') {
      console.error('⚠️ price 컬럼이 이미 integer 타입이거나 존재하지 않습니다.')
    } else if (error.code === '42804') {
      console.error('⚠️ 기존 데이터를 변환할 수 없습니다. 수동으로 확인이 필요합니다.')
    }
    
    throw error
  }
}

migratePriceToInteger()
  .then(() => {
    console.log('\n✨ 작업 완료')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ 오류 발생:', error)
    process.exit(1)
  })

