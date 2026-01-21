import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Grid3X3, Map, Loader2 } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import PropertyCard from '../components/property/PropertyCard'
import PropertyFilters from '../components/property/PropertyFilters'
import PropertyMap from '../components/property/PropertyMap'
import Button from '../components/ui/Button'

function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [viewMode, setViewMode] = useState('grid')
  const { user } = useAuth()

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    district: searchParams.get('district') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    priceRange: searchParams.get('priceRange') || '',
    minArea: searchParams.get('minArea') || '',
    maxArea: searchParams.get('maxArea') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
  })

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['properties', filters],
    queryFn: () => api.getProperties(filters),
  })

  const { data: favoritesData } = useQuery({
    queryKey: ['favorites'],
    queryFn: api.getFavorites,
    enabled: !!user,
  })

  const favoriteIds = new Set(
    favoritesData?.favorites?.map((f) => f.property_id) || []
  )

  const handleSearch = () => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value)
    })
    setSearchParams(params)
    refetch()
  }

  useEffect(() => {
    // Save search history if user is logged in
    if (user && Object.values(filters).some((v) => v)) {
      api.saveSearchHistory(filters).catch(() => {})
    }
  }, [filters, user])

  const properties = data?.properties || []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-secondary mb-3">
          Encuentra tu hogar ideal
        </h1>
        <p className="text-muted text-lg max-w-2xl mx-auto">
          Descubre departamentos y casas en los mejores distritos de Lima
        </p>
      </div>

      {/* Filters */}
      <PropertyFilters
        filters={filters}
        onFilterChange={setFilters}
        onSearch={handleSearch}
      />

      {/* View Toggle */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-muted text-sm">
          {isLoading
            ? 'Cargando...'
            : `${properties.length} propiedad${properties.length !== 1 ? 'es' : ''} encontrada${properties.length !== 1 ? 's' : ''}`}
        </p>
        <div className="flex items-center gap-2 bg-surface rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'grid'
                ? 'bg-white shadow text-secondary'
                : 'text-muted hover:text-secondary'
            }`}
          >
            <Grid3X3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'map'
                ? 'bg-white shadow text-secondary'
                : 'text-muted hover:text-secondary'
            }`}
          >
            <Map className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-red-500 mb-4">Error al cargar las propiedades</p>
          <Button onClick={() => refetch()}>Reintentar</Button>
        </div>
      ) : viewMode === 'grid' ? (
        properties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                isFavorite={favoriteIds.has(property.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted mb-4">
              No se encontraron propiedades con los filtros seleccionados
            </p>
            <Button
              variant="secondary"
              onClick={() => {
                setFilters({
                  search: '',
                  district: '',
                  bedrooms: '',
                  priceRange: '',
                  minArea: '',
                  maxArea: '',
                  minPrice: '',
                  maxPrice: '',
                })
                setSearchParams({})
              }}
            >
              Limpiar filtros
            </Button>
          </div>
        )
      ) : (
        <div className="h-[600px] rounded-xl overflow-hidden">
          <PropertyMap properties={properties} />
        </div>
      )}
    </div>
  )
}

export default HomePage
