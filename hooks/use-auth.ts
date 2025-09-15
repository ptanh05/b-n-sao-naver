"use client"

import { useState, useEffect } from "react"
import { authManager, type AuthState } from "@/lib/auth"
import { storage } from "@/lib/storage"

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  })

  useEffect(() => {
    const user = authManager.getCurrentUser()
    setAuthState({
      user,
      isAuthenticated: user !== null,
    })
  }, [])

  const login = (email: string, password: string) => {
    const result = authManager.login(email, password)
    if (result.success && result.user) {
      setAuthState({
        user: result.user,
        isAuthenticated: true,
      })
    }
    return result
  }

  const register = (email: string, password: string, fullName: string) => {
    const result = authManager.register(email, password, fullName)
    if (result.success && result.user) {
      setAuthState({
        user: result.user,
        isAuthenticated: true,
      })
    }
    return result
  }

  const logout = () => {
    storage.clearUserData()
    authManager.logout()
    setAuthState({
      user: null,
      isAuthenticated: false,
    })
  }

  return {
    ...authState,
    login,
    register,
    logout,
  }
}
