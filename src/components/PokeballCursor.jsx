import { useEffect, useRef } from 'react'
import PokeballSvg from './PokeballSvg'

const INTERACTIVE = 'a, button, input, select, textarea, label, [role="button"]'

// Quão rápido cada camada persegue o ponteiro. A bola quase acompanha; o halo
// fica para trás de propósito, e é essa diferença que cria o rastro.
const BALL_EASE = 0.35
const RING_EASE = 0.12
const ROLL_FACTOR = 0.55

export default function PokeballCursor() {
  const ballRef = useRef(null)
  const ringRef = useRef(null)

  useEffect(() => {
    // Em telas de toque não existe ponteiro para seguir, e esconder o cursor
    // nativo só atrapalharia.
    if (!window.matchMedia('(pointer: fine)').matches) return

    const ball = ballRef.current
    const ring = ringRef.current
    if (!ball || !ring) return

    document.body.classList.add('has-pokeball-cursor')

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const ballPos = { ...target }
    const ringPos = { ...target }
    let rotation = 0
    let lastX = target.x
    let hovering = false
    let pressed = false
    let visible = false
    let frame

    function handleMove(e) {
      target.x = e.clientX
      target.y = e.clientY

      if (!visible) {
        visible = true
        ball.style.opacity = '1'
        ring.style.opacity = '1'
      }

      hovering = e.target instanceof Element && e.target.closest(INTERACTIVE) !== null
    }

    function handleLeave() {
      visible = false
      ball.style.opacity = '0'
      ring.style.opacity = '0'
    }

    const handleDown = () => {
      pressed = true
    }
    const handleUp = () => {
      pressed = false
    }

    function loop() {
      ballPos.x += (target.x - ballPos.x) * BALL_EASE
      ballPos.y += (target.y - ballPos.y) * BALL_EASE
      ringPos.x += (target.x - ringPos.x) * RING_EASE
      ringPos.y += (target.y - ringPos.y) * RING_EASE

      // A bola rola conforme o deslocamento horizontal, como uma pokébola de
      // verdade rolaria — em vez de só deslizar pela tela.
      rotation += (ballPos.x - lastX) * ROLL_FACTOR
      lastX = ballPos.x

      const ballScale = pressed ? 0.82 : hovering ? 1.15 : 1
      const ringScale = pressed ? 1.25 : hovering ? 1.4 : 1

      ball.style.transform = `translate3d(${ballPos.x}px, ${ballPos.y}px, 0) translate(-50%, -50%) scale(${ballScale}) rotate(${rotation}deg)`
      ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%) scale(${ringScale})`

      frame = requestAnimationFrame(loop)
    }

    frame = requestAnimationFrame(loop)
    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerdown', handleDown)
    window.addEventListener('pointerup', handleUp)
    document.addEventListener('mouseleave', handleLeave)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerdown', handleDown)
      window.removeEventListener('pointerup', handleUp)
      document.removeEventListener('mouseleave', handleLeave)
      document.body.classList.remove('has-pokeball-cursor')
    }
  }, [])

  return (
    <>
      <div ref={ringRef} className="pokeball-cursor-ring" aria-hidden="true" />
      <div ref={ballRef} className="pokeball-cursor" aria-hidden="true">
        <PokeballSvg size={28} />
      </div>
    </>
  )
}
