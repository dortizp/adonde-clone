import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

import authRoutes from './routes/auth.js'
import propertiesRoutes from './routes/properties.js'
import favoritesRoutes from './routes/favorites.js'
import inquiriesRoutes from './routes/inquiries.js'
import recommendationsRoutes from './routes/recommendations.js'
import searchHistoryRoutes from './routes/searchHistory.js'
import { errorHandler } from './middleware/errorHandler.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Serve uploaded files
app.use('/upload', express.static(join(__dirname, '../../upload')))

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/properties', propertiesRoutes)
app.use('/api/favorites', favoritesRoutes)
app.use('/api/inquiries', inquiriesRoutes)
app.use('/api/recommendations', recommendationsRoutes)
app.use('/api/search-history', searchHistoryRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Error handler
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

export default app
