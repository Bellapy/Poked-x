import { useGLTF } from '@react-three/drei'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { getModelUrl } from '../api/pokemon3d'
import { useBannerPokemon } from '../lib/useBannerPokemon'
import PokemonStage, { ENTER_MS, EXIT_MS, SLOT_MS } from './PokemonStage'

const ENTER_S = ENTER_MS / 1000

export default function HeroBanner() {
  const { slides, status } = useBannerPokemon()
  const [actors, setActors] = useState([])

  const indexRef = useRef(0)
  const idRef = useRef(0)
  const timeoutsRef = useRef(new Set())

  useEffect(() => {
    if (slides.length === 0) return
    indexRef.current = 0
    idRef.current = 0
    setActors([{ id: 0, slide: slides[0], leaving: false }])
  }, [slides])

  useEffect(() => {
    if (slides.length < 2) return

    const timer = setInterval(() => {
      indexRef.current = (indexRef.current + 1) % slides.length
      idRef.current += 1

      // O que já estava em cena passa a sair no mesmo instante em que o novo
      // entra — os dois convivem durante a sobreposição.
      const entering = { id: idRef.current, slide: slides[indexRef.current], leaving: false }
      setActors((current) => [...current.map((a) => ({ ...a, leaving: true })), entering])

      const cleanup = setTimeout(() => {
        setActors((current) => current.filter((a) => !a.leaving))
        timeoutsRef.current.delete(cleanup)
      }, EXIT_MS)
      timeoutsRef.current.add(cleanup)
    }, SLOT_MS)

    return () => clearInterval(timer)
  }, [slides])

  useEffect(() => {
    const timeouts = timeoutsRef.current
    return () => {
      for (const id of timeouts) clearTimeout(id)
      timeouts.clear()
    }
  }, [])

  const current = actors.find((a) => !a.leaving)

  // Carrega o próximo modelo enquanto o atual ainda está parado: sem isso o
  // Suspense só resolve na hora da troca e o Pokémon "aparece" no meio da pista.
  useEffect(() => {
    if (slides.length < 2 || !current) return
    const nextIndex = (slides.indexOf(current.slide) + 1) % slides.length
    useGLTF.preload(getModelUrl(slides[nextIndex].dexId))
  }, [current, slides])

  if (status === 'loading' || !current) {
    return <div className="h-[52vh] max-h-[560px] min-h-[380px] w-full" />
  }

  return (
    // Altura fixa + overflow hidden: o banner é uma caixa fechada. Nada que
    // aconteça na cena 3D pode vazar para o header ou para as cartas de baixo.
    <section
      className="relative h-[52vh] max-h-[560px] min-h-[380px] w-full overflow-hidden"
      style={{
        // Esfumaça a base do banner para que ele se dissolva no fundo da
        // página em vez de terminar numa borda reta.
        maskImage: 'linear-gradient(to bottom, black 62%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 62%, transparent 100%)',
      }}
    >
      <AnimatePresence>
        <motion.img
          key={`art-${current.id}`}
          src={current.slide.artworkUrl}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full scale-125 object-cover blur-3xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.35 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
        />
      </AnimatePresence>

      <PokemonStage
        className="absolute inset-0 z-10"
        actors={actors.map((a) => ({
          id: a.id,
          url: getModelUrl(a.slide.dexId),
          leaving: a.leaving,
        }))}
      />

      {/* A ficha fica fora do fluxo, absoluta e acima da cena, ocupando a metade
          direita: assim ela nunca empurra nem é empurrada pelo Pokémon, que
          descansa do lado esquerdo. Sobe um pouco do centro para não cair na
          faixa onde a máscara começa a esfumaçar a base. */}
      <div className="pointer-events-none absolute inset-y-0 right-[5%] z-20 flex w-[52%] max-w-2xl -translate-y-[4%] flex-col justify-center md:right-[8%] md:w-[46%]">
        <AnimatePresence>
          <motion.div
            key={`info-${current.id}`}
            className="absolute inset-x-0"
            initial={{ opacity: 0, y: 28 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: { delay: ENTER_S, duration: 0.8, ease: [0.16, 1, 0.3, 1] },
            }}
            exit={{ opacity: 0, y: -18, transition: { duration: 0.5, ease: 'easeIn' } }}
          >
            <p className="font-mono-tabular text-xs tracking-[0.4em] text-ink-muted">
              N° {String(current.slide.dexId).padStart(3, '0')}
            </p>

            <h2 className="text-gradient font-display mt-2 text-5xl font-bold tracking-tight md:text-7xl">
              {current.slide.name}
            </h2>

            <div className="mt-4 flex flex-wrap gap-2">
              {current.slide.types.map((type) => (
                <span
                  key={type}
                  className="rounded-full border border-arcade-panel-light bg-arcade-panel px-3 py-1 text-[11px] font-light tracking-wide text-ink backdrop-blur-md"
                >
                  {type}
                </span>
              ))}
            </div>

            <p className="mt-4 max-w-md text-sm font-light leading-relaxed text-ink-muted">
              {current.slide.blurb}
            </p>

            <dl className="mt-4 flex gap-8 text-xs font-light text-ink-muted">
              <div>
                <dt className="uppercase tracking-wider">Altura</dt>
                <dd className="font-mono-tabular mt-0.5 text-sm text-ink">
                  {current.slide.height}
                </dd>
              </div>
              <div>
                <dt className="uppercase tracking-wider">Peso</dt>
                <dd className="font-mono-tabular mt-0.5 text-sm text-ink">
                  {current.slide.weight}
                </dd>
              </div>
            </dl>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
