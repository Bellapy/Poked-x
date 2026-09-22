import { useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCards } from '../context/CardsContext'
import {
  estimateValue,
  executeTrade,
  getCollection,
  getListing,
  getListings,
  getUser,
  isForTrade,
} from '../lib/market'

export default function TradeProposal() {
  const { listingId } = useParams()
  const { user } = useAuth()
  const { getCard, status } = useCards()
  const navigate = useNavigate()

  const [selected, setSelected] = useState([])
  const [error, setError] = useState('')

  const listing = getListing(listingId)

  // Cartas já anunciadas não entram na oferta: elas estão comprometidas em outro
  // fluxo e sumiriam do mercado sem o anúncio ser encerrado.
  const offerable = useMemo(() => {
    if (status !== 'ready') return []
    const listedItemIds = new Set(getListings().map((l) => l.itemId))
    return getCollection(user.id).filter((item) => !listedItemIds.has(item.id))
  }, [status, user.id])

  if (status === 'loading') return <p className="p-6 text-ink-muted">Carregando...</p>
  if (!listing || !isForTrade(listing)) return <Navigate to="/" replace />
  if (listing.ownerId === user.id) return <Navigate to="/perfil" replace />

  const targetCard = getCard(listing.cardId)
  const targetValue = targetCard ? estimateValue(targetCard, listing.condition) : 0
  const owner = getUser(listing.ownerId)

  const offeredValue = selected.reduce((sum, itemId) => {
    const item = offerable.find((i) => i.id === itemId)
    const card = item && getCard(item.cardId)
    return sum + (card ? estimateValue(card, item.condition) : 0)
  }, 0)

  const enough = offeredValue >= targetValue

  function toggle(itemId) {
    setSelected((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId],
    )
  }

  function handleSubmit() {
    const result = executeTrade({
      proposerId: user.id,
      listingId: listing.id,
      offeredItemIds: selected,
      offeredValue,
      targetValue,
    })

    if (!result.ok) setError(result.error)
    else navigate('/perfil')
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-bold text-ink">Propor troca</h1>
      <p className="text-sm text-ink-muted">
        A troca é aceita automaticamente quando o valor somado da sua oferta cobre a carta desejada.
      </p>

      <section className="mt-6 flex items-center gap-4 rounded-2xl border border-arcade-panel-light bg-arcade-panel p-4">
        {targetCard && (
          <img src={targetCard.images.small} alt={targetCard.name} className="w-20 rounded-lg" />
        )}
        <div>
          <p className="font-bold text-ink">{targetCard?.name ?? listing.cardId}</p>
          <p className="text-xs text-ink-muted">
            {listing.condition} · de {owner?.name ?? 'desconhecido'}
          </p>
          <p className="font-mono-tabular text-sm text-glow-ultra-a">Vale {targetValue} PC</p>
        </div>
      </section>

      <h2 className="mt-8 text-lg font-bold text-ink">Escolha o que oferecer</h2>

      {offerable.length === 0 ? (
        <p className="mt-2 text-sm text-ink-muted">
          Você não tem cartas livres para oferecer — cartas já anunciadas não podem entrar numa
          troca.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {offerable.map((item) => {
            const card = getCard(item.cardId)
            const active = selected.includes(item.id)

            return (
              <button
                key={item.id}
                onClick={() => toggle(item.id)}
                className={`rounded-2xl border p-2 text-left ${
                  active
                    ? 'border-glow-ultra-a bg-glow-ultra-a/10'
                    : 'border-arcade-panel-light bg-arcade-panel'
                }`}
              >
                {card && (
                  <img src={card.images.small} alt={card.name} className="w-full rounded-lg" />
                )}
                <p className="mt-1 truncate text-xs text-ink">{card?.name ?? item.cardId}</p>
                <p className="text-[11px] text-ink-muted">{item.condition}</p>
                <p className="font-mono-tabular text-[11px] text-glow-rare">
                  {card ? estimateValue(card, item.condition) : 0} PC
                </p>
              </button>
            )
          })}
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-arcade-panel-light bg-arcade-panel p-4">
        <div>
          <p className="text-sm text-ink-muted">Sua oferta</p>
          <p className="font-mono-tabular text-2xl text-glow-rare">{offeredValue} PC</p>
          <p className={`text-xs ${enough ? 'text-glow-rare' : 'text-glow-common'}`}>
            {enough
              ? 'Oferta suficiente — a troca será aceita.'
              : `Faltam ${targetValue - offeredValue} PC para cobrir a carta.`}
          </p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={selected.length === 0 || !enough}
          className="rounded-full bg-glow-ultra-a px-5 py-2 font-semibold text-arcade-bg disabled:opacity-40"
        >
          Enviar proposta
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-glow-common">{error}</p>}
    </div>
  )
}
