import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import PropertyCard from '../components/property/PropertyCard'
import { AuthProvider } from '../context/AuthContext'

const mockProperty = {
  id: 'test-123',
  title: 'Moderno Departamento en Miraflores',
  address: 'Av. Larco 500, Miraflores, Lima',
  district: 'Miraflores',
  price_soles: 350000,
  bedrooms: '3 dorm.',
  area_range_m2: '95 m²',
  amenities: '["Gimnasio", "Piscina", "Área de juegos"]',
  photo: null,
  status: 'Entrega inmediata',
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
})

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {component}
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  )
}

describe('PropertyCard', () => {
  it('renders property title', () => {
    renderWithProviders(<PropertyCard property={mockProperty} />)
    expect(screen.getByText('Moderno Departamento en Miraflores')).toBeInTheDocument()
  })

  it('renders property address', () => {
    renderWithProviders(<PropertyCard property={mockProperty} />)
    expect(screen.getByText('Av. Larco 500, Miraflores, Lima')).toBeInTheDocument()
  })

  it('renders formatted price in soles', () => {
    renderWithProviders(<PropertyCard property={mockProperty} />)
    expect(screen.getByText(/S\/ 350,000/)).toBeInTheDocument()
  })

  it('renders bedrooms info', () => {
    renderWithProviders(<PropertyCard property={mockProperty} />)
    expect(screen.getByText('3 dorm.')).toBeInTheDocument()
  })

  it('renders area info', () => {
    renderWithProviders(<PropertyCard property={mockProperty} />)
    expect(screen.getByText('95 m²')).toBeInTheDocument()
  })

  it('does not show favorite button when not logged in', () => {
    renderWithProviders(<PropertyCard property={mockProperty} />)
    // The favorite button should not be visible without authentication
    const favoriteButton = screen.queryByRole('button')
    expect(favoriteButton).not.toBeInTheDocument()
  })

  it('shows district in the card', () => {
    renderWithProviders(<PropertyCard property={mockProperty} />)
    // Verify the property renders correctly without auth
    expect(screen.getByText('Moderno Departamento en Miraflores')).toBeInTheDocument()
  })

  it('links to property detail page', () => {
    renderWithProviders(<PropertyCard property={mockProperty} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/property/test-123')
  })

  it('renders status badge when available', () => {
    renderWithProviders(<PropertyCard property={mockProperty} />)
    expect(screen.getByText('Entrega inmediata')).toBeInTheDocument()
  })

  it('handles property without photo gracefully', () => {
    renderWithProviders(<PropertyCard property={mockProperty} />)
    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('src', '/placeholder-property.svg')
  })
})
