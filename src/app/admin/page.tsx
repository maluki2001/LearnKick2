'use client'

import { useEffect } from 'react'
import { AdminDashboard } from '@/components/admin/AdminDashboard'
import { AdminLogin } from '@/components/admin/AdminLogin'
import { useAuth } from '@/lib/useAuth'
import { hasRole } from '@/lib/auth-types'

export default function AdminPage() {
  const { user, isLoading } = useAuth()

  // Prevent page caching issues
  useEffect(() => {
    // Force disable caching for admin pages
    if (typeof window !== 'undefined') {
      const meta = document.createElement('meta')
      meta.httpEquiv = 'Cache-Control'
      meta.content = 'no-cache, no-store, must-revalidate'
      document.head.appendChild(meta)

      return () => {
        document.head.removeChild(meta)
      }
    }
  }, [])

  console.log('🔐 Admin Page Render:', { user: !!user, isLoading, userRole: user?.role })

  // Show loading while auth is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  // Show login if no user or user doesn't have at least teacher role
  // Role hierarchy: superadmin > admin > teacher > parent > student
  if (!user || !hasRole(user.role, 'teacher')) {
    console.log('🔐 Showing login screen - user:', user?.role || 'none')
    return <AdminLogin />
  }

  // Show admin dashboard for authenticated users with teacher+ role
  console.log('✅ Showing admin dashboard for:', user.email, user.role)
  return <AdminDashboard user={user} />
}