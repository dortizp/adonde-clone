import { useQuery } from '@tanstack/react-query'
import { User, Heart, Mail, Calendar, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import Button from '../components/ui/Button'
import PropertyCard from '../components/property/PropertyCard'

function ProfilePage() {
  const { user, logout } = useAuth()

  const { data: favoritesData, isLoading: loadingFavorites } = useQuery({
    queryKey: ['favorites'],
    queryFn: api.getFavorites,
  })

  const { data: recommendationsData, isLoading: loadingRecommendations } = useQuery({
    queryKey: ['recommendations'],
    queryFn: api.getRecommendations,
  })

  const favorites = favoritesData?.favorites || []
  const recommendations = recommendationsData?.recommendations || []
  const favoriteIds = new Set(favorites.map((f) => f.property_id))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Profile header */}
      <div className="bg-white rounded-xl border border-border p-6 mb-8">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-secondary mb-1">
              {user?.name}
            </h1>
            <div className="flex items-center gap-2 text-muted mb-4">
              <Mail className="w-4 h-4" />
              <span>{user?.email}</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary" />
                <span className="text-muted">
                  {favorites.length} favorito{favorites.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted" />
                <span className="text-muted">
                  Miembro desde {new Date(user?.created_at).toLocaleDateString('es-PE', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>
          <Button variant="secondary" onClick={logout}>
            Cerrar sesión
          </Button>
        </div>
      </div>

      {/* Recent favorites */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-secondary">
            Tus favoritos recientes
          </h2>
          {favorites.length > 4 && (
            <Link to="/favorites" className="text-primary hover:underline text-sm">
              Ver todos
            </Link>
          )}
        </div>
        {loadingFavorites ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : favorites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {favorites.slice(0, 4).map((favorite) => (
              <PropertyCard
                key={favorite.property_id}
                property={favorite.property}
                isFavorite={true}
              />
            ))}
          </div>
        ) : (
          <div className="bg-surface rounded-xl p-8 text-center">
            <Heart className="w-12 h-12 text-border mx-auto mb-3" />
            <p className="text-muted">
              Aún no tienes favoritos.{' '}
              <Link to="/" className="text-primary hover:underline">
                Explora propiedades
              </Link>
            </p>
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div>
        <h2 className="text-xl font-semibold text-secondary mb-4">
          Recomendaciones para ti
        </h2>
        {loadingRecommendations ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : recommendations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendations.slice(0, 4).map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                isFavorite={favoriteIds.has(property.id)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-surface rounded-xl p-8 text-center">
            <p className="text-muted">
              Busca y guarda propiedades para recibir recomendaciones personalizadas.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfilePage
