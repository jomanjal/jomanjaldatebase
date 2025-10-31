"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nickname: "",
    game: "",
    level: ""
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.")
      return
    }
    
    setIsLoading(true)
    
    // TODO: 실제 회원가입 로직 구현
    console.log("회원가입 시도:", formData)
    
    // 임시로 2초 후 로딩 해제
    setTimeout(() => {
      setIsLoading(false)
      alert("회원가입이 완료되었습니다!")
    }, 2000)
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
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="이메일을 입력하세요"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nickname">닉네임</Label>
              <Input
                id="nickname"
                type="text"
                placeholder="닉네임을 입력하세요"
                value={formData.nickname}
                onChange={(e) => handleInputChange("nickname", e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required
              />
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
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="game">주요 게임</Label>
              <Select value={formData.game} onValueChange={(value) => handleInputChange("game", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="게임을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lol">리그 오브 레전드</SelectItem>
                  <SelectItem value="valorant">발로란트</SelectItem>
                  <SelectItem value="overwatch">오버워치 2</SelectItem>
                  <SelectItem value="pubg">배틀그라운드</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="level">게임 레벨</Label>
              <Select value={formData.level} onValueChange={(value) => handleInputChange("level", value)}>
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


