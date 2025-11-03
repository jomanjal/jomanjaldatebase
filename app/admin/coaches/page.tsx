"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Plus, Edit, Trash2, Star, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"

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
  verified: boolean
}

export default function CoachesManagementPage() {
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGame, setSelectedGame] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    specialty: "",
    tier: "",
    experience: "",
    price: "",
    specialtyInput: "",
    description: "",
    verified: false,
  })
  
  const games = ["all", "리그 오브 레전드", "발로란트", "오버워치 2", "배틀그라운드"]
  
  // 게임별 티어 옵션 (강의관리와 동일)
  const gameTiers: Record<string, string[]> = {
    "리그 오브 레전드": ["아이언", "브론즈", "실버", "골드", "플래티넘", "에메랄드", "다이아", "마스터", "그랜드마스터", "챌린저"],
    "발로란트": ["아이언", "브론즈", "실버", "골드", "플래티넘", "다이아", "초월자", "불멸", "레디언트"],
    "오버워치 2": ["브론즈", "실버", "골드", "플래티넘", "다이아", "마스터", "그랜드마스터"],
    "배틀그라운드": ["브론즈", "실버", "골드", "플래티넘", "다이아", "마스터"],
  }
  
  // 현재 선택한 게임에 해당하는 티어 옵션 가져오기
  const getTierOptions = () => {
    if (!formData.specialty) return []
    return gameTiers[formData.specialty] || []
  }

  // 코치 목록 조회
  const fetchCoaches = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (selectedGame !== 'all') params.append('specialty', selectedGame)
      params.append('admin', 'true')

      const response = await fetch(`/api/coaches?${params.toString()}`, {
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
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCoaches()
  }, [searchQuery, selectedGame])

  const handleAddCoach = () => {
    setFormData({
      name: "",
      specialty: "",
      tier: "",
      experience: "",
      price: "",
      specialtyInput: "",
      description: "",
      verified: false,
    })
    setIsAddDialogOpen(true)
  }
  
  // 게임 변경 시 티어 처리
  const handleSpecialtyChange = (value: string) => {
    const newTierOptions = gameTiers[value] || []
    // 현재 티어가 새 게임의 티어 목록에 없으면 빈 문자열로 설정
    const newTier = formData.tier && newTierOptions.includes(formData.tier) ? formData.tier : ""
    setFormData({ ...formData, specialty: value, tier: newTier })
  }

  const handleEditCoach = (coach: Coach) => {
    setEditingCoach(coach)
    setFormData({
      name: coach.name,
      specialty: coach.specialty,
      tier: coach.tier,
      experience: coach.experience,
      price: coach.price || "",
      specialtyInput: coach.specialties.join(', '),
      description: coach.description || "",
      verified: coach.verified,
    })
    setIsEditDialogOpen(true)
  }

  const handleSaveCoach = async () => {
    if (!formData.name || !formData.specialty || !formData.tier || !formData.experience) {
      alert('이름, 전문 분야, 티어, 경력은 필수 입력 항목입니다.')
      return
    }

    try {
      const specialties = formData.specialtyInput
        ? formData.specialtyInput.split(',').map(s => s.trim()).filter(s => s)
        : []

      const data = {
        name: formData.name,
        specialty: formData.specialty,
        tier: formData.tier,
        experience: formData.experience,
        price: formData.price || null,
        specialties: specialties,
        description: formData.description || null,
        verified: formData.verified,
      }

      const url = editingCoach ? `/api/coaches/${editingCoach.id}` : '/api/coaches'
      const method = editingCoach ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setIsAddDialogOpen(false)
          setIsEditDialogOpen(false)
          setEditingCoach(null)
          fetchCoaches()
        } else {
          alert(result.message || '저장 중 오류가 발생했습니다.')
        }
      } else {
        const result = await response.json()
        alert(result.message || '저장 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('Failed to save coach:', error)
      alert('저장 중 오류가 발생했습니다.')
    }
  }

  const handleDeleteCoach = async (id: number, name: string) => {
    if (!confirm(`정말 ${name} 코치를 삭제하시겠습니까?`)) {
      return
    }

    try {
      const response = await fetch(`/api/coaches/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          fetchCoaches()
        } else {
          alert(result.message || '삭제 중 오류가 발생했습니다.')
        }
      } else {
        const result = await response.json()
        alert(result.message || '삭제 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('Failed to delete coach:', error)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  const filteredCoaches = coaches

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
        <div className="flex gap-2">
          <Button onClick={fetchCoaches} variant="outline" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
          <Button onClick={handleAddCoach} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            코치 추가
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
                placeholder="코치 이름 또는 게임으로 검색... (최대 100자)"
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
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-4">로딩 중...</p>
            </div>
          ) : filteredCoaches.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">검색 결과가 없습니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>코치</TableHead>
                    <TableHead>전문 분야</TableHead>
                    <TableHead>티어</TableHead>
                    <TableHead>평점</TableHead>
                    <TableHead>수강생</TableHead>
                    <TableHead>리뷰</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCoaches.map(coach => (
                    <TableRow key={coach.id}>
                      <TableCell>
                        <div className="font-medium">{coach.id}</div>
                      </TableCell>
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
                          <span className="font-medium">{coach.rating.toFixed(1)}</span>
                        </div>
                      </TableCell>
                      <TableCell>{coach.students || 0}명</TableCell>
                      <TableCell>{coach.reviews}건</TableCell>
                      <TableCell>
                        {coach.verified ? (
                          <Badge className="bg-green-500">인증됨</Badge>
                        ) : (
                          <Badge variant="outline">미인증</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditCoach(coach)}
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

      {/* 코치 추가 다이얼로그 */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>코치 추가</DialogTitle>
            <DialogDescription>
              새로운 코치 정보를 입력하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">이름 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="코치 이름"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="specialty">전문 분야 *</Label>
                <Select value={formData.specialty} onValueChange={handleSpecialtyChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="게임 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {games.filter(g => g !== 'all').map(game => (
                      <SelectItem key={game} value={game}>{game}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="tier">티어 *</Label>
                <Select value={formData.tier} onValueChange={(value) => setFormData({ ...formData, tier: value })} disabled={!formData.specialty}>
                  <SelectTrigger>
                    <SelectValue placeholder={formData.specialty ? "티어 선택" : "게임을 먼저 선택하세요"} />
                  </SelectTrigger>
                  <SelectContent>
                    {getTierOptions().map(tier => (
                      <SelectItem key={tier} value={tier}>{tier}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="experience">경력 *</Label>
                <Input
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  placeholder="예: 5년"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">가격</Label>
              <Input
                id="price"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="예: 50,000원/시간"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="specialtyInput">전문 기술 (쉼표로 구분)</Label>
              <Input
                id="specialtyInput"
                value={formData.specialtyInput}
                onChange={(e) => setFormData({ ...formData, specialtyInput: e.target.value })}
                placeholder="예: 정글, 미드, 라인전"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="코치에 대한 설명을 입력하세요."
                rows={4}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="verified"
                checked={formData.verified}
                onCheckedChange={(checked) => setFormData({ ...formData, verified: checked === true })}
              />
              <Label htmlFor="verified" className="cursor-pointer">
                인증된 코치
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSaveCoach}>
              추가
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 코치 수정 다이얼로그 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>코치 수정</DialogTitle>
            <DialogDescription>
              코치 정보를 수정하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">이름 *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="코치 이름"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-specialty">전문 분야 *</Label>
                <Select value={formData.specialty} onValueChange={handleSpecialtyChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="게임 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {games.filter(g => g !== 'all').map(game => (
                      <SelectItem key={game} value={game}>{game}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-tier">티어 *</Label>
                <Select value={formData.tier} onValueChange={(value) => setFormData({ ...formData, tier: value })} disabled={!formData.specialty}>
                  <SelectTrigger>
                    <SelectValue placeholder={formData.specialty ? "티어 선택" : "게임을 먼저 선택하세요"} />
                  </SelectTrigger>
                  <SelectContent>
                    {getTierOptions().map(tier => (
                      <SelectItem key={tier} value={tier}>{tier}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-experience">경력 *</Label>
                <Input
                  id="edit-experience"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  placeholder="예: 5년"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-price">가격</Label>
              <Input
                id="edit-price"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="예: 50,000원/시간"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-specialtyInput">전문 기술 (쉼표로 구분)</Label>
              <Input
                id="edit-specialtyInput"
                value={formData.specialtyInput}
                onChange={(e) => setFormData({ ...formData, specialtyInput: e.target.value })}
                placeholder="예: 정글, 미드, 라인전"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">설명</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="코치에 대한 설명을 입력하세요."
                rows={4}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-verified"
                checked={formData.verified}
                onCheckedChange={(checked) => setFormData({ ...formData, verified: checked === true })}
              />
              <Label htmlFor="edit-verified" className="cursor-pointer">
                인증된 코치
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSaveCoach}>
              수정
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
