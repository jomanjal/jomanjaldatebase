"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, RefreshCw } from "lucide-react"

interface ErrorDisplayProps {
  error?: Error | string | null
  onRetry?: () => void
  message?: string
  className?: string
}

export function ErrorDisplay({ 
  error, 
  onRetry, 
  message,
  className = "" 
}: ErrorDisplayProps) {
  const isNetworkError = 
    (typeof error === "string" && (error.includes("fetch") || error.includes("network"))) ||
    (error instanceof Error && (error.message.includes("fetch") || error.message.includes("network")))

  const errorMessage = message || 
    (isNetworkError 
      ? "네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요."
      : "데이터를 불러오는 중 오류가 발생했습니다.")

  return (
    <div className={`flex justify-center items-center py-20 ${className}`}>
      <Card className="w-full max-w-md">
        <CardContent className="p-6 text-center space-y-4">
          <div className="flex justify-center">
            <AlertCircle className="w-12 h-12 text-destructive" />
          </div>
          <div>
            <p className="text-lg font-medium text-foreground mb-2">오류가 발생했습니다</p>
            <p className="text-sm text-muted-foreground">{errorMessage}</p>
          </div>
          {onRetry && (
            <Button onClick={onRetry} variant="outline" className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              다시 시도
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
