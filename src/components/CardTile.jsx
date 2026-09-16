import { Link } from 'react-router-dom'
import { getRarityTier } from '../api/pokemonTcg'

const TIER_STYLES = {
  common: {
    glow: 'bg-glow-common/30',
    ring: 'group-hover:ring-glow-common/70',
    shadow: 'group-hover:shadow-[0_10px_30px_-8px_var(--color-glow-common)]',
    label: 'text-glow-common',
  },
  rare: {
    glow: 'bg-glow-rare/30',
    ring: 'group-hover:ring-glow-rare/70',
    shadow: 'group-hover:shadow-[0_10px_30px_-8px_var(--color-glow-rare)]',
    label: 'text-glow-rare',
  },
  ultra: {
    glow: 'holo-glow opacity-40',
    ring: 'group-hover:ring-white/80',
    shadow: 'group-hover:shadow-[0_10px_36px_-6px_var(--color-glow-ultra-a)]',
    label: 'text-white',
  },
}

// Um código curto tipo "A7" de máquina de cápsulas, derivado da própria carta.
function slotCode(card) {
  const setCode = card.set?.ptcgoCode ?? card.set?.id?.slice(0, 3).toUpperCase() ?? '—'
  return `${setCode}-${card.number}`
}

export default function CardTile({ card }) {
  const tier = getRarityTier(card)
  const styles = TIER_STYLES[tier]

  return (
    <Link
      to={`/carta/${card.id}`}
      className="group relative flex flex-col rounded-2xl border border-arcade-panel-light bg-arcade-panel p-3 ring-1 ring-transparent transition-all duration-300 hover:-translate-y-1"
    >
      <span
        aria-hidden="true"
        className={`absolute inset-3 -z-10 rounded-xl blur-xl transition-opacity duration-300 ${styles.glow}`}
      />
      <div
        className={`relative overflow-hidden rounded-xl ring-1 ring-arcade-panel-light transition-all duration-300 ${styles.ring} ${styles.shadow}`}
      >
        <img src={card.images.small} alt={card.name} className="w-full" loading="lazy" />
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="truncate text-sm font-medium text-ink">{card.name}</p>
        <span className={`font-mono-tabular shrink-0 text-[11px] ${styles.label}`}>
          {slotCode(card)}
        </span>
      </div>
    </Link>
  )
}
