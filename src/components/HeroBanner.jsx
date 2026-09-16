import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { getModelUrl } from '../api/pokemon3d'
import { useBannerPokemon } from '../lib/useBannerPokemon'
import PokemonScene3D from './PokemonScene3D'

const AUTO_ADVANCE_MS = 6000

export default function HeroBanner({ highlightCards }) {
  const { slides, status } = useBannerPokemon(highlightCards)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (slides.length < 2) return
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length)
    }, AUTO_ADVANCE_MS)
    return () => clearInterval(timer)
  }, [slides.length])

  if (status === 'loading' || slides.length === 0) {
    return (
      <section className="h-96 rounded-2xl bg-gradient-to-br from-pokedex-red/40 to-pokedex-blue/40 flex items-center justify-center text-white/70">
        {status === 'loading' ? 'Carregando banner...' : 'Nenhum modelo 3D disponível no momento.'}
      </section>
    )
  }

  // Evita estourar o índice se a lista de slides encolher (ex.: nova busca de destaques).
  const current = slides[index % slides.length]

  function goTo(i) {
    setIndex(((i % slides.length) + slides.length) % slides.length)
  }

  return (
    <section className="relative h-96 rounded-2xl overflow-hidden">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={current.dexId}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <img
            src={current.artworkUrl}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover blur-2xl scale-110 opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-pokedex-red/50 via-black/40 to-pokedex-blue/50" />

          <PokemonScene3D url={getModelUrl(current.dexId)} className="absolute inset-0" />

          <motion.h2
            className="absolute bottom-6 left-6 text-3xl font-bold text-white drop-shadow-lg"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {current.name}
          </motion.h2>
        </motion.div>
      </AnimatePresence>

      {slides.length > 1 && (
        <>
          <button
            onClick={() => goTo(index - 1)}
            aria-label="Pokémon anterior"
            className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/40 text-white hover:bg-black/60"
          >
            ‹
          </button>
          <button
            onClick={() => goTo(index + 1)}
            aria-label="Próximo Pokémon"
            className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/40 text-white hover:bg-black/60"
          >
            ›
          </button>

          <div className="absolute bottom-6 right-6 flex gap-2">
            {slides.map((slide, i) => (
              <button
                key={slide.dexId}
                onClick={() => goTo(i)}
                aria-label={`Ir para ${slide.name}`}
                className={`h-2 w-2 rounded-full transition ${
                  i === index ? 'bg-white' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
