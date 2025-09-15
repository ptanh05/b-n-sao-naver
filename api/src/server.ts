import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

// Routes will be added soon
import authRoutes from './routes/auth'
import taskRoutes from './routes/tasks'
import habitsRoutes from './routes/habits'
import schedulesRoutes from './routes/schedules'
import analyticsRoutes from './routes/analytics'
import pomodoroRoutes from './routes/pomodoro_sessions'
import syncLogsRoutes from './routes/sync_logs'
import { ensureSchema } from './db'

const app = express()

const PORT = Number(process.env.PORT) || 3001
const ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000'

app.use(cors({ origin: ORIGIN, credentials: true }))
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser(process.env.COOKIE_SECRET || 'dev_secret'))

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ ok: true, name: 'time-management-api' })
})

app.use('/api/auth', authRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/habits', habitsRoutes)
app.use('/api/schedules', schedulesRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/pomodoro_sessions', pomodoroRoutes)
app.use('/api/sync_logs', syncLogsRoutes)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  // Basic error handler
  console.error(err)
  const status = Number(err?.status) || 500
  res.status(status).json({ message: err?.message || 'Internal server error' })
})

ensureSchema()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API listening on http://localhost:${PORT}`)
    })
  })
  .catch((err) => {
    console.error('Failed to ensure schema', err)
    process.exit(1)
  })


