import { motion } from 'framer-motion'
import { useMemo } from 'react'
import Button from '../components/Button'
import { CartIcon, PokeballIcon, TrashIcon } from '../components/icons'
import { useAuth } from '../context/AuthContext'
import { useCards } from '../context/CardsContext'
import { useCart } from '../context/CartContext'
import { getRarityTier } from '../lib/cardRarity'
import { getListing, isForSale } from '../lib/market'

const TIER_LABEL = {
  common: 'text-glow-common',
  rare: 'text-glow-rare',
  ultra: 'text-glow-ultra-a',
}

export default function Cart() {
  const { items, removeItem } = useCart()
  const { getCard } = useCards()
  const { user } = useAuth()

  // Um anúncio pode ter sido vendido ou cancelado depois de entrar no carrinho.
  const { valid, stale, subtotal } = useMemo(() => {
    const valid = []
    const stale = []

    for (const item of items) {
      const listing = getListing(item.listingId)
      if (listing && isForSale(listing)) valid.push(listing)
      else stale.push(item)
    }

    return { valid, stale, subtotal: valid.reduce((sum, l) => sum + l.price, 0) }
  }, [items])

  if (items.length === 0) return <EmptyCart />

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-14">
      <h1 className="text-4xl font-bold tracking-tight text-ink">Carrinho</h1>
      <p className="mt-1 text-sm font-light text-ink-muted">
        {valid.length} carta(s) prontas para negociar.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {valid.map((listing, i) => (
            <CartRow
              key={listing.id}
              listing={listing}
              card={getCard(listing.cardId)}
              index={i}
              onRemove={() => removeItem(listing.id)}
            />
          ))}

          {stale.map((item) => (
            <div
              key={item.listingId}
              className="glass flex items-center justify-between rounded-2xl border border-glow-common/30 p-4 text-sm"
            >
              <span className="font-light text-glow-common">
                Um anúncio saiu do ar e não entra no total.
              </span>
              <Button variant="danger" size="sm" onClick={() => removeItem(item.listingId)}>
                <TrashIcon width={14} height={14} />
                Remover
              </Button>
            </div>
          ))}
        </div>

        <OrderSummary subtotal={subtotal} balance={user.balance} canCheckout={valid.length > 0} />
      </div>
    </div>
  )
}

function CartRow({ listing, card, index, onRemove }) {
  if (!card) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="glass group flex items-center gap-5 rounded-2xl border border-arcade-panel-light p-4 transition-colors duration-300 hover:border-glow-ultra-a/40"
    >
      <img
        src={card.images.small}
        alt={card.name}
        className="w-20 shrink-0 rounded-xl shadow-[0_10px_24px_-10px_rgba(0,0,0,0.9)]"
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-lg font-medium text-ink">{card.name}</p>
        <p className={`text-xs ${TIER_LABEL[getRarityTier(card)]}`}>
          {card.rarity ?? 'Sem raridade'}
        </p>
        <span className="mt-2 inline-block rounded-full border border-arcade-panel-light px-3 py-1 text-[11px] font-light text-ink-muted">
          {listing.condition}
        </span>
      </div>

      <div className="text-right">
        <p className="font-mono-tabular text-xl text-ink">{listing.price}</p>
        <p className="text-[11px] font-light text-ink-muted">PokeCoins</p>
      </div>

      <button
        onClick={onRemove}
        aria-label={`Remover ${card.name} do carrinho`}
        className="flex h-10 w-10 items-center justify-center rounded-full text-[#ff7a85] transition-colors duration-300 hover:bg-[#ff7a85]/12"
      >
        <TrashIcon />
      </button>
    </motion.div>
  )
}

function OrderSummary({ subtotal, balance, canCheckout }) {
  const insufficient = subtotal > balance

  return (
    <aside className="glass h-fit rounded-3xl border border-arcade-panel-light p-7 lg:sticky lg:top-28">
      <h2 className="text-lg font-bold text-ink">Resumo do pedido</h2>

      <dl className="mt-6 space-y-4 text-sm">
        <div className="flex items-center justify-between">
          <dt className="font-light text-ink-muted">Subtotal</dt>
          <dd className="font-mono-tabular text-ink">{subtotal} PC</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="font-light text-ink-muted">Taxa de troca</dt>
          <dd className="text-glow-rare">Grátis</dd>
        </div>

        <div className="flex items-end justify-between border-t border-arcade-panel-light pt-5">
          <dt className="font-medium text-ink">Total</dt>
          <dd className="font-mono-tabular text-3xl text-glow-rare">{subtotal} PC</dd>
        </div>
      </dl>

      <p className="mt-4 text-xs font-light text-ink-muted">
        Seu saldo: <span className="font-mono-tabular text-ink">{balance} PC</span>
      </p>
      {insufficient && (
        <p className="mt-2 text-xs text-glow-common">
          Saldo insuficiente — recarregue no seu perfil.
        </p>
      )}

      {/* O pulso vai no brilho, não na opacidade: opacidade piscando dá
          aparência de elemento carregando, não de chamada para ação. */}
      <motion.div
        className="mt-7 rounded-full"
        animate={
          canCheckout && !insufficient
            ? {
                boxShadow: [
                  '0 0 0 0 rgba(224,36,156,0)',
                  '0 0 0 12px rgba(224,36,156,0.12)',
                  '0 0 0 0 rgba(224,36,156,0)',
                ],
              }
            : undefined
        }
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Button to="/checkout" size="lg" className="w-full" disabled={!canCheckout}>
          <CartIcon />
          Finalizar compra
        </Button>
      </motion.div>
    </aside>
  )
}

function EmptyCart() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-8 py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="glass w-full max-w-lg rounded-3xl border border-arcade-panel-light px-12 py-16 text-center"
      >
        <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-glow-ultra-a/25 blur-2xl"
          />
          <PokeballIcon width={72} height={72} className="relative text-ink-muted" />
        </div>

        <h1 className="mt-8 text-3xl font-bold tracking-tight text-ink">
          Sua mochila está vazia!
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm font-light leading-relaxed text-ink-muted">
          Nenhuma carta por aqui ainda. Dê uma volta pelo mercado e encontre aquela que falta na
          sua coleção.
        </p>

        <Button to="/" size="lg" className="mt-9">
          Ver o mercado
        </Button>
      </motion.div>
    </div>
  )
}
