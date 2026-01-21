const API_BASE = '/api'

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

  const response = await fetch(`${API_BASE}${endpoint}`, config)

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error de conexión' }))
    throw new Error(error.message || 'Error en la solicitud')
  }

  return response.json()
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
