/**
 * 데이터베이스 연결 테스트 스크립트
 * 사용법: pnpm tsx scripts/test-db-connection.ts
 */

// 가장 먼저 환경 변수 로드 (다른 import보다 먼저!)
import { config } from 'dotenv'
import path from 'path'

// .env.local 파일 로드
config({ path: path.resolve(process.cwd(), '.env.local') })

async function testConnection() {
  // 환경 변수 로드 후에 동적으로 모듈 import
  const { db } = await import('../lib/db')
  const { sql } = await import('drizzle-orm')
  try {
    console.log('🔍 데이터베이스 연결 테스트 중...\n')
    
    // 환경 변수 확인
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL 환경 변수가 설정되지 않았습니다.')
      console.log('💡 .env.local 파일이 프로젝트 루트에 있는지 확인하세요.')
      process.exit(1)
    }

    console.log('✅ DATABASE_URL 환경 변수 발견')
    // 비밀번호 부분만 마스킹
    const maskedUrl = process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':****@')
    console.log(`📍 연결 문자열: ${maskedUrl}\n`)

    // 간단한 쿼리로 연결 테스트
    const result = await db.execute(sql`SELECT NOW() as current_time, version() as pg_version`)
    console.log('✅ 데이터베이스 연결 성공!')
    
    if (result.rows.length > 0) {
      const row = result.rows[0] as any
      console.log(`⏰ 서버 시간: ${row.current_time}`)
      console.log(`📦 PostgreSQL 버전: ${row.pg_version.split(',')[0]}\n`)
    }
    
    // 테이블 목록 확인
    const tables = await db.execute(sql`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `)
    
    if (tables.rows.length > 0) {
      console.log('📋 생성된 테이블:')
      tables.rows.forEach((row: any) => {
        console.log(`   ✓ ${row.tablename}`)
      })
      console.log(`\n✅ 총 ${tables.rows.length}개의 테이블이 있습니다.`)
    } else {
      console.log('\n⚠️  아직 테이블이 생성되지 않았습니다.')
      console.log('💡 다음 명령어를 실행하여 테이블을 생성하세요:')
      console.log('   pnpm db:push')
    }
    
    console.log('\n✅ 모든 테스트 통과!')
    process.exit(0)
  } catch (error: any) {
    console.error('\n❌ 데이터베이스 연결 실패')
    console.error(`오류 메시지: ${error.message}`)
    if (error.cause) {
      console.error(`원인: ${error.cause.message || JSON.stringify(error.cause)}`)
    }
    console.error(`\n전체 오류:`, error)
    console.log('')
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      console.log('💡 해결 방법:')
      console.log('   1. PostgreSQL 서비스가 실행 중인지 확인:')
      console.log('      Get-Service postgresql*')
      console.log('   2. 서비스가 중지되어 있다면 시작:')
      console.log('      Start-Service postgresql-x64-18  # 버전에 따라 다름')
    } else if (error.code === '28P01') {
      console.log('💡 해결 방법:')
      console.log('   1. DATABASE_URL의 사용자명과 비밀번호를 확인하세요')
      console.log('   2. .env.local 파일을 다시 확인하세요')
    } else if (error.code === '3D000') {
      console.log('💡 해결 방법:')
      console.log('   1. 데이터베이스가 존재하는지 확인:')
      console.log('      psql -U postgres -c "\\l"')
      console.log('   2. 데이터베이스 생성:')
      console.log('      psql -U postgres -c "CREATE DATABASE gamecoach_ai;"')
    } else if (error.message.includes('does not exist')) {
      console.log('💡 해결 방법:')
      console.log('   1. 데이터베이스를 생성하세요:')
      console.log('      psql -U postgres -c "CREATE DATABASE gamecoach_ai;"')
    }
    
    console.log(`\n상세 오류 코드: ${error.code || 'N/A'}`)
    process.exit(1)
  }
}

testConnection()

