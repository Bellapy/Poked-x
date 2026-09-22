import { useCallback, useRef } from 'react'

const MAX_TILT = 15

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

// Carta com o efeito holográfico "rainbow". Toda a reação ao cursor é escrita
// direto nas custom properties do nó — nunca via estado do React, porque um
// re-render por pointermove com várias cartas na tela derruba o frame rate.
//
// `restOpacity` deixa um brilho residual mesmo sem o mouse em cima (usado na
// carta em foco da roleta); o resto das cartas fica em 0 e só acende no hover.
export default function HoloCard({ src, alt, className = '', restOpacity = 0 }) {
  const rootRef = useRef(null)

  const setVars = useCallback((vars) => {
    const node = rootRef.current
    if (!node) return
    for (const [key, value] of Object.entries(vars)) node.style.setProperty(key, value)
  }, [])

  function handlePointerMove(e) {
    if (e.pointerType && e.pointerType !== 'mouse') return

    const rect = e.currentTarget.getBoundingClientRect()
    const fromLeft = clamp((e.clientX - rect.left) / rect.width, 0, 1)
    const fromTop = clamp((e.clientY - rect.top) / rect.height, 0, 1)

    // Distância normalizada até o centro: dirige a intensidade do brilho e do
    // reflexo especular, como no efeito original.
    const dx = fromLeft - 0.5
    const dy = fromTop - 0.5
    const fromCenter = clamp(Math.hypot(dx, dy) / 0.5, 0, 1)

    setVars({
      '--pointer-x': `${fromLeft * 100}%`,
      '--pointer-y': `${fromTop * 100}%`,
      '--pointer-from-left': fromLeft,
      '--pointer-from-top': fromTop,
      '--pointer-from-center': fromCenter,
      '--rotate-x': `${dx * MAX_TILT * 2}deg`,
      '--rotate-y': `${-dy * MAX_TILT * 2}deg`,
    })
  }

  function handlePointerEnter(e) {
    if (e.pointerType && e.pointerType !== 'mouse') return
    rootRef.current?.classList.add('holo--interacting')
    setVars({ '--card-opacity': 1 })
  }

  function handlePointerLeave() {
    rootRef.current?.classList.remove('holo--interacting')
    setVars({
      '--card-opacity': restOpacity,
      '--rotate-x': '0deg',
      '--rotate-y': '0deg',
      '--pointer-from-center': 0,
      '--pointer-x': '50%',
      '--pointer-y': '50%',
    })
  }

  return (
    <div
      ref={rootRef}
      className={`holo ${className}`}
      style={{ '--card-opacity': restOpacity }}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <div className="holo__rotator">
        <img className="holo__img" src={src} alt={alt} draggable={false} />
        <div className="holo__shine" />
        <div className="holo__glare" />
      </div>
    </div>
  )
}
