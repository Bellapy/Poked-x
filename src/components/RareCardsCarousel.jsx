import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getRarityTier } from '../api/pokemonTcg'
import { ChevronLeftIcon, ChevronRightIcon } from './icons'

const CARD_WIDTH = 150
const CARD_SPACING = 178

const TIER_GLOW = {
  common: 'var(--color-glow-common)',
  rare: 'var(--color-glow-rare)',
  ultra: 'var(--color-glow-ultra-a)',
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function CarouselCard({ card, offset, dragging }) {
  const tier = getRarityTier(card)
  const distance = Math.abs(offset) / CARD_SPACING
  const scale = clamp(1 - distance * 0.22, 0.62, 1)
  const opacity = clamp(1 - distance * 0.4, 0.25, 1)
  const rotateY = clamp(-Math.sign(offset) * distance * 26, -32, 32)
  const isFocused = distance < 0.5

  return (
    <Link
      to={`/carta/${card.id}`}
      draggable={false}
      className="absolute top-1/2 select-none rounded-2xl border border-arcade-panel-light bg-arcade-panel p-2"
      style={{
        width: CARD_WIDTH,
        left: '50%',
        zIndex: 100 - Math.round(distance * 10),
        transform: `translate(-50%, -50%) translateX(${offset}px) scale(${scale}) rotateY(${rotateY}deg)`,
        opacity,
        boxShadow: isFocused ? `0 14px 40px -10px ${TIER_GLOW[tier]}` : 'none',
        transition: dragging ? 'none' : 'transform 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.4s, box-shadow 0.3s',
      }}
    >
      <div className="overflow-hidden rounded-xl ring-1 ring-arcade-panel-light">
        <img src={card.images.small} alt={card.name} draggable={false} className="w-full" />
      </div>
      {isFocused && (
        <p className="mt-2 truncate text-center text-sm font-medium text-ink">{card.name}</p>
      )}
    </Link>
  )
}

export default function RareCardsCarousel({ cards }) {
  const [focusedIndex, setFocusedIndex] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [dragging, setDragging] = useState(false)
  const startXRef = useRef(0)

  function handlePointerDown(e) {
    startXRef.current = e.clientX
    setDragging(true)
  }

  function handlePointerMove(e) {
    if (!dragging) return
    setDragOffset(e.clientX - startXRef.current)
  }

  function endDrag() {
    if (!dragging) return
    const steps = Math.round(-dragOffset / CARD_SPACING)
    setFocusedIndex((i) => clamp(i + steps, 0, cards.length - 1))
    setDragOffset(0)
    setDragging(false)
  }

  function goTo(i) {
    setFocusedIndex(clamp(i, 0, cards.length - 1))
  }

  if (cards.length === 0) return null

  return (
    <div className="relative">
      <div
        className="relative h-72 touch-pan-y select-none overflow-hidden"
        style={{ perspective: 1000 }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
      >
        {cards.map((card, i) => (
          <CarouselCard
            key={card.id}
            card={card}
            dragging={dragging}
            offset={(i - focusedIndex) * CARD_SPACING + (dragging ? dragOffset : 0)}
          />
        ))}
      </div>

      <button
        onClick={() => goTo(focusedIndex - 1)}
        aria-label="Carta anterior"
        disabled={focusedIndex === 0}
        className="absolute left-0 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-arcade-panel-light bg-arcade-panel text-ink transition hover:shadow-[0_4px_16px_-4px_var(--color-glow-rare)] hover:ring-1 hover:ring-glow-rare disabled:opacity-30"
      >
        <ChevronLeftIcon />
      </button>
      <button
        onClick={() => goTo(focusedIndex + 1)}
        aria-label="Próxima carta"
        disabled={focusedIndex === cards.length - 1}
        className="absolute right-0 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-arcade-panel-light bg-arcade-panel text-ink transition hover:shadow-[0_4px_16px_-4px_var(--color-glow-rare)] hover:ring-1 hover:ring-glow-rare disabled:opacity-30"
      >
        <ChevronRightIcon />
      </button>
    </div>
  )
}
