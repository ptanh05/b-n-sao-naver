export interface User {
  id: string
  email: string
  fullName: string
  createdAt: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

class AuthManager {
  private static instance: AuthManager
  private currentUser: User | null = null

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager()
    }
    return AuthManager.instance
  }

  constructor() {
    // Khởi tạo không cần loadUserFromStorage nữa
  }

  async register(email: string, password: string, fullName: string): Promise<{ success: boolean; message: string; user?: User }> {
    const res = await fetch('/api/entities/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, fullName }),
    })
    return await res.json()
  }

  async login(email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> {
    const res = await fetch('/api/entities/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const result = await res.json()
    if (result.success && result.user) {
      this.currentUser = result.user
    }
    return result
  }

  async logout(): Promise<void> {
    await fetch('/api/entities/users/logout', { method: 'POST' })
    this.currentUser = null
  }

  async getCurrentUser(): Promise<User | null> {
    const res = await fetch('/api/entities/users/me')
    if (!res.ok) return null
    const user = await res.json()
    this.currentUser = user
    return user
  }

  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser()
    return !!user
  }

  async getAllUsers(): Promise<User[]> {
    const res = await fetch('/api/entities/users')
    if (!res.ok) return []
    return await res.json()
  }
