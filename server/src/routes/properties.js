import { Router } from 'express'
import db from '../db/schema.js'
import { optionalAuth } from '../middleware/auth.js'

const router = Router()

// Get all properties with filters
router.get('/', optionalAuth, (req, res, next) => {
  try {
    const {
      search,
      district,
      bedrooms,
      priceRange,
      minPrice,
      maxPrice,
      minArea,
      maxArea,
      page = 1,
      limit = 50,
    } = req.query

    let query = 'SELECT * FROM properties WHERE 1=1'
    const params = []

    // Search filter
    if (search) {
      query += ' AND (title LIKE ? OR address LIKE ?)'
      params.push(`%${search}%`, `%${search}%`)
    }

    // District filter
    if (district) {
      query += ' AND (district = ? OR address LIKE ?)'
      params.push(district, `%${district}%`)
    }

    // Bedrooms filter
    if (bedrooms) {
      if (bedrooms === '4+') {
        query += ' AND (bedrooms LIKE ? OR CAST(bedrooms AS INTEGER) >= 4)'
        params.push('%4%')
      } else {
        query += ' AND (bedrooms LIKE ? OR bedrooms = ?)'
        params.push(`%${bedrooms}%`, bedrooms)
      }
    }

    // Price range filter
    if (priceRange) {
      const [min, max] = priceRange.split('-')
      if (min) {
        query += ' AND CAST(price_soles AS INTEGER) >= ?'
        params.push(parseInt(min))
      }
      if (max) {
        query += ' AND CAST(price_soles AS INTEGER) <= ?'
        params.push(parseInt(max))
      }
    }

    // Direct price filters
    if (minPrice) {
      query += ' AND CAST(price_soles AS INTEGER) >= ?'
      params.push(parseInt(minPrice))
    }
    if (maxPrice) {
      query += ' AND CAST(price_soles AS INTEGER) <= ?'
      params.push(parseInt(maxPrice))
    }

    // Area filters
    if (minArea) {
      query += ' AND (area_m2 >= ? OR CAST(SUBSTR(area_range_m2, 1, INSTR(area_range_m2, " ") - 1) AS INTEGER) >= ?)'
      params.push(parseInt(minArea), parseInt(minArea))
    }
    if (maxArea) {
      query += ' AND (area_m2 <= ? OR CAST(SUBSTR(area_range_m2, 1, INSTR(area_range_m2, " ") - 1) AS INTEGER) <= ?)'
      params.push(parseInt(maxArea), parseInt(maxArea))
    }

    query += ' ORDER BY created_at DESC'

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit)
    query += ' LIMIT ? OFFSET ?'
    params.push(parseInt(limit), offset)

    const properties = db.prepare(query).all(...params)

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM properties WHERE 1=1'
    const countParams = params.slice(0, -2) // Remove limit and offset

    // Rebuild count query with same filters
    let countQueryWithFilters = 'SELECT COUNT(*) as total FROM properties WHERE 1=1'
    let paramIndex = 0

    if (search) {
      countQueryWithFilters += ' AND (title LIKE ? OR address LIKE ?)'
      paramIndex += 2
    }
    if (district) {
      countQueryWithFilters += ' AND (district = ? OR address LIKE ?)'
      paramIndex += 2
    }
    if (bedrooms) {
      if (bedrooms === '4+') {
        countQueryWithFilters += ' AND (bedrooms LIKE ? OR CAST(bedrooms AS INTEGER) >= 4)'
        paramIndex += 1
      } else {
        countQueryWithFilters += ' AND (bedrooms LIKE ? OR bedrooms = ?)'
        paramIndex += 2
      }
    }
    if (priceRange) {
      const [min, max] = priceRange.split('-')
      if (min) paramIndex += 1
      if (max) paramIndex += 1
    }
    if (minPrice) paramIndex += 1
    if (maxPrice) paramIndex += 1
    if (minArea) paramIndex += 2
    if (maxArea) paramIndex += 2

    const totalResult = db.prepare(countQueryWithFilters).get(...countParams)
    const total = totalResult?.total || 0

    res.json({
      properties,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    })
  } catch (err) {
    next(err)
  }
})

// Get single property
router.get('/:id', (req, res, next) => {
  try {
    const property = db.prepare('SELECT * FROM properties WHERE id = ?').get(req.params.id)

    if (!property) {
      return res.status(404).json({ message: 'Propiedad no encontrada' })
    }

    res.json({ property })
  } catch (err) {
    next(err)
  }
})

export default router
