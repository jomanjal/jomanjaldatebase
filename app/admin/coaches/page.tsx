"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Edit, Trash2, Star } from "lucide-react"
import { useState } from "react"
import { instructors } from "@/lib/instructors"

export default function CoachesManagementPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGame, setSelectedGame] = useState<string>("all")
  
  const games = ["all", "리그 오브 레전드", "발로란트", "오버워치 2", "배틀그라운드"]

  const filteredCoaches = instructors.filter(coach => {
    const matchesSearch = coach.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          coach.specialty.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesGame = selectedGame === "all" || coach.specialty === selectedGame
    return matchesSearch && matchesGame
  })

  const handleAddCoach = () => {
    alert("코치 추가 기능은 곧 구현될 예정입니다.")
  }

  const handleEditCoach = (id: number) => {
    alert(`코치 수정 기능 (ID: ${id})은 곧 구현될 예정입니다.`)
  }

  const handleDeleteCoach = (id: number, name: string) => {
    if (confirm(`정말 ${name} 코치를 삭제하시겠습니까?`)) {
      alert(`코치 삭제 기능 (ID: ${id})은 곧 구현될 예정입니다.`)
    }
  }

  return (
    <div className="p-8 space-y-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">코치 관리</h1>
          <p className="text-muted-foreground mt-1">
            등록된 코치를 관리하고 새로운 코치를 추가할 수 있습니다.
          </p>
        </div>
        <Button onClick={handleAddCoach} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          코치 추가
        </Button>
      </div>

      {/* 검색 및 필터 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="코치 이름 또는 게임으로 검색..."
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
            <div className="text-2xl font-bold">{filteredCoaches.length}</div>
            <div className="text-sm text-muted-foreground mt-1">총 코치 수</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {filteredCoaches.reduce((sum, c) => sum + (c.students || 0), 0)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">총 수강생</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {(filteredCoaches.reduce((sum, c) => sum + c.rating, 0) / filteredCoaches.length || 0).toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">평균 평점</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {filteredCoaches.reduce((sum, c) => sum + c.reviews, 0)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">총 리뷰 수</div>
          </CardContent>
        </Card>
      </div>

      {/* 코치 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>코치 목록</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCoaches.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">검색 결과가 없습니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>코치</TableHead>
                    <TableHead>전문 분야</TableHead>
                    <TableHead>티어</TableHead>
                    <TableHead>평점</TableHead>
                    <TableHead>수강생</TableHead>
                    <TableHead>리뷰</TableHead>
                    <TableHead>작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCoaches.map(coach => (
                    <TableRow key={coach.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-bold text-primary">
                              {coach.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">{coach.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {coach.experience} 경력
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{coach.specialty}</Badge>
                      </TableCell>
                      <TableCell>{coach.tier}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{coach.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell>{coach.students || 0}명</TableCell>
                      <TableCell>{coach.reviews}건</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditCoach(coach.id)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCoach(coach.id, coach.name)}
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

