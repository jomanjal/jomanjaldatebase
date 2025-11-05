"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { checkAuth } from "@/lib/auth"
import { Loader2, Clock, CheckCircle, XCircle, Calendar, User, MessageSquare, Send } from "lucide-react"
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

export default function MyStudentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null)
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'cancel' | null>(null)
  const [coachMessage, setCoachMessage] = useState("")

  useEffect(() => {
    async function loadData() {
      try {
        const user = await checkAuth()
        if (!user) {
          window.location.href = '/login'
          return
        }

        if (user.role !== 'coach') {
          toast.error('코치만 접근할 수 있습니다.')
          window.location.href = '/my'
          return
        }

        const params = new URLSearchParams()
        params.append('role', 'coach')
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

  const handleAction = async () => {
    if (!selectedEnrollment || !actionType) return

    try {
      const response = await fetchWithCsrf(`/api/enrollments/${selectedEnrollment.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: actionType === 'approve' ? 'approved' : actionType === 'reject' ? 'rejected' : 'cancelled',
          coachMessage: coachMessage || null,
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast.success(
          actionType === 'approve' ? '수강 신청이 승인되었습니다.' : 
          actionType === 'reject' ? '수강 신청이 거절되었습니다.' : 
          '수강 신청이 취소되었습니다.'
        )
        setActionDialogOpen(false)
        setSelectedEnrollment(null)
        setActionType(null)
        setCoachMessage("")
        // 목록 새로고침
        const params = new URLSearchParams()
        params.append('role', 'coach')
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
        toast.error(result.message || '처리 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('처리 실패:', error)
      toast.error('처리 중 오류가 발생했습니다.')
    }
  }

  const openActionDialog = (enrollment: Enrollment, type: 'approve' | 'reject' | 'cancel') => {
    setSelectedEnrollment(enrollment)
    setActionType(type)
    setCoachMessage("")
    setActionDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">대기 중</Badge>
      case 'approved':
        return <Badge className="bg-green-500">승인됨</Badge>
      case 'rejected':
        return <Badge variant="destructive">거절됨</Badge>
      case 'completed':
        return <Badge className="bg-blue-500">완료</Badge>
      case 'cancelled':
        return <Badge variant="outline">취소됨</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
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
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">수강생 관리</h1>
          <p className="text-muted-foreground">수강 신청을 승인하고 수강생을 관리할 수 있습니다.</p>
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
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">수강 신청이 없습니다.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {enrollments.map((enrollment) => (
            <Card key={enrollment.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold">{enrollment.userName}</h3>
                      {getStatusBadge(enrollment.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{enrollment.userEmail}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
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
                        <div className="mb-3 p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <MessageSquare className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              {isGameInfo ? '학생 게임 정보' : '수강생 메시지'}
                            </span>
                          </div>
                          {isGameInfo ? (
                            <div className="space-y-2 text-sm text-foreground">
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
                            <p className="text-sm text-foreground">{sanitizeText(enrollment.message)}</p>
                          )}
                        </div>
                      )
                    })()}

                    {enrollment.coachMessage && (
                      <div className="mb-3 p-3 bg-primary/10 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium text-primary">내 답변</span>
                        </div>
                        <p className="text-sm text-foreground">{sanitizeText(enrollment.coachMessage)}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-4">
                      {enrollment.status === 'pending' && (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => openActionDialog(enrollment, 'approve')}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            승인하기
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => openActionDialog(enrollment, 'reject')}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            거절하기
                          </Button>
                        </>
                      )}
                      {enrollment.status === 'approved' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openActionDialog(enrollment, 'cancel')}
                        >
                          취소하기
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 승인/거절 다이얼로그 */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? '수강 신청 승인' : actionType === 'reject' ? '수강 신청 거절' : '수강 신청 취소'}
            </DialogTitle>
            <DialogDescription>
              {selectedEnrollment?.userName}님의 수강 신청을 {actionType === 'approve' ? '승인' : actionType === 'reject' ? '거절' : '취소'}하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="coach-message">메시지 (선택사항)</Label>
              <Textarea
                id="coach-message"
                placeholder="수강생에게 전달할 메시지를 입력하세요..."
                value={coachMessage}
                onChange={(e) => setCoachMessage(e.target.value)}
                className="mt-2"
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {coachMessage.length}/500자
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setActionDialogOpen(false)
                setSelectedEnrollment(null)
                setActionType(null)
                setCoachMessage("")
              }}
            >
              취소
            </Button>
            <Button
              variant={actionType === 'approve' ? 'default' : actionType === 'reject' ? 'destructive' : 'outline'}
              onClick={handleAction}
            >
              {actionType === 'approve' ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  승인하기
                </>
              ) : actionType === 'reject' ? (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  거절하기
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  취소하기
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

