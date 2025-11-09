export const isMobile = (): boolean => {
  if (typeof window === "undefined") return false
  return window.innerWidth < 768
}

export const isTablet = (): boolean => {
  if (typeof window === "undefined") return false
  return window.innerWidth >= 768 && window.innerWidth < 1024
}

export const isDesktop = (): boolean => {
  if (typeof window === "undefined") return false
  return window.innerWidth >= 1024
}

export const getViewportSize = () => {
  if (typeof window === "undefined") {
    return { width: 0, height: 0 }
  }
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  }
}

export const enableTouchOptimizations = () => {
  if (typeof document === "undefined") return

  // Add touch-action CSS for better touch performance
  const style = document.createElement("style")
  style.textContent = `
    * {
      -webkit-tap-highlight-color: transparent;
      touch-action: manipulation;
    }
    button, a {
      -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
    }
  `
  document.head.appendChild(style)
}

