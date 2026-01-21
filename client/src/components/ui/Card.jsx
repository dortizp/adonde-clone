import { useState } from 'react'

const PLACEHOLDER_IMAGE = '/placeholder-property.svg'

function Card({ children, className = '', hover = true, ...props }) {
  return (
    <div
      className={`
        bg-white rounded-xl border border-border overflow-hidden
        ${hover ? 'transition-shadow duration-200 hover:shadow-card' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}

function CardImage({ src, alt, aspectRatio = 'aspect-[4/3]', className = '' }) {
  const [imgError, setImgError] = useState(false)

  return (
    <div className={`${aspectRatio} overflow-hidden bg-surface ${className}`}>
      <img
        src={imgError ? PLACEHOLDER_IMAGE : (src || PLACEHOLDER_IMAGE)}
        alt={alt}
        className="w-full h-full object-cover"
        onError={() => setImgError(true)}
        loading="lazy"
      />
    </div>
  )
}

function CardContent({ children, className = '' }) {
  return <div className={`p-4 ${className}`}>{children}</div>
}

Card.Image = CardImage
Card.Content = CardContent

export default Card
