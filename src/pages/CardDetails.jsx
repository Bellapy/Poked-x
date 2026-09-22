import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import Button from '../components/Button'
import HoloCard from '../components/HoloCard'
import { CartIcon } from '../components/icons'
import ListingTile from '../components/ListingTile'
import { useAuth } from '../context/AuthContext'
import { useCards } from '../context/CardsContext'
import { useCart } from '../context/CartContext'
import {
  estimateValue,
  getCollection,
  getListings,
  getUsers,
  isForSale,
  isForTrade,
} from '../lib/market'
import { shuffle } from '../lib/shuffle'

const CROSS_SELL_COUNT = 10

export default function CardDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const { getCard, status, marketVersion } = useCards()
  const { items, addItem } = useCart()

  const card = getCard(id)

  // Uma mesma carta pode estar anunciada por vários vendedores, em estados de
  // conservação e preços diferentes — por isso a página lista todas as ofertas.
  const { offers, sellerNames, owned, suggestions } = useMemo(() => {
    if (status !== 'ready') {
      return { offers: [], sellerNames: new Map(), owned: false, suggestions: [] }
    }

    const listings = getListings()
    return {
      offers: listings.filter((l) => l.cardId === id),
      sellerNames: new Map(getUsers().map((u) => [u.id, u.name])),
      owned: getCollection(user.id).some((i) => i.cardId === id),
      suggestions: shuffle(
        listings.filter((l) => l.cardId !== id && l.ownerId !== user.id),
      ).slice(0, CROSS_SELL_COUNT),
    }
    // marketVersion não é lido aqui de propósito: ele é o sinal de que o
    // localStorage mudou, que o React não tem como observar sozinho.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, id, user.id, marketVersion])

  if (status === 'loading') {
    return <div className="px-8 py-16 font-light text-ink-muted">Carregando carta...</div>
  }
  if (!card) return <div className="px-8 py-16 text-glow-common">Carta não encontrada.</div>

  const inCart = new Set(items.map((i) => i.listingId))

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-14">
      <div className="grid items-start gap-16 lg:grid-cols-[minmax(0,420px)_1fr]">
        <div
          className="lg:sticky lg:top-28"
          style={{ boxShadow: '0 50px 90px -40px rgba(0,0,0,0.95)', borderRadius: '4.55% / 3.5%' }}
        >
          <HoloCard src={card.images.large} alt={card.name} restOpacity={0.3} />
        </div>

        <div>
          <p className="font-mono-tabular text-xs tracking-[0.3em] text-ink-muted">
            {card.set?.name ?? 'Edição desconhecida'}
          </p>
          <h1 className="mt-3 text-5xl font-bold leading-tight tracking-tight text-ink">
            {card.name}
          </h1>
          <p className="mt-2 font-light text-ink-muted">{card.rarity ?? 'Sem raridade'}</p>
          {owned && (
            <p className="mt-3 inline-block rounded-full border border-glow-common/40 px-4 py-1.5 text-xs text-glow-common">
              Você já tem esta carta
            </p>
          )}

          <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-5 text-sm">
            <Spec label="Tipo" value={card.types?.join(', ') ?? '—'} />
            <Spec label="Edição" value={card.set?.name ?? '—'} />
            <Spec label="Número" value={`${card.number}/${card.set?.printedTotal ?? '?'}`} />
            <Spec
              label="Valor de referência"
              value={`${estimateValue(card)} PC`}
              accent
            />
          </dl>

          <h2 className="mt-14 text-xl font-bold text-ink">Ofertas no mercado</h2>

          {offers.length === 0 ? (
            <p className="glass mt-4 rounded-2xl border border-arcade-panel-light p-6 text-sm font-light text-ink-muted">
              Ninguém está anunciando esta carta no momento.
            </p>
          ) : (
            <ul className="mt-5 space-y-3">
              {offers.map((offer) => (
                <li
                  key={offer.id}
                  className="glass flex flex-wrap items-center gap-4 rounded-2xl border border-arcade-panel-light p-5 transition-colors duration-300 hover:border-glow-ultra-a/40"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-ink">
                      {sellerNames.get(offer.ownerId) ?? 'Desconhecido'}
                    </p>
                    <span className="mt-1.5 inline-block rounded-full border border-arcade-panel-light px-3 py-1 text-[11px] font-light text-ink-muted">
                      {offer.condition}
                    </span>
                  </div>

                  {offer.ownerId === user.id ? (
                    <span className="text-xs font-light text-ink-muted">Este anúncio é seu</span>
                  ) : (
                    // Um anúncio "both" oferece as duas ações lado a lado.
                    <div className="flex flex-wrap items-center gap-3">
                      {isForSale(offer) && (
                        <>
                          <span className="font-mono-tabular text-2xl text-ink">
                            {offer.price} PC
                          </span>
                          {inCart.has(offer.id) ? (
                            <Button to="/carrinho" variant="ghost" size="sm">
                              No carrinho
                            </Button>
                          ) : (
                            <Button size="sm" onClick={() => addItem(offer.id)}>
                              <CartIcon width={14} height={14} />
                              Adicionar
                            </Button>
                          )}
                        </>
                      )}

                      {isForTrade(offer) && (
                        <Button
                          to={`/troca/${offer.id}`}
                          variant={isForSale(offer) ? 'ghost' : 'primary'}
                          size="sm"
                        >
                          Propor troca
                        </Button>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {suggestions.length > 0 && (
        <section className="mt-28">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-ink">
                Outras cartas que você pode gostar
              </h2>
              <p className="mt-1 text-sm font-light text-ink-muted">
                Anúncios ativos de outros colecionadores.
              </p>
            </div>
            <Link
              to="/"
              className="shrink-0 text-sm font-light text-ink-muted transition-colors duration-300 hover:text-ink"
            >
              Ver tudo
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 lg:grid-cols-5">
            {suggestions.map((listing) => (
              <ListingTile
                key={listing.id}
                listing={listing}
                card={getCard(listing.cardId)}
                holo
                inCart={inCart.has(listing.id)}
                onAddToCart={() => addItem(listing.id)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function Spec({ label, value, accent }) {
  return (
    <div className="border-b border-arcade-panel-light pb-3">
      <dt className="text-xs font-light uppercase tracking-wider text-ink-muted">{label}</dt>
      <dd className={`mt-1.5 ${accent ? 'font-mono-tabular text-glow-rare' : 'text-ink'}`}>
        {value}
      </dd>
    </div>
  )
}
