"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Mail, UserCheck, Send, CheckCircle, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { toast } from "sonner"

interface WaitlistItem {
  id: number
  name: string
  email: string
  goal: string | null
  tier: string | null
  importantPoint: string | null
  contacted: boolean
  createdAt: Date | string
}

export default function WaitlistManagementPage() {
  const [waitlistItems, setWaitlistItems] = useState<WaitlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGame, setSelectedGame] = useState<string>("all")
  const [filterContacted, setFilterContacted] = useState<string>("all")
  
  const games = ["all", "리그 오브 레전드", "발로란트", "오버워치 2", "배틀그라운드"]

  // 웨이팅 리스트 조회
  const fetchWaitlist = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (selectedGame !== 'all') params.append('game', selectedGame)
      if (filterContacted === 'true') params.append('contacted', 'true')
      if (filterContacted === 'false') params.append('contacted', 'false')

      const response = await fetch(`/api/waitlist?${params.toString()}`, {
        credentials: 'include',
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setWaitlistItems(result.data || [])
        }
      }
    } catch (error) {
      console.error('Failed to fetch waitlist:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWaitlist()
  }, [searchQuery, selectedGame, filterContacted])

  const handleMarkAsContacted = async (id: number, contacted: boolean) => {
    try {
      const response = await fetch(`/api/waitlist/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ contacted: !contacted }),
      })

      if (response.ok) {
        fetchWaitlist()
      } else {
        toast.error('연락 완료 표시 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('Failed to update contacted status:', error)
      toast.error('연락 완료 표시 중 오류가 발생했습니다.')
    }
  }

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`정말 "${name}"님의 웨이팅 리스트 항목을 삭제하시겠습니까?`)) {
      return
    }

    try {
      const response = await fetch(`/api/waitlist/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        fetchWaitlist()
        toast.success('웨이팅 리스트 항목이 삭제되었습니다.')
      } else {
        toast.error('삭제 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('Failed to delete:', error)
      toast.error('삭제 중 오류가 발생했습니다.')
    }
  }

  const filteredWaitlist = waitlistItems

  return (
    <div className="p-8 space-y-8">
      {/* 헤더 */}
      <div>
        <h1 className="text-3xl font-bold">웨이팅 리스트 관리</h1>
        <p className="text-muted-foreground mt-1">
          코칭 서비스를 기다리는 사용자들을 관리합니다.
        </p>
      </div>

      {/* 검색 및 필터 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                              placeholder="이름 또는 이메일로 검색... (최대 100자)"
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
              <Button
                variant="outline"
                onClick={fetchWaitlist}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                새로고침
              </Button>
            </div>
            <div className="flex gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground self-center">게임:</span>
              {games.map(game => (
                <Button
                  key={game}
                  variant={selectedGame === game ? "default" : "outline"}
                  onClick={() => setSelectedGame(game)}
                  size="sm"
                >
                  {game === "all" ? "전체" : game}
                </Button>
              ))}
              <span className="text-sm text-muted-foreground self-center ml-2">연락 상태:</span>
              <Button
                variant={filterContacted === "all" ? "default" : "outline"}
                onClick={() => setFilterContacted("all")}
                size="sm"
              >
                전체
              </Button>
              <Button
                variant={filterContacted === "false" ? "default" : "outline"}
                onClick={() => setFilterContacted("false")}
                size="sm"
              >
                미연락
              </Button>
              <Button
                variant={filterContacted === "true" ? "default" : "outline"}
                onClick={() => setFilterContacted("true")}
                size="sm"
              >
                연락 완료
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{filteredWaitlist.length}</div>
            <div className="text-sm text-muted-foreground mt-1">총 웨이팅</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {filteredWaitlist.filter(w => w.goal === "리그 오브 레전드").length}
            </div>
            <div className="text-sm text-muted-foreground mt-1">리그오브레전드</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {filteredWaitlist.filter(w => w.goal === "발로란트").length}
            </div>
            <div className="text-sm text-muted-foreground mt-1">발로란트</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">
              {filteredWaitlist.filter(w => w.goal === "오버워치 2").length}
            </div>
            <div className="text-sm text-muted-foreground mt-1">오버워치 2</div>
          </CardContent>
        </Card>
      </div>

      {/* 웨이팅 리스트 */}
      <Card>
        <CardHeader>
          <CardTitle>웨이팅 리스트</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-4">로딩 중...</p>
            </div>
          ) : filteredWaitlist.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">검색 결과가 없습니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>이름</TableHead>
                    <TableHead>이메일</TableHead>
                    <TableHead>게임</TableHead>
                    <TableHead>티어</TableHead>
                    <TableHead>원하는 스타일</TableHead>
                    <TableHead>등록일시</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWaitlist.map(item => {
                    const createdAt = typeof item.createdAt === 'string' 
                      ? new Date(item.createdAt) 
                      : item.createdAt
                    
                    return (
                      <TableRow key={item.id} className={item.contacted ? 'opacity-60' : ''}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <UserCheck className={`w-4 h-4 ${item.contacted ? 'text-green-600' : 'text-primary'}`} />
                            <span className="font-medium">{item.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{item.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.goal ? (
                            <Badge variant="outline">{item.goal}</Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {item.tier || <span className="text-muted-foreground text-sm">-</span>}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate text-sm" title={item.importantPoint || ''}>
                            {item.importantPoint || '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {format(createdAt, 'yyyy-MM-dd HH:mm', { locale: ko })}
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.contacted ? (
                            <Badge className="bg-green-500">연락 완료</Badge>
                          ) : (
                            <Badge variant="outline">대기 중</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsContacted(item.id, item.contacted)}
                              title={item.contacted ? '연락 완료 취소' : '연락 완료 표시'}
                            >
                              <CheckCircle className={`w-4 h-4 ${item.contacted ? 'text-green-600' : 'text-gray-400'}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(item.id, item.name)}
                              className="text-destructive hover:text-destructive"
                            >
                              삭제
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

