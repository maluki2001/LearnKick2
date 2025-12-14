'use client'

import { useState } from 'react'
import { authClient } from '@/lib/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface RegisterFormProps {
  callbackUrl?: string
}

export function RegisterForm({ callbackUrl = '/' }: RegisterFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<'admin' | 'parent'>('parent')
  const [schoolCode, setSchoolCode] = useState('')
  const [schoolName, setSchoolName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    // Validate password
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      setIsLoading(false)
      return
    }

    try {
      const result = await authClient.register({
        email,
        password,
        fullName,
        role,
        schoolCode: role === 'parent' ? schoolCode : undefined,
        schoolName: role === 'admin' ? schoolName : undefined,
      })

      if (result.error) {
        setError(result.error.message)
      } else {
        setSuccess('Account created! Redirecting...')
        setTimeout(() => {
          window.location.href = callbackUrl
        }, 1000)
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-2 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-2 bg-green-100 text-green-700 rounded-md text-sm">
          {success}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="role">I am a...</Label>
        <Select value={role} onValueChange={(v) => setRole(v as 'admin' | 'parent')} disabled={isLoading}>
          <SelectTrigger>
            <SelectValue placeholder="Select your role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="parent">Parent (join existing school)</SelectItem>
            <SelectItem value="admin">School Admin (create new school)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          type="text"
          placeholder="John Doe"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
          minLength={8}
        />
      </div>

      {role === 'parent' && (
        <div className="space-y-2">
          <Label htmlFor="schoolCode">School Code</Label>
          <Input
            id="schoolCode"
            type="text"
            placeholder="ABC123"
            value={schoolCode}
            onChange={(e) => setSchoolCode(e.target.value.toUpperCase())}
            required
            disabled={isLoading}
            className="uppercase"
          />
          <p className="text-xs text-gray-500">
            Ask your child&apos;s school for their code
          </p>
        </div>
      )}

      {role === 'admin' && (
        <div className="space-y-2">
          <Label htmlFor="schoolName">School Name</Label>
          <Input
            id="schoolName"
            type="text"
            placeholder="Springfield Elementary"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            required
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500">
            A unique code will be generated for your school
          </p>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </Button>
    </form>
  )
}
