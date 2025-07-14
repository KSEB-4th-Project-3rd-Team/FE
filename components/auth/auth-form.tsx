"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Warehouse, Eye, EyeOff, Loader2 } from "lucide-react"
// import { authService, type User } from "@/lib/auth" // Removed for Spring backend integration
import type { User } from "@/app/(main)/layout"

interface AuthFormProps {
  onAuthSuccess: (user: User) => void
}

export default function AuthForm({ onAuthSuccess }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    fullName: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError("")
  }

  const validateForm = () => {
    if (!formData.username || !formData.password) {
      setError("아이디와 비밀번호를 입력해주세요.")
      return false
    }

    if (!isLogin) {
      if (!formData.fullName) {
        setError("이름을 입력해주세요.")
        return false
      }
      if (formData.password !== formData.confirmPassword) {
        setError("비밀번호가 일치하지 않습니다.")
        return false
      }
      if (formData.password.length < 6) {
        setError("비밀번호는 최소 6자 이상이어야 합니다.")
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setError("")

    try {
      if (isLogin) {
        // Mock login success
        setTimeout(() => {
          onAuthSuccess({ id: "1", username: formData.username, fullName: "Test User", role: "Admin" })
          setIsLoading(false)
        }, 1000)
      } else {
        // Mock registration success
        setTimeout(() => {
          alert("회원가입이 완료되었습니다. 로그인해주세요.")
          setIsLogin(true)
          setFormData({
            username: formData.username,
            password: "",
            fullName: "",
            confirmPassword: "",
          })
          setIsLoading(false)
        }, 1000)
      }
    } catch (err) {
      setError("오류가 발생했습니다. 다시 시도해주세요.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
              <Warehouse className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-blue-600">AGV WMS</CardTitle>
          <p className="text-gray-600">창고 관리 시스템</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <Label htmlFor="fullName">이름</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="이름을 입력하세요"
                  disabled={isLoading}
                />
              </div>
            )}

            <div>
              <Label htmlFor="username">아이디</Label>
              <Input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="아이디를 입력하세요"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="password">비밀번호</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="비밀번호를 입력하세요"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="비밀번호를 다시 입력하세요"
                  disabled={isLoading}
                />
              </div>
            )}

            {error && <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isLogin ? "로그인 중..." : "회원가입 중..."}
                </>
              ) : isLogin ? (
                "로그인"
              ) : (
                "회원가입"
              )}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={() => {
                  setIsLogin(!isLogin)
                  setError("")
                  setFormData({
                    username: "",
                    password: "",
                    fullName: "",
                    confirmPassword: "",
                  })
                }}
                disabled={isLoading}
              >
                {isLogin ? "계정이 없으신가요? 회원가입" : "이미 계정이 있으신가요? 로그인"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
