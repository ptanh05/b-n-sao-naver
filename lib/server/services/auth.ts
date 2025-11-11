import { pool } from '../db'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

export interface RegisterData {
  email: string
  password: string
  fullName?: string
  name?: string
}

export interface LoginData {
  email: string
  password: string
}

export class AuthService {
  private jwtSecret = process.env.JWT_SECRET || 'dev_jwt'

  async register(data: RegisterData) {
    const { email, password, fullName, name } = data
    const resolvedName = name || fullName

    if (!email || !password || !resolvedName) {
      throw new Error('Thiếu thông tin')
    }

    const existing = await pool.query('SELECT id FROM users WHERE email=$1', [email])
    if (existing.rowCount && existing.rowCount > 0) {
      throw new Error('Email đã tồn tại')
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const result = await pool.query(
      'INSERT INTO users(email, name, password) VALUES($1,$2,$3) RETURNING id, email, name, created_at',
      [email, resolvedName, hashedPassword],
    )

    const userRow = result.rows[0]
    const user = {
      id: userRow.id,
      email: userRow.email,
      fullName: userRow.name,
      createdAt: userRow.created_at,
    }

    const token = jwt.sign({ userId: user.id }, this.jwtSecret, { expiresIn: '7d' })

    return { user, token }
  }

  async login(data: LoginData) {
    const { email, password } = data

    if (!email || !password) {
      throw new Error('Thiếu thông tin')
    }

    const result = await pool.query('SELECT * FROM users WHERE email=$1', [email])
    if (result.rowCount === 0) {
      throw new Error('Email không tồn tại')
    }

    const userRow = result.rows[0]

    const isValidPassword = await bcrypt.compare(password, userRow.password)
    if (!isValidPassword) {
      throw new Error('Mật khẩu không đúng')
    }

    const token = jwt.sign({ userId: userRow.id }, this.jwtSecret, { expiresIn: '7d' })

    const user = {
      id: userRow.id,
      email: userRow.email,
      fullName: userRow.name,
      createdAt: userRow.created_at,
    }

    return { user, token }
  }

  async getUserById(userId: number) {
    const result = await pool.query(
      'SELECT id, email, name, created_at FROM users WHERE id=$1',
      [userId],
    )

    if (result.rowCount === 0) return null

    const row = result.rows[0]
    return {
      id: row.id,
      email: row.email,
      fullName: row.name,
      createdAt: row.created_at,
    }
  }

  async requestPasswordReset(email: string) {
    if (!email) {
      throw new Error('Email là bắt buộc')
    }

    const result = await pool.query('SELECT id, email FROM users WHERE email=$1', [email])
    if (result.rowCount === 0) {
      return { success: true, message: 'Nếu email tồn tại, bạn sẽ nhận được link reset password' }
    }

    const resetToken = jwt.sign(
      { userId: result.rows[0].id, type: 'password-reset' },
      this.jwtSecret,
      { expiresIn: '1h' },
    )

    await pool.query(
      'UPDATE users SET reset_token=$1, reset_token_expires_at=now() + interval \'1 hour\' WHERE id=$2',
      [resetToken, result.rows[0].id],
    )

    return { success: true, message: 'Nếu email tồn tại, bạn sẽ nhận được link reset password', resetToken }
  }

  async resetPassword(token: string, newPassword: string) {
    if (!token || !newPassword) {
      throw new Error('Token và mật khẩu mới là bắt buộc')
    }

    try {
      const payload = jwt.verify(token, this.jwtSecret) as { userId: number; type?: string }

      if (payload.type !== 'password-reset') {
        throw new Error('Invalid token type')
      }

      const result = await pool.query(
        'SELECT id FROM users WHERE reset_token=$1 AND reset_token_expires_at > now()',
        [token],
      )

      if (result.rowCount === 0) {
        throw new Error('Token không hợp lệ hoặc đã hết hạn')
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10)

      await pool.query(
        'UPDATE users SET password=$1, reset_token=NULL, reset_token_expires_at=NULL WHERE id=$2',
        [hashedPassword, payload.userId],
      )

      return { success: true, message: 'Đặt lại mật khẩu thành công' }
    } catch (e: any) {
      if (e.name === 'JsonWebTokenError' || e.name === 'TokenExpiredError') {
        throw new Error('Token không hợp lệ hoặc đã hết hạn')
      }
      throw e
    }
  }
}


