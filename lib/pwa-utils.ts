export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    })
    console.log("Service Worker registered:", registration)
    return registration
  } catch (error) {
    console.error("Service Worker registration failed:", error)
    return null
  }
}

export async function unregisterServiceWorker(): Promise<boolean> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return false
  }

  try {
    const registration = await navigator.serviceWorker.ready
    const unregistered = await registration.unregister()
    console.log("Service Worker unregistered:", unregistered)
    return unregistered
  } catch (error) {
    console.error("Service Worker unregistration failed:", error)
    return false
  }
}

export function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return Promise.resolve("denied")
  }

  if (Notification.permission === "granted" || Notification.permission === "denied") {
    return Promise.resolve(Notification.permission)
  }

  return Notification.requestPermission()
}

export function isOnline(): boolean {
  if (typeof window === "undefined") return true
  return navigator.onLine
}

export function onOnlineStatusChange(callback: (isOnline: boolean) => void): () => void {
  if (typeof window === "undefined") {
    return () => {}
  }

  const handleOnline = () => callback(true)
  const handleOffline = () => callback(false)

  window.addEventListener("online", handleOnline)
  window.addEventListener("offline", handleOffline)

  return () => {
    window.removeEventListener("online", handleOnline)
    window.removeEventListener("offline", handleOffline)
  }
}

export async function installPWA(): Promise<boolean> {
  if (typeof window === "undefined") return false

  // Check if browser supports PWA installation
  const deferredPrompt = (window as any).deferredPrompt
  if (!deferredPrompt) return false

  try {
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    ;(window as any).deferredPrompt = null
    return outcome === "accepted"
  } catch (error) {
    console.error("PWA installation failed:", error)
    return false
  }
}

export function isPWAInstalled(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true
}

