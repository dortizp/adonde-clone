import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'
import db from '../db/schema.js'
import { optionalAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'

const router = Router()

const createInquirySchema = z.object({
  propertyId: z.string().uuid('ID de propiedad inválido'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Correo inválido'),
  phone: z.string().optional(),
  message: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres'),
})

// Create inquiry
router.post('/', optionalAuth, validate(createInquirySchema), (req, res, next) => {
  try {
    const { propertyId, name, email, phone, message } = req.body
    const userId = req.user?.id || null

    // Check if property exists
    const property = db.prepare('SELECT id, title FROM properties WHERE id = ?').get(propertyId)
    if (!property) {
      return res.status(404).json({ message: 'Propiedad no encontrada' })
    }

    // Create inquiry
    const id = uuidv4()
    db.prepare(`
      INSERT INTO inquiries (id, property_id, user_id, name, email, phone, message)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, propertyId, userId, name, email, phone || null, message)

    res.status(201).json({
      message: 'Consulta enviada correctamente',
      inquiry: { id, property_id: propertyId }
    })
  } catch (err) {
    next(err)
  }
})

export default router
