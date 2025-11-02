import { defineConfig } from 'drizzle-kit'
import { config } from 'dotenv'
import path from 'path'

// Vercel 환경에서는 환경 변수가 이미 설정되어 있음
// 로컬에서는 .env.local 파일 로드
if (process.env.VERCEL !== '1') {
  config({ path: path.resolve(process.cwd(), '.env.local') })
}

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || '',
  },
})

