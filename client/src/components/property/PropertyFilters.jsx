import { useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'

const districts = [
  { value: '', label: 'Todos los distritos' },
  { value: 'Miraflores', label: 'Miraflores' },
  { value: 'San Isidro', label: 'San Isidro' },
  { value: 'Surco', label: 'Santiago de Surco' },
  { value: 'Barranco', label: 'Barranco' },
  { value: 'San Borja', label: 'San Borja' },
  { value: 'La Molina', label: 'La Molina' },
  { value: 'Lince', label: 'Lince' },
  { value: 'Chorrillos', label: 'Chorrillos' },
  { value: 'Breña', label: 'Breña' },
]

const bedroomOptions = [
  { value: '', label: 'Cualquier cantidad' },
  { value: '1', label: '1 dormitorio' },
  { value: '2', label: '2 dormitorios' },
  { value: '3', label: '3 dormitorios' },
  { value: '4+', label: '4+ dormitorios' },
]

const priceRanges = [
  { value: '', label: 'Cualquier precio' },
  { value: '0-200000', label: 'Hasta S/ 200,000' },
  { value: '200000-400000', label: 'S/ 200,000 - S/ 400,000' },
  { value: '400000-600000', label: 'S/ 400,000 - S/ 600,000' },
  { value: '600000-1000000', label: 'S/ 600,000 - S/ 1,000,000' },
  { value: '1000000-', label: 'Más de S/ 1,000,000' },
]

function PropertyFilters({ filters, onFilterChange, onSearch }) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleChange = (field, value) => {
    onFilterChange({ ...filters, [field]: value })
  }

  const clearFilters = () => {
    onFilterChange({
      search: '',
      district: '',
      bedrooms: '',
      priceRange: '',
      minArea: '',
      maxArea: '',
    })
  }

  const hasActiveFilters = Object.values(filters).some(
    (v) => v !== '' && v !== undefined
  )

  return (
    <div className="bg-white rounded-xl border border-border p-4 mb-6">
      {/* Main search bar */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            type="text"
            placeholder="Buscar por título, dirección..."
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <Button onClick={onSearch}>Buscar</Button>
        <Button
          variant="secondary"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filtros</span>
        </Button>
      </div>

      {/* Quick filters */}
      <div className="flex flex-wrap gap-3">
        <div className="w-full sm:w-auto sm:min-w-[180px]">
          <Select
            options={districts}
            value={filters.district || ''}
            onChange={(e) => handleChange('district', e.target.value)}
            placeholder="Distrito"
          />
        </div>
        <div className="w-full sm:w-auto sm:min-w-[180px]">
          <Select
            options={bedroomOptions}
            value={filters.bedrooms || ''}
            onChange={(e) => handleChange('bedrooms', e.target.value)}
            placeholder="Dormitorios"
          />
        </div>
        <div className="w-full sm:w-auto sm:min-w-[200px]">
          <Select
            options={priceRanges}
            value={filters.priceRange || ''}
            onChange={(e) => handleChange('priceRange', e.target.value)}
            placeholder="Precio"
          />
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters} className="text-muted">
            <X className="w-4 h-4 mr-1" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="Área mínima (m²)"
              type="number"
              value={filters.minArea || ''}
              onChange={(e) => handleChange('minArea', e.target.value)}
              placeholder="Ej: 50"
            />
            <Input
              label="Área máxima (m²)"
              type="number"
              value={filters.maxArea || ''}
              onChange={(e) => handleChange('maxArea', e.target.value)}
              placeholder="Ej: 200"
            />
            <Input
              label="Precio mínimo (S/)"
              type="number"
              value={filters.minPrice || ''}
              onChange={(e) => handleChange('minPrice', e.target.value)}
              placeholder="Ej: 100000"
            />
            <Input
              label="Precio máximo (S/)"
              type="number"
              value={filters.maxPrice || ''}
              onChange={(e) => handleChange('maxPrice', e.target.value)}
              placeholder="Ej: 500000"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default PropertyFilters
