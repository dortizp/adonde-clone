import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'
import db from '../db/schema.js'
import { authenticateToken } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'

const router = Router()

const saveHistorySchema = z.object({
  filters: z.object({}).passthrough(),
})

// Save search history
router.post('/', authenticateToken, validate(saveHistorySchema), (req, res, next) => {
  try {
    const { filters } = req.body

    // Don't save empty filters
    const hasFilters = Object.values(filters).some(v => v !== '' && v !== undefined && v !== null)
    if (!hasFilters) {
      return res.json({ message: 'No hay filtros para guardar' })
    }

    const id = uuidv4()
    db.prepare(`
      INSERT INTO search_history (id, user_id, filters)
      VALUES (?, ?, ?)
    `).run(id, req.user.id, JSON.stringify(filters))

    // Keep only last 50 searches per user
    db.prepare(`
      DELETE FROM search_history
      WHERE user_id = ?
      AND id NOT IN (
        SELECT id FROM search_history
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 50
      )
    `).run(req.user.id, req.user.id)

    res.status(201).json({ message: 'Historial guardado' })
  } catch (err) {
    next(err)
  }
})

// Get search history
router.get('/', authenticateToken, (req, res, next) => {
  try {
    const history = db.prepare(`
      SELECT id, filters, created_at
      FROM search_history
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 20
    `).all(req.user.id)

    res.json({
      history: history.map(h => ({
        ...h,
        filters: JSON.parse(h.filters)
      }))
    })
  } catch (err) {
    next(err)
  }
})

export default router
