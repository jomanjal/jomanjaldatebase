# 테스트 가이드

## 개요

이 프로젝트는 Jest와 React Testing Library를 사용하여 테스트 환경을 구성했습니다.

## 설치된 패키지

- **jest**: JavaScript 테스트 프레임워크
- **jest-environment-jsdom**: 브라우저 환경 시뮬레이션
- **@testing-library/react**: React 컴포넌트 테스트 유틸리티
- **@testing-library/jest-dom**: 추가 DOM 매처
- **@testing-library/user-event**: 사용자 이벤트 시뮬레이션

## 테스트 실행

### 모든 테스트 실행
```bash
pnpm test
```

### Watch 모드 (파일 변경 시 자동 실행)
```bash
pnpm test:watch
```

### 커버리지 리포트 생성
```bash
pnpm test:coverage
```

## 테스트 파일 위치

테스트 파일은 다음 위치에 작성할 수 있습니다:

1. `__tests__/` 디렉토리 내
2. 파일과 같은 디렉토리에 `.test.ts` 또는 `.test.tsx` 확장자
3. 파일과 같은 디렉토리에 `.spec.ts` 또는 `.spec.tsx` 확장자

예시:
- `__tests__/components/Button.test.tsx`
- `components/Button.test.tsx`
- `lib/utils.test.ts`

## 테스트 작성 예제

### 컴포넌트 테스트

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  it('should render correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should handle click events', async () => {
    const handleClick = jest.fn()
    const user = userEvent.setup()
    
    render(<Button onClick={handleClick}>Click me</Button>)
    await user.click(screen.getByRole('button'))
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### 유틸리티 함수 테스트

```tsx
import { cn } from '@/lib/utils'

describe('cn utility', () => {
  it('should merge class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })
})
```

### API 라우트 테스트

```tsx
import { GET } from '@/app/api/coaches/route'
import { NextRequest } from 'next/server'

describe('GET /api/coaches', () => {
  it('should return coaches list', async () => {
    const request = new NextRequest('http://localhost:3000/api/coaches')
    const response = await GET(request)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })
})
```

## 모킹 (Mocking)

### Next.js Router 모킹

`jest.setup.js`에서 이미 설정되어 있습니다:

```tsx
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      // ...
    }
  },
}))
```

### 사용자 정의 모킹

```tsx
// __mocks__/lib/auth.ts
export const checkAuth = jest.fn().mockResolvedValue({
  userId: 1,
  username: 'testuser',
  role: 'user',
})
```

## 테스트 베스트 프랙티스

1. **명확한 테스트 이름**: 테스트가 무엇을 검증하는지 명확하게 작성
2. **AAA 패턴**: Arrange, Act, Assert 구조 사용
3. **단위 테스트**: 하나의 기능만 테스트
4. **독립성**: 테스트는 서로 독립적이어야 함
5. **접근성**: `getByRole`, `getByLabelText` 등 접근성 쿼리 우선 사용

## 커버리지 목표

현재 커버리지 임계값은 0%로 설정되어 있습니다. 프로젝트 진행에 따라 점진적으로 증가시킬 수 있습니다.

```javascript
// jest.config.mjs
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  },
}
```

## 추가 리소스

- [Jest 공식 문서](https://jestjs.io/)
- [React Testing Library 공식 문서](https://testing-library.com/react)
- [Testing Library 쿼리 우선순위](https://testing-library.com/docs/queries/about/#priority)

