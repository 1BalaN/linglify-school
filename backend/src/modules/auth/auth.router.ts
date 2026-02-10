import { Router } from 'express'

const router = Router()

// POST /api/auth/register
router.post('/register', (_req, res) => {
  res.json({ message: 'Register endpoint' })
})

// POST /api/auth/login
router.post('/login', (_req, res) => {
  res.json({ message: 'Login endpoint' })
})

// POST /api/auth/refresh
router.post('/refresh', (_req, res) => {
  res.json({ message: 'Refresh endpoint' })
})

// POST /api/auth/logout
router.post('/logout', (_req, res) => {
  res.json({ message: 'Logout endpoint' })
})

export default router
