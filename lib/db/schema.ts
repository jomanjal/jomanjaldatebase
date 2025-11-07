import { pgTable, text, timestamp, integer, real, boolean, serial, varchar, index } from 'drizzle-orm/pg-core'

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
  price: integer('price'), // 가격 (원 단위 숫자)
  discount: integer('discount'), // 할인율 (10, 30, 50)
  specialties: text('specialties').default('[]'), // JSON 배열 형태
  description: text('description'), // 코치 카드 설명 (제목)
  headline: text('headline'), // 한문장 표현 (상세 페이지 상단 표시)
  coachIntroduction: text('coach_introduction'), // 코치 소개 (별도 컬럼)
  // 상세 페이지 구성 정보
  thumbnailImage: text('thumbnail_image'), // 섬네일 이미지 URL (코치 카드용)
  profileImage: text('profile_image'), // 프로필 이미지 URL (코치 상세 페이지 우측바용)
  introductionImage: text('introduction_image'), // 강의 소개 이미지 URL
  introductionContent: text('introduction_content'), // 강의 소개 내용 (JSON)
  curriculumItems: text('curriculum_items').default('[]'), // 커리큘럼 항목들 (JSON 배열)
  totalCourseTime: varchar('total_course_time', { length: 50 }), // 총 강의 시간 (예: "1시간")
  verified: boolean('verified').default(false).notNull(),
  active: boolean('active').default(true).notNull(), // 강의 활성화 여부 (코치 목록 노출)
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  // 검색 성능 최적화를 위한 인덱스
  nameIdx: index('coaches_name_idx').on(table.name), // 이름 검색용
  specialtyIdx: index('coaches_specialty_idx').on(table.specialty), // 전문 분야 필터링용
  tierIdx: index('coaches_tier_idx').on(table.tier), // 티어 필터링용
  verifiedActiveIdx: index('coaches_verified_active_idx').on(table.verified, table.active), // 일반 사용자 필터링용 복합 인덱스
  priceIdx: index('coaches_price_idx').on(table.price), // 가격 정렬/필터링용
  ratingIdx: index('coaches_rating_idx').on(table.rating), // 평점 정렬용
  createdAtIdx: index('coaches_created_at_idx').on(table.createdAt), // 최신순 정렬용
}))

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

// 업로드된 이미지 해시 테이블 (중복 체크용)
export const uploadedImages = pgTable('uploaded_images', {
  id: serial('id').primaryKey(),
  fileHash: varchar('file_hash', { length: 64 }).notNull().unique(), // SHA256 해시 (64자)
  blobUrl: text('blob_url').notNull(), // Vercel Blob Storage URL
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// 수강 신청 테이블 (enrollments)
export const enrollments = pgTable('enrollments', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  coachId: integer('coach_id').references(() => coaches.id).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'), // pending, approved, rejected, completed, cancelled
  message: text('message'), // 사용자가 보내는 메시지
  coachMessage: text('coach_message'), // 코치가 보내는 메시지
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('enrollments_user_id_idx').on(table.userId),
  coachIdIdx: index('enrollments_coach_id_idx').on(table.coachId),
  statusIdx: index('enrollments_status_idx').on(table.status),
  createdAtIdx: index('enrollments_created_at_idx').on(table.createdAt),
}))

// 코치 주간 일정 테이블 (coach_schedules)
export const coachSchedules = pgTable('coach_schedules', {
  id: serial('id').primaryKey(),
  coachId: integer('coach_id').references(() => coaches.id).notNull(),
  dayOfWeek: integer('day_of_week').notNull(), // 0: 일요일, 1: 월요일, ..., 6: 토요일
  enabled: boolean('enabled').default(true).notNull(), // 해당 요일 활성화 여부
  startTime: varchar('start_time', { length: 5 }).notNull(), // 시작 시간 (HH:mm 형식)
  endTime: varchar('end_time', { length: 5 }).notNull(), // 종료 시간 (HH:mm 형식)
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  coachIdIdx: index('coach_schedules_coach_id_idx').on(table.coachId),
  dayOfWeekIdx: index('coach_schedules_day_of_week_idx').on(table.dayOfWeek),
  coachDayIdx: index('coach_schedules_coach_day_idx').on(table.coachId, table.dayOfWeek),
}))

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
export type UploadedImage = typeof uploadedImages.$inferSelect
export type NewUploadedImage = typeof uploadedImages.$inferInsert
export type Enrollment = typeof enrollments.$inferSelect
export type NewEnrollment = typeof enrollments.$inferInsert
export type CoachSchedule = typeof coachSchedules.$inferSelect
export type NewCoachSchedule = typeof coachSchedules.$inferInsert

