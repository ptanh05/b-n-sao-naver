"use client"

import { useState, useEffect } from "react"
import type { AuthState } from "@/lib/types"
import { api, endpoints } from "@/lib/api"

type AuthResponse = {
  success: boolean
  message: string
  user?: {
    id: string
    email: string
    fullName: string
    createdAt: string
  }
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  })

  useEffect(() => {
    const loadMe = async () => {
      try {
        const me = await api.get<AuthResponse>(endpoints.me)
        setAuthState({ user: me.user ?? null, isAuthenticated: Boolean(me.user) })
      } catch {
        setAuthState({ user: null, isAuthenticated: false })
      }
    }
    loadMe()
  }, [])

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const res = await api.post<AuthResponse, { email: string; password: string }>(endpoints.login, {
        email,
        password,
      })
      if (res.success && res.user) {
        setAuthState({ user: res.user, isAuthenticated: true })
      }
      return res
    } catch (err: any) {
      return { success: false, message: err?.message || "Đăng nhập thất bại" }
    }
  }

  const register = async (
    email: string,
    password: string,
    fullName: string,
  ): Promise<AuthResponse> => {
    try {
      const res = await api.post<AuthResponse, { email: string; password: string; fullName: string }>(
        endpoints.register,
        { email, password, fullName },
      )
      if (res.success && res.user) {
        setAuthState({ user: res.user, isAuthenticated: true })
      }
      return res
    } catch (err: any) {
      // Handle network errors
      if (err?.message?.includes('Failed to fetch') || err?.message?.includes('NetworkError')) {
        return { success: false, message: "Không thể kết nối đến server. Vui lòng kiểm tra API server có đang chạy không." }
      }
      return { success: false, message: err?.message || "Đăng ký thất bại" }
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await api.post<void>(endpoints.logout)
    } finally {
      setAuthState({ user: null, isAuthenticated: false })
    }
  }

  return {
    ...authState,
    login,
    register,
    logout,
  }
}
