'use client'

import { useState } from 'react'

interface RecipeImageProps {
  src: string | null
  alt: string
  className?: string
  fallbackClassName?: string
  fallbackSize?: 'small' | 'medium' | 'large'
}

const FALLBACK_SIZES = {
  small: 'text-5xl',
  medium: 'text-6xl',
  large: 'text-8xl',
}

export default function RecipeImage({
  src,
  alt,
  className = '',
  fallbackClassName = '',
  fallbackSize = 'large',
}: RecipeImageProps) {
  const [hasError, setHasError] = useState(false)

  // Show fallback if no src or if image failed to load
  if (!src || hasError) {
    return (
      <div
        className={`bg-gray-100 flex items-center justify-center ${fallbackClassName}`}
      >
        <span className={FALLBACK_SIZES[fallbackSize]}>🍴</span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
      loading="lazy"
    />
  )
}
