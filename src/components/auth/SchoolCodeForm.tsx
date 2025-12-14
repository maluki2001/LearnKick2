'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface SchoolCodeFormProps {
  callbackUrl?: string
}

export function SchoolCodeForm({ callbackUrl = '/' }: SchoolCodeFormProps) {
  const [schoolCode, setSchoolCode] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [grade, setGrade] = useState('3')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('school-code', {
        schoolCode: schoolCode.toUpperCase(),
        playerName,
        grade,
        redirect: false,
      })

      if (result?.error) {
        if (result.error === 'CredentialsSignin') {
          setError('Invalid school code. Ask your teacher for the correct code.')
        } else {
          setError(result.error)
        }
      } else {
        window.location.href = callbackUrl
      }
    } catch {
      setError('Something went wrong. Please try again.')
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
          className="text-center text-xl tracking-widest uppercase"
          maxLength={10}
        />
        <p className="text-xs text-gray-500">
          Ask your teacher for the school code
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="playerName">Your Name</Label>
        <Input
          id="playerName"
          type="text"
          placeholder="Enter your name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="grade">Your Grade</Label>
        <Select value={grade} onValueChange={setGrade} disabled={isLoading}>
          <SelectTrigger>
            <SelectValue placeholder="Select your grade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Grade 1</SelectItem>
            <SelectItem value="2">Grade 2</SelectItem>
            <SelectItem value="3">Grade 3</SelectItem>
            <SelectItem value="4">Grade 4</SelectItem>
            <SelectItem value="5">Grade 5</SelectItem>
            <SelectItem value="6">Grade 6</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Joining...' : "Let's Play!"}
      </Button>
    </form>
  )
}
