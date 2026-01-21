import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Heart,
  MapPin,
  Bed,
  Bath,
  Maximize,
  Car,
  ChevronLeft,
  Share2,
  Loader2,
} from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import InquiryForm from '../components/property/InquiryForm'

const PLACEHOLDER_IMAGE = '/placeholder-property.svg'

function PropertyPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [imgError, setImgError] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ['property', id],
    queryFn: () => api.getProperty(id),
  })

  const { data: favoritesData } = useQuery({
    queryKey: ['favorites'],
    queryFn: api.getFavorites,
    enabled: !!user,
  })

  const isFavorite = favoritesData?.favorites?.some((f) => f.property_id === id)

  const addFavoriteMutation = useMutation({
    mutationFn: () => api.addFavorite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
    },
  })

  const removeFavoriteMutation = useMutation({
    mutationFn: () => api.removeFavorite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
    },
  })

  const toggleFavorite = () => {
    if (isFavorite) {
      removeFavoriteMutation.mutate()
    } else {
      addFavoriteMutation.mutate()
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: `Mira esta propiedad: ${property.title}`,
          url: window.location.href,
        })
      } catch (err) {
        // User cancelled or error
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Enlace copiado al portapapeles')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !data?.property) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Propiedad no encontrada</h2>
        <Link to="/">
          <Button>Volver al inicio</Button>
        </Link>
      </div>
    )
  }

  const property = data.property
  const amenities = typeof property.amenities === 'string'
    ? JSON.parse(property.amenities || '[]')
    : property.amenities || []

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Back button */}
      <Link
        to="/"
        className="inline-flex items-center text-muted hover:text-secondary mb-4 transition-colors"
      >
        <ChevronLeft className="w-5 h-5 mr-1" />
        Volver a propiedades
      </Link>

      {/* Header with actions */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-secondary mb-2">
            {property.title}
          </h1>
          <div className="flex items-center gap-2 text-muted">
            <MapPin className="w-4 h-4" />
            <span>{property.address}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleShare}>
            <Share2 className="w-4 h-4" />
          </Button>
          {user && (
            <Button
              variant={isFavorite ? 'primary' : 'secondary'}
              size="sm"
              onClick={toggleFavorite}
              disabled={addFavoriteMutation.isPending || removeFavoriteMutation.isPending}
            >
              <Heart
                className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`}
              />
            </Button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Property details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image */}
          <div className="aspect-[16/9] rounded-xl overflow-hidden bg-surface">
            <img
              src={imgError ? PLACEHOLDER_IMAGE : (property.photo || PLACEHOLDER_IMAGE)}
              alt={property.title}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          </div>

          {/* Price and status */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-3xl font-bold text-secondary">
                {formatPrice(property.price_soles)}
              </p>
              {property.price_usd && (
                <p className="text-muted">
                  US$ {property.price_usd.toLocaleString()}
                </p>
              )}
            </div>
            {property.status && <Badge variant="primary">{property.status}</Badge>}
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {property.bedrooms && (
              <div className="bg-surface rounded-xl p-4 text-center">
                <Bed className="w-6 h-6 mx-auto mb-2 text-muted" />
                <p className="font-semibold text-secondary">{property.bedrooms}</p>
                <p className="text-sm text-muted">Dormitorios</p>
              </div>
            )}
            {property.bathrooms && (
              <div className="bg-surface rounded-xl p-4 text-center">
                <Bath className="w-6 h-6 mx-auto mb-2 text-muted" />
                <p className="font-semibold text-secondary">{property.bathrooms}</p>
                <p className="text-sm text-muted">Baños</p>
              </div>
            )}
            {(property.area_range_m2 || property.area_m2) && (
              <div className="bg-surface rounded-xl p-4 text-center">
                <Maximize className="w-6 h-6 mx-auto mb-2 text-muted" />
                <p className="font-semibold text-secondary">
                  {property.area_m2 ? `${property.area_m2} m²` : property.area_range_m2}
                </p>
                <p className="text-sm text-muted">Área</p>
              </div>
            )}
            {property.parking_spaces && (
              <div className="bg-surface rounded-xl p-4 text-center">
                <Car className="w-6 h-6 mx-auto mb-2 text-muted" />
                <p className="font-semibold text-secondary">
                  {property.parking_spaces}
                </p>
                <p className="text-sm text-muted">Estacionamientos</p>
              </div>
            )}
          </div>

          {/* Amenities */}
          {amenities.length > 0 && amenities.some((a) => a && a.trim()) && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Amenidades</h2>
              <div className="flex flex-wrap gap-2">
                {amenities
                  .filter((a) => a && a.trim())
                  .map((amenity, index) => (
                    <Badge key={index}>{amenity.trim()}</Badge>
                  ))}
              </div>
            </div>
          )}

          {/* District info */}
          {property.district && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Ubicación</h2>
              <p className="text-muted">
                Esta propiedad se encuentra en{' '}
                <span className="text-secondary font-medium">
                  {property.district}
                </span>
                , Lima.
              </p>
            </div>
          )}
        </div>

        {/* Right column - Contact form */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white rounded-xl border border-border p-6">
            <InquiryForm propertyId={id} propertyTitle={property.title} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default PropertyPage
