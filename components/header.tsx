"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChatbotModal } from "@/components/chatbot-modal"

export function Header() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)

  return (
    <>
      <header className="w-full bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="text-xl font-bold text-foreground">GameCoach.AI</span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#coaches" className="text-foreground hover:text-primary transition-colors">
                코치찾기
              </a>
              <a href="#lessons" className="text-foreground hover:text-primary transition-colors">
                수업듣기
              </a>
              <a href="#manage" className="text-foreground hover:text-primary transition-colors">
                수업관리
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
