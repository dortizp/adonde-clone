import { Router } from 'express'
import db from '../db/schema.js'
import { authenticateToken } from '../middleware/auth.js'

const router = Router()

// Get personalized recommendations
router.get('/', authenticateToken, (req, res, next) => {
  try {
    // Get user's search history
    const searchHistory = db.prepare(`
      SELECT filters FROM search_history
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `).all(req.user.id)

    // Get user's favorites to exclude them
    const favorites = db.prepare(`
      SELECT property_id FROM favorites WHERE user_id = ?
    `).all(req.user.id)
    const favoriteIds = new Set(favorites.map(f => f.property_id))

    // Analyze search patterns
    const patterns = {
      districts: {},
      priceRanges: [],
      bedrooms: {},
    }

    searchHistory.forEach(item => {
      try {
        const filters = JSON.parse(item.filters)
        if (filters.district) {
          patterns.districts[filters.district] = (patterns.districts[filters.district] || 0) + 1
        }
        if (filters.priceRange) {
          patterns.priceRanges.push(filters.priceRange)
        }
        if (filters.bedrooms) {
          patterns.bedrooms[filters.bedrooms] = (patterns.bedrooms[filters.bedrooms] || 0) + 1
        }
      } catch (e) {
        // Skip invalid JSON
      }
    })

    // Build recommendation query
    let query = 'SELECT * FROM properties WHERE 1=1'
    const params = []

    // Prefer most searched district
    const topDistrict = Object.entries(patterns.districts)
      .sort((a, b) => b[1] - a[1])[0]?.[0]

    if (topDistrict) {
      query += ' AND (district = ? OR address LIKE ?)'
      params.push(topDistrict, `%${topDistrict}%`)
    }

    // Prefer most searched bedroom count
    const topBedrooms = Object.entries(patterns.bedrooms)
      .sort((a, b) => b[1] - a[1])[0]?.[0]

    if (topBedrooms && topBedrooms !== '4+') {
      query += ' AND (bedrooms LIKE ? OR bedrooms = ?)'
      params.push(`%${topBedrooms}%`, topBedrooms)
    }

    query += ' ORDER BY created_at DESC LIMIT 10'

    let recommendations = db.prepare(query).all(...params)

    // Filter out favorites
    recommendations = recommendations.filter(r => !favoriteIds.has(r.id))

    // If not enough recommendations, get random ones
    if (recommendations.length < 4) {
      const excludeIds = [...favoriteIds, ...recommendations.map(r => r.id)]
      const placeholders = excludeIds.map(() => '?').join(',')

      const additionalQuery = excludeIds.length > 0
        ? `SELECT * FROM properties WHERE id NOT IN (${placeholders}) ORDER BY RANDOM() LIMIT ?`
        : 'SELECT * FROM properties ORDER BY RANDOM() LIMIT ?'

      const additionalParams = excludeIds.length > 0
        ? [...excludeIds, 10 - recommendations.length]
        : [10 - recommendations.length]

      const additional = db.prepare(additionalQuery).all(...additionalParams)
      recommendations = [...recommendations, ...additional].slice(0, 10)
    }

    res.json({ recommendations })
  } catch (err) {
    next(err)
  }
})

export default router
