"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Save, Upload, X } from "lucide-react"
import { checkAuth, type User } from "@/lib/auth"
import { toast } from "sonner"
import Image from "next/image"

interface Coach {
  id: number
  name: string
  specialty: string
  tier: string
  experience: string
  description: string | null
  thumbnailImage: string | null
  profileImage: string | null
  headline: string | null
  introductionImage: string | null
  introductionContent: string | null
  curriculumItems: Array<{ title: string; duration: string }>
  totalCourseTime: string | null
  price: number | null
  discount: number | null
  specialties: string[]
}

export default function ProfileSettingsPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [coach, setCoach] = useState<Coach | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingProfile, setUploadingProfile] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  
  // 폼 상태
  const [formData, setFormData] = useState({
    experience: "",
    description: "",
    profileImage: "",
  })

  useEffect(() => {
    async function loadProfile() {
      try {
        const user = await checkAuth()
        if (!user || user.role !== 'coach') {
          router.push('/login')
          return
        }
        setCurrentUser(user)

        // 코치 프로필 조회
        const response = await fetch('/api/coaches/my')
        const result = await response.json()

        if (result.success && result.data) {
          setCoach(result.data)
          setFormData({
            experience: result.data.experience || "",
            description: result.data.description || "",
            profileImage: result.data.profileImage || "",
          })
        } else {
          toast.error('프로필을 불러올 수 없습니다.')
        }
      } catch (error) {
        console.error('프로필 로드 실패:', error)
        toast.error('프로필을 불러오는 중 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [router])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'thumbnail') => {
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

    setUploadingProfile(true)
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
        setFormData({ ...formData, profileImage: result.path })
        toast.success('프로필 이미지가 업로드되었습니다.')
      } else {
        toast.error(result.message || '이미지 업로드에 실패했습니다.')
      }
    } catch (error: any) {
      console.error('파일 업로드 실패:', error)
      toast.error(error.message || '이미지 업로드 중 오류가 발생했습니다.')
    } finally {
      setUploadingProfile(false)
      setUploadProgress(0)
      e.target.value = ''
    }
  }

  const handleRemoveImage = () => {
    setFormData({ ...formData, profileImage: "" })
    toast.info('프로필 이미지가 제거되었습니다.')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!coach) {
      toast.error('코치 프로필을 먼저 생성해주세요.')
      router.push('/my/course')
      return
    }

    setSaving(true)

    try {
      const response = await fetch('/api/coaches/my', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: coach.name,
          specialty: coach.specialty,
          tier: coach.tier,
          experience: formData.experience,
          price: coach.price || null,
          discount: coach.discount || null,
          specialties: coach.specialties || [],
          description: formData.description || null,
          thumbnailImage: coach.thumbnailImage || null, // 섬네일 이미지 유지
          profileImage: formData.profileImage || null,
          headline: coach.headline || null,
          introductionImage: coach.introductionImage || null,
          introductionContent: coach.introductionContent || null,
          curriculumItems: coach.curriculumItems || [],
          totalCourseTime: coach.totalCourseTime || null,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('프로필이 저장되었습니다.')
        // 데이터 새로고침
        const refreshResponse = await fetch('/api/coaches/my')
        const refreshResult = await refreshResponse.json()
        if (refreshResult.success && refreshResult.data) {
          setCoach(refreshResult.data)
          // 사이드바 프로필 이미지 업데이트를 위한 이벤트 발생
          window.dispatchEvent(new CustomEvent('profileImageUpdated', { 
            detail: { profileImage: refreshResult.data.profileImage } 
          }))
        }
        // 레이아웃 새로고침을 위해 router.refresh() 호출
        router.refresh()
      } else {
        toast.error(result.message || '프로필 저장에 실패했습니다.')
      }
    } catch (error: any) {
      console.error('프로필 저장 실패:', error)
      toast.error('프로필 저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary01)] mx-auto"></div>
          <p className="mt-4 text-[var(--text04)]">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!coach) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card className="bg-[var(--layer02)] ">
          <CardContent className="p-4">
            <p className="text-center text-[var(--text04)] mb-4">
              코치 프로필을 먼저 생성해주세요.
            </p>
            <Button onClick={() => router.push('/my/course')} className="w-full">
              강의 관리로 이동
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-4">
        <h1 className="text-xl font-semibold mb-1 text-[var(--text01)]">프로필 설정</h1>
        <p className="text-[var(--text04)] text-xs">
          코치 프로필 이미지, 경력, 소개글을 설정할 수 있습니다.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* 프로필 이미지 */}
          <Card className="bg-[var(--layer02)]  ">
            <CardHeader>
              <CardTitle className="text-[var(--text01)]">프로필 이미지</CardTitle>
              <CardDescription className="text-[var(--text04)]">
                코치 상세 페이지 우측바에 표시될 프로필 이미지입니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 space-y-3">
              {formData.profileImage ? (
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-[var(--divider01)]">
                  <Image
                    src={formData.profileImage}
                    alt="프로필 이미지"
                    fill
                    className="object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveImage}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full bg-[var(--layer01)] border-2 border-dashed border-[var(--divider01)] flex items-center justify-center">
                  <span className="text-[var(--text04)] text-xs">이미지 없음</span>
                </div>
              )}
              <div className="flex items-center gap-4">
                <Label htmlFor="profileImage" className="cursor-pointer">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploadingProfile}
                    asChild
                  >
                    <span>
                      {uploadingProfile ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          업로드 중... {Math.round(uploadProgress)}%
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          프로필 이미지 업로드
                        </>
                      )}
                    </span>
                  </Button>
                </Label>
                <Input
                  id="profileImage"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, 'profile')}
                  disabled={uploadingProfile}
                />
              </div>
            </CardContent>
          </Card>

          {/* 경력 */}
          <Card className="bg-[var(--layer02)]  ">
            <CardHeader>
              <CardTitle className="text-[var(--text01)]">경력</CardTitle>
              <CardDescription className="text-[var(--text04)]">
                코치의 경력을 입력해주세요. (예: &quot;5년&quot;, &quot;프로게이머 경력 3년&quot;)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                placeholder="예: 5년, 프로게이머 경력 3년"
                maxLength={50}
              />
            </CardContent>
          </Card>

          {/* 소개글 */}
          <Card className="bg-[var(--layer02)]  ">
            <CardHeader>
              <CardTitle className="text-[var(--text01)]">소개글</CardTitle>
              <CardDescription className="text-[var(--text04)]">
                코치 카드에 표시될 간단한 소개글을 입력해주세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="코치에 대한 간단한 소개를 작성해주세요."
                rows={4}
                maxLength={200}
              />
              <p className="text-xs text-[var(--text04)] mt-2">
                {formData.description.length}/200
              </p>
            </CardContent>
          </Card>

          {/* 저장 버튼 */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/my')}
            >
              취소
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  저장 중...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  저장
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

