import { Request, Response } from 'express'
import { AuthService } from '../services/auth.service'
import jwt from 'jsonwebtoken'

const authService = new AuthService()
const jwtSecret = process.env.JWT_SECRET || 'dev_jwt'

const setAuthCookie = (res: Response, token: string) => {
  res.cookie('auth', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  })
}

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { user, token } = await authService.register(req.body)
      setAuthCookie(res, token)
      res.json({ success: true, message: 'Đăng ký thành công', user })
    } catch (e: any) {
      // Detailed server-side log for debugging
      console.error('[auth.register] Failed:', e)

      let status = 500
      if (e?.message === 'Email đã tồn tại') status = 409
      if (e?.message === 'Thiếu thông tin') status = 400

      // Avoid leaking internal DB errors to client
      const clientMessage =
        e?.message === 'Email đã tồn tại' || e?.message === 'Thiếu thông tin'
          ? e.message
          : 'Lỗi server'

      res.status(status).json({ success: false, message: clientMessage })
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { user, token } = await authService.login(req.body)
      setAuthCookie(res, token)
      res.json({ success: true, message: 'Đăng nhập thành công', user })
    } catch (e: any) {
      const status = e.message === 'Thiếu thông tin' ? 400 : 200
      res.status(status).json({ success: false, message: e?.message || 'Lỗi server' })
    }
  }

  async logout(req: Request, res: Response) {
    res.clearCookie('auth')
    res.status(204).end()
  }

  async getMe(req: Request, res: Response) {
    const token = req.cookies?.auth
    if (!token) return res.json({ success: true, user: null })

    try {
      const payload = jwt.verify(token, jwtSecret) as { userId: number }
      const user = await authService.getUserById(payload.userId)
      res.json({ success: true, user })
    } catch {
      res.json({ success: true, user: null })
    }
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      const result = await authService.requestPasswordReset(req.body.email)
      res.json(result)
    } catch (e: any) {
      const status = e.message === 'Email là bắt buộc' ? 400 : 500
      res.status(status).json({ success: false, message: e?.message || 'Lỗi server' })
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const result = await authService.resetPassword(req.body.token, req.body.newPassword)
      res.json(result)
    } catch (e: any) {
      const status = e.message === 'Token và mật khẩu mới là bắt buộc' ? 400 : 200
      res.status(status).json({ success: false, message: e?.message || 'Lỗi server' })
    }
  }
}

