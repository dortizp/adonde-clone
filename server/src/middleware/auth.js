import jwt from 'jsonwebtoken'
import db from '../db/schema.js'

const JWT_SECRET = process.env.JWT_SECRET || 'adondevivir-secret-key-change-in-production'

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Token de autenticación requerido' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    const user = db.prepare('SELECT id, email, name, created_at FROM users WHERE id = ?').get(decoded.userId)

    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' })
    }

    req.user = user
    next()
  } catch (err) {
    return res.status(403).json({ message: 'Token inválido o expirado' })
  }
}

export function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return next()
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    const user = db.prepare('SELECT id, email, name, created_at FROM users WHERE id = ?').get(decoded.userId)
    req.user = user || null
  } catch (err) {
    req.user = null
  }

  next()
}

export function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

export { JWT_SECRET }
