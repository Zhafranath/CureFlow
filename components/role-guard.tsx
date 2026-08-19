'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Role } from '@/lib/store'
import { useApp } from '@/lib/store'

export function RoleGuard({
  role,
  children,
}: {
  role: Role
  children: React.ReactNode
}) {
  const { user } = useApp()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    if (!user) {
      router.replace('/login')
    } else if (user.role !== role) {
      router.replace(`/${user.role}`)
    }
  }, [user, role, router, mounted])

  if (!mounted || !user || user.role !== role) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    )
  }

  return <>{children}</>
}
