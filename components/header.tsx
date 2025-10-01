"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChatbotModal } from "@/components/chatbot-modal"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"

export function Header() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)

  return (
    <>
      <header className="w-full bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="text-xl font-bold text-foreground">GameCoach.AI</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center space-x-1 text-foreground hover:text-primary transition-colors">
                  <span>GCA 소개</span>
                  <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem asChild>
                    <Link href="#company">회사 소개</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="#team">팀 소개</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="#history">연혁</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="#location">오시는 길</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Link href="/coaches" className="text-foreground hover:text-primary transition-colors">
                코치 목록
              </Link>
              <a href="#reviews" className="text-foreground hover:text-primary transition-colors">
                수업후기
              </a>
              <a href="#notice" className="text-foreground hover:text-primary transition-colors">
                공지사항
              </a>
            </nav>

            {/* Login Button */}
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="text-foreground hover:text-primary"
                >
                  로그인
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <ChatbotModal isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />
    </>
  )
}
