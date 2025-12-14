'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { authClient } from '@/lib/useAuth'
import { AlertCircle, RefreshCw, Trash2 } from 'lucide-react'

export function AuthDebugPanel() {
  const [isClearing, setIsClearing] = useState(false)
  const [status, setStatus] = useState('')

  const clearAuthData = async () => {
    setIsClearing(true)
    setStatus('Clearing authentication data...')

    try {
      await authClient.clearAllAuthData()
      setStatus('✅ Auth data cleared! Please refresh the page.')

      // Force page refresh after a short delay
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      setStatus(`❌ Error: ${error}`)
    } finally {
      setIsClearing(false)
    }
  }

  const checkAuthStatus = () => {
    try {
      const user = authClient.getUser()
      if (user) {
        setStatus(`✅ Logged in as: ${user.email} (DEV MODE)`)
      } else {
        setStatus('ℹ️ No active session (DEV MODE)')
      }
    } catch (error) {
      setStatus(`❌ Check failed: ${error}`)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-center mb-4">
        <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
        <h3 className="font-medium text-yellow-800">Authentication Debug</h3>
      </div>
      
      <p className="text-sm text-yellow-700 mb-4">
        If you&apos;re seeing &quot;Invalid Refresh Token&quot; errors, click below to clear all authentication data.
      </p>

      <div className="space-y-3">
        <Button
          onClick={checkAuthStatus}
          variant="secondary"
          className="w-full flex items-center justify-center"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Check Auth Status
        </Button>

        <Button
          onClick={clearAuthData}
          disabled={isClearing}
          variant="secondary"
          className="w-full flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          {isClearing ? 'Clearing...' : 'Clear Auth Data'}
        </Button>

        {status && (
          <div className="p-3 bg-white rounded border text-sm">
            {status}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-yellow-200">
        <p className="text-xs text-yellow-600">
          Manual fix: Open DevTools → Application → Local Storage → Delete all &quot;supabase&quot; entries
        </p>
      </div>
    </div>
  )
}