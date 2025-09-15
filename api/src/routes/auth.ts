import { Router, Request, Response } from 'express'
import { pool } from '../db'
import jwt from 'jsonwebtoken'

const router = Router()

const setAuthCookie = (res: Response, token: string) => {
  res.cookie('auth', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  })
}

router.post('/register', async (req: Request, res: Response) => {
  const { email, password, fullName, name } = req.body || {}
  const resolvedName = name || fullName
  if (!email || !password || !resolvedName) {
    return res.status(400).json({ success: false, message: 'Thiếu thông tin' })
  }
  try {
    const existing = await pool.query('SELECT id FROM users WHERE email=$1', [email])
    if (existing.rowCount && existing.rowCount > 0) {
      return res.json({ success: false, message: 'Email đã tồn tại' })
    }
    const pwd = password // TODO: hash in production
    const result = await pool.query(
      'INSERT INTO users(email, name, password) VALUES($1,$2,$3) RETURNING id, email, name, created_at',
      [email, resolvedName, pwd],
    )
    const user = {
      id: result.rows[0].id,
      email: result.rows[0].email,
      fullName: result.rows[0].name,
      createdAt: result.rows[0].created_at,
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'dev_jwt', { expiresIn: '7d' })
    setAuthCookie(res, token)
    res.json({ success: true, message: 'Đăng ký thành công', user })
  } catch (e: any) {
    res.status(500).json({ success: false, message: e?.message || 'Lỗi server' })
  }
})

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ success: false, message: 'Thiếu thông tin' })
  try {
    const result = await pool.query('SELECT * FROM users WHERE email=$1', [email])
    if (result.rowCount === 0) return res.json({ success: false, message: 'Email không tồn tại' })
    const userRow = result.rows[0]
    if (userRow.password !== password) return res.json({ success: false, message: 'Mật khẩu không đúng' })
    const token = jwt.sign({ userId: userRow.id }, process.env.JWT_SECRET || 'dev_jwt', { expiresIn: '7d' })
    const user = {
      id: userRow.id,
      email: userRow.email,
      fullName: userRow.name,
      createdAt: userRow.created_at,
    }
    setAuthCookie(res, token)
    res.json({ success: true, message: 'Đăng nhập thành công', user })
  } catch (e: any) {
    res.status(500).json({ success: false, message: e?.message || 'Lỗi server' })
  }
})

router.post('/logout', async (req: Request, res: Response) => {
  res.clearCookie('auth')
  res.status(204).end()
})

router.get('/me', async (req: Request, res: Response) => {
  const token = req.cookies?.auth
  if (!token) return res.json({ success: true, user: null })
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_jwt') as { userId: number }
    const result = await pool.query('SELECT id, email, name, created_at FROM users WHERE id=$1', [payload.userId])
    if (result.rowCount === 0) return res.json({ success: true, user: null })
    const row = result.rows[0]
    res.json({ success: true, user: { id: row.id, email: row.email, fullName: row.name, createdAt: row.created_at } })
  } catch {
    res.json({ success: true, user: null })
  }
})

export default router


