'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { LoginForm } from '@/components/auth/LoginForm'
import { SchoolCodeForm } from '@/components/auth/SchoolCodeForm'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Suspense } from 'react'

function SignInContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  const [activeTab, setActiveTab] = useState('student')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-600">
            Welcome to LearnKick!
          </CardTitle>
          <CardDescription>
            Choose how you want to sign in
          </CardDescription>
          {error && (
            <div className="mt-2 p-2 bg-red-100 text-red-700 rounded-md text-sm">
              {error === 'CredentialsSignin' && 'Invalid email or password'}
              {error === 'OAuthAccountNotLinked' && 'Email already registered with different provider'}
              {error !== 'CredentialsSignin' && error !== 'OAuthAccountNotLinked' && `Error: ${error}`}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="student">Student</TabsTrigger>
              <TabsTrigger value="login">Email</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="student" className="mt-4">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600">
                  For students: Enter your school code and name
                </p>
              </div>
              <SchoolCodeForm callbackUrl={callbackUrl} />
            </TabsContent>

            <TabsContent value="login" className="mt-4">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600">
                  For teachers, parents, and admins
                </p>
              </div>
              <LoginForm callbackUrl={callbackUrl} />
            </TabsContent>

            <TabsContent value="register" className="mt-4">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600">
                  Create a new account or school
                </p>
              </div>
              <RegisterForm callbackUrl={callbackUrl} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  )
}
