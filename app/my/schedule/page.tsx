"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Loader2, Save, Settings } from "lucide-react"
import { checkAuth, type User } from "@/lib/auth"
import { toast } from "sonner"
import { fetchWithCsrf } from "@/lib/csrf-client"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Schedule {
  dayOfWeek: number
  enabled: boolean
  startTime: string
  endTime: string
}

const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']

export default function SchedulePage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [tempStartTime, setTempStartTime] = useState('00:00')
  const [tempEndTime, setTempEndTime] = useState('23:30')

  // 30분 간격 시간 목록 생성 (00:00 ~ 23:30)
  const generateTimeOptions = () => {
    const times: string[] = []
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
        times.push(timeString)
      }
    }
    return times
  }

  const timeOptions = generateTimeOptions()

  useEffect(() => {
    async function loadSchedule() {
      try {
        const user = await checkAuth()
        if (!user || user.role !== 'coach') {
          router.push('/login')
          return
        }
        setCurrentUser(user)

        const response = await fetch('/api/coaches/my/schedule')
        const result = await response.json()

        if (result.success && result.data) {
          setSchedules(result.data)
        } else {
          // 기본 일정 설정 (모두 활성화, 00:00 ~ 23:30)
          const defaultSchedules: Schedule[] = Array.from({ length: 7 }, (_, i) => ({
            dayOfWeek: i,
            enabled: true,
            startTime: '00:00',
            endTime: '23:30',
          }))
          setSchedules(defaultSchedules)
        }
      } catch (error) {
        console.error('일정 로드 실패:', error)
        toast.error('일정을 불러오는 중 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }

    loadSchedule()
  }, [router])

  const handleToggle = (dayOfWeek: number) => {
    setSchedules(prev => prev.map(schedule => 
      schedule.dayOfWeek === dayOfWeek
        ? { ...schedule, enabled: !schedule.enabled }
        : schedule
    ))
  }

  const handleOpenSettings = (schedule: Schedule) => {
    setEditingSchedule(schedule)
    setTempStartTime(schedule.startTime)
    setTempEndTime(schedule.endTime)
    setIsDialogOpen(true)
  }

  const handleSaveSettings = () => {
    if (!editingSchedule) return

    // 시간 유효성 검사
    if (tempStartTime >= tempEndTime) {
      toast.error('시작 시간은 종료 시간보다 이전이어야 합니다.')
      return
    }

    setSchedules(prev => prev.map(schedule =>
      schedule.dayOfWeek === editingSchedule.dayOfWeek
        ? { ...schedule, startTime: tempStartTime, endTime: tempEndTime }
        : schedule
    ))

    setIsDialogOpen(false)
    setEditingSchedule(null)
  }

  const handleSubmit = async () => {
    setSaving(true)

    try {
      const response = await fetchWithCsrf('/api/coaches/my/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ schedules }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('일정이 저장되었습니다.')
      } else {
        toast.error(result.message || '일정 저장에 실패했습니다.')
      }
    } catch (error) {
      console.error('일정 저장 실패:', error)
      toast.error('일정 저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[var(--primary01)] mx-auto mb-4" />
          <p className="text-[var(--text04)]">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold mb-2">일정 관리</h1>
        <p className="text-[var(--text04)] text-xs">
          주간 일정을 설정하여 학생들이 예약할 수 있는 시간을 관리할 수 있습니다.
        </p>
      </div>

      <div className="space-y-4 mb-6">
        {schedules.map((schedule) => (
          <Card key={schedule.dayOfWeek} className="bg-card">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{dayNames[schedule.dayOfWeek]}</h3>
                  <p className="text-xs text-[var(--text04)]">
                    {schedule.startTime} ~ {schedule.endTime}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={schedule.enabled}
                      onCheckedChange={() => handleToggle(schedule.dayOfWeek)}
                    />
                    <Label className="text-sm">
                      {schedule.enabled ? '활성화' : '비활성화'}
                    </Label>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenSettings(schedule)}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    설정
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              저장 중...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              저장
            </>
          )}
        </Button>
      </div>

      {/* 시간 설정 다이얼로그 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <DialogHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="text-lg font-semibold text-foreground mb-2">
                  {editingSchedule && dayNames[editingSchedule.dayOfWeek]}
                </DialogTitle>
                <p className="text-xl font-medium text-foreground">
                  {tempStartTime} ~ {tempEndTime}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  취소
                </Button>
                <Button onClick={handleSaveSettings} className="bg-[var(--primary01)] hover:bg-[var(--primary02)]">
                  저장
                </Button>
              </div>
            </div>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <Label className="text-sm text-[var(--text04)] mb-2 block">시작</Label>
                <Select value={tempStartTime} onValueChange={setTempStartTime}>
                  <SelectTrigger className="w-full">
                    <SelectValue>{tempStartTime}</SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <span className="text-[var(--text04)] mt-8">~</span>
              <div className="flex-1">
                <Label className="text-sm text-[var(--text04)] mb-2 block">종료</Label>
                <Select value={tempEndTime} onValueChange={setTempEndTime}>
                  <SelectTrigger className="w-full">
                    <SelectValue>{tempEndTime}</SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

