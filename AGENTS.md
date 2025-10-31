# GameCoach.AI 프로젝트 분석 보고서

## 프로젝트 개요

**GameCoach.AI**는 AI 기반 게임 코칭 플랫폼으로, Next.js 14와 TypeScript를 기반으로 구축된 웹 애플리케이션입니다. 프로게이머를 꿈꾸는 사용자들에게 맞춤형 코치 매칭 서비스를 제공하는 것이 목표입니다.

## 기술 스택

### 프레임워크 및 라이브러리
- **Next.js 14.2.16** - React 기반 풀스택 프레임워크
- **React 18** - UI 라이브러리
- **TypeScript 5** - 타입 안전성을 위한 정적 타입 언어
- **Tailwind CSS 4.1.9** - 유틸리티 퍼스트 CSS 프레임워크

### UI 컴포넌트 라이브러리
- **Radix UI** - 접근성이 뛰어난 헤드리스 UI 컴포넌트들
  - Dialog, Button, Input, Card, Accordion 등 다양한 컴포넌트
- **Lucide React** - 아이콘 라이브러리
- **Geist Font** - 모던한 폰트 패밀리 (Sans, Mono)

### 상태 관리 및 폼 처리
- **React Hook Form 7.60.0** - 폼 상태 관리
- **Zod 3.25.67** - 스키마 검증
- **@hookform/resolvers** - 폼 검증 통합

### 기타 라이브러리
- **next-themes** - 다크/라이트 테마 지원
- **@vercel/analytics** - 웹 분석
- **date-fns** - 날짜 처리
- **recharts** - 차트 라이브러리
- **sonner** - 토스트 알림

## 프로젝트 구조

```
gamecoach-ai/
├── app/                    # Next.js App Router
│   ├── globals.css        # 전역 스타일
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx          # 홈페이지
├── components/            # React 컴포넌트
│   ├── ui/               # 재사용 가능한 UI 컴포넌트
│   ├── header.tsx        # 헤더 컴포넌트
│   ├── hero-section.tsx  # 히어로 섹션
│   ├── chatbot-modal.tsx # 챗봇 모달
│   └── ...               # 기타 섹션 컴포넌트들
├── lib/                  # 유틸리티 함수
│   └── utils.ts          # 공통 유틸리티
├── hooks/                # 커스텀 훅
├── public/               # 정적 파일
└── styles/               # 스타일 파일
```

## 애플리케이션 아키텍처

### 라우팅 구조
- **App Router** 사용 (Next.js 13+)
- 단일 페이지 애플리케이션 (SPA) 구조
- 모든 섹션이 하나의 페이지에 구성

### 컴포넌트 구조
1. **Header** - 네비게이션 및 로고
2. **HeroSection** - 메인 캐러셀 배너
3. **GameCoachSection** - 게임별 코치 카테고리
4. **KeyBenefitsSection** - 주요 혜택 소개
5. **AIMatchingProcessSection** - AI 매칭 프로세스
6. **InstructorProfileSection** - 강사 프로필
7. **UseCaseSection** - 사용 사례
8. **ReviewsSection** - 리뷰 섹션
9. **CTAHighlightSection** - 행동 유도 섹션
10. **FooterSection** - 푸터

## 상태 관리

### 클라이언트 상태 관리
- **React useState** 훅을 사용한 로컬 상태 관리
- 복잡한 상태 관리는 최소화 (workspace rules에 따라)
- 주요 상태:
  - `isChatbotOpen`: 챗봇 모달 열림/닫힘 상태
  - `currentSlide`: 히어로 섹션 캐러셀 현재 슬라이드
  - `messages`: 챗봇 대화 메시지 배열
  - `userAnswers`: 사용자 답변 저장

### 상태 관리 패턴
- 각 컴포넌트에서 독립적인 상태 관리
- Props drilling 최소화를 위한 모달 상태 관리
- 전역 상태 관리 라이브러리 미사용 (Redux, Zustand 등)

## 데이터 흐름

### 정적 데이터
- 게임 카테고리 정보 (리그 오브 레전드, 발로란트, 오버워치 2, 배틀그라운드)
- 히어로 섹션 슬라이드 데이터
- 강사 프로필 정보
- 리뷰 데이터

### 동적 데이터 처리
- 챗봇 대화 흐름 관리
- 사용자 입력 처리 및 검증
- 웨이팅 리스트 등록 (현재는 더미 함수)

## 스타일링 시스템

### CSS 아키텍처
- **Tailwind CSS** 기반 유틸리티 퍼스트 접근법
- 커스텀 CSS 변수를 통한 디자인 시스템
- 다크/라이트 테마 지원

### 디자인 시스템
- **색상 팔레트**: GameCoach.AI 브랜드 컬러
  - Primary: Professional blue (oklch(0.45 0.15 240))
  - Accent: Accent blue (oklch(0.55 0.2 200))
  - 다크 모드에서 녹색 계열로 변경
- **타이포그래피**: Geist 폰트 패밀리
- **애니메이션**: 게임 테마에 맞는 subtle한 애니메이션

## 주요 기능

### 1. 반응형 캐러셀 히어로 섹션
- 자동 슬라이드 전환 (5초 간격)
- 수동 네비게이션 (화살표, 도트)
- 반응형 디자인

### 2. 게임별 코치 카테고리
- 4개 주요 게임 카테고리
- 호버 효과 및 그라데이션 배경
- 클릭 시 챗봇 모달 열림

### 3. AI 챗봇 모달
- 단계별 질문 시스템
- 실시간 대화 인터페이스
- 웨이팅 리스트 등록 기능

### 4. 반응형 레이아웃
- 모바일 우선 디자인
- Tailwind CSS 브레이크포인트 활용
- 유연한 그리드 시스템

## 개발 환경 설정

### 패키지 매니저
- **pnpm** 사용 (workspace rules에 따라)
- 설치 명령어: `npm i -g pnpm`

### 빌드 설정
- **Next.js Config**: ESLint 및 TypeScript 빌드 에러 무시 설정
- **이미지 최적화**: 비활성화 (unoptimized: true)
- **PostCSS**: Tailwind CSS 처리

### 개발 도구
- TypeScript 컴파일러
- ESLint (빌드 시 무시)
- PostCSS 및 Autoprefixer

## 성능 최적화

### 이미지 최적화
- Next.js Image 컴포넌트 미사용
- 정적 이미지 파일 직접 참조
- WebP 형식 지원 고려 필요

### 번들 최적화
- Tree shaking을 통한 불필요한 코드 제거
- 동적 import 미사용 (단일 페이지 구조)
- Vercel Analytics 통합

## 보안 고려사항

### 클라이언트 사이드 보안
- 사용자 입력 검증 (현재 기본적 수준)
- XSS 방지를 위한 React의 기본 보안 기능 활용
- CSRF 보호 (서버 사이드 구현 필요)

### 데이터 보호
- 개인정보 처리 최소화
- 웨이팅 리스트 데이터 암호화 필요

## 향후 개선 방향

### 기능 확장
1. **백엔드 API 연동**
   - 사용자 인증 시스템
   - 코치 매칭 알고리즘
   - 결제 시스템

2. **데이터베이스 연동**
   - 사용자 프로필 관리
   - 코치 정보 관리
   - 수업 일정 관리

3. **실시간 기능**
   - WebSocket을 통한 실시간 채팅
   - 라이브 코칭 세션

### 기술적 개선
1. **상태 관리 고도화**
   - Context API 또는 Zustand 도입
   - 서버 상태 관리 (TanStack Query)

2. **성능 최적화**
   - 이미지 최적화 활성화
   - 코드 스플리팅
   - 서버 사이드 렌더링 활용

3. **접근성 개선**
   - ARIA 라벨 추가
   - 키보드 네비게이션 개선
   - 스크린 리더 지원

## 결론

GameCoach.AI는 현대적인 웹 기술 스택을 활용하여 구축된 게임 코칭 플랫폼입니다. Next.js 14의 App Router와 Tailwind CSS를 활용한 반응형 디자인, Radix UI를 통한 접근성 있는 컴포넌트 구성이 특징입니다. 

현재는 프론트엔드 프로토타입 단계이며, 향후 백엔드 API 연동, 사용자 인증, 결제 시스템 등의 기능을 추가하여 완전한 서비스로 발전시킬 수 있는 기반이 잘 갖춰져 있습니다.

프로젝트의 코드 구조는 workspace rules에 따라 단순하고 유지보수하기 쉽게 설계되어 있으며, 확장성을 고려한 아키텍처를 가지고 있습니다.


