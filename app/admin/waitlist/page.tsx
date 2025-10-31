"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Mail, UserCheck, Send } from "lucide-react"
import { useState, useEffect } from "react"

// 임시 웨이팅 리스트 데이터 (나중에 Notion API로 교체)
const waitlistItems = [
  {
    id: 1,
    name: "김게이머",
    email: "gamer@example.com",
    game: "리그 오브 레전드",
    tier: "골드",
    style: "라인전 실력 향상",
    timestamp: "2024-01-15 10:30"
  },
  {
    id: 2,
    name: "박발로",
    email: "valorant@example.com",
    game: "발로란트",
    tier: "실버",
    style: "전략 및 포지셔닝",
    timestamp: "2024-01-15 09:15"
  },
  {
    id: 3,
    name: "이오버워치",
    email: "overwatch@example.com",
    game: "오버워치 2",
    tier: "다이아",
    style: "팀워크 및 전략",
    timestamp: "2024-01-15 08:00"
  },
  {
    id: 4,
    name: "정배그",
    email: "pubg@example.com",
    game: "배틀그라운드",
    tier: "플래티넘",
    style: "사격 및 서바이벌",
    timestamp: "2024-01-14 15:45"
  },
]

export default function WaitlistManagementPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGame, setSelectedGame] = useState<string>("all")
  
  const games = ["all", "리그 오브 레전드", "발로란트", "오버워치 2", "배틀그라운드"]

  const filteredWaitlist = waitlistItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesGame = selectedGame === "all" || item.game === selectedGame
    return matchesSearch && matchesGame
  })

  const handleContact = (item: typeof waitlistItems[0]) => {
    alert(`"${item.name}"님에게 연락하는 기능은 곧 구현될 예정입니다.`)
  }

  const handleMarkAsContacted = (id: number) => {
    alert(`연락 완료 표시 기능 (ID: ${id})은 곧 구현될 예정입니다.`)
  }

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
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="이름 또는 이메일로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
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
              {filteredWaitlist.filter(w => w.game === "리그 오브 레전드").length}
            </div>
            <div className="text-sm text-muted-foreground mt-1">리그오브레전드</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {filteredWaitlist.filter(w => w.game === "발로란트").length}
            </div>
            <div className="text-sm text-muted-foreground mt-1">발로란트</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">
              {filteredWaitlist.filter(w => w.game === "오버워치 2").length}
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
          {filteredWaitlist.length === 0 ? (
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
                    <TableHead>작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWaitlist.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-primary" />
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
                        <Badge variant="outline">{item.game}</Badge>
                      </TableCell>
                      <TableCell>{item.tier}</TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate text-sm">
                          {item.style}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {item.timestamp}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleContact(item)}
                          >
                            <Send className="w-4 h-4 mr-1" />
                            연락
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsContacted(item.id)}
                          >
                            <UserCheck className="w-4 h-4 text-green-600" />
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

