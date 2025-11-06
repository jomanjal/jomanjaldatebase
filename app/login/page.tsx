"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { login } from "@/lib/auth"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    const response = await login(email, password)
    
    if (response.success) {
      router.push("/")
    } else {
      setError(response.message || "이메일 또는 비밀번호가 올바르지 않습니다.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-[var(--primary01)] rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <span className="text-xl font-bold text-foreground">GameCoach.AI</span>
          </div>
          <CardTitle className="text-xl">로그인</CardTitle>
          <CardDescription>
            계정에 로그인하여 게임 코칭을 시작하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-[var(--systemWarning01)]/10 text-[var(--systemWarning01)] text-sm p-3 rounded-md border border-[var(--systemWarning01)]/30">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="이메일을 입력하세요"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "로그인 중..." : "로그인"}
            </Button>
          </form>
          
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-[var(--text04)]">
              계정이 없으신가요?{" "}
              <Link href="/signup" className="text-[var(--primary01)] hover:underline">
                회원가입
              </Link>
            </p>
            <Link href="/" className="text-sm text-[var(--text04)] hover:underline">
              홈으로 돌아가기
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}