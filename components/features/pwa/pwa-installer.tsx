"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { registerServiceWorker, isPWAInstalled, installPWA, isOnline, onOnlineStatusChange } from "@/lib/pwa-utils"
import { Download, WifiOff } from "lucide-react"

export function PWAInstaller() {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [online, setOnline] = useState(true)

  useEffect(() => {
    // Register service worker
    registerServiceWorker()

    // Check if PWA is already installed
    setIsInstalled(isPWAInstalled())

    // Check online status
    setOnline(isOnline())
    const unsubscribe = onOnlineStatusChange(setOnline)

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      ;(window as any).deferredPrompt = e
      if (!isPWAInstalled()) {
        setShowInstallPrompt(true)
      }
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    return () => {
      unsubscribe()
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    const installed = await installPWA()
    if (installed) {
      setShowInstallPrompt(false)
      setIsInstalled(true)
    }
  }

  if (isInstalled) return null

  return (
    <>
      {/* Install Prompt Dialog */}
      <Dialog open={showInstallPrompt} onOpenChange={setShowInstallPrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cài đặt ứng dụng</DialogTitle>
            <DialogDescription>
              Cài đặt ứng dụng để sử dụng offline và truy cập nhanh hơn!
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Button onClick={handleInstall} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Cài đặt
            </Button>
            <Button variant="outline" onClick={() => setShowInstallPrompt(false)}>
              Bỏ qua
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Online/Offline Status Indicator */}
      <div className="fixed bottom-4 right-4 z-50">
        {!online && (
          <div className="bg-amber-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <WifiOff className="h-4 w-4" />
            <span className="text-sm">Đang offline</span>
          </div>
        )}
      </div>
    </>
  )
}

