"use client"

import { useEffect } from "react"
import { registerServiceWorker } from "@/lib/pwa-utils"
import { PWAInstaller } from "./pwa-installer"

export function PWAProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    registerServiceWorker()
  }, [])

  return (
    <>
      {children}
      <PWAInstaller />
    </>
  )
}

