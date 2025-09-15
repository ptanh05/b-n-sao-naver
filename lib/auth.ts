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
    this.loadUserFromStorage()
  }

  private loadUserFromStorage() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const userData = window.localStorage.getItem("currentUser")
      if (userData) {
        this.currentUser = JSON.parse(userData)
      }
    }
  }

  private saveUserToStorage(user: User) {
    localStorage.setItem("currentUser", JSON.stringify(user))
    this.currentUser = user
  }

  private clearUserFromStorage() {
    localStorage.removeItem("currentUser")
    this.currentUser = null
  }

  register(email: string, password: string, fullName: string): { success: boolean; message: string; user?: User } {
    // Check if user already exists
    const users = this.getAllUsers()
    if (users.find((u) => u.email === email)) {
      return { success: false, message: "Email đã được sử dụng" }
    }

    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      email,
      fullName,
      createdAt: new Date().toISOString(),
    }

    // Save user credentials
    const userCredentials = { email, password }
    localStorage.setItem(`user_${newUser.id}`, JSON.stringify(userCredentials))

    // Add to users list
    users.push(newUser)
    localStorage.setItem("users", JSON.stringify(users))

    // Auto login after registration
    this.saveUserToStorage(newUser)

    return { success: true, message: "Đăng ký thành công", user: newUser }
  }

  login(email: string, password: string): { success: boolean; message: string; user?: User } {
    const users = this.getAllUsers()
    const user = users.find((u) => u.email === email)

    if (!user) {
      return { success: false, message: "Email không tồn tại" }
    }

    // Check password
    const userCredentials = localStorage.getItem(`user_${user.id}`)
    if (userCredentials) {
      const { password: storedPassword } = JSON.parse(userCredentials)
      if (storedPassword !== password) {
        return { success: false, message: "Mật khẩu không đúng" }
      }
    } else {
      return { success: false, message: "Lỗi xác thực" }
    }

    this.saveUserToStorage(user)
    return { success: true, message: "Đăng nhập thành công", user }
  }

  logout() {
    this.clearUserFromStorage()
  }

  getCurrentUser(): User | null {
    return this.currentUser
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null
  }

  private getAllUsers(): User[] {
    const users = localStorage.getItem("users")
    return users ? JSON.parse(users) : []
  }
}

export const authManager = AuthManager.getInstance()
