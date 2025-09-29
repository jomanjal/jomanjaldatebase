"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Bot, User } from "lucide-react"
import { submitWaitlist } from "@/actions/notion"

interface ChatMessage {
  type: "bot" | "user"
  message: string
}

interface ChatbotModalProps {
  isOpen: boolean
  onClose: () => void
}

interface UserInfo {
  name: string
  email: string
}

export function ChatbotModal({ isOpen, onClose }: ChatbotModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { type: "bot", message: "안녕하세요! 먼저 이름과 이메일을 알려주세요." },
  ])
  const [userInput, setUserInput] = useState("")
  const [userInfo, setUserInfo] = useState<UserInfo>({ name: "", email: "" })
  const [userAnswers, setUserAnswers] = useState<string[]>([])
  const [selectedTier, setSelectedTier] = useState("")
  const [isCompleted, setIsCompleted] = useState(false)
  const [isCollectingInfo, setIsCollectingInfo] = useState(true)
  const [isSelectingTier, setIsSelectingTier] = useState(false)

  const questions = [
    "안녕하세요! 먼저 이름과 이메일을 알려주세요.",
    "어떤 목표로 코칭을 원하시나요?",
    "당신의 주 게임 티어는 어느 정도인가요?",
    "코칭에서 가장 중요한 건 무엇인가요?",
  ]

  const tierOptions = [
    "브론즈",
    "실버", 
    "골드",
    "플래티넘",
    "다이아",
    "초월자",
    "불멸",
    "레디언트",
  ]

  // 이메일 유효성 검사
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleInfoSubmit = () => {
    if (!userInfo.name.trim() || !userInfo.email.trim()) {
      setMessages((prev) => [
        ...prev,
        { type: "bot", message: "이름과 이메일을 모두 입력해주세요." },
      ])
      return
    }

    if (!isValidEmail(userInfo.email)) {
      setMessages((prev) => [
        ...prev,
        { type: "bot", message: "올바른 이메일 형식을 입력해주세요." },
      ])
      return
    }

    const newMessages = [
      ...messages,
      { type: "user" as const, message: `이름: ${userInfo.name}, 이메일: ${userInfo.email}` },
    ]

    setMessages(newMessages)
    setIsCollectingInfo(false)
    setUserInput("")

    setTimeout(() => {
      setMessages((prev) => [...prev, { type: "bot", message: questions[1] }])
      setCurrentStep(1)
    }, 1000)
  }

  const handleSubmit = () => {
    if (!userInput.trim()) return

    const newMessages = [...messages, { type: "user" as const, message: userInput }]
    const newAnswers = [...userAnswers, userInput]

    setMessages(newMessages)
    setUserAnswers(newAnswers)
    setUserInput("")

    if (currentStep === 1) {
      // 목표 입력 후 티어 선택으로
      setTimeout(() => {
        setMessages((prev) => [...prev, { type: "bot", message: questions[2] }])
        setCurrentStep(2)
        setIsSelectingTier(true)
      }, 1000)
    } else if (currentStep < questions.length - 1) {
      setTimeout(() => {
        setMessages((prev) => [...prev, { type: "bot", message: questions[currentStep + 1] }])
        setCurrentStep(currentStep + 1)
      }, 1000)
    } else {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            message: "완벽해요! 이제 AI가 당신에게 최적의 강사를 매칭해드릴게요. 웨이팅 리스트에 등록하시겠어요?",
          },
        ])
        setIsCompleted(true)
      }, 1000)
    }
  }

  const handleTierSelect = (tier: string) => {
    setSelectedTier(tier)
    const newMessages = [...messages, { type: "user" as const, message: tier }]
    const newAnswers = [...userAnswers, tier]

    setMessages(newMessages)
    setUserAnswers(newAnswers)
    setIsSelectingTier(false)

    setTimeout(() => {
      setMessages((prev) => [...prev, { type: "bot", message: questions[3] }])
      setCurrentStep(3)
    }, 1000)
  }

  const handleFinalSubmit = async () => {
    // 로딩 상태 표시
    setMessages((prev) => [
      ...prev,
      { type: "bot", message: "웨이팅 리스트에 등록 중입니다..." },
    ])

    try {
      console.log('웨이팅 리스트 제출 시작:', {
        name: userInfo.name,
        email: userInfo.email,
        goal: userAnswers[0] || "",
        tier: selectedTier || "",
        importantPoint: userAnswers[2] || "",
      })

      // 타임아웃 설정 (30초)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('요청 시간 초과')), 30000)
      )

      // Notion API를 통한 데이터 저장
      const result = await Promise.race([
        submitWaitlist({
          name: userInfo.name,
          email: userInfo.email,
          goal: userAnswers[0] || "",
          tier: selectedTier || "",
          importantPoint: userAnswers[2] || "",
        }),
        timeoutPromise
      ]) as { success: boolean; message?: string; error?: string }

      console.log('웨이팅 리스트 제출 결과:', result)

      if (result.success) {
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            message: "웨이팅 리스트 등록 완료! 출시되면 가장 먼저 알려드릴게요. 🎮",
          },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            message: `등록 중 오류가 발생했습니다: ${result.error}`,
          },
        ])
        return
      }
    } catch (error) {
      console.error('Error submitting waitlist:', error)
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          message: error instanceof Error && error.message === '요청 시간 초과' 
            ? "요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요."
            : "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        },
      ])
      return
    }

    setTimeout(() => {
      onClose()
      // Reset state
      setCurrentStep(0)
      setMessages([{ type: "bot", message: "안녕하세요! 먼저 이름과 이메일을 알려주세요." }])
      setUserInfo({ name: "", email: "" })
      setUserAnswers([])
      setSelectedTier("")
      setIsCompleted(false)
      setIsCollectingInfo(true)
      setIsSelectingTier(false)
    }, 2000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-white border border-gray-200 shadow-2xl">
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-foreground">GameCoach.AI</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-gray-200">
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Chat messages */}
          <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, index) => (
              <div key={index} className={`flex gap-3 ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                {msg.type === "bot" && (
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-3 rounded-lg shadow-sm ${
                    msg.type === "bot"
                      ? "bg-white text-foreground border border-gray-200"
                      : "bg-primary text-white ml-auto"
                  }`}
                >
                  {msg.message}
                </div>
                {msg.type === "user" && (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Input area */}
          <div className="p-4 border-t border-gray-200 bg-white">
            {isCollectingInfo ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Input
                    value={userInfo.name}
                    onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="이름을 입력하세요"
                    className="border-gray-300 focus:border-primary"
                  />
                  <Input
                    value={userInfo.email}
                    onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="이메일을 입력하세요"
                    type="email"
                    className="border-gray-300 focus:border-primary"
                  />
                </div>
                <Button 
                  onClick={handleInfoSubmit} 
                  disabled={!userInfo.name.trim() || !userInfo.email.trim()} 
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  다음 단계로
                </Button>
              </div>
            ) : isSelectingTier ? (
              <div className="space-y-3">
                <Select onValueChange={handleTierSelect}>
                  <SelectTrigger className="w-full border-gray-300 focus:border-primary">
                    <SelectValue placeholder="티어를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {tierOptions.map((tier) => (
                      <SelectItem key={tier} value={tier}>
                        {tier}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : !isCompleted ? (
              <div className="flex gap-2">
                <Input
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="답변을 입력하세요..."
                  onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
                  className="flex-1 border-gray-300 focus:border-primary"
                />
                <Button onClick={handleSubmit} disabled={!userInput.trim()} className="bg-primary hover:bg-primary/90">
                  전송
                </Button>
              </div>
            ) : (
              <Button onClick={handleFinalSubmit} className="w-full bg-primary hover:bg-primary/90">
                웨이팅 리스트 등록하기
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
