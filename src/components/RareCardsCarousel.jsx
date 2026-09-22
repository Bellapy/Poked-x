import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getRarityTier } from '../lib/cardRarity'
import HoloCard from './HoloCard'
import { ChevronLeftIcon, ChevronRightIcon } from './icons'

const CARD_WIDTH = 250
const SPACING = 280
// Quantas cartas desenhar de cada lado do centro. Só essa janela existe no DOM.
const WINDOW = 5
const DRAG_THRESHOLD = 8
const AUTO_ADVANCE_MS = 3000

const TIER_GLOW = {
  common: 'var(--color-glow-common)',
  rare: 'var(--color-glow-rare)',
  ultra: 'var(--color-glow-ultra-a)',
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

// Índice circular: é o que torna a roleta infinita nos dois sentidos. Ao passar
// do fim da lista o índice volta ao começo sozinho, sem clonar nós no DOM nem
// reposicionar scroll — que é de onde vem o "pulo" nas implementações comuns.
function wrap(index, length) {
  return ((index % length) + length) % length
}

function CarouselCard({ card, offset, dragging }) {
  const distance = Math.abs(offset) / SPACING
  const scale = clamp(1 - distance * 0.16, 0.6, 1)
  const opacity = clamp(1 - distance * 0.3, 0.18, 1)
  const rotateY = clamp(-Math.sign(offset) * distance * 22, -34, 34)
  const isFocused = distance < 0.5

  return (
    <div
      className="absolute left-1/2 top-1/2"
      style={{
        width: CARD_WIDTH,
        zIndex: 100 - Math.round(distance * 10),
        transform: `translate(-50%, -50%) translateX(${offset}px) scale(${scale}) rotateY(${rotateY}deg)`,
        opacity,
        filter: isFocused ? 'none' : 'brightness(0.65)',
        transition: dragging
          ? 'none'
          : 'transform 0.55s cubic-bezier(0.16,1,0.3,1), opacity 0.55s ease, filter 0.55s ease',
      }}
    >
      <Link
        to={`/carta/${card.id}`}
        draggable={false}
        className="block"
        style={{
          borderRadius: '4.55% / 3.5%',
          boxShadow: isFocused
            ? `0 30px 70px -20px ${TIER_GLOW[getRarityTier(card)]}, 0 10px 30px -10px rgba(0,0,0,0.9)`
            : '0 12px 30px -12px rgba(0,0,0,0.8)',
          transition: 'box-shadow 0.55s ease',
        }}
      >
        <HoloCard
          src={card.images.large ?? card.images.small}
          alt={card.name}
          restOpacity={isFocused ? 0.45 : 0}
        />
      </Link>
    </div>
  )
}

export default function RareCardsCarousel({ cards }) {
  // Índice virtual: cresce e diminui sem limite, e só vira índice real do array
  // na hora de escolher a carta. Começa no meio da lista.
  const [center, setCenter] = useState(() => Math.floor(cards.length / 2))
  const [dragOffset, setDragOffset] = useState(0)
  const [dragging, setDragging] = useState(false)
  const startXRef = useRef(0)
  const movedRef = useRef(0)

  // Avanço automático para a direita. Pausa enquanto o usuário arrasta, senão o
  // timer disputaria a posição com a mão dele e a roleta saltaria.
  useEffect(() => {
    if (dragging) return
    const timer = setInterval(() => setCenter((c) => c + 1), AUTO_ADVANCE_MS)
    return () => clearInterval(timer)
  }, [dragging])

  if (cards.length === 0) return null

  function handlePointerDown(e) {
    startXRef.current = e.clientX
    movedRef.current = 0
    setDragging(true)
  }

  function handlePointerMove(e) {
    if (!dragging) return
    const delta = e.clientX - startXRef.current
    movedRef.current = Math.max(movedRef.current, Math.abs(delta))
    setDragOffset(delta)
  }

  function endDrag() {
    if (!dragging) return
    setCenter((c) => c + Math.round(-dragOffset / SPACING))
    setDragOffset(0)
    setDragging(false)
  }

  // Um arrasto não pode virar navegação: sem isso, soltar o mouse em cima de
  // uma carta abriria a página dela.
  function handleClickCapture(e) {
    if (movedRef.current > DRAG_THRESHOLD) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  const slots = []
  for (let i = center - WINDOW; i <= center + WINDOW; i++) {
    slots.push({ virtualIndex: i, card: cards[wrap(i, cards.length)] })
  }

  return (
    <div className="relative w-full">
      <div
        className="relative h-[520px] w-full cursor-grab touch-pan-y select-none overflow-hidden active:cursor-grabbing"
        style={{ perspective: 1600 }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onClickCapture={handleClickCapture}
      >
        {slots.map(({ virtualIndex, card }) => (
          <CarouselCard
            key={virtualIndex}
            card={card}
            dragging={dragging}
            offset={(virtualIndex - center) * SPACING + dragOffset}
          />
        ))}
      </div>

      {/* Sem estado desabilitado: a roleta é circular, sempre há um próximo. */}
      <CarouselArrow side="left" onClick={() => setCenter((c) => c - 1)} />
      <CarouselArrow side="right" onClick={() => setCenter((c) => c + 1)} />
    </div>
  )
}

function CarouselArrow({ side, onClick }) {
  const isLeft = side === 'left'

  return (
    <button
      onClick={onClick}
      aria-label={isLeft ? 'Carta anterior' : 'Próxima carta'}
      className={`glass absolute top-1/2 z-[200] flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-arcade-panel-light text-ink transition-all duration-300 hover:scale-110 hover:border-glow-ultra-a ${
        isLeft ? 'left-6 md:left-12' : 'right-6 md:right-12'
      }`}
    >
      {isLeft ? <ChevronLeftIcon width={22} height={22} /> : <ChevronRightIcon width={22} height={22} />}
    </button>
  )
}
