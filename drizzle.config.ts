import { defineConfig } from 'drizzle-kit'
import { config } from 'dotenv'
import path from 'path'

// .env.local 파일 로드
config({ path: path.resolve(process.cwd(), '.env.local') })

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || '',
  },
})

