"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { isAuthenticated, getCurrentUser, logout } from "@/lib/auth"
import Link from "next/link"
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  ListChecks,
  LogOut,
  Shield
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [authenticated, setAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<{ username: string } | null>(null)

  useEffect(() => {
    const auth = isAuthenticated()
    const user = getCurrentUser()
    
    if (!auth || user?.username !== "admin112") {
      router.push("/login")
      return
    }
    
    setAuthenticated(true)
    setCurrentUser(user)
  }, [router])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (!authenticated) {
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
                <Shield className="w-6 h-6 text-primary" />
                <div>
                  <h2 className="text-lg font-bold text-sidebar-foreground">
                    관리자 패널
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
                      <Link href="/admin">
                        <LayoutDashboard className="w-5 h-5" />
                        <span>대시보드</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/admin/coaches">
                        <Users className="w-5 h-5" />
                        <span>코치 관리</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/admin/reviews">
                        <MessageSquare className="w-5 h-5" />
                        <span>리뷰 관리</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/admin/waitlist">
                        <ListChecks className="w-5 h-5" />
                        <span>웨이팅 리스트</span>
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
                    {currentUser?.username.charAt(0).toUpperCase() || "A"}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium">{currentUser?.username}</p>
                  <p className="text-xs text-muted-foreground">관리자</p>
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

