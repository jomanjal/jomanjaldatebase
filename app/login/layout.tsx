import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '로그인 - GameCoach.AI',
  description: 'GameCoach.AI에 로그인하여 게임 코칭을 시작하세요',
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}


