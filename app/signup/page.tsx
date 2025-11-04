"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nickname: "",
    game: "",
    level: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null) // 입력 시 에러 메시지 제거
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    // 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.")
      return
    }
    
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          nickname: formData.nickname,
          password: formData.password,
          game: formData.game || null,
          level: formData.level || null,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success("회원가입이 완료되었습니다!")
        router.push('/login')
      } else {
        setError(data.message || '회원가입 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('Signup error:', error)
      setError('회원가입 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <span className="text-xl font-bold text-foreground">GameCoach.AI</span>
          </div>
          <CardTitle className="text-2xl">회원가입</CardTitle>
          <CardDescription>
            계정을 생성하여 게임 코칭을 시작하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="이메일을 입력하세요"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nickname">닉네임</Label>
              <Input
                id="nickname"
                type="text"
                placeholder="닉네임을 입력하세요 (2-20자)"
                value={formData.nickname}
                onChange={(e) => handleInputChange("nickname", e.target.value)}
                required
                disabled={isLoading}
                minLength={2}
                maxLength={20}
              />
              <p className="text-xs text-muted-foreground">2자 이상 20자 이하여야 합니다.</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="비밀번호를 입력하세요 (최소 8자, 영문+숫자+특수문자)"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required
                disabled={isLoading}
                minLength={8}
              />
              <p className="text-xs text-muted-foreground">최소 8자 이상, 영문, 숫자, 특수문자를 각각 1개 이상 포함해야 합니다.</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">비밀번호 확인</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="비밀번호를 다시 입력하세요"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="game">주요 게임 (선택)</Label>
              <Select 
                value={formData.game} 
                onValueChange={(value) => handleInputChange("game", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="게임을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="리그 오브 레전드">리그 오브 레전드</SelectItem>
                  <SelectItem value="발로란트">발로란트</SelectItem>
                  <SelectItem value="오버워치 2">오버워치 2</SelectItem>
                  <SelectItem value="배틀그라운드">배틀그라운드</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="level">게임 레벨 (선택)</Label>
              <Select 
                value={formData.level} 
                onValueChange={(value) => handleInputChange("level", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="레벨을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">초급</SelectItem>
                  <SelectItem value="intermediate">중급</SelectItem>
                  <SelectItem value="advanced">고급</SelectItem>
                  <SelectItem value="pro">프로</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "회원가입 중..." : "회원가입"}
            </Button>
          </form>
          
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              이미 계정이 있으신가요?{" "}
              <Link href="/login" className="text-primary hover:underline">
                로그인
              </Link>
            </p>
            <Link href="/" className="text-sm text-muted-foreground hover:underline">
              홈으로 돌아가기
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


