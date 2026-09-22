import { Link } from 'react-router-dom'
import { getRarityTier } from '../lib/cardRarity'
import { isForSale } from '../lib/market'
import Button from './Button'
import HoloCard from './HoloCard'
import { CartIcon } from './icons'

const TIER = {
  common: { glow: 'var(--color-glow-common)', label: 'text-glow-common' },
  rare: { glow: 'var(--color-glow-rare)', label: 'text-glow-rare' },
  ultra: { glow: 'var(--color-glow-ultra-a)', label: 'text-white' },
}

// Anúncio na vitrine. O aviso de carta repetida existe porque a persona
// compradora precisa reconhecer de relance o que já tem na coleção.
//
// `holo` é opcional de propósito: o efeito custa duas camadas com mix-blend-mode
// e filter por carta, o que pesa no grid grande do mercado. Fica ligado só onde
// há poucas cartas na tela (cross-sell).
export default function ListingTile({
  listing,
  card,
  owned,
  isOwn,
  holo = false,
  inCart = false,
  onAddToCart,
}) {
  if (!card) return null

  const tier = TIER[getRarityTier(card)]
  const image = card.images.large ?? card.images.small

  return (
    <div className="group relative">
      {/* Halo colorido que acende por trás da carta no hover. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-2 -z-10 rounded-3xl opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-60"
        style={{ backgroundColor: tier.glow }}
      />

      <Link to={`/carta/${card.id}`} className="block">
        <div
          className="transition-transform duration-500 ease-out group-hover:-translate-y-3"
          style={{
            borderRadius: '4.55% / 3.5%',
            boxShadow: '0 18px 40px -18px rgba(0,0,0,0.9)',
          }}
        >
          {holo ? (
            <HoloCard src={image} alt={card.name} />
          ) : (
            <img
              src={image}
              alt={card.name}
              loading="lazy"
              className="w-full rounded-2xl"
              style={{ borderRadius: '4.55% / 3.5%' }}
            />
          )}
        </div>

        <div className="mt-3 px-1">
          <p className="truncate text-[15px] font-medium text-ink">{card.name}</p>
          <p className={`text-xs ${tier.label}`}>
            {card.rarity ?? 'Sem raridade'} · {listing.condition}
          </p>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
            {isForSale(listing) ? (
              <span className="font-mono-tabular text-lg text-ink">{listing.price} PC</span>
            ) : (
              <span className="text-sm text-glow-ultra-a">Aberta a trocas</span>
            )}

            {/* Anúncio "both" aparece nas duas seções, então precisa dizer que
                também aceita a outra forma de negociar. */}
            {listing.type === 'both' && (
              <span className="rounded-full border border-glow-ultra-a/40 px-2 py-0.5 text-[10px] text-glow-ultra-a">
                aceita troca
              </span>
            )}

            {isOwn && <span className="ml-auto text-[11px] text-ink-muted">Seu anúncio</span>}
          </div>

          {owned && !isOwn && (
            <p className="mt-1 text-[11px] text-glow-common">Você já tem esta carta</p>
          )}
        </div>
      </Link>

      {onAddToCart &&
        (isForSale(listing) ? (
          inCart ? (
            <Button to="/carrinho" variant="ghost" size="sm" className="mt-3 w-full">
              No carrinho
            </Button>
          ) : (
            <Button size="sm" className="mt-3 w-full" onClick={onAddToCart}>
              <CartIcon width={14} height={14} />
              Comprar
            </Button>
          )
        ) : (
          <Button to={`/troca/${listing.id}`} variant="ghost" size="sm" className="mt-3 w-full">
            Propor troca
          </Button>
        ))}
    </div>
  )
}
