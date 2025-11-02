/**
 * 초기 관리자 계정 생성 스크립트
 * 
 * 사용법:
 * tsx scripts/create-admin.ts <username> <password> <email>
 * 
 * 또는
 * pnpm tsx scripts/create-admin.ts admin112 admin119 admin@example.com
 */

// 환경 변수 로드
import { config } from 'dotenv'
import path from 'path'
config({ path: path.resolve(process.cwd(), '.env.local') })

import bcrypt from 'bcryptjs'

async function createAdmin(username: string, password: string, email: string) {
  // 환경 변수 로드 후에 동적으로 모듈 import
  const { db } = await import('../lib/db')
  const { users, admins } = await import('../lib/db/schema')
  try {
    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10)

    // 사용자 생성
    const [user] = await db.insert(users).values({
      username,
      email,
      password: hashedPassword,
      role: 'admin',
    }).returning()

    console.log('✅ 사용자 생성 완료:', user)

    // 관리자 레코드 생성
    const [admin] = await db.insert(admins).values({
      userId: user.id,
      permissions: JSON.stringify(['all']),
    }).returning()

    console.log('✅ 관리자 계정 생성 완료:', admin)
    console.log('\n📝 로그인 정보:')
    console.log(`   아이디: ${username}`)
    console.log(`   이메일: ${email}`)
    console.log(`   비밀번호: ${password}`)
    console.log('\n⚠️  비밀번호를 안전한 곳에 저장하세요!')
  } catch (error) {
    console.error('❌ 오류 발생:', error)
    process.exit(1)
  }
}

// 명령줄 인자 읽기
const args = process.argv.slice(2)
if (args.length < 3) {
  console.error('사용법: tsx scripts/create-admin.ts <username> <password> <email>')
  process.exit(1)
}

const [username, password, email] = args
createAdmin(username, password, email).then(() => {
  process.exit(0)
})

