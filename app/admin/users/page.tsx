"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Edit, Trash2, RefreshCw, UserCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"

interface User {
  id: number
  username: string
  email: string
  role: 'user' | 'admin' | 'coach'
  createdAt: string | Date
  updatedAt: string | Date
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterRole, setFilterRole] = useState<string>("all")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    role: "user" as 'user' | 'admin' | 'coach',
  })

  // 유저 목록 조회
  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (filterRole !== 'all') params.append('role', filterRole)

      const response = await fetch(`/api/users?${params.toString()}`, {
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
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [searchQuery, filterRole])

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setFormData({
      username: user.username,
      email: user.email,
      role: user.role,
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateUser = async () => {
    if (!editingUser) return

    try {
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setIsEditDialogOpen(false)
          fetchUsers()
        } else {
          alert(result.message || '유저 수정 중 오류가 발생했습니다.')
        }
      } else {
        const result = await response.json()
        alert(result.message || '유저 수정 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('Failed to update user:', error)
      alert('유저 수정 중 오류가 발생했습니다.')
    }
  }

  const handleDeleteUser = async (id: number, username: string) => {
    if (!confirm(`정말 "${username}"님의 계정을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
      return
    }

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          fetchUsers()
        } else {
          alert(result.message || '유저 삭제 중 오류가 발생했습니다.')
        }
      } else {
        const result = await response.json()
        alert(result.message || '유저 삭제 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('Failed to delete user:', error)
      alert('유저 삭제 중 오류가 발생했습니다.')
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'default'
      case 'coach':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return '관리자'
      case 'coach':
        return '코치'
      default:
        return '일반 사용자'
    }
  }

  const totalUsers = users.length
  const adminUsers = users.filter(u => u.role === 'admin').length
  const coachUsers = users.filter(u => u.role === 'coach').length
  const normalUsers = users.filter(u => u.role === 'user').length

  return (
    <div className="p-8 space-y-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">유저 관리</h1>
          <p className="text-muted-foreground mt-1">
            등록된 모든 유저를 관리할 수 있습니다.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchUsers}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          새로고침
        </Button>
      </div>

      {/* 검색 및 필터 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="이메일 또는 닉네임으로 검색... (최대 100자)"
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
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              <span className="text-sm text-muted-foreground self-center">역할:</span>
              <Button
                variant={filterRole === "all" ? "default" : "outline"}
                onClick={() => setFilterRole("all")}
                size="sm"
              >
                전체
              </Button>
              <Button
                variant={filterRole === "user" ? "default" : "outline"}
                onClick={() => setFilterRole("user")}
                size="sm"
              >
                일반 사용자
              </Button>
              <Button
                variant={filterRole === "admin" ? "default" : "outline"}
                onClick={() => setFilterRole("admin")}
                size="sm"
              >
                관리자
              </Button>
              <Button
                variant={filterRole === "coach" ? "default" : "outline"}
                onClick={() => setFilterRole("coach")}
                size="sm"
              >
                코치
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalUsers}</div>
            <div className="text-sm text-muted-foreground mt-1">총 유저 수</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {normalUsers}
            </div>
            <div className="text-sm text-muted-foreground mt-1">일반 사용자</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">
              {adminUsers}
            </div>
            <div className="text-sm text-muted-foreground mt-1">관리자</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {coachUsers}
            </div>
            <div className="text-sm text-muted-foreground mt-1">코치</div>
          </CardContent>
        </Card>
      </div>

      {/* 유저 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>유저 목록</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-4">유저를 불러오는 중...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">검색 결과가 없습니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>닉네임</TableHead>
                    <TableHead>이메일</TableHead>
                    <TableHead>역할</TableHead>
                    <TableHead>가입일</TableHead>
                    <TableHead>작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(user => {
                    const createdAt = typeof user.createdAt === 'string'
                      ? new Date(user.createdAt)
                      : user.createdAt

                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="font-medium">{user.id}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <UserCircle className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{user.username}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{user.email}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {getRoleLabel(user.role)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {format(createdAt, 'yyyy-MM-dd HH:mm', { locale: ko })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditUser(user)}
                              title="유저 정보 수정"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id, user.username)}
                              title="유저 삭제"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
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

      {/* 유저 수정 다이얼로그 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>유저 정보 수정</DialogTitle>
            <DialogDescription>
              유저의 정보를 수정할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="username">닉네임</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                placeholder="닉네임 입력 (2-20자)"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="이메일 입력"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">역할</Label>
              <Select
                value={formData.role}
                onValueChange={(value: 'user' | 'admin' | 'coach') => setFormData(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">일반 사용자</SelectItem>
                  <SelectItem value="admin">관리자</SelectItem>
                  <SelectItem value="coach">코치</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleUpdateUser}>
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

