import { useEffect, useRef } from 'react'

const COLORS = ['#ff8a3d', '#e0249c', '#8b7bff', '#4cc9f0', '#ffffff']
const SPARKS_PER_KEYSTROKE = 3

// Mede onde está o cursor de texto dentro do campo, para as faíscas saírem da
// ponta do que está sendo digitado e não do meio da caixa.
const measurer = document.createElement('canvas').getContext('2d')

function caretPosition(el) {
  const rect = el.getBoundingClientRect()
  const style = getComputedStyle(el)

  // Numa textarea o texto quebra em linhas e esta medida por largura não vale;
  // nesse caso as faíscas saem do fim do campo.
  if (el.tagName === 'TEXTAREA') {
    return { x: rect.right - 12, y: rect.top + 16 }
  }

  let caret
  try {
    // input[type=number] lança ao ler selectionStart em alguns navegadores.
    caret = el.selectionStart ?? el.value.length
  } catch {
    caret = el.value.length
  }

  const raw = el.value.slice(0, caret)
  const text = el.type === 'password' ? '•'.repeat(raw.length) : raw

  measurer.font =
    style.font || `${style.fontWeight} ${style.fontSize} / ${style.lineHeight} ${style.fontFamily}`

  const offset =
    (parseFloat(style.borderLeftWidth) || 0) +
    (parseFloat(style.paddingLeft) || 0) +
    measurer.measureText(text).width -
    el.scrollLeft

  return {
    x: Math.min(rect.left + offset, rect.right - 6),
    y: rect.top + rect.height / 2,
  }
}

// Faíscas ao digitar em qualquer campo do site. Ouve o evento no documento (que
// borbulha) em vez de exigir que cada formulário se conecte, e desenha direto no
// DOM com a Web Animations API — sem estado do React, que re-renderizaria a
// árvore inteira a cada tecla.
export default function TypingSparkles() {
  const layerRef = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const layer = layerRef.current
    if (!layer) return

    function spawn(x, y) {
      for (let i = 0; i < SPARKS_PER_KEYSTROKE; i++) {
        const spark = document.createElement('span')
        spark.className = 'type-spark'
        spark.style.left = `${x}px`
        spark.style.top = `${y}px`
        spark.style.background = COLORS[Math.floor(Math.random() * COLORS.length)]
        layer.appendChild(spark)

        const driftX = (Math.random() - 0.5) * 28
        const driftY = -12 - Math.random() * 24

        const animation = spark.animate(
          [
            { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
            {
              transform: `translate(calc(-50% + ${driftX}px), calc(-50% + ${driftY}px)) scale(0)`,
              opacity: 0,
            },
          ],
          { duration: 480 + Math.random() * 280, easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)' },
        )

        animation.onfinish = () => spark.remove()
      }
    }

    function handleInput(e) {
      const el = e.target
      const isField =
        el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement
      if (!isField) return

      const { x, y } = caretPosition(el)
      spawn(x, y)

      // Reinicia a animação do brilho do campo: sem remover a classe e forçar um
      // reflow, teclas seguidas não retriggam o keyframe.
      el.classList.remove('is-typing')
      void el.offsetWidth
      el.classList.add('is-typing')
    }

    document.addEventListener('input', handleInput)
    return () => {
      document.removeEventListener('input', handleInput)
      layer.replaceChildren()
    }
  }, [])

  return <div ref={layerRef} className="type-spark-layer" aria-hidden="true" />
}
