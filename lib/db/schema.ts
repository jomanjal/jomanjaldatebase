import { pgTable, text, timestamp, integer, real, boolean, serial, varchar } from 'drizzle-orm/pg-core'

// 사용자 테이블
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(), // bcrypt 해시된 비밀번호
  role: varchar('role', { length: 20 }).notNull().default('user'), // 'user', 'admin', 'coach'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// 관리자 테이블 (users 테이블과 별도 관리 가능)
export const admins = pgTable('admins', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull().unique(),
  permissions: text('permissions').default('[]'), // JSON 배열 형태로 권한 관리
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// 코치 테이블
export const coaches = pgTable('coaches', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  name: varchar('name', { length: 100 }).notNull(),
  specialty: varchar('specialty', { length: 100 }).notNull(), // 게임 이름
  tier: varchar('tier', { length: 50 }).notNull(),
  experience: varchar('experience', { length: 50 }).notNull(),
  rating: real('rating').default(0).notNull(),
  reviews: integer('reviews').default(0).notNull(),
  students: integer('students').default(0).notNull(),
  price: varchar('price', { length: 100 }),
  discount: integer('discount'), // 할인율 (10, 30, 50)
  specialties: text('specialties').default('[]'), // JSON 배열 형태
  description: text('description'),
  // 상세 페이지 구성 정보
  introductionImage: text('introduction_image'), // 소개 이미지 URL
  introductionContent: text('introduction_content'), // 강의 소개 내용 (JSON)
  curriculumItems: text('curriculum_items').default('[]'), // 커리큘럼 항목들 (JSON 배열)
  totalCourseTime: varchar('total_course_time', { length: 50 }), // 총 강의 시간 (예: "1시간")
  verified: boolean('verified').default(false).notNull(),
  active: boolean('active').default(true).notNull(), // 강의 활성화 여부 (코치 목록 노출)
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// 웨이팅 리스트 테이블
export const waitlist = pgTable('waitlist', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  goal: varchar('goal', { length: 100 }), // 게임 이름
  tier: varchar('tier', { length: 50 }),
  importantPoint: text('important_point'), // 매칭 스타일
  contacted: boolean('contacted').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// 리뷰 테이블
export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  coachId: integer('coach_id').references(() => coaches.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  rating: integer('rating').notNull(), // 1-5 점수
  comment: text('comment'),
  verified: boolean('verified').default(false).notNull(), // 관리자 승인 여부
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// 타입 추출
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Admin = typeof admins.$inferSelect
export type NewAdmin = typeof admins.$inferInsert
export type Coach = typeof coaches.$inferSelect
export type NewCoach = typeof coaches.$inferInsert
export type Waitlist = typeof waitlist.$inferSelect
export type NewWaitlist = typeof waitlist.$inferInsert
export type Review = typeof reviews.$inferSelect
export type NewReview = typeof reviews.$inferInsert

