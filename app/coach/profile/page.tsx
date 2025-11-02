"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function CoachProfilePage() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace('/my/course')
  }, [router])
  
  return null
}
