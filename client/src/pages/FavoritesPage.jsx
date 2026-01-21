import { useQuery } from '@tanstack/react-query'
import { Heart, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import PropertyCard from '../components/property/PropertyCard'
import Button from '../components/ui/Button'

function FavoritesPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['favorites'],
    queryFn: api.getFavorites,
  })

  const favorites = data?.favorites || []

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-red-500 mb-4">Error al cargar tus favoritos</p>
        <Button onClick={() => window.location.reload()}>Reintentar</Button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Heart className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-secondary">Mis favoritos</h1>
          <p className="text-muted text-sm">
            {favorites.length} propiedad{favorites.length !== 1 ? 'es' : ''} guardada{favorites.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((favorite) => (
            <PropertyCard
              key={favorite.property_id}
              property={favorite.property}
              isFavorite={true}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Heart className="w-16 h-16 text-border mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            Aún no tienes favoritos
          </h2>
          <p className="text-muted mb-6">
            Guarda las propiedades que te gusten para verlas más tarde
          </p>
          <Link to="/">
            <Button>Explorar propiedades</Button>
          </Link>
        </div>
      )}
    </div>
  )
}

export default FavoritesPage
