import { useState } from 'react'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import Button from '../components/Button'
import HoloCard from '../components/HoloCard'
import { useAuth } from '../context/AuthContext'
import { useCards } from '../context/CardsContext'
import {
  CONDITIONS,
  createListing,
  estimateValue,
  getCollection,
  getListingByItem,
} from '../lib/market'

const TYPE_OPTIONS = [
  { id: 'sale', label: 'Venda', hint: 'Só aceita PokeCoins.' },
  { id: 'trade', label: 'Troca', hint: 'Só aceita outras cartas.' },
  { id: 'both', label: 'Ambos', hint: 'Aceita PokeCoins ou cartas.' },
]

export default function PublishListing() {
  const { itemId } = useParams()
  const { user } = useAuth()
  const { getCard, status } = useCards()
  const navigate = useNavigate()

  const item = getCollection(user.id).find((i) => i.id === itemId)
  const card = item ? getCard(item.cardId) : null

  // O seletor de carta pode indicar a intenção (?tipo=trade) para o formulário
  // já abrir na modalidade certa.
  const [searchParams] = useSearchParams()
  const intent = searchParams.get('tipo')
  const [type, setType] = useState(
    TYPE_OPTIONS.some((o) => o.id === intent) ? intent : 'sale',
  )
  const [condition, setCondition] = useState(item?.condition ?? 'Nova')
  const [price, setPrice] = useState('')
  const [error, setError] = useState('')

  if (status === 'loading') return <p className="p-6 text-ink-muted">Carregando...</p>
  if (!item) return <Navigate to="/perfil" replace />
  if (getListingByItem(item.id)) return <Navigate to="/perfil" replace />

  const suggested = card ? estimateValue(card, condition) : 0

  function handleSubmit(e) {
    e.preventDefault()

    const needsPrice = type !== 'trade'
    const finalPrice = needsPrice ? Number(price || suggested) : null
    if (needsPrice && (!finalPrice || finalPrice < 1)) {
      setError('Informe um preço válido em PokeCoins.')
      return
    }

    const result = createListing({
      ownerId: user.id,
      itemId: item.id,
      cardId: item.cardId,
      condition,
      type,
      price: finalPrice,
    })

    if (!result.ok) setError(result.error)
    else navigate('/perfil')
  }

  return (
    <div className="mx-auto grid max-w-4xl items-start gap-14 px-8 py-14 md:grid-cols-2">
      {card && (
        <div style={{ boxShadow: '0 40px 80px -30px rgba(0,0,0,0.95)', borderRadius: '4.55% / 3.5%' }}>
          <HoloCard src={card.images.large} alt={card.name} restOpacity={0.3} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-7">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink">Anunciar carta</h1>
          <p className="mt-1 font-light text-ink-muted">{card?.name ?? item.cardId}</p>
        </div>

        <fieldset>
          <legend className="mb-3 text-xs font-light uppercase tracking-wider text-ink-muted">
            Como você quer negociar
          </legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {TYPE_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setType(option.id)}
                className={`rounded-2xl border p-4 text-left transition-colors duration-300 ${
                  type === option.id
                    ? 'border-glow-ultra-a bg-glow-ultra-a/10 text-ink'
                    : 'border-arcade-panel-light bg-arcade-panel text-ink-muted hover:text-ink'
                }`}
              >
                <span className="block text-sm font-semibold">{option.label}</span>
                <span className="mt-1 block text-[11px] font-light leading-snug">{option.hint}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <label className="flex flex-col gap-2 text-sm">
          <span className="text-xs font-light uppercase tracking-wider text-ink-muted">
            Estado de conservação
          </span>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="rounded-full border border-arcade-panel-light bg-arcade-panel px-5 py-3 font-light text-ink"
          >
            {CONDITIONS.map((c) => (
              <option key={c} value={c} className="bg-arcade-bg">
                {c}
              </option>
            ))}
          </select>
        </label>

        {type !== 'trade' && (
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-xs font-light uppercase tracking-wider text-ink-muted">
              Preço em PokeCoins
            </span>
            <input
              type="number"
              min="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder={String(suggested)}
              className="rounded-full border border-arcade-panel-light bg-arcade-panel px-5 py-3 font-light text-ink placeholder:text-ink-muted"
            />
            <span className="text-xs font-light text-ink-muted">
              Sugestão de mercado para o estado "{condition}": {suggested} PC.
            </span>
          </label>
        )}

        {error && <p className="text-sm text-glow-common">{error}</p>}

        <Button type="submit" size="lg">
          Publicar anúncio
        </Button>
      </form>
    </div>
  )
}
