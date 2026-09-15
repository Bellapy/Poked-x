import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getCardById } from '../api/pokemonTcg'

export default function CardDetails() {
  const { id } = useParams()
  const [card, setCard] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let cancelled = false
    setStatus('loading')

    getCardById(id)
      .then((data) => {
        if (cancelled) return
        setCard(data)
        setStatus('ready')
      })
      .catch(() => {
        if (cancelled) return
        setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [id])

  if (status === 'loading') return <div className="p-6 text-white/50">Carregando carta...</div>
  if (status === 'error' || !card) {
    return <div className="p-6 text-pokedex-red">Carta não encontrada.</div>
  }

  return (
    <div className="p-6 grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      <img src={card.images.large} alt={card.name} className="rounded-xl w-full" />

      <div>
        <h1 className="text-3xl font-bold">{card.name}</h1>
        <p className="text-white/40 mt-1">{card.rarity ?? 'Sem raridade'}</p>

        <dl className="mt-6 space-y-2 text-sm">
          <div className="flex justify-between border-b border-white/10 pb-2">
            <dt className="text-white/50">Tipo</dt>
            <dd>{card.types?.join(', ') ?? '—'}</dd>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-2">
            <dt className="text-white/50">Edição</dt>
            <dd>{card.set?.name ?? '—'}</dd>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-2">
            <dt className="text-white/50">Número</dt>
            <dd>
              {card.number}/{card.set?.printedTotal ?? '?'}
            </dd>
          </div>
        </dl>

        <p className="text-white/40 text-sm mt-6">
          Esta carta ainda não está anunciada para venda ou troca no mercado.
        </p>
      </div>
    </div>
  )
}
