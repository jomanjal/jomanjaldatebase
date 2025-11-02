"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { checkAuth, logout, type User } from "@/lib/auth"
import Link from "next/link"
import { 
  LayoutDashboard, 
  BookOpen,
  LogOut,
  UserCircle,
  Home
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function MyPageLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [authenticated, setAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function verifyAuth() {
      try {
        // 서버에서 토큰 검증
        const user = await checkAuth()
        
        if (!user) {
          router.push("/login")
          return
        }
        
        // 코치 권한 확인
        if (user.role !== 'coach') {
          router.push("/")
          return
        }
        
        setAuthenticated(true)
        setCurrentUser(user)
      } catch (error) {
        console.error('Auth verification error:', error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }
    
    verifyAuth()
  }, [router])

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarContent>
            <div className="p-4 border-b">
              <div className="flex items-center gap-2">
                <UserCircle className="w-6 h-6 text-primary" />
                <div>
                  <h2 className="text-lg font-bold text-sidebar-foreground">
                    마이페이지
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    GameCoach.AI
                  </p>
                </div>
              </div>
            </div>
            
            <SidebarGroup>
              <SidebarGroupLabel>메뉴</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/my">
                        <LayoutDashboard className="w-5 h-5" />
                        <span>대시보드</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/my/course">
                        <BookOpen className="w-5 h-5" />
                        <span>강의 관리</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* 홈으로 이동 링크 */}
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/">
                        <Home className="w-5 h-5" />
                        <span>홈으로</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <div className="p-4 border-t">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">
                    {currentUser?.username.charAt(0).toUpperCase() || "C"}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium">{currentUser?.username}</p>
                  <p className="text-xs text-muted-foreground">코치</p>
                </div>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              로그아웃
            </Button>
          </div>
        </Sidebar>
        
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}

