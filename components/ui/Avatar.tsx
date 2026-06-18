'use client'
import Image from 'next/image'

interface AvatarProps {
  nome?: string
  fotoUrl?: string | null
  size?: number
  className?: string
}

export function Avatar({ nome, fotoUrl, size = 32, className = '' }: AvatarProps) {
  const initials = nome
    ? nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  if (fotoUrl) {
    return (
      <div
        className={`rounded-full overflow-hidden shrink-0 ${className}`}
        style={{ width: size, height: size }}
      >
        <Image
          src={fotoUrl}
          alt={nome || 'Avatar'}
          width={size}
          height={size}
          className="object-cover w-full h-full"
          unoptimized
        />
      </div>
    )
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-bold shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: 'linear-gradient(135deg, #E8671A, #FF8A3D)',
      }}
    >
      {initials}
    </div>
  )
}
