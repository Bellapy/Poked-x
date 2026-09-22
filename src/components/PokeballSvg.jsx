import { useId } from 'react'

// Desenho compartilhado pelo cursor e pela animação de abertura. O id do
// gradiente vem do useId porque dois SVGs com o mesmo id no documento fazem um
// sobrescrever o preenchimento do outro.
export default function PokeballSvg({ size = 28, className }) {
  const gradientId = useId()

  return (
    <svg viewBox="0 0 32 32" width={size} height={size} className={className}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff5f6d" />
          <stop offset="100%" stopColor="#e01e37" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="15" fill="#f7f4ff" />
      <path d="M1 16a15 15 0 0 1 30 0Z" fill={`url(#${gradientId})`} />
      <path d="M1 16h30" stroke="#120d1c" strokeWidth="3" />
      <circle cx="16" cy="16" r="5.4" fill="#120d1c" />
      <circle cx="16" cy="16" r="3.6" fill="#f7f4ff" />
      <circle cx="16" cy="16" r="1.6" fill="#cfc7e6" />
      <circle cx="16" cy="16" r="15" fill="none" stroke="#120d1c" strokeWidth="2" />
    </svg>
  )
}
