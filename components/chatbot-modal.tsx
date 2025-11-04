"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Bot, User, Loader2 } from "lucide-react"
import { submitWaitlist } from "@/actions/notion"

interface ChatMessage {
  type: "bot" | "user" | "loading"
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
  const [selectedGame, setSelectedGame] = useState("")
  const [selectedTier, setSelectedTier] = useState("")
  const [isCompleted, setIsCompleted] = useState(false)
  const [isCollectingInfo, setIsCollectingInfo] = useState(true)
  const [isSelectingGame, setIsSelectingGame] = useState(false)
  const [isSelectingTier, setIsSelectingTier] = useState(false)
  const [isProcessingAI, setIsProcessingAI] = useState(false)
  const [showInstructorCard, setShowInstructorCard] = useState(false)
  const [matchedInstructor, setMatchedInstructor] = useState<any>(null)
  
  // 메시지 스크롤을 위한 ref
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 메시지가 변경될 때마다 스크롤을 맨 아래로 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const games = [
    "리그 오브 레전드",
    "발로란트",
    "오버워치 2",
    "배틀그라운드",
  ]

  const lolTiers = [
    "아이언",
    "브론즈",
    "실버",
    "골드",
    "플래티넘",
    "에메랄드",
    "다이아",
    "마스터",
    "그랜드마스터",
    "챌린저",
  ]

  const valorantTiers = [
    "아이언",
    "브론즈",
    "실버",
    "골드",
    "플래티넘",
    "다이아",
    "초월자",
    "불멸",
    "레디언트",
  ]

  const getTierOptions = () => {
    if (selectedGame === "리그 오브 레전드") return lolTiers
    if (selectedGame === "발로란트") return valorantTiers
    return lolTiers // 기본값
  }

  const questions = [
    "안녕하세요! 먼저 이름과 이메일을 알려주세요.",
    "배우고 싶으신 게임을 선택해주세요.",
    "당신의 게임 티어는 어느 정도인가요?",
    "마지막으로 원하는 매칭 스타일을 입력해주세요.",
  ]

  const matchingStyleExamples = [
    "공격적으로 플레이 스타일을 개선하고 싶어요",
    "전략적 사고와 맵 움직임을 배우고 싶어요",
    "대인전 실력을 향상시키고 싶어요",
    "팀 전술과 협동 능력을 키우고 싶어요",
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
      setIsSelectingGame(true)
    }, 1000)
  }

  const handleGameSelect = (game: string) => {
    setSelectedGame(game)
    const newMessages = [...messages, { type: "user" as const, message: game }]
    const newAnswers = [...userAnswers, game]

    setMessages(newMessages)
    setUserAnswers(newAnswers)
    setIsSelectingGame(false)

    setTimeout(() => {
      setMessages((prev) => [...prev, { type: "bot", message: questions[2] }])
      setCurrentStep(2)
      setIsSelectingTier(true)
    }, 1000)
  }

  const handleTierSelect = (tier: string) => {
    setSelectedTier(tier)
    const newMessages = [...messages, { type: "user" as const, message: tier }]
    const newAnswers = [...userAnswers, tier]

    setMessages(newMessages)
    setUserAnswers(newAnswers)
    setIsSelectingTier(false)

    setTimeout(() => {
      setMessages((prev) => [
        ...prev, 
        { type: "bot", message: questions[3] },
        { type: "bot", message: "예시: " + matchingStyleExamples[Math.floor(Math.random() * matchingStyleExamples.length)] }
      ])
      setCurrentStep(3)
    }, 1000)
  }

  const handleSubmit = () => {
    if (!userInput.trim()) return

    const newMessages = [...messages, { type: "user" as const, message: userInput }]
    const newAnswers = [...userAnswers, userInput]

    setMessages(newMessages)
    setUserAnswers(newAnswers)
    setUserInput("")

    // 매칭 스타일 입력 후 완료
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          message: "완벽해요! 이제 AI가 당신에게 최적의 강사를 매칭해드릴게요.",
        },
      ])
      setIsCompleted(true)
    }, 1000)
  }

  const handleFinalSubmit = async () => {
    setIsProcessingAI(true)
    
    // AI가 고민하는 로딩 화면
    setMessages((prev) => [
      ...prev,
      { type: "loading", message: "AI가 최적의 강사를 찾고 있어요... 🤔" },
    ])

    // 3-5초 AI 처럼 시간 지연
    await new Promise(resolve => setTimeout(resolve, 3500))

    try {
      console.log('웨이팅 리스트 제출 시작:', {
        name: userInfo.name,
        email: userInfo.email,
        game: selectedGame || "",
        tier: selectedTier || "",
        matchingStyle: userAnswers[2] || "",
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
          goal: selectedGame || "",
          tier: selectedTier || "",
          importantPoint: userAnswers[2] || "",
        }),
        timeoutPromise
      ]) as { success: boolean; message?: string; error?: string }

      console.log('웨이팅 리스트 제출 결과:', result)

      if (result.success) {
        // 로딩 메시지 제거
        setMessages((prev) => prev.filter(msg => msg.type !== "loading"))
        
        // API에서 선택한 게임에 맞는 코치 찾기
        try {
          const params = new URLSearchParams()
          params.append('specialty', selectedGame)
          params.append('limit', '100') // 키워드 매칭을 위해 충분한 수의 코치 가져오기
          
          const coachResponse = await fetch(`/api/coaches?${params.toString()}`)
          const coachResult = await coachResponse.json()
          
          if (coachResult.success && coachResult.data && coachResult.data.length > 0) {
            // 매칭 스타일에서 키워드 추출 (간단한 단어 분리)
            const matchingStyle = userAnswers[2] || ""
            const matchingKeywords = matchingStyle.toLowerCase().split(/\s+/).filter(k => k.length > 1) || []
            
            // 키워드 매칭된 코치 찾기
            let matchedCoach = null
            for (const coach of coachResult.data) {
              const coachKeywords = (coach.specialties || []).map((k: string) => k.toLowerCase())
              
              // 매칭 스타일 키워드가 코치의 키워드에 포함되어 있는지 확인
              const hasMatch = matchingKeywords.some(keyword => 
                coachKeywords.some((ck: string) => ck.includes(keyword) || keyword.includes(ck))
              )
              
              if (hasMatch) {
                matchedCoach = coach
                break
              }
            }
            
            if (matchedCoach) {
              // API 응답을 프로필카드 형식으로 변환
              const instructor = {
                id: matchedCoach.id,
                name: matchedCoach.name,
                image: matchedCoach.thumbnailImage || "/uploads/coaches/1762077719977_qq.jpg",
                specialty: matchedCoach.specialty,
                tier: matchedCoach.tier,
                style: matchedCoach.specialties?.join(", ") || "",
                games: matchedCoach.specialties || [matchedCoach.specialty],
                specialties: matchedCoach.specialties || [], // 전문 분야
                description: matchedCoach.description || matchedCoach.headline || "",
                experience: matchedCoach.experience,
              }
              
              setMatchedInstructor(instructor)
              
              setMessages((prev) => [
                ...prev,
                {
                  type: "bot",
                  message: "🎉 AI가 강사님을 찾았습니다!",
                },
              ])
              
              // 강사 카드 표시
              setShowInstructorCard(true)
              setIsProcessingAI(false)
            } else {
              // 매칭된 코치가 없는 경우
              setMessages((prev) => [
                ...prev,
                {
                  type: "bot",
                  message: "AI가 강사님을 찾지 못했습니다. 😔",
                },
              ])
              
              setIsProcessingAI(false)
              
              // 2초 후 자동으로 닫기
              setTimeout(() => {
                handleClose()
              }, 2000)
            }
          } else {
            // 코치 목록이 없는 경우
            setMessages((prev) => [
              ...prev,
              {
                type: "bot",
                message: "AI가 강사님을 찾지 못했습니다. 😔",
              },
            ])
            
            setIsProcessingAI(false)
            
            // 2초 후 자동으로 닫기
            setTimeout(() => {
              handleClose()
            }, 2000)
          }
        } catch (error) {
          console.error('Error fetching coach:', error)
          setMessages((prev) => [
            ...prev,
            {
              type: "bot",
              message: "코치 정보를 가져오는 중 오류가 발생했습니다.",
            },
          ])
          setIsProcessingAI(false)
        }
      } else {
        setMessages((prev) => prev.filter(msg => msg.type !== "loading"))
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            message: `등록 중 오류가 발생했습니다: ${result.error}`,
          },
        ])
        setIsProcessingAI(false)
        return
      }
    } catch (error) {
      console.error('Error submitting waitlist:', error)
      setMessages((prev) => prev.filter(msg => msg.type !== "loading"))
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          message: error instanceof Error && error.message === '요청 시간 초과' 
            ? "요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요."
            : "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        },
      ])
      setIsProcessingAI(false)
      return
    }

    // 자동으로 닫히지 않음 - 사용자가 강사 카드를 확인하고 닫을 수 있게 함
  }
  
  const handleInstructorSelect = () => {
    // 강사 선택 시 동작 (예: 강사 상세 페이지로 이동 또는 정보 저장)
    if (matchedInstructor) {
      window.location.href = `/coaches/${matchedInstructor.id}`
    }
  }

  const handleClose = () => {
    // 모든 상태를 초기화
    setCurrentStep(0)
    setMessages([{ type: "bot", message: "안녕하세요! 먼저 이름과 이메일을 알려주세요." }])
    setUserInfo({ name: "", email: "" })
      setUserAnswers([])
      setSelectedGame("")
      setSelectedTier("")
      setIsCompleted(false)
      setIsCollectingInfo(true)
      setIsSelectingGame(false)
      setIsSelectingTier(false)
      setIsProcessingAI(false)
      setShowInstructorCard(false)
      setMatchedInstructor(null)
    
    // 모달 닫기
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-50 transition-all" onClick={handleClose}>
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/20 bg-white/60 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-foreground">GameCoach.AI</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose} className="hover:bg-white/40 rounded-full transition-colors">
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Chat messages */}
          <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-white/40 via-white/50 to-white/60 backdrop-blur-sm">
            {messages.map((msg, index) => (
              <div key={index} className={`flex gap-3 ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                {msg.type === "bot" && (
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-3 rounded-2xl shadow-lg ${
                    msg.type === "bot"
                      ? "bg-white/80 backdrop-blur-sm text-foreground border border-white/30"
                      : msg.type === "user"
                      ? "bg-gradient-to-br from-primary to-primary/80 text-white ml-auto shadow-xl"
                      : "bg-white/80 backdrop-blur-sm text-foreground border border-primary/30 flex items-center gap-2 shadow-lg"
                  }`}
                >
                  {msg.type === "loading" && <Loader2 className="w-4 h-4 animate-spin" />}
                  {msg.message}
                </div>
                {msg.type === "user" && (
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                    <User className="w-4 h-4 text-gray-700" />
                  </div>
                )}
              </div>
            ))}
            {/* 스크롤 자동 이동을 위한 요소 */}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="p-4 border-t border-white/20 bg-white/80 backdrop-blur-md">
            {isCollectingInfo ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Input
                    value={userInfo.name}
                    onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="이름을 입력하세요"
                    className="border-white/40 bg-white/60 backdrop-blur-sm focus:border-primary focus:bg-white/80 transition-all shadow-sm"
                  />
                  <Input
                    value={userInfo.email}
                    onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
                    onKeyPress={(e) => e.key === "Enter" && userInfo.name.trim() && userInfo.email.trim() && handleInfoSubmit()}
                    placeholder="이메일을 입력하세요"
                    type="email"
                    className="border-white/40 bg-white/60 backdrop-blur-sm focus:border-primary focus:bg-white/80 transition-all shadow-sm"
                  />
                </div>
                <Button 
                  onClick={handleInfoSubmit} 
                  disabled={!userInfo.name.trim() || !userInfo.email.trim()} 
                  className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-white shadow-lg transition-all"
                >
                  다음 단계로
                </Button>
              </div>
            ) : isSelectingGame ? (
              <div className="space-y-3">
                <Select onValueChange={handleGameSelect}>
                  <SelectTrigger className="w-full border-white/40 bg-white/60 backdrop-blur-sm focus:border-primary focus:bg-white/80 transition-all shadow-sm">
                    <SelectValue placeholder="게임을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {games.map((game) => (
                      <SelectItem key={game} value={game}>
                        {game}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : isSelectingTier ? (
              <div className="space-y-3">
                <Select onValueChange={handleTierSelect}>
                  <SelectTrigger className="w-full border-white/40 bg-white/60 backdrop-blur-sm focus:border-primary focus:bg-white/80 transition-all shadow-sm">
                    <SelectValue placeholder="티어를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {getTierOptions().map((tier) => (
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
                  placeholder="매칭 스타일을 입력하세요..."
                  onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
                  className="flex-1 border-white/40 bg-white/60 backdrop-blur-sm focus:border-primary focus:bg-white/80 transition-all shadow-sm"
                />
                <Button onClick={handleSubmit} disabled={!userInput.trim()} className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-white shadow-lg transition-all">
                  전송
                </Button>
              </div>
            ) : showInstructorCard && matchedInstructor ? (
              <div className="space-y-3">
                <div className="border-2 border-primary/30 rounded-2xl p-4 bg-gradient-to-br from-primary/10 via-primary/5 to-white/60 backdrop-blur-md shadow-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-primary/30 shadow-lg">
                      <img 
                        src={matchedInstructor.image} 
                        alt={matchedInstructor.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-foreground">{matchedInstructor.name} 강사</h3>
                      <p className="text-sm text-muted-foreground mt-1">{matchedInstructor.description}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {matchedInstructor.games.map((game: string) => (
                          <span key={game} className="text-xs bg-primary/20 backdrop-blur-sm text-primary px-2 py-1 rounded-full shadow-sm border border-primary/10">{game}</span>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">✨ {matchedInstructor.tier} 티어</p>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={handleInstructorSelect} 
                  className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-white shadow-lg transition-all"
                >
                  강사 프로필 보기
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleClose} 
                  className="w-full border-white/40 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all shadow-sm"
                >
                  닫기
                </Button>
              </div>
            ) : (
              <Button 
                onClick={handleFinalSubmit} 
                disabled={isProcessingAI}
                className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-white shadow-lg transition-all disabled:opacity-50"
              >
                {isProcessingAI ? "처리 중..." : "AI 매칭 시작"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
