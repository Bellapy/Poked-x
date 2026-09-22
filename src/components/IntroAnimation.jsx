import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import PokeballSvg from './PokeballSvg'

const DURATION = 4.2

// Uma linha do tempo só, compartilhada pelas três camadas via `times`, para
// elas ficarem sincronizadas sem depender de setTimeout encadeado.
//
//  0     → 0.083  a bola surge                (~0.35s)
//  0.083 → 0.655  gira acelerando             (~2.4s — a parte que dá gosto de ver)
//  0.655 → 0.738  recua e encolhe             (~0.35s, antecipação antes do estouro)
//  0.738 → 0.881  explode para fora da tela   (~0.60s)
//  0.881 → 1      o clarão se dissolve        (~0.50s)
//
// As frações estão calculadas para que só o GIRO cresça ao alongar a abertura.
// Esticar tudo por igual deixaria a explosão lenta, e explosão lenta não lê
// como impacto — lê como lentidão.
const BALL = {
  scale: [0, 1, 1.05, 0.82, 55, 55],
  // Mais voltas para compensar o tempo maior: com a rotação antiga, o giro
  // ficaria visivelmente arrastado.
  rotate: [0, 260, 1800, 1880, 2160, 2160],
  opacity: [1, 1, 1, 1, 1, 0],
  times: [0, 0.083, 0.655, 0.738, 0.881, 1],
}

export default function IntroAnimation() {
  const [done, setDone] = useState(false)

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="intro"
          className="fixed inset-0 z-[100000] flex items-center justify-center overflow-hidden bg-arcade-bg"
          onClick={() => setDone(true)}
          initial={{ opacity: 1 }}
          animate={{ opacity: [1, 1, 1, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: DURATION, times: [0, 0.738, 0.91, 1], ease: 'linear' }}
          onAnimationComplete={() => setDone(true)}
        >
          {/* Brilho que pulsa atrás da bola enquanto ela gira. */}
          <motion.span
            aria-hidden="true"
            className="absolute h-64 w-64 rounded-full"
            style={{
              background:
                'radial-gradient(circle, hsl(322 90% 60% / 0.55), hsl(258 80% 55% / 0.25) 45%, transparent 70%)',
            }}
            animate={{ scale: [0, 1, 1.25, 0.9, 8], opacity: [0, 0.9, 1, 1, 0] }}
            transition={{
              duration: DURATION,
              times: [0, 0.083, 0.655, 0.738, 0.93],
              ease: 'easeOut',
            }}
          />

          <motion.div
            animate={BALL}
            transition={{ duration: DURATION, times: BALL.times, ease: 'easeInOut' }}
          >
            <PokeballSvg size={150} />
          </motion.div>

          {/* Clarão do estouro: entra no instante em que a bola toma a tela e
              se apaga junto com a cortina, entregando o fundo da home. */}
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at center, #fff 0%, hsl(322 90% 70%) 35%, hsl(258 80% 55%) 100%)',
            }}
            animate={{ opacity: [0, 0, 0.95, 0] }}
            transition={{ duration: DURATION, times: [0, 0.8, 0.881, 1], ease: 'easeOut' }}
          />

          <span className="absolute bottom-10 text-xs font-light tracking-widest text-ink-muted">
            clique para pular
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
