/**
 * Vercel 배포 후 데이터베이스 스키마를 자동으로 푸시하는 스크립트
 * Vercel 빌드 후 자동 실행됨
 */

// 환경 변수는 이미 Vercel에서 설정되어 있음
async function deploySchema() {
  try {
    console.log('🚀 데이터베이스 스키마 배포 중...\n')

    if (!process.env.DATABASE_URL) {
      console.warn('⚠️ DATABASE_URL 환경 변수가 설정되지 않았습니다. 스키마 배포를 건너뜁니다.')
      return
    }

    const maskedUrl = process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':****@')
    console.log(`📍 연결 문자열: ${maskedUrl}\n`)

    // drizzle-kit push 실행
    const { execSync } = await import('child_process')
    
    try {
      execSync('pnpm drizzle-kit push', {
        stdio: 'inherit',
        env: process.env,
      })
      console.log('\n✅ 스키마 배포 완료!')
    } catch (error: any) {
      console.error('\n❌ 스키마 배포 실패:', error.message)
      // 빌드는 계속 진행 (스키마가 이미 있을 수 있음)
      console.warn('⚠️ 스키마 배포 실패했지만 빌드를 계속 진행합니다.')
    }
  } catch (error: any) {
    console.error('❌ 오류 발생:', error.message)
    // 빌드는 계속 진행
    console.warn('⚠️ 오류가 발생했지만 빌드를 계속 진행합니다.')
  }
}

deploySchema()

