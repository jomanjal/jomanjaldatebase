"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Star, Eye, Trash2, CheckCircle, RefreshCw, Plus } from "lucide-react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"

interface Review {
  id: number
  coachId: number
  userId: number
  rating: number
  comment: string
  verified: boolean
  createdAt: Date | string
  coachName: string
  coachSpecialty: string
  userName: string
  timeAgo: string
}

interface Coach {
  id: number
  name: string
  specialty: string
}

interface User {
  id: number
  username: string
  email: string
}

export default function ReviewsManagementPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterRating, setFilterRating] = useState<number | null>(null)
  const [showPendingOnly, setShowPendingOnly] = useState(false)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [formData, setFormData] = useState({
    coachId: "",
    userId: "",
    rating: 5,
    comment: "",
    verified: false,
  })

  // 코치 목록 조회
  const fetchCoaches = async () => {
    try {
      const response = await fetch('/api/coaches?admin=true', {
        credentials: 'include',
      })
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setCoaches(result.data || [])
        }
      }
    } catch (error) {
      console.error('Failed to fetch coaches:', error)
    }
  }

  // 사용자 목록 조회
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users', {
        credentials: 'include',
      })
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setUsers(result.data || [])
        }
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  // 리뷰 목록 조회
  const fetchReviews = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('admin', 'true')
      if (searchQuery) params.append('search', searchQuery)
      if (filterRating !== null) params.append('rating', filterRating.toString())
      if (showPendingOnly) params.append('verified', 'false')

      const response = await fetch(`/api/reviews?${params.toString()}`, {
        credentials: 'include',
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setReviews(result.data || [])
        }
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
    fetchCoaches()
    fetchUsers()
  }, [searchQuery, filterRating, showPendingOnly])

  const handleVerifyReview = async (id: number) => {
    try {
      const response = await fetch(`/api/reviews/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ verified: true }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          fetchReviews()
          toast.success('리뷰가 승인되었습니다.')
        } else {
          toast.error(result.message || '리뷰 승인 중 오류가 발생했습니다.')
        }
      } else {
        const result = await response.json()
        toast.error(result.message || '리뷰 승인 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('Failed to verify review:', error)
      toast.error('리뷰 승인 중 오류가 발생했습니다.')
    }
  }

  const handleDeleteReview = async (id: number, userName: string) => {
    if (!confirm(`정말 "${userName}"의 리뷰를 삭제하시겠습니까?`)) {
      return
    }

    try {
      const response = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          fetchReviews()
          toast.success('리뷰가 삭제되었습니다.')
        } else {
          toast.error(result.message || '리뷰 삭제 중 오류가 발생했습니다.')
        }
      } else {
        const result = await response.json()
        toast.error(result.message || '리뷰 삭제 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('Failed to delete review:', error)
      toast.error('리뷰 삭제 중 오류가 발생했습니다.')
    }
  }

  const handleViewReview = async (id: number) => {
    try {
      const response = await fetch(`/api/reviews/${id}`, {
        credentials: 'include',
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setSelectedReview({
            ...result.data,
            timeAgo: getTimeAgo(result.data.createdAt),
            userName: result.data.userName || '익명',
          } as Review)
          setIsDialogOpen(true)
        }
      }
    } catch (error) {
      console.error('Failed to fetch review:', error)
      toast.error('리뷰 조회 중 오류가 발생했습니다.')
    }
  }

  const handleAddReview = async () => {
    if (!formData.coachId || !formData.userId || !formData.rating) {
      toast.error('코치, 사용자, 평점은 필수 입력 항목입니다.')
      return
    }

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          coachId: parseInt(formData.coachId),
          userId: parseInt(formData.userId),
          rating: formData.rating,
          comment: formData.comment || null,
          verified: formData.verified,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setIsAddDialogOpen(false)
          setFormData({
            coachId: "",
            userId: "",
            rating: 5,
            comment: "",
            verified: false,
          })
          fetchReviews()
          toast.success('리뷰가 추가되었습니다.')
        } else {
          toast.error(result.message || '리뷰 추가 중 오류가 발생했습니다.')
        }
      } else {
        const result = await response.json()
        toast.error(result.message || '리뷰 추가 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('Failed to add review:', error)
      toast.error('리뷰 추가 중 오류가 발생했습니다.')
    }
  }

  const filteredReviews = reviews

  const totalReviews = reviews.length
  const pendingReviews = reviews.filter(r => !r.verified).length
  const verifiedReviews = reviews.filter(r => r.verified).length
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0'

  return (
    <div className="p-8 space-y-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">리뷰 관리</h1>
          <p className="text-muted-foreground mt-1">
            등록된 리뷰를 관리하고 승인할 수 있습니다.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            리뷰 추가
          </Button>
          <Button onClick={fetchReviews} variant="outline" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="사용자 이름으로 검색... (최대 100자)"
                value={searchQuery}
                onChange={(e) => {
                  if (e.target.value.length <= 100) {
                    setSearchQuery(e.target.value)
                  }
                }}
                className="pl-10"
                maxLength={100}
              />
            </div>
            <div className="flex gap-2 items-center">
              <Button
                variant={showPendingOnly ? "default" : "outline"}
                onClick={() => setShowPendingOnly(!showPendingOnly)}
                size="sm"
              >
                승인 대기만
              </Button>
              <div className="flex gap-1">
                {[5, 4, 3, 2, 1].map(rating => (
                  <Button
                    key={rating}
                    variant={filterRating === rating ? "default" : "outline"}
                    onClick={() => setFilterRating(filterRating === rating ? null : rating)}
                    size="sm"
                    className="p-2"
                  >
                    <Star className={`w-4 h-4 ${filterRating === rating ? 'fill-current' : ''}`} />
                    {rating}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalReviews}</div>
            <div className="text-sm text-muted-foreground mt-1">총 리뷰</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">
              {pendingReviews}
            </div>
            <div className="text-sm text-muted-foreground mt-1">승인 대기</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {verifiedReviews}
            </div>
            <div className="text-sm text-muted-foreground mt-1">승인 완료</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {avgRating}
            </div>
            <div className="text-sm text-muted-foreground mt-1">평균 평점</div>
          </CardContent>
        </Card>
      </div>

      {/* 리뷰 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>리뷰 목록</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-4">로딩 중...</p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">검색 결과가 없습니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>사용자</TableHead>
                    <TableHead>코치</TableHead>
                    <TableHead>평점</TableHead>
                    <TableHead>리뷰 내용</TableHead>
                    <TableHead>시간</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReviews.map(review => (
                    <TableRow key={review.id}>
                      <TableCell>
                        <div className="font-medium">{review.userName}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{review.coachName}</div>
                          <div className="text-xs text-muted-foreground">{review.coachSpecialty}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                          <span className="ml-1 text-sm font-medium">{review.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md truncate" title={review.comment}>
                          {review.comment || '(리뷰 내용 없음)'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">{review.timeAgo}</div>
                      </TableCell>
                      <TableCell>
                        {review.verified ? (
                          <Badge className="bg-green-500">승인됨</Badge>
                        ) : (
                          <Badge variant="outline" className="border-orange-500 text-orange-600">
                            대기 중
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {!review.verified && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleVerifyReview(review.id)}
                              title="리뷰 승인"
                            >
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewReview(review.id)}
                            title="리뷰 상세 보기"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteReview(review.id, review.userName)}
                            title="리뷰 삭제"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 리뷰 상세 다이얼로그 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>리뷰 상세</DialogTitle>
            <DialogDescription>
              리뷰의 자세한 내용을 확인할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">사용자</p>
                  <p className="font-medium">{selectedReview.userName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">코치</p>
                  <p className="font-medium">{selectedReview.coachName}</p>
                  <p className="text-xs text-muted-foreground">{selectedReview.coachSpecialty}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">평점</p>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < selectedReview.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="ml-2 font-medium">{selectedReview.rating}/5</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">리뷰 내용</p>
                <p className="text-sm whitespace-pre-wrap">{selectedReview.comment || '(리뷰 내용 없음)'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">작성 시간</p>
                  <p className="text-sm">{selectedReview.timeAgo}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">상태</p>
                  {selectedReview.verified ? (
                    <Badge className="bg-green-500">승인됨</Badge>
                  ) : (
                    <Badge variant="outline" className="border-orange-500 text-orange-600">
                      대기 중
                    </Badge>
                  )}
                </div>
              </div>
              {!selectedReview.verified && (
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    닫기
                  </Button>
                  <Button
                    onClick={() => {
                      handleVerifyReview(selectedReview.id)
                      setIsDialogOpen(false)
                    }}
                  >
                    승인하기
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 리뷰 추가 다이얼로그 */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>리뷰 추가</DialogTitle>
            <DialogDescription>
              새로운 리뷰를 등록할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="coach" className="text-right">
                코치
              </Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, coachId: value }))} value={formData.coachId}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="코치를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {coaches.map(coach => (
                    <SelectItem key={coach.id} value={coach.id.toString()}>
                      {coach.name} ({coach.specialty})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="user" className="text-right">
                사용자
              </Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, userId: value }))} value={formData.userId}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="사용자를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.username} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rating" className="text-right">
                평점
              </Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, rating: parseInt(value, 10) }))} value={formData.rating.toString()}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="평점을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map(rating => (
                    <SelectItem key={rating} value={rating.toString()}>
                      {rating}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="comment" className="text-right">
                리뷰 내용
              </Label>
              <Textarea
                id="comment"
                value={formData.comment}
                onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                className="col-span-3"
                placeholder="리뷰 내용을 입력하세요 (최대 500자)"
                maxLength={500}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="verified"
                checked={formData.verified}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, verified: checked as boolean }))}
              />
              <Label htmlFor="verified">승인됨</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>취소</Button>
            <Button onClick={handleAddReview}>리뷰 추가</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/**
 * 시간을 "X분 전" 형식으로 변환
 */
function getTimeAgo(date: Date | string): string {
  const now = new Date()
  const past = typeof date === 'string' ? new Date(date) : date
  const diffMs = now.getTime() - past.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return '방금 전'
  if (diffMins < 60) return `${diffMins}분 전`
  if (diffHours < 24) return `${diffHours}시간 전`
  if (diffDays < 7) return `${diffDays}일 전`
  return past.toLocaleDateString('ko-KR')
}
