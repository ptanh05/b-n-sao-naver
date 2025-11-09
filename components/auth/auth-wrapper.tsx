"use client"

import type React from "react"

import { useState } from "react"
import { LoginForm } from "./login-form"
import { RegisterForm } from "./register-form"
import { ForgotPasswordForm } from "./forgot-password-form"
import { useAuth } from "@/hooks/use-auth"

interface AuthWrapperProps {
  children: React.ReactNode
}

type AuthView = "login" | "register" | "forgot-password"

export function AuthWrapper({ children }: AuthWrapperProps) {
  const [view, setView] = useState<AuthView>("login")
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <>{children}</>
  }

  return (
    <>
      {view === "login" && (
        <LoginForm
          onSwitchToRegister={() => setView("register")}
          onForgotPassword={() => setView("forgot-password")}
        />
      )}
      {view === "register" && (
        <RegisterForm onSwitchToLogin={() => setView("login")} />
      )}
      {view === "forgot-password" && (
        <ForgotPasswordForm
          onBack={() => setView("login")}
          onReset={() => setView("login")}
        />
      )}
    </>
  )
}
