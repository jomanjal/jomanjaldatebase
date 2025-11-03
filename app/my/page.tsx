"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { checkAuth } from "@/lib/auth"
import { Loader2, UserCircle, BookOpen, Star, Users, Edit } from "lucide-react"
import Link from "next/link"

interface Coach {
  id: number
  name: string
  specialty: string
  tier: string
  experience: string
  rating: number
  reviews: number
  students: number
  price: number | null // 숫자로 변경
  specialties: string[]
  description: string | null
  verified: boolean
  active?: boolean
}

export default function MyPage() {
  const [coach, setCoach] = useState<Coach | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingActive, setUpdatingActive] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const user = await checkAuth()
        if (!user) return

        // 코치 프로필 조회
        const response = await fetch('/api/coaches/my', {
          credentials: 'include',
        })

        const result = await response.json()

        if (result.success && result.data) {
          setCoach(result.data)
        }
      } catch (error) {
        console.error('데이터 로드 실패:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleToggleActive = async (active: boolean) => {
    setUpdatingActive(true)
    try {
      const response = await fetch('/api/coaches/my', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ active }),
      })

      const result = await response.json()

      if (result.success && coach) {
        setCoach({ ...coach, active })
      }
    } catch (error) {
      console.error('활성화 상태 업데이트 실패:', error)
    } finally {
      setUpdatingActive(false)
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

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">대시보드</h1>
        <p className="text-muted-foreground">코치 대시보드에 오신 것을 환영합니다.</p>
      </div>

      {coach && (
        <>
          {/* 프로필 카드 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>프로필 정보</CardTitle>
                <Button variant="outline" asChild>
                  <Link href="/my/course">
                    <Edit className="w-4 h-4 mr-2" />
                    강의 설정
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                    <UserCircle className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{coach.name}</h3>
                    <p className="text-muted-foreground">{coach.specialty} • {coach.tier}</p>
                  </div>
                  <div>
                    {coach.verified ? (
                      <Badge className="bg-green-500">승인됨</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                        승인 대기
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">평점</p>
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-2xl font-bold">{coach.rating.toFixed(1)}</span>
                      <span className="text-muted-foreground">({coach.reviews})</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">수강생</p>
                    <div className="flex items-center gap-1">
                      <Users className="w-5 h-5 text-primary" />
                      <span className="text-2xl font-bold">{coach.students}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">가격</p>
                    <p className="text-2xl font-bold">
                      {coach.price ? `₩${coach.price.toLocaleString()}` : "미설정"}
                    </p>
                  </div>
                </div>

                {coach.description && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">소개</p>
                    <p className="text-sm">{coach.description}</p>
                  </div>
                )}

                {coach.specialties && coach.specialties.length > 0 && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">전문 분야</p>
                    <div className="flex flex-wrap gap-2">
                      {coach.specialties.map((spec, index) => (
                        <Badge key={index} variant="secondary">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* 강의 활성화 스위치 */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={coach.active !== false}
                        onCheckedChange={handleToggleActive}
                        disabled={updatingActive}
                      />
                      <div>
                        <p className="text-sm font-medium">코치 목록 노출</p>
                        <p className="text-xs text-muted-foreground">
                          {coach.active !== false ? "강의가 활성화 되었습니다." : "강의를 활성화 시켜주세요."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 빠른 액션 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  강의 설정
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  강의 소개, 커리큘럼, 상세 페이지 설정을 관리할 수 있습니다.
                </p>
                <Button asChild className="w-full">
                  <Link href="/my/course">
                    강의 설정 바로가기
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {coach.verified && (
              <Card>
                <CardHeader>
                  <CardTitle>상세 페이지</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    내 강의 상세 페이지를 확인할 수 있습니다.
                  </p>
                  <Button variant="outline" asChild className="w-full">
                    <Link href={`/coaches/${coach.id}`}>
                      상세 페이지 보기
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}

      {!coach && (
        <Card>
          <CardHeader>
            <CardTitle>프로필 생성</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              아직 코치 프로필이 생성되지 않았습니다. 강의 설정을 통해 프로필을 생성해주세요.
            </p>
            <Button asChild>
              <Link href="/my/course">
                프로필 생성하기
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

