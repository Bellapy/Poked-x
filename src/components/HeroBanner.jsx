import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { getModelUrl } from '../api/pokemon3d'
import { ChevronLeftIcon, ChevronRightIcon } from '../components/icons'
import { useBannerPokemon } from '../lib/useBannerPokemon'
import PokemonScene3D from './PokemonScene3D'

const AUTO_ADVANCE_MS = 6000
const EXIT_MS = 900

const letterVariants = {
  hidden: { y: '100%' },
  visible: (i) => ({
    y: '0%',
    transition: { delay: 0.35 + i * 0.035, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  }),
}

function AnimatedName({ name }) {
  return (
    <h2 className="font-display flex overflow-hidden text-3xl font-bold text-ink md:text-4xl">
      {name.split('').map((char, i) => (
        <motion.span
          key={`${name}-${i}`}
          custom={i}
          initial="hidden"
          animate="visible"
          variants={letterVariants}
          className="inline-block"
        >
          {char === ' ' ? ' ' : char}
        </motion.span>
      ))}
    </h2>
  )
}

export default function HeroBanner({ highlightCards }) {
  const { slides, status } = useBannerPokemon(highlightCards)
  const [index, setIndex] = useState(0)
  const [current, setCurrent] = useState(null)
  const [outgoing, setOutgoing] = useState(null)
  const prevSlideRef = useRef(null)
  const exitTimerRef = useRef(null)

  useEffect(() => {
    if (slides.length === 0) return
    const next = slides[index % slides.length]
    const prev = prevSlideRef.current

    if (prev && prev.dexId !== next.dexId) {
      setOutgoing(prev)
      clearTimeout(exitTimerRef.current)
      exitTimerRef.current = setTimeout(() => setOutgoing(null), EXIT_MS)
    }

    prevSlideRef.current = next
    setCurrent(next)
  }, [index, slides])

  useEffect(() => () => clearTimeout(exitTimerRef.current), [])

  useEffect(() => {
    if (slides.length < 2) return
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length)
    }, AUTO_ADVANCE_MS)
    return () => clearInterval(timer)
  }, [slides.length])

  if (status === 'loading' || slides.length === 0 || !current) {
    return (
      <section className="flex h-96 items-center justify-center rounded-2xl border border-arcade-panel-light bg-arcade-panel text-ink-muted">
        {status === 'loading' ? 'Aquecendo as vitrines...' : 'Nenhum modelo 3D disponível no momento.'}
      </section>
    )
  }

  function goTo(i) {
    setIndex(((i % slides.length) + slides.length) % slides.length)
  }

  return (
    <section className="relative rounded-[28px] border-2 border-arcade-panel-light bg-arcade-panel p-2 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)]">
      <div className="relative h-96 overflow-hidden rounded-2xl bg-arcade-bg">
        <AnimatePresence mode="sync">
          <motion.img
            key={current.dexId}
            src={current.artworkUrl}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-arcade-bg via-arcade-bg/20 to-transparent" />

        {outgoing && (
          <PokemonScene3D
            key={`out-${outgoing.dexId}`}
            url={getModelUrl(outgoing.dexId)}
            mode="leave"
            className="pointer-events-none absolute inset-0"
          />
        )}
        <PokemonScene3D
          key={`in-${current.dexId}`}
          url={getModelUrl(current.dexId)}
          mode="arrive"
          className="absolute inset-0"
        />

        <span className="font-mono-tabular absolute left-6 top-6 text-xs text-ink-muted">
          JANELA {String(index + 1).padStart(2, '0')}/{String(slides.length).padStart(2, '0')}
        </span>

        <div className="absolute bottom-6 left-6">
          <AnimatedName key={current.dexId} name={current.name} />
        </div>

        {slides.length > 1 && (
          <>
            <button
              onClick={() => goTo(index - 1)}
              aria-label="Pokémon anterior"
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-arcade-panel-light bg-arcade-panel text-ink transition hover:shadow-[0_4px_16px_-4px_var(--color-glow-rare)] hover:ring-1 hover:ring-glow-rare"
            >
              <ChevronLeftIcon />
            </button>
            <button
              onClick={() => goTo(index + 1)}
              aria-label="Próximo Pokémon"
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-arcade-panel-light bg-arcade-panel text-ink transition hover:shadow-[0_4px_16px_-4px_var(--color-glow-rare)] hover:ring-1 hover:ring-glow-rare"
            >
              <ChevronRightIcon />
            </button>

            <div className="absolute bottom-6 right-6 flex gap-2">
              {slides.map((slide, i) => (
                <button
                  key={slide.dexId}
                  onClick={() => goTo(i)}
                  aria-label={`Ir para ${slide.name}`}
                  className={`h-2 w-2 rounded-full transition ${
                    i === index
                      ? 'bg-glow-rare shadow-[0_2px_8px_-1px_var(--color-glow-rare)]'
                      : 'bg-arcade-panel-light'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
