"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error | null; resetError: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
    })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />
      }

      return (
        <ErrorFallback error={this.state.error} resetError={this.resetError} />
      )
    }

    return this.props.children
  }
}

interface ErrorFallbackProps {
  error: Error | null
  resetError: () => void
}

function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const isNetworkError = error?.message?.includes("fetch") || 
                        error?.message?.includes("network") ||
                        error?.message?.includes("Failed to fetch")

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="w-16 h-16 text-destructive" />
          </div>
          <CardTitle className="text-2xl">오류가 발생했습니다</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-muted-foreground mb-2">
              {isNetworkError 
                ? "네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요."
                : "예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요."}
            </p>
            {process.env.NODE_ENV === "development" && error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-muted-foreground mb-2">
                  오류 상세 정보
                </summary>
                <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                  {error.message}
                  {error.stack && `\n\n${error.stack}`}
                </pre>
              </details>
            )}
          </div>
          
          <div className="flex flex-col gap-2">
            <Button onClick={resetError} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              다시 시도
            </Button>
            <Link href="/" className="w-full">
              <Button variant="outline" className="w-full">
                <Home className="w-4 h-4 mr-2" />
                홈으로 돌아가기
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
