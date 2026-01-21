import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Bed, Maximize, MapPin } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import Badge from '../ui/Badge'

const PLACEHOLDER_IMAGE = '/placeholder-property.svg'

function PropertyCard({ property, isFavorite = false }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [imgError, setImgError] = useState(false)

  const addFavoriteMutation = useMutation({
    mutationFn: () => api.addFavorite(property.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
      queryClient.invalidateQueries({ queryKey: ['properties'] })
    },
  })

  const removeFavoriteMutation = useMutation({
    mutationFn: () => api.removeFavorite(property.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
      queryClient.invalidateQueries({ queryKey: ['properties'] })
    },
  })

  const toggleFavorite = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (isFavorite) {
      removeFavoriteMutation.mutate()
    } else {
      addFavoriteMutation.mutate()
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <Link to={`/property/${property.id}`} className="block group">
      <div className="card">
        <div className="relative aspect-[4/3] overflow-hidden bg-surface">
          <img
            src={imgError ? PLACEHOLDER_IMAGE : (property.photo || PLACEHOLDER_IMAGE)}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
            loading="lazy"
          />
          {user && (
            <button
              onClick={toggleFavorite}
              className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-all"
              disabled={addFavoriteMutation.isPending || removeFavoriteMutation.isPending}
            >
              <Heart
                className={`w-5 h-5 transition-colors ${
                  isFavorite ? 'fill-primary text-primary' : 'text-secondary'
                }`}
              />
            </button>
          )}
          {property.status && (
            <div className="absolute bottom-3 left-3">
              <Badge variant="primary">{property.status}</Badge>
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-secondary line-clamp-1 group-hover:text-primary transition-colors">
              {property.title}
            </h3>
          </div>

          <div className="flex items-center gap-1 text-muted text-sm mb-3">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="line-clamp-1">{property.address}</span>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted mb-3">
            {property.bedrooms && (
              <div className="flex items-center gap-1">
                <Bed className="w-4 h-4" />
                <span>{property.bedrooms}</span>
              </div>
            )}
            {property.area_range_m2 && (
              <div className="flex items-center gap-1">
                <Maximize className="w-4 h-4" />
                <span>{property.area_range_m2}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-lg font-bold text-secondary">
              {formatPrice(property.price_soles)}
            </p>
            {property.price_usd && (
              <p className="text-sm text-muted">
                US$ {property.price_usd.toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default PropertyCard
