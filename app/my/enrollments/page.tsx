"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { checkAuth } from "@/lib/auth"
import { Loader2, Clock, CheckCircle, XCircle, Calendar, User, MessageSquare } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { sanitizeText } from "@/lib/dompurify-client"
import { fetchWithCsrf } from "@/lib/csrf-client"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface Enrollment {
  id: number
  userId: number
  coachId: number
  status: string
  message: string | null
  coachMessage: string | null
  createdAt: string
  updatedAt: string
  userName: string
  userEmail: string
  coachName: string
  coachSpecialty: string
}

export default function MyEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const user = await checkAuth()
        if (!user) {
          window.location.href = '/login'
          return
        }

        const params = new URLSearchParams()
        params.append('role', 'user')
        if (filterStatus !== 'all') {
          params.append('status', filterStatus)
        }

        const response = await fetch(`/api/enrollments?${params.toString()}`, {
          credentials: 'include',
        })

        const result = await response.json()

        if (result.success) {
          setEnrollments(result.data || [])
        }
      } catch (error) {
        console.error('데이터 로드 실패:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [filterStatus])

  const handleCancel = async () => {
    if (!selectedEnrollment) return

    try {
      const response = await fetchWithCsrf(`/api/enrollments/${selectedEnrollment.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'cancelled' }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast.success('수강 신청이 취소되었습니다.')
        setCancelDialogOpen(false)
        setSelectedEnrollment(null)
        // 목록 새로고침
        const params = new URLSearchParams()
        params.append('role', 'user')
        if (filterStatus !== 'all') {
          params.append('status', filterStatus)
        }
        const refreshResponse = await fetch(`/api/enrollments?${params.toString()}`, {
          credentials: 'include',
        })
        const refreshResult = await refreshResponse.json()
        if (refreshResult.success) {
          setEnrollments(refreshResult.data || [])
        }
      } else {
        toast.error(result.message || '수강 신청 취소 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('수강 신청 취소 실패:', error)
      toast.error('수강 신청 취소 중 오류가 발생했습니다.')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-[var(--systemWarning01)]/10 text-[var(--systemWarning01)] border-[var(--systemWarning01)]">대기 중</Badge>
      case 'approved':
        return <Badge className="bg-[var(--systemSuccess01)] text-white">승인됨</Badge>
      case 'rejected':
        return <Badge variant="destructive">거절됨</Badge>
      case 'completed':
        return <Badge className="bg-[var(--primary01)] text-white">완료</Badge>
      case 'cancelled':
        return <Badge variant="outline" className="text-[var(--text04)] border-[var(--divider01)]">취소됨</Badge>
      default:
        return <Badge variant="outline" className="text-[var(--text04)] border-[var(--divider01)]">{status}</Badge>
    }
  }

  // 포지션 영어 -> 한글 변환
  const getPositionLabel = (position: string) => {
    const positionMap: Record<string, string> = {
      'sentinel': '감시자',
      'controller': '전략가',
      'initiator': '척후대',
      'duelist': '타격대',
    }
    return positionMap[position] || position
  }

  // 랭크 영어 -> 한글 변환 (모든 게임 통합)
  const getRankLabel = (rank: string) => {
    const rankMap: Record<string, string> = {
      // 발로란트
      'iron': '아이언',
      'bronze': '브론즈',
      'silver': '실버',
      'gold': '골드',
      'platinum': '플래티넘',
      'diamond': '다이아몬드',
      'ascendant': '초월자',
      'immortal': '불멸',
      'radiant': '레디언트',
      // 리그 오브 레전드
      'emerald': '에메랄드',
      'master': '마스터',
      'grandmaster': '그랜드마스터',
      'challenger': '챌린저',
      // 오버워치 2, 배틀그라운드
      // (공통 랭크는 위에 포함됨)
    }
    return rankMap[rank] || rank
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--primary01)] mx-auto mb-4" />
          <p className="text-[var(--text04)]">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold mb-1 text-[var(--text01)]">내 수강 신청</h1>
          <p className="text-[var(--text04)] text-xs">수강 신청 내역을 확인하고 관리할 수 있습니다.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="상태" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="pending">대기 중</SelectItem>
              <SelectItem value="approved">승인됨</SelectItem>
              <SelectItem value="rejected">거절됨</SelectItem>
              <SelectItem value="completed">완료</SelectItem>
              <SelectItem value="cancelled">취소됨</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {enrollments.length === 0 ? (
        <Card className="bg-[var(--layer02)] ">
          <CardContent className="py-12 text-center">
            <p className="text-[var(--text01)] mb-2 font-medium">주문 기간 내에 구매 내역이 없습니다.</p>
            <p className="text-[var(--text04)] text-xs mb-1">주문 기간을 변경하여 확인해 보세요.</p>
            <p className="text-[var(--text04)] text-xs mb-4">(기본 조회 기간: 1년)</p>
            <Button asChild>
              <Link href="/coaches">코치 찾아보기</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {enrollments.map((enrollment) => (
            <Card key={enrollment.id} className="bg-[var(--layer02)]  ">
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-[var(--text01)]">{enrollment.coachName} 코치</h3>
                      {getStatusBadge(enrollment.status)}
                    </div>
                    <p className="text-xs text-[var(--text04)] mb-2">{enrollment.coachSpecialty}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-[var(--text04)] mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>신청일: {format(new Date(enrollment.createdAt), 'yyyy년 MM월 dd일', { locale: ko })}</span>
                      </div>
                      {enrollment.updatedAt && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>수정일: {format(new Date(enrollment.updatedAt), 'yyyy년 MM월 dd일', { locale: ko })}</span>
                        </div>
                      )}
                    </div>

                    {enrollment.message && (() => {
                      // 게임 정보 JSON 파싱 시도
                      let gameInfo = null
                      let isGameInfo = false
                      try {
                        const parsed = JSON.parse(enrollment.message)
                        if (parsed && (parsed.rank || parsed.positions || parsed.agents)) {
                          gameInfo = parsed
                          isGameInfo = true
                        }
                      } catch {
                        // JSON이 아니면 일반 메시지로 처리
                      }

                      return (
                        <div className="mb-3 p-3 bg-[var(--layer01)] border border-[var(--divider01)] rounded-md">
                          <div className="flex items-center gap-2 mb-1">
                            <MessageSquare className="w-4 h-4 text-[var(--text04)]" />
                            <span className="text-xs font-medium text-[var(--text01)]">
                              {isGameInfo ? '내 게임 정보' : '내 메시지'}
                            </span>
                          </div>
                          {isGameInfo ? (
                            <div className="space-y-2 text-xs text-[var(--text01)]">
                              {gameInfo.rank && (
                                <p><span className="font-medium">랭크:</span> {getRankLabel(gameInfo.rank)}</p>
                              )}
                              {gameInfo.positions && gameInfo.positions.length > 0 && (
                                <p>
                                  <span className="font-medium">포지션:</span> {gameInfo.positions.map(getPositionLabel).join(', ')}
                                </p>
                              )}
                              {gameInfo.agents && gameInfo.agents.length > 0 && (
                                <p>
                                  <span className="font-medium">요원:</span> {gameInfo.agents.join(', ')}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-[var(--text01)]">{sanitizeText(enrollment.message)}</p>
                          )}
                        </div>
                      )
                    })()}

                    {enrollment.coachMessage && (
                      <div className="mb-3 p-3 bg-[var(--primaryOpacity01)] rounded-md">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-[var(--textPrimary)]" />
                          <span className="text-xs font-medium text-[var(--textPrimary)]">코치 답변</span>
                        </div>
                        <p className="text-xs text-[var(--text01)]">{sanitizeText(enrollment.coachMessage)}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-4">
                      <Button variant="outline" asChild size="sm">
                        <Link href={`/coaches/${enrollment.coachId}`}>
                          코치 프로필 보기
                        </Link>
                      </Button>
                      {enrollment.status === 'pending' && (
                        <>
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => {
                              const chatUrl = process.env.NEXT_PUBLIC_KAKAO_CHAT_URL || 'https://open.kakao.com/o/s6kCFbZh'
                              window.open(chatUrl, '_blank', 'noopener,noreferrer')
                            }}
                          >
                            결제하기
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedEnrollment(enrollment)
                              setCancelDialogOpen(true)
                            }}
                          >
                            취소하기
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 취소 확인 다이얼로그 */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>수강 신청 취소</DialogTitle>
            <DialogDescription>
              정말 이 수강 신청을 취소하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCancelDialogOpen(false)
                setSelectedEnrollment(null)
              }}
            >
              아니오
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
            >
              취소하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

