"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Save, X, Plus, Upload, ChevronLeft, ChevronRight, Search, Check } from "lucide-react"
import { checkAuth, type User } from "@/lib/auth"
import Link from "next/link"
import { toast } from "sonner"

interface Coach {
  id: number
  name: string
  specialty: string
  tier: string
  experience: string
  rating: number
  reviews: number
  students: number
  price: string | null
  specialties: string[]
  description: string | null
  headline: string | null
  thumbnailImage: string | null
  introductionImage: string | null
  introductionContent: string | null
  curriculumItems: string[]
  totalCourseTime: string | null
  verified: boolean
}

interface CurriculumItem {
  title: string
  duration: string
}

const games = ["리그 오브 레전드", "발로란트", "오버워치 2", "배틀그라운드"]

// 게임별 티어 옵션
const gameTiers: Record<string, string[]> = {
  "리그 오브 레전드": ["아이언", "브론즈", "실버", "골드", "플래티넘", "에메랄드", "다이아", "마스터", "그랜드마스터", "챌린저"],
  "발로란트": ["아이언", "브론즈", "실버", "골드", "플래티넘", "다이아", "초월자", "불멸", "레디언트"],
  "오버워치 2": ["브론즈", "실버", "골드", "플래티넘", "다이아", "마스터", "그랜드마스터"],
  "배틀그라운드": ["브론즈", "실버", "골드", "플래티넘", "다이아", "마스터"],
}

const valorantPositions = [
  { id: "sentinel", name: "감시자", icon: "🛡️" },
  { id: "controller", name: "전략가", icon: "🎯" },
  { id: "initiator", name: "척후대", icon: "⬆️" },
  { id: "duelist", name: "타격대", icon: "⚔️" },
]

const valorantAgents = [
  "게코", "네온", "데드록", "레이나", "레이즈", "바이퍼", "브리치", "브림스톤",
  "사이퍼", "세이지", "소바", "스카이", "아스트라", "아이소", "오멘", "요루",
  "제트", "체임버", "케이/오", "클로브", "킬조이", "페이드", "피닉스", "하버"
]

const courseTypes = ["온라인 강의", "오프라인 강의"]

const guaranteeOptions = [
  { id: "rank_up", name: "랭크 상승 보장", icon: "🌊" },
  { id: "refund", name: "불만족시 환불 보장", icon: "📄" },
  { id: "time", name: "시간 준수 보장", icon: "⏰" },
]

export default function CourseSettingsPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [coach, setCoach] = useState<Coach | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)
  const [hasProfile, setHasProfile] = useState(false)
  const [activeTab, setActiveTab] = useState("game-info")
  
  // 게임 정보
  const [gameInfo, setGameInfo] = useState({
    game: "",
    tier: "",
    experience: "",
    thumbnails: [] as string[],
    positions: [] as string[],
    agents: [] as string[],
  })
  
  // 강의 유형
  const [courseType, setCourseType] = useState({
    type: "",
    guarantees: [] as string[],
  })
  
  // 강의 요약
  const [courseSummary, setCourseSummary] = useState({
    headline: "",
    targets: [""],
    effects: [""],
  })
  
  // 커리큘럼
  const [curriculum, setCurriculum] = useState<CurriculumItem[]>([])
  
  // 강의 상세
  const [courseDetail, setCourseDetail] = useState({
    price: null as number | null, // 숫자로 저장
    priceDisplay: "", // 입력 필드용 포맷팅된 문자열
    discount: null as number | null, // 10, 30, 50 또는 null
    title: "",
    content: "",
    videoUrl: "",
    image: "",
    keywords: [] as string[],
  })

  // 인증 확인 및 코치 프로필 조회
  useEffect(() => {
    async function loadProfile() {
      try {
        const user = await checkAuth()
        
        if (!user) {
          router.push("/login")
          return
        }
        
        if (user.role !== 'coach') {
          router.push("/")
          return
        }

        setCurrentUser(user)

        // 코치 프로필 조회
        const response = await fetch('/api/coaches/my', {
          credentials: 'include',
        })

        const result = await response.json()

        if (result.success && result.data) {
          setCoach(result.data)
          setHasProfile(true)
          
          // introductionContent에서 강의 요약 정보 파싱 시도
          let introductionItems: any[] = []
          if (result.data.introductionContent) {
            try {
              introductionItems = JSON.parse(result.data.introductionContent)
            } catch {
              introductionItems = []
            }
          }
          
          // 포지션과 에이전트 정보 복원
          const positionsItem = introductionItems.find((item: any) => item.title === "__positions__")
          const agentsItem = introductionItems.find((item: any) => item.title === "__agents__")
          const courseTypeItem = introductionItems.find((item: any) => item.title === "__courseType__")
          let positions: string[] = []
          let agents: string[] = []
          let courseTypeData = { type: "", guarantees: [] as string[] }
          
          if (positionsItem && positionsItem.content) {
            try {
              positions = JSON.parse(positionsItem.content)
            } catch {
              positions = []
            }
          }
          
          if (agentsItem && agentsItem.content) {
            try {
              agents = JSON.parse(agentsItem.content)
            } catch {
              agents = []
            }
          }
          
          if (courseTypeItem && courseTypeItem.content) {
            try {
              courseTypeData = JSON.parse(courseTypeItem.content)
            } catch {
              courseTypeData = { type: "", guarantees: [] }
            }
          }
          
          // 기존 데이터 파싱 및 설정
          setGameInfo({
            game: result.data.specialty || "",
            tier: result.data.tier || "",
            experience: result.data.experience || "",
            thumbnails: result.data.thumbnailImage ? [result.data.thumbnailImage] : [],
            positions: positions,
            agents: agents,
          })
          
          // introductionItems에서 "강의 소개" 찾기
          const courseIntroItem = introductionItems.find((item: any) => item.title === "강의 소개")
          const courseTargets = introductionItems.filter((item: any) => item.title === "강의 대상").map((item: any) => item.content || "")
          const courseEffects = introductionItems.filter((item: any) => item.title === "강의 효과").map((item: any) => item.content || "")
          
          // 강의 요약 기본값
          setCourseSummary({
            headline: result.data.headline || "",
            targets: courseTargets.length > 0 ? courseTargets : [""],
            effects: courseEffects.length > 0 ? courseEffects : [""],
          })
          
          // 강의 유형 설정
          setCourseType({
            type: courseTypeData.type || "",
            guarantees: courseTypeData.guarantees || [],
          })
          
          // 커리큘럼
          const curriculumItems = result.data.curriculumItems && result.data.curriculumItems.length > 0 
            ? result.data.curriculumItems 
            : []
          setCurriculum(curriculumItems.length > 0 ? curriculumItems : [{ title: "[소장] 마이크를 사용하지 않고도 배울 수 있는 과제 형식의 독보적 커리큘럼", duration: "1시간" }])
          
          // 강의 상세
          const priceNum = typeof result.data.price === 'number' 
            ? result.data.price 
            : (result.data.price ? parseInt(result.data.price.toString().replace(/,/g, '')) : null)
          setCourseDetail({
            price: priceNum,
            priceDisplay: priceNum ? priceNum.toLocaleString() : "",
            discount: result.data.discount || null,
            title: result.data.description || "",
            content: courseIntroItem?.content || "",
            videoUrl: courseIntroItem?.videoUrl || "",
            image: result.data.introductionImage || "",
            keywords: result.data.specialties || [],
          })
        } else {
          setHasProfile(false)
        }
      } catch (error) {
        console.error('프로필 로드 실패:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [router])

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 파일 형식 검증
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      toast.error('지원하는 이미지 형식만 업로드할 수 있습니다. (JPG, PNG, WebP, GIF)')
      e.target.value = ''
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('파일 크기는 5MB 이하여야 합니다.')
      e.target.value = ''
      return
    }

    // 프리뷰 생성
    const previewUrl = URL.createObjectURL(file)
    setUploadPreview(previewUrl)
    setUploading(true)
    setUploadProgress(0)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      // XMLHttpRequest를 사용하여 진행률 추적
      const xhr = new XMLHttpRequest()

      const uploadPromise = new Promise<any>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100
            setUploadProgress(percentComplete)
          }
        })

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            try {
              const result = JSON.parse(xhr.responseText)
              resolve(result)
            } catch (error) {
              reject(new Error('응답 파싱 실패'))
            }
          } else {
            try {
              const result = JSON.parse(xhr.responseText)
              reject(new Error(result.message || '업로드 실패'))
            } catch {
              reject(new Error('업로드 실패'))
            }
          }
        })

        xhr.addEventListener('error', () => {
          reject(new Error('네트워크 오류'))
        })

        xhr.open('POST', '/api/upload')
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest')
        xhr.withCredentials = true
        xhr.send(uploadFormData)
      })

      const result = await uploadPromise

      if (result.success) {
        // 썸네일은 1개만 유지
        setGameInfo({ ...gameInfo, thumbnails: [result.path] })
        toast.success('이미지가 업로드되었습니다.')
        // 프리뷰 제거
        URL.revokeObjectURL(previewUrl)
        setUploadPreview(null)
      } else {
        toast.error(result.message || '이미지 업로드에 실패했습니다.')
        URL.revokeObjectURL(previewUrl)
        setUploadPreview(null)
      }
    } catch (error: any) {
      console.error('파일 업로드 실패:', error)
      toast.error(error.message || '이미지 업로드 중 오류가 발생했습니다.')
      if (uploadPreview) {
        URL.revokeObjectURL(previewUrl)
        setUploadPreview(null)
      }
    } finally {
      setUploading(false)
      setUploadProgress(0)
      e.target.value = ''
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 파일 형식 검증
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      toast.error('지원하는 이미지 형식만 업로드할 수 있습니다. (JPG, PNG, WebP, GIF)')
      e.target.value = ''
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('파일 크기는 5MB 이하여야 합니다.')
      e.target.value = ''
      return
    }

    // 프리뷰 생성
    const previewUrl = URL.createObjectURL(file)
    setUploadPreview(previewUrl)
    setUploading(true)
    setUploadProgress(0)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      // XMLHttpRequest를 사용하여 진행률 추적
      const xhr = new XMLHttpRequest()

      const uploadPromise = new Promise<any>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100
            setUploadProgress(percentComplete)
          }
        })

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            try {
              const result = JSON.parse(xhr.responseText)
              resolve(result)
            } catch (error) {
              reject(new Error('응답 파싱 실패'))
            }
          } else {
            try {
              const result = JSON.parse(xhr.responseText)
              reject(new Error(result.message || '업로드 실패'))
            } catch {
              reject(new Error('업로드 실패'))
            }
          }
        })

        xhr.addEventListener('error', () => {
          reject(new Error('네트워크 오류'))
        })

        xhr.open('POST', '/api/upload')
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest')
        xhr.withCredentials = true
        xhr.send(uploadFormData)
      })

      const result = await uploadPromise

      if (result.success) {
        setCourseDetail({ ...courseDetail, image: result.path })
        toast.success('이미지가 업로드되었습니다.')
        // 프리뷰 제거
        URL.revokeObjectURL(previewUrl)
        setUploadPreview(null)
      } else {
        toast.error(result.message || '이미지 업로드에 실패했습니다.')
        URL.revokeObjectURL(previewUrl)
        setUploadPreview(null)
      }
    } catch (error: any) {
      console.error('파일 업로드 실패:', error)
      toast.error(error.message || '이미지 업로드 중 오류가 발생했습니다.')
      if (uploadPreview) {
        URL.revokeObjectURL(previewUrl)
        setUploadPreview(null)
      }
    } finally {
      setUploading(false)
      setUploadProgress(0)
      e.target.value = ''
    }
  }

  const handleSubmit = async () => {
    setSaving(true)

    try {
      // introductionContent 생성
      // 강의 대상과 효과, 강의 상세 내용을 모두 포함
      const introductionItems: any[] = []
      
      // 발로란트 포지션 정보 저장 (발로란트인 경우만)
      if (gameInfo.game === "발로란트" && gameInfo.positions.length > 0) {
        introductionItems.push({
          title: "__positions__",
          content: JSON.stringify(gameInfo.positions),
          items: [],
        })
      }
      
      // 발로란트 에이전트 정보 저장 (발로란트인 경우만)
      if (gameInfo.game === "발로란트" && gameInfo.agents.length > 0) {
        introductionItems.push({
          title: "__agents__",
          content: JSON.stringify(gameInfo.agents),
          items: [],
        })
      }
      
      // 강의 유형 정보 저장
      if (courseType.type || courseType.guarantees.length > 0) {
        introductionItems.push({
          title: "__courseType__",
          content: JSON.stringify({
            type: courseType.type || "",
            guarantees: courseType.guarantees || [],
          }),
          items: [],
        })
      }
      
      // 강의 상세 내용이 있으면 먼저 추가
      if (courseDetail.content && courseDetail.content.trim()) {
        introductionItems.push({
          title: "강의 소개",
          content: courseDetail.content,
          items: [],
          videoUrl: courseDetail.videoUrl || null,
        })
      }
      
      // 강의 대상 추가
      courseSummary.targets.forEach((target, index) => {
        if (target.trim()) {
          introductionItems.push({
            title: index === 0 ? "강의 대상" : "강의 대상",
            content: target,
            items: [],
          })
        }
      })
      
      // 강의 효과 추가
      courseSummary.effects.forEach((effect, index) => {
        if (effect.trim()) {
          introductionItems.push({
            title: index === 0 ? "강의 효과" : "강의 효과",
            content: effect,
            items: [],
          })
        }
      })

      // 커리큘럼을 문자열 배열로 변환 (기존 형식 유지)
      const curriculumItems = curriculum.map(item => `${item.title}|${item.duration}`)

      const response = await fetch('/api/coaches/my', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: currentUser?.username || "",
          specialty: gameInfo.game,
          tier: gameInfo.tier || coach?.tier || "",
          experience: gameInfo.experience || coach?.experience || "",
          price: courseDetail.price || null,
          discount: courseDetail.discount || null,
          specialties: courseDetail.keywords,
          description: courseDetail.title || null, // 코치 카드 설명 (제목)
          headline: courseSummary.headline || null, // 한문장 표현 (상세 페이지 상단)
          thumbnailImage: gameInfo.thumbnails[0] || null, // 섬네일 (코치 카드, 사이드바용)
          introductionImage: courseDetail.image || null, // 강의 소개 이미지
          introductionContent: JSON.stringify(introductionItems),
          curriculumItems: curriculumItems,
          totalCourseTime: curriculum.reduce((total, item) => {
            const match = item.duration.match(/(\d+)/)
            return total + (match ? parseInt(match[1]) : 0)
          }, 0) + "시간" || null,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(result.message || '강의 설정이 저장되었습니다.')
        if (result.data) {
          setCoach(result.data)
          setHasProfile(true)
          router.push('/my')
        }
      } else {
        toast.error(result.message || '강의 설정 저장에 실패했습니다.')
      }
    } catch (error) {
      console.error('강의 설정 저장 실패:', error)
      toast.error('강의 설정 저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const nextTab = () => {
    const tabs = ["game-info", "course-type", "course-summary", "curriculum", "course-detail"]
    const currentIndex = tabs.indexOf(activeTab)
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1])
    }
  }

  const prevTab = () => {
    const tabs = ["game-info", "course-type", "course-summary", "curriculum", "course-detail"]
    const currentIndex = tabs.indexOf(activeTab)
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1])
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!currentUser || currentUser.role !== 'coach') {
    return null
  }

  const tabs = [
    { id: "game-info", label: "게임 정보" },
    { id: "course-type", label: "강의 유형" },
    { id: "course-summary", label: "강의 요약" },
    { id: "curriculum", label: "커리큘럼" },
    { id: "course-detail", label: "강의 상세" },
  ]

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">강의 수정</h1>
            <p className="text-muted-foreground">
              {hasProfile 
                ? '강의 정보와 상세 페이지를 수정할 수 있습니다. 관리자 승인 후 공개됩니다.' 
                : '강의 정보와 상세 페이지를 설정해주세요. 관리자 승인 후 공개됩니다.'}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => router.push('/my')}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {coach && !coach.verified && (
        <Card className="mb-6 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
          <CardContent className="pt-6">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              ⚠️ 관리자 승인 대기 중입니다. 승인되기 전까지 프로필이 공개되지 않습니다.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-4">
            {tabs.map((tab, index) => (
              <div key={tab.id} className="flex items-center">
                <Button
                  variant={activeTab === tab.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab(tab.id)}
                  className={activeTab === tab.id ? "bg-primary" : ""}
                >
                  {tab.label}
                </Button>
                {index < tabs.length - 1 && <span className="mx-2 text-muted-foreground">·</span>}
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            이 정보는 강의 전문성을 정확하게 전달하기 위해 사용됩니다. 강의 등록에 어려움이 있다면 고객 지원으로 문의해 주세요.
          </p>
        </CardHeader>
        <CardContent>
          {/* a. 게임 정보 */}
          {activeTab === "game-info" && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="game">게임 *</Label>
                <Select 
                  value={gameInfo.game} 
                  onValueChange={(value) => {
                    // 게임 변경 시 티어 초기화 (새 게임의 티어와 맞지 않을 수 있음)
                    const newTier = gameTiers[value]?.includes(gameInfo.tier) ? gameInfo.tier : ""
                    setGameInfo({ ...gameInfo, game: value, tier: newTier })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="게임 선택" />
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="tier">티어 *</Label>
                  <Select 
                    value={gameInfo.tier} 
                    onValueChange={(value) => setGameInfo({ ...gameInfo, tier: value })}
                    disabled={!gameInfo.game}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={gameInfo.game ? "티어 선택" : "먼저 게임을 선택하세요"} />
                    </SelectTrigger>
                    <SelectContent>
                      {(gameTiers[gameInfo.game] || []).map((tier) => (
                        <SelectItem key={tier} value={tier}>
                          {tier}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="experience">경력 *</Label>
                  <Input
                    id="experience"
                    value={gameInfo.experience}
                    onChange={(e) => setGameInfo({ ...gameInfo, experience: e.target.value })}
                    placeholder="예: 3년"
                    required
                    maxLength={50}
                  />
                </div>
              </div>

              <div>
                <Label>섬네일</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  강의 상품을 대표할 섬네일을 등록하거나 선택해 주세요. 선택하지 않으면 무작위로 지정됩니다.
                </p>
                <div className="w-full max-w-md">
                  <div className="relative">
                    <label className={`flex items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                      {uploadPreview && uploading ? (
                        <div className="relative w-full h-full">
                          <img src={uploadPreview} alt="업로드 중" className="w-full h-full object-cover rounded-lg opacity-50" />
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-lg">
                            <Loader2 className="w-8 h-8 text-white animate-spin mb-2" />
                            <span className="text-white text-sm">{Math.round(uploadProgress)}%</span>
                            <div className="w-3/4 h-2 bg-white/20 rounded-full mt-2">
                              <div 
                                className="h-full bg-primary rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ) : gameInfo.thumbnails[0] ? (
                        <>
                          <img src={gameInfo.thumbnails[0]} alt="섬네일" className="w-full h-full object-cover rounded-lg" />
                          <div className="absolute top-2 left-2 bg-primary text-white rounded-full p-1">
                            <Check className="w-4 h-4" />
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              setGameInfo({ ...gameInfo, thumbnails: [] })
                            }}
                            className="absolute top-2 right-2 bg-destructive text-white rounded-full p-1 hover:bg-destructive/80"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <div className="text-center p-4">
                          <Upload className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">이미지 업로드</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                        onChange={(e) => handleThumbnailUpload(e, 0)}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
                <div className="mt-4 text-xs text-muted-foreground space-y-1">
                  <p>• 권장 사이즈: 1,424 x 1,068px (4:3 비율)</p>
                  <p>• 등록 이미지는 이용약관에 따라 광고 소재로 활용될 수 있음.</p>
                  <p>• 저작권 침해 이미지는 사용 불가.</p>
                  <p>• 임의 제작된 인증 마크, 라벨, 할인 표기 사용 불가.</p>
                  <p>• 검증 불가 내용(최초, 유일, 무제한, 1위 등) 포함 불가.</p>
                  <p>• 5MB 이하 이미지 파일만 등록 가능.</p>
                </div>
              </div>

              {gameInfo.game === "발로란트" && (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <Label>포지션</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (gameInfo.positions.length === valorantPositions.length) {
                            setGameInfo({ ...gameInfo, positions: [] })
                          } else {
                            setGameInfo({ ...gameInfo, positions: valorantPositions.map(p => p.id) })
                          }
                        }}
                      >
                        모두 선택
                      </Button>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {valorantPositions.map((position) => (
                        <Button
                          key={position.id}
                          type="button"
                          variant={gameInfo.positions.includes(position.id) ? "default" : "outline"}
                          onClick={() => {
                            const newPositions = gameInfo.positions.includes(position.id)
                              ? gameInfo.positions.filter(p => p !== position.id)
                              : [...gameInfo.positions, position.id]
                            setGameInfo({ ...gameInfo, positions: newPositions })
                          }}
                          className="rounded-full"
                        >
                          <span className="mr-2">{position.icon}</span>
                          {position.name}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <Label>요원</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (gameInfo.agents.length === valorantAgents.length) {
                            setGameInfo({ ...gameInfo, agents: [] })
                          } else {
                            setGameInfo({ ...gameInfo, agents: [...valorantAgents] })
                          }
                        }}
                      >
                        모두 선택
                      </Button>
                    </div>
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Q 요원 검색"
                        className="pl-10"
                      />
                    </div>
                    <div className="grid grid-cols-6 gap-2">
                      {valorantAgents.map((agent) => (
                        <Button
                          key={agent}
                          type="button"
                          variant={gameInfo.agents.includes(agent) ? "default" : "outline"}
                          onClick={() => {
                            const newAgents = gameInfo.agents.includes(agent)
                              ? gameInfo.agents.filter(a => a !== agent)
                              : [...gameInfo.agents, agent]
                            setGameInfo({ ...gameInfo, agents: newAgents })
                          }}
                          className="rounded-full flex flex-col items-center gap-1 h-auto py-2"
                        >
                          <span className="text-xs">{agent}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300">
                <CardContent className="pt-6">
                  <p className="font-semibold mb-2">TIP!</p>
                  <p className="text-sm">강의와 관련된 상세 정보는 필수로 선택해 주셔야합니다.</p>
                  <p className="text-sm">선택한 정보는 강의 상세 페이지 및 검색 결과에 표시되며, 이로 인해 수익 창출 기회가 확대될 수 있습니다. (중복 선택 가능)</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* b. 강의 유형 */}
          {activeTab === "course-type" && (
            <div className="space-y-6">
              <div>
                <Label>유형</Label>
                <Select value={courseType.type} onValueChange={(value) => setCourseType({ ...courseType, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="강의 유형 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {courseTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>보장성</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  아래와 같이 보장되는 사항이 있을 시 선택해 주세요. (선택)
                </p>
                <Card className="mb-4 border-red-500 bg-red-50 dark:bg-red-900/20">
                  <CardContent className="pt-6">
                    <p className="text-sm text-red-800 dark:text-red-200 flex items-center gap-2">
                      <span>⚠️</span>
                      보장성 강의는 보장이 이루어지지 않을 경우, 전액 환불 또는 Gigs의 내부 규정에 따른 조치가 취해질 수 있습니다.
                    </p>
                  </CardContent>
                </Card>
                <div className="space-y-2">
                  {guaranteeOptions.map((option) => (
                    <Button
                      key={option.id}
                      type="button"
                      variant={courseType.guarantees.includes(option.id) ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => {
                        const newGuarantees = courseType.guarantees.includes(option.id)
                          ? courseType.guarantees.filter(g => g !== option.id)
                          : [...courseType.guarantees, option.id]
                        setCourseType({ ...courseType, guarantees: newGuarantees })
                      }}
                    >
                      <span className="mr-2">{option.icon}</span>
                      {option.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* c. 강의 요약 */}
          {activeTab === "course-summary" && (
            <div className="space-y-6">
              <Card className="mb-4 border-red-500 bg-red-50 dark:bg-red-900/20">
                <CardContent className="pt-6">
                  <p className="text-sm text-red-800 dark:text-red-200 flex items-center gap-2">
                    <span>●</span>
                    강의 대상 및 효과는 최대 3개까지 추가 가능하며, 1개는 필수로 작성해 주셔야 합니다.
                  </p>
                </CardContent>
              </Card>

              <div>
                <Label htmlFor="headline">이 강의를 한문장으로 표현한다면?</Label>
                <Input
                  id="headline"
                  value={courseSummary.headline}
                  onChange={(e) => setCourseSummary({ ...courseSummary, headline: e.target.value })}
                  placeholder="예: 에임, 피지컬 강의 국내 No.1"
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {courseSummary.headline.length} / 100
                </p>
                <p className="text-xs text-muted-foreground">
                  최소 10자 이상 입력해 주세요.
                </p>
              </div>

              <div>
                <Label>이 강의는 어떤 대상을 위해 진행되나요?</Label>
                {courseSummary.targets.map((target, index) => (
                  <div key={index} className="mb-2">
                    <div className="flex gap-2">
                      <Input
                        value={target}
                        onChange={(e) => {
                          const newTargets = [...courseSummary.targets]
                          newTargets[index] = e.target.value
                          setCourseSummary({ ...courseSummary, targets: newTargets })
                        }}
                        placeholder="예: 나는 분명 뇌지컬은 좋은거 같은데 에임이 안좋다."
                        maxLength={60}
                      />
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const newTargets = courseSummary.targets.filter((_, i) => i !== index)
                            setCourseSummary({ ...courseSummary, targets: newTargets })
                          }}
                        >
                          삭제
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {target.length} / 60 - 최소 10자 이상 입력해 주세요.
                    </p>
                  </div>
                ))}
                {courseSummary.targets.length < 3 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCourseSummary({ ...courseSummary, targets: [...courseSummary.targets, ""] })}
                    className="mt-2"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    강의 대상 추가
                  </Button>
                )}
              </div>

              <div>
                <Label>이 강의를 듣고 나면 어떤 효과를 기대할 수 있을까요?</Label>
                {courseSummary.effects.map((effect, index) => (
                  <div key={index} className="mb-2">
                    <div className="flex gap-2">
                      <Input
                        value={effect}
                        onChange={(e) => {
                          const newEffects = [...courseSummary.effects]
                          newEffects[index] = e.target.value
                          setCourseSummary({ ...courseSummary, effects: newEffects })
                        }}
                        placeholder="예: 제 수업을 들었던 200명이 넘는 수강생분들이 에임상승과 랭크상승을 경험하셨습니다."
                        maxLength={60}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const newEffects = courseSummary.effects.filter((_, i) => i !== index)
                          setCourseSummary({ ...courseSummary, effects: newEffects })
                        }}
                      >
                        삭제
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {effect.length} / 60 - 최소 10자 이상 입력해 주세요.
                    </p>
                  </div>
                ))}
                {courseSummary.effects.length < 3 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCourseSummary({ ...courseSummary, effects: [...courseSummary.effects, ""] })}
                    className="mt-2"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    강의 효과 추가
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* d. 커리큘럼 */}
          {activeTab === "curriculum" && (
            <div className="space-y-6">
              <div>
                <Label>커리큘럼</Label>
                {curriculum.length > 0 && (
                  <p className="text-sm text-green-600 mb-4 flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    총 {curriculum.reduce((total, item) => {
                      const match = item.duration.match(/(\d+)/)
                      return total + (match ? parseInt(match[1]) : 0)
                    }, 0)}시간의 커리큘럼이 저장되었습니다.
                  </p>
                )}
                <div className="space-y-3">
                  {curriculum.map((item, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="text-muted-foreground">⋮⋮</div>
                            <div>
                              <p className="font-semibold">{item.title}</p>
                              <p className="text-sm text-muted-foreground">{item.duration}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newCurriculum = [...curriculum]
                                newCurriculum[index] = { ...item, title: prompt("제목을 입력하세요:", item.title) || item.title, duration: prompt("소요 시간을 입력하세요:", item.duration) || item.duration }
                                setCurriculum(newCurriculum)
                              }}
                            >
                              변경
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newCurriculum = curriculum.filter((_, i) => i !== index)
                                setCurriculum(newCurriculum)
                              }}
                            >
                              삭제
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurriculum([...curriculum, { title: "", duration: "" }])}
                  className="mt-4 w-full"
                >
                  <Plus className="w-6 h-6 mr-2" />
                  커리큘럼 추가하기
                </Button>
              </div>
            </div>
          )}

          {/* e. 강의 상세 */}
          {activeTab === "course-detail" && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="price">원가 (원) *</Label>
                <Input
                  id="price"
                  type="text"
                  value={courseDetail.priceDisplay}
                  onChange={(e) => {
                    // 숫자만 추출
                    const numericValue = e.target.value.replace(/[^0-9]/g, '')
                    const num = numericValue ? parseInt(numericValue) : null
                    setCourseDetail({ 
                      ...courseDetail, 
                      price: num,
                      priceDisplay: num ? num.toLocaleString() : ""
                    })
                  }}
                  placeholder="50000"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  원가를 숫자로 입력하세요 (예: 50000). 자동으로 포맷팅됩니다.
                </p>
              </div>

              <div>
                <Label>할인 설정 (선택)</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  할인율을 설정하면 코치 목록에서 할인 배지가 표시됩니다.
                </p>
                <div className="flex gap-2">
                  {[10, 30, 50].map((percent) => (
                    <Button
                      key={percent}
                      type="button"
                      variant={courseDetail.discount === percent ? "default" : "outline"}
                      onClick={() => {
                        setCourseDetail({ 
                          ...courseDetail, 
                          discount: courseDetail.discount === percent ? null : percent 
                        })
                      }}
                      className={courseDetail.discount === percent ? "bg-primary" : ""}
                    >
                      {percent}%
                    </Button>
                  ))}
                  {courseDetail.discount && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setCourseDetail({ ...courseDetail, discount: null })}
                    >
                      <X className="w-4 h-4 mr-2" />
                      할인 해제
                    </Button>
                  )}
                </div>
                {courseDetail.discount && courseDetail.price && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">할인 가격 미리보기</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">원가:</span>
                      <span className="text-xs line-through text-muted-foreground">
                        ₩{courseDetail.price.toLocaleString()}
                      </span>
                      <span className="text-sm font-medium">할인가:</span>
                      <span className="text-lg font-bold text-green-600">
                        ₩{Math.round(courseDetail.price * (1 - courseDetail.discount / 100)).toLocaleString()}
                      </span>
                      <Badge variant="destructive" className="text-xs">
                        {courseDetail.discount}% 할인
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      할인가 ₩{Math.round(courseDetail.price * (1 - courseDetail.discount / 100)).toLocaleString()}가 코치 목록에 표시됩니다.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="title">제목</Label>
                <Input
                  id="title"
                  value={courseDetail.title}
                  onChange={(e) => setCourseDetail({ ...courseDetail, title: e.target.value })}
                  placeholder="예: [인기] 수강생 200+ 이 경험한 에임실력 상승 🔥"
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {courseDetail.title.length} / 100
                </p>
              </div>

              <div>
                <Label htmlFor="content">내용</Label>
                <Textarea
                  id="content"
                  value={courseDetail.content}
                  onChange={(e) => setCourseDetail({ ...courseDetail, content: e.target.value })}
                  placeholder="강의 내용을 입력하세요"
                  rows={10}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {courseDetail.content.length} / 500
                </p>
              </div>

              <div>
                <Label htmlFor="videoUrl">소개 영상 URL (선택)</Label>
                <div className="flex gap-2">
                  <Input
                    id="videoUrl"
                    value={courseDetail.videoUrl}
                    onChange={(e) => setCourseDetail({ ...courseDetail, videoUrl: e.target.value })}
                    placeholder="유튜브 영상 URL을 입력해 주세요."
                  />
                  <Button type="button" variant="outline">
                    미리보기
                  </Button>
                </div>
              </div>

              <div>
                <Label>강의를 표현할 수 있는 이미지를 등록해 주세요.</Label>
                <div className="flex gap-4">
                  <label className={`relative flex items-center justify-center w-32 h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    {uploadPreview && uploading ? (
                      <div className="relative w-full h-full">
                        <img src={uploadPreview} alt="업로드 중" className="w-full h-full object-cover rounded-lg opacity-50" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-lg">
                          <Loader2 className="w-6 h-6 text-white animate-spin mb-1" />
                          <span className="text-white text-xs">{Math.round(uploadProgress)}%</span>
                          <div className="w-2/3 h-1 bg-white/20 rounded-full mt-1">
                            <div 
                              className="h-full bg-primary rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ) : courseDetail.image ? (
                      <>
                        <img src={courseDetail.image} alt="미리보기" className="w-full h-full object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => setCourseDetail({ ...courseDetail, image: "" })}
                          className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 hover:bg-destructive/80"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <div className="text-center">
                        <Plus className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">이미지 등록</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="mt-4 text-xs text-muted-foreground space-y-1">
                  <p>• 이미지 권장 사이즈: 1,424 x 1,068px (4:3 비율)</p>
                  <p>• 등록하신 이미지는 이용약관에 따라 광고 소재로 활용될 수 있습니다.</p>
                  <p>• 저작권 침해 (무단복제, 도용) 이미지는 사용이 불가합니다.</p>
                  <p>• 임의로 제작된 인증 마크, 라벨, 할인표기는 사용이 불가합니다.</p>
                  <p>• 검증 불가 내용 (최초, 유일, 무제한, 1위, 누적의뢰 수/금액 표기 등)</p>
                  <p>• 5MB 이하 이미지 파일만 등록 가능합니다.</p>
                </div>
              </div>

              <div>
                <Label htmlFor="keywords">키워드</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    id="keywords"
                    value={courseDetail.keywords.join('')}
                    onChange={(e) => {
                      // 키워드 입력 로직 (실제로는 개별 입력)
                    }}
                    placeholder="키워드를 입력해 주세요."
                    maxLength={6}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const input = document.getElementById('keywords') as HTMLInputElement
                      const keyword = input.value.trim()
                      if (keyword && courseDetail.keywords.length < 6 && !courseDetail.keywords.includes(keyword)) {
                        setCourseDetail({ ...courseDetail, keywords: [...courseDetail.keywords, keyword] })
                        input.value = ''
                      }
                    }}
                  >
                    등록
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {courseDetail.keywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {keyword}
                      <button
                        type="button"
                        onClick={() => {
                          const newKeywords = courseDetail.keywords.filter((_, i) => i !== index)
                          setCourseDetail({ ...courseDetail, keywords: newKeywords })
                        }}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {courseDetail.keywords.length} / 6
                </p>
                <Card className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300">
                  <CardContent className="pt-6">
                    <p className="font-semibold mb-2">TIP!</p>
                    <p className="text-sm">6자까지 입력할 수 있으며, 특수문자 및 이모지는 입력할 수 없습니다.</p>
                    <p className="text-sm">키워드는 강의 설명 및 검색 기능 대상 단어로 사용되어, 강의와 연관된 단어를 여러 개 입력하는 것이 검색 노출 향상에 도움이 됩니다.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={prevTab}
              disabled={activeTab === "game-info"}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              이전
            </Button>
            {activeTab === "course-detail" ? (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="bg-primary"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    저장 중...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    등록
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={nextTab}
                className="bg-primary"
              >
                다음
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
