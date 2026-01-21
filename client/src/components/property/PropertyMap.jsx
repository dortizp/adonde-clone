import { useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Link } from 'react-router-dom'
import L from 'leaflet'

const PLACEHOLDER_IMAGE = '/placeholder-property.svg'

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Custom price marker icon
const createPriceIcon = (price) => {
  const formattedPrice = price >= 1000000
    ? `${(price / 1000000).toFixed(1)}M`
    : `${Math.round(price / 1000)}K`

  return L.divIcon({
    className: 'custom-price-marker',
    html: `
      <div style="
        background: white;
        border: 2px solid #222;
        border-radius: 20px;
        padding: 4px 10px;
        font-size: 12px;
        font-weight: 600;
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      ">
        S/ ${formattedPrice}
      </div>
    `,
    iconSize: [80, 30],
    iconAnchor: [40, 30],
  })
}

function PropertyMap({ properties, center = [-12.0464, -77.0428], zoom = 12 }) {
  const propertiesWithCoords = properties.filter(
    (p) => p.latitude && p.longitude
  )

  if (propertiesWithCoords.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-surface rounded-xl">
        <p className="text-muted">No hay propiedades con ubicación disponible</p>
      </div>
    )
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="h-full w-full rounded-xl"
      style={{ minHeight: '400px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {propertiesWithCoords.map((property) => (
        <Marker
          key={property.id}
          position={[property.latitude, property.longitude]}
          icon={createPriceIcon(property.price_soles)}
        >
          <Popup>
            <Link
              to={`/property/${property.id}`}
              className="block w-48 no-underline"
            >
              <img
                src={property.photo || PLACEHOLDER_IMAGE}
                alt={property.title}
                className="w-full h-24 object-cover rounded-lg mb-2 bg-surface"
                onError={(e) => { e.target.src = PLACEHOLDER_IMAGE }}
              />
              <h3 className="font-semibold text-secondary text-sm line-clamp-1">
                {property.title}
              </h3>
              <p className="text-muted text-xs line-clamp-1">
                {property.address}
              </p>
              <p className="text-secondary font-bold text-sm mt-1">
                S/ {property.price_soles.toLocaleString()}
              </p>
            </Link>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

export default PropertyMap
