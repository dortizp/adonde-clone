import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'
import db from '../db/schema.js'
import { authenticateToken } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'

const router = Router()

const addFavoriteSchema = z.object({
  propertyId: z.string().uuid('ID de propiedad inválido'),
})

// Get user's favorites
router.get('/', authenticateToken, (req, res, next) => {
  try {
    const favorites = db.prepare(`
      SELECT
        f.id,
        f.property_id,
        f.created_at,
        p.id as 'property.id',
        p.title as 'property.title',
        p.address as 'property.address',
        p.district as 'property.district',
        p.status as 'property.status',
        p.price_soles as 'property.price_soles',
        p.price_usd as 'property.price_usd',
        p.bedrooms as 'property.bedrooms',
        p.area_range_m2 as 'property.area_range_m2',
        p.area_m2 as 'property.area_m2',
        p.photo as 'property.photo',
        p.amenities as 'property.amenities'
      FROM favorites f
      JOIN properties p ON f.property_id = p.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `).all(req.user.id)

    // Transform flat results to nested objects
    const transformedFavorites = favorites.map(f => ({
      id: f.id,
      property_id: f.property_id,
      created_at: f.created_at,
      property: {
        id: f['property.id'],
        title: f['property.title'],
        address: f['property.address'],
        district: f['property.district'],
        status: f['property.status'],
        price_soles: f['property.price_soles'],
        price_usd: f['property.price_usd'],
        bedrooms: f['property.bedrooms'],
        area_range_m2: f['property.area_range_m2'],
        area_m2: f['property.area_m2'],
        photo: f['property.photo'],
        amenities: f['property.amenities'],
      }
    }))

    res.json({ favorites: transformedFavorites })
  } catch (err) {
    next(err)
  }
})

// Add favorite
router.post('/', authenticateToken, validate(addFavoriteSchema), (req, res, next) => {
  try {
    const { propertyId } = req.body

    // Check if property exists
    const property = db.prepare('SELECT id FROM properties WHERE id = ?').get(propertyId)
    if (!property) {
      return res.status(404).json({ message: 'Propiedad no encontrada' })
    }

    // Check if already favorited
    const existing = db.prepare(
      'SELECT id FROM favorites WHERE user_id = ? AND property_id = ?'
    ).get(req.user.id, propertyId)

    if (existing) {
      return res.status(409).json({ message: 'La propiedad ya está en favoritos' })
    }

    // Add favorite
    const id = uuidv4()
    db.prepare(`
      INSERT INTO favorites (id, user_id, property_id)
      VALUES (?, ?, ?)
    `).run(id, req.user.id, propertyId)

    res.status(201).json({
      message: 'Propiedad agregada a favoritos',
      favorite: { id, property_id: propertyId }
    })
  } catch (err) {
    next(err)
  }
})

// Remove favorite
router.delete('/:propertyId', authenticateToken, (req, res, next) => {
  try {
    const { propertyId } = req.params

    const result = db.prepare(
      'DELETE FROM favorites WHERE user_id = ? AND property_id = ?'
    ).run(req.user.id, propertyId)

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Favorito no encontrado' })
    }

    res.json({ message: 'Propiedad eliminada de favoritos' })
  } catch (err) {
    next(err)
  }
})

export default router
