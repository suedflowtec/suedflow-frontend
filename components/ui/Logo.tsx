// frontend/components/ui/Logo.tsx
import Image from 'next/image'

const MARK_RATIO = 673 / 378 // dimensões originais de /public/logo/suedflow-mark.png

interface LogoProps {
  /** Altura renderizada da marca, em px. A largura é calculada pela proporção original. */
  height?: number
  className?: string
}

/**
 * Marca SUEDFLOW oficial, sempre sobre sua plaquinha navy original —
 * mantém contraste consistente tanto no tema escuro quanto no tema claro.
 */
export function Logo({ height = 40, className = '' }: LogoProps) {
  const width = Math.round(height * MARK_RATIO)

  return (
    <span
      className={`inline-flex items-center justify-center rounded-xl shrink-0 ${className}`}
      style={{ background: '#0A1F35', padding: '4px 10px' }}
    >
      <Image
        src="/logo/suedflow-mark.png"
        alt="SUEDFLOW"
        width={width}
        height={height}
        priority
        style={{ height: `${height}px`, width: 'auto' }}
      />
    </span>
  )
}
