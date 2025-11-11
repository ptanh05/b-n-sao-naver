import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import '@/lib/server/load-env'
import { AuthService } from '@/lib/server/services/auth'

const authService = new AuthService()
const jwtSecret = process.env.JWT_SECRET || 'dev_jwt'

function setAuthCookie(token: string) {
  const cookieStore = cookies()
  cookieStore.set('auth', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

function clearAuthCookie() {
  const cookieStore = cookies()
  cookieStore.delete('auth')
}

function getAuthToken(): string | null {
  const cookieStore = cookies()
  return cookieStore.get('auth')?.value || null
}

export async function GET(request: NextRequest, { params }: { params: { slug: string[] } }) {
  const [endpoint] = params.slug || []

  if (endpoint === 'me') {
    const token = getAuthToken()
    if (!token) {
      return NextResponse.json({ success: true, user: null })
    }

    try {
      const payload = jwt.verify(token, jwtSecret) as { userId: number }
      const user = await authService.getUserById(payload.userId)
      return NextResponse.json({ success: true, user })
    } catch {
      return NextResponse.json({ success: true, user: null })
    }
  }

  return NextResponse.json({ message: 'Not found' }, { status: 404 })
}

export async function POST(request: NextRequest, { params }: { params: { slug: string[] } }) {
  const [endpoint] = params.slug || []
  const body = await request.json().catch(() => ({}))

  if (endpoint === 'register') {
    try {
      const { user, token } = await authService.register(body)
      setAuthCookie(token)
      return NextResponse.json({ success: true, message: 'Đăng ký thành công', user })
    } catch (e: any) {
      console.error('[auth.register] Failed:', e)

      if (e?.message === 'Email đã tồn tại') {
        try {
          const { user, token } = await authService.login({
            email: String(body?.email || ''),
            password: String(body?.password || ''),
          })
          setAuthCookie(token)
          return NextResponse.json({
            success: true,
            message: 'Email đã tồn tại - đã đăng nhập thành công',
            user,
          })
        } catch (loginErr: any) {
          return NextResponse.json(
            { success: false, message: 'Email đã tồn tại. Vui lòng đăng nhập với mật khẩu đúng.' },
            { status: 409 }
          )
        }
      }

      const status = e?.message === 'Thiếu thông tin' ? 400 : 500
      const clientMessage = e?.message === 'Thiếu thông tin' ? e.message : 'Lỗi server'
      return NextResponse.json({ success: false, message: clientMessage }, { status })
    }
  }

  if (endpoint === 'login') {
    try {
      const { user, token } = await authService.login(body)
      setAuthCookie(token)
      return NextResponse.json({ success: true, message: 'Đăng nhập thành công', user })
    } catch (e: any) {
      const status = e.message === 'Thiếu thông tin' ? 400 : 200
      return NextResponse.json({ success: false, message: e?.message || 'Lỗi server' }, { status })
    }
  }

  if (endpoint === 'logout') {
    clearAuthCookie()
    return new NextResponse(null, { status: 204 })
  }

  if (endpoint === 'forgot-password') {
    try {
      const result = await authService.requestPasswordReset(body.email)
      return NextResponse.json(result)
    } catch (e: any) {
      const status = e.message === 'Email là bắt buộc' ? 400 : 500
      return NextResponse.json({ success: false, message: e?.message || 'Lỗi server' }, { status })
    }
  }

  if (endpoint === 'reset-password') {
    try {
      const result = await authService.resetPassword(body.token, body.newPassword)
      return NextResponse.json(result)
    } catch (e: any) {
      const status = e.message === 'Token và mật khẩu mới là bắt buộc' ? 400 : 200
      return NextResponse.json({ success: false, message: e?.message || 'Lỗi server' }, { status })
    }
  }

  return NextResponse.json({ message: 'Not found' }, { status: 404 })
}

