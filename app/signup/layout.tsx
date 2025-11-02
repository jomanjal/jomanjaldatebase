import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '회원가입 - GameCoach.AI',
  description: 'GameCoach.AI에 회원가입하여 게임 코칭을 시작하세요',
}

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}


