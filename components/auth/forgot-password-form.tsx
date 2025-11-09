"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { api, endpoints } from "@/lib/api"

interface ForgotPasswordFormProps {
  onBack: () => void
  onReset: () => void
}

export function ForgotPasswordForm({ onBack, onReset }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("")
  const [token, setToken] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [step, setStep] = useState<"request" | "reset">("request")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [resetToken, setResetToken] = useState<string | null>(null)

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    if (!email) {
      setError("Vui lòng nhập email")
      setIsLoading(false)
      return
    }

    try {
      const result = await api.post<{ success: boolean; message: string; resetToken?: string }, { email: string }>(
        endpoints.forgotPassword,
        { email }
      )

      if (result.success) {
        setSuccess(result.message)
        if (result.resetToken) {
          setResetToken(result.resetToken)
          setStep("reset")
        } else {
          // In production, token would be sent via email
          setSuccess("Vui lòng kiểm tra email để lấy token reset password")
        }
      } else {
        setError(result.message || "Có lỗi xảy ra")
      }
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    if (!token && !resetToken) {
      setError("Vui lòng nhập token reset")
      setIsLoading(false)
      return
    }

    if (!newPassword || !confirmPassword) {
      setError("Vui lòng nhập đầy đủ thông tin")
      setIsLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp")
      setIsLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự")
      setIsLoading(false)
      return
    }

    try {
      const result = await api.post<{ success: boolean; message: string }, { token: string; newPassword: string }>(
        endpoints.resetPassword,
        { token: token || resetToken || "", newPassword }
      )

      if (result.success) {
        setSuccess("Mật khẩu đã được đặt lại thành công!")
        setTimeout(() => {
          onReset()
        }, 2000)
      } else {
        setError(result.message || "Có lỗi xảy ra")
      }
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra")
    } finally {
      setIsLoading(false)
    }
  }

  if (step === "reset") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-primary">
              🔐 Đặt lại mật khẩu
            </CardTitle>
            <CardDescription>Nhập token và mật khẩu mới</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              {resetToken && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                  <p className="font-medium text-blue-800 mb-1">Token reset (chỉ hiển thị trong development):</p>
                  <p className="text-blue-600 break-all font-mono text-xs">{resetToken}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="token">Token reset</Label>
                <Input
                  id="token"
                  type="text"
                  placeholder="Nhập token reset"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Mật khẩu mới</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full"
                />
              </div>

              {error && (
                <div className="text-destructive text-sm text-center bg-destructive/10 p-2 rounded">
                  {error}
                </div>
              )}

              {success && (
                <div className="text-green-600 text-sm text-center bg-green-50 p-2 rounded">
                  {success}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-primary"
                onClick={() => {
                  setStep("request")
                  setToken("")
                  setNewPassword("")
                  setConfirmPassword("")
                  setResetToken(null)
                }}
              >
                ← Quay lại
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">
            🔐 Quên mật khẩu
          </CardTitle>
          <CardDescription>Nhập email để nhận link reset password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRequestReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
              />
            </div>

            {error && (
              <div className="text-destructive text-sm text-center bg-destructive/10 p-2 rounded">
                {error}
              </div>
            )}

            {success && (
              <div className="text-green-600 text-sm text-center bg-green-50 p-2 rounded">
                {success}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Đang gửi..." : "Gửi yêu cầu reset"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              className="text-sm text-muted-foreground hover:text-primary"
              onClick={onBack}
            >
              ← Quay lại đăng nhập
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

