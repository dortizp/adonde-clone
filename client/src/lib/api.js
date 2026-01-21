import { mockProperties, filterProperties } from './mockData'

// Use environment variable or default to relative path for local dev
const API_BASE = import.meta.env.VITE_API_URL || '/api'
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token')

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error de conexión' }))
      throw new Error(error.message || 'Error en la solicitud')
    }

    return response.json()
  } catch (err) {
    // If backend unavailable and we have mock handlers, use them
    if (USE_MOCK || err.message === 'Failed to fetch') {
      return handleMockRequest(endpoint, options)
    }
    throw err
  }
}

function handleMockRequest(endpoint, options = {}) {
  // Mock property endpoints
  if (endpoint.startsWith('/properties')) {
    if (endpoint === '/properties' || endpoint.startsWith('/properties?')) {
      const url = new URL(endpoint, 'http://localhost')
      const filters = Object.fromEntries(url.searchParams)
      const filtered = filterProperties(mockProperties, filters)
      return Promise.resolve({ properties: filtered, pagination: { total: filtered.length } })
    }
    const id = endpoint.split('/')[2]
    const property = mockProperties.find((p) => p.id === id)
    return property
      ? Promise.resolve({ property })
      : Promise.reject(new Error('Propiedad no encontrada'))
  }

  // Mock auth - demo mode
  if (endpoint === '/auth/login' || endpoint === '/auth/register') {
    const body = JSON.parse(options.body || '{}')
    return Promise.resolve({
      user: { id: 'demo', name: body.name || 'Demo User', email: body.email },
      token: 'demo-token'
    })
  }
  if (endpoint === '/auth/me') {
    const token = localStorage.getItem('token')
    if (token === 'demo-token') {
      return Promise.resolve({ user: { id: 'demo', name: 'Demo User', email: 'demo@example.com' } })
    }
    return Promise.reject(new Error('No autenticado'))
  }

  // Mock favorites
  if (endpoint === '/favorites') {
    return Promise.resolve({ favorites: [] })
  }

  // Mock other endpoints
  if (endpoint === '/recommendations') {
    return Promise.resolve({ recommendations: mockProperties.slice(0, 4) })
  }
  if (endpoint === '/search-history') {
    return Promise.resolve({ message: 'ok' })
  }
  if (endpoint === '/inquiries') {
    return Promise.resolve({ message: 'Mensaje enviado' })
  }

  return Promise.reject(new Error('Endpoint no disponible en modo demo'))
}

export const api = {
  // Auth
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name, email, password) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  getMe: () => request('/auth/me'),

  // Properties
  getProperties: (params = {}) => {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value)
      }
    })
    const query = searchParams.toString()
    return request(`/properties${query ? `?${query}` : ''}`)
  },

  getProperty: (id) => request(`/properties/${id}`),

  // Favorites
  getFavorites: () => request('/favorites'),

  addFavorite: (propertyId) =>
    request('/favorites', {
      method: 'POST',
      body: JSON.stringify({ propertyId }),
    }),

  removeFavorite: (propertyId) =>
    request(`/favorites/${propertyId}`, {
      method: 'DELETE',
    }),

  // Inquiries
  createInquiry: (data) =>
    request('/inquiries', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Recommendations
  getRecommendations: () => request('/recommendations'),

  // Search history
  saveSearchHistory: (filters) =>
    request('/search-history', {
      method: 'POST',
      body: JSON.stringify({ filters }),
    }),
}
