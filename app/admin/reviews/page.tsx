"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Star, Eye, Trash2, CheckCircle } from "lucide-react"
import { useState } from "react"

// 임시 리뷰 데이터
const reviews = [
  {
    id: 1,
    user: "수확_코**",
    rating: 5,
    timeAgo: "4분전",
    review: "매우 도움됫습니다",
    coach: "Jomanjal",
    course: "발로란트 에이밍 강의",
    verified: true
  },
  {
    id: 2,
    user: "여왕의_**",
    rating: 5,
    timeAgo: "48분전",
    review: "개인적으로 척후대를 배우시는 분들이 찾아가시면 더 좋을 거 같습니다. 강사님이 척후대를 통한 운영이나 스킬 활용에 대해서 친절히 알려주셔서 더 유익할 거 같습니다.",
    coach: "Jomanjal",
    course: "발로란트 척후대 강의",
    verified: true
  },
  {
    id: 3,
    user: "게임마스터**",
    rating: 5,
    timeAgo: "1시간전",
    review: "정말 체계적으로 잘 가르쳐주셔서 실력이 많이 늘었어요! 추천합니다.",
    coach: "Jomanjal",
    course: "발로란트 전략 강의",
    verified: true
  },
  {
    id: 4,
    user: "프로게이머**",
    rating: 4,
    timeAgo: "2시간전",
    review: "좋은 강의였지만 조금 더 실전적인 팁이 있었으면 좋겠어요.",
    coach: "Jomanjal",
    course: "발로란트 실전 강의",
    verified: false
  },
]

export default function ReviewsManagementPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterRating, setFilterRating] = useState<number | null>(null)
  const [showPendingOnly, setShowPendingOnly] = useState(false)

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          review.course.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRating = filterRating === null || review.rating === filterRating
    const matchesPending = !showPendingOnly || !review.verified
    return matchesSearch && matchesRating && matchesPending
  })

  const handleVerifyReview = (id: number) => {
    alert(`리뷰 승인 기능 (ID: ${id})은 곧 구현될 예정입니다.`)
  }

  const handleDeleteReview = (id: number, user: string) => {
    if (confirm(`정말 "${user}"의 리뷰를 삭제하시겠습니까?`)) {
      alert(`리뷰 삭제 기능 (ID: ${id})은 곧 구현될 예정입니다.`)
    }
  }

  const handleViewReview = (id: number) => {
    alert(`리뷰 상세 보기 기능 (ID: ${id})은 곧 구현될 예정입니다.`)
  }

  return (
    <div className="p-8 space-y-8">
      {/* 헤더 */}
      <div>
        <h1 className="text-3xl font-bold">리뷰 관리</h1>
        <p className="text-muted-foreground mt-1">
          등록된 리뷰를 관리하고 승인할 수 있습니다.
        </p>
      </div>

      {/* 검색 및 필터 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="사용자 이름 또는 강의명으로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
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
            <div className="text-2xl font-bold">{filteredReviews.length}</div>
            <div className="text-sm text-muted-foreground mt-1">총 리뷰</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">
              {reviews.filter(r => !r.verified).length}
            </div>
            <div className="text-sm text-muted-foreground mt-1">승인 대기</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {reviews.filter(r => r.verified).length}
            </div>
            <div className="text-sm text-muted-foreground mt-1">승인 완료</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {(filteredReviews.reduce((sum, r) => sum + r.rating, 0) / filteredReviews.length || 0).toFixed(1)}
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
          {filteredReviews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">검색 결과가 없습니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>사용자</TableHead>
                    <TableHead>평점</TableHead>
                    <TableHead>리뷰 내용</TableHead>
                    <TableHead>강의</TableHead>
                    <TableHead>시간</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReviews.map(review => (
                    <TableRow key={review.id}>
                      <TableCell>
                        <div className="font-medium">{review.user}</div>
                        <div className="text-xs text-muted-foreground">{review.coach}</div>
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
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md truncate" title={review.review}>
                          {review.review}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{review.course}</div>
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
                            >
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewReview(review.id)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteReview(review.id, review.user)}
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
    </div>
  )
}

