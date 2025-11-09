import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export function getUserIdFromJWT(req: Request): number | null {
  const token = (req as any).cookies?.auth as string | undefined
  if (!token) return null
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_jwt') as { userId: number }
    return payload.userId
  } catch {
    return null
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = getUserIdFromJWT(req)
  if (!userId) return res.status(401).json({ message: 'Unauthorized' })
  ;(req as any).userId = userId
  next()
}

