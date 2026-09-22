import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCards } from '../context/CardsContext'
import { useCart } from '../context/CartContext'
import { buyListing, getListing, isForSale } from '../lib/market'

const PAYMENT_METHODS = ['Pix', 'Cartão de crédito', 'Boleto']

// Frete e prazo são cosméticos (REQUISITOS 4.6) mas precisam ser estáveis entre
// renders, senão o valor dança na tela enquanto o usuário escolhe o pagamento.
function fakeShipping(itemCount) {
  return 15 + itemCount * 5
}

export default function Checkout() {
  const { items, removeItem, clear } = useCart()
  const { getCard } = useCards()
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()

  const [payment, setPayment] = useState(PAYMENT_METHODS[0])
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)

  const { lines, subtotal } = useMemo(() => {
    const lines = items
      .map((item) => getListing(item.listingId))
      .filter((listing) => listing && isForSale(listing))
    return { lines, subtotal: lines.reduce((sum, l) => sum + l.price, 0) }
  }, [items])

  const [deliveryDays] = useState(() => 3 + Math.floor(Math.random() * 7))
  const shipping = fakeShipping(lines.length)

  if (items.length === 0) return <Navigate to="/carrinho" replace />

  function handleConfirm() {
    setProcessing(true)
    setError('')

    const failures = []
    for (const listing of lines) {
      const result = buyListing({ buyerId: user.id, listingId: listing.id })
      if (result.ok) removeItem(listing.id)
      else failures.push(result.error)
    }

    refreshUser()
    setProcessing(false)

    if (failures.length > 0) {
      setError(failures[0])
      return
    }

    clear()
    navigate('/perfil')
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold text-ink">Checkout</h1>

      <ul className="space-y-2">
        {lines.map((listing) => (
          <li
            key={listing.id}
            className="flex items-center justify-between rounded-xl border border-arcade-panel-light bg-arcade-panel p-3 text-sm"
          >
            <span className="text-ink">{getCard(listing.cardId)?.name ?? listing.cardId}</span>
            <span className="font-mono-tabular text-glow-rare">{listing.price} PC</span>
          </li>
        ))}
      </ul>

      <dl className="mt-6 space-y-2 rounded-2xl border border-arcade-panel-light bg-arcade-panel p-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-ink-muted">Quantidade</dt>
          <dd>{lines.length} carta(s)</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-muted">Subtotal</dt>
          <dd className="font-mono-tabular">{subtotal} PC</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-muted">Frete estimado</dt>
          <dd className="font-mono-tabular">{shipping} PC</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-muted">Prazo de entrega</dt>
          <dd>{deliveryDays} dias úteis</dd>
        </div>
        <div className="flex justify-between border-t border-arcade-panel-light pt-2 text-base">
          <dt className="text-ink">Total</dt>
          <dd className="font-mono-tabular text-glow-rare">{subtotal} PC</dd>
        </div>
        <p className="text-xs text-ink-muted">
          O frete é apenas ilustrativo e não é cobrado — só o valor das cartas sai do seu saldo.
        </p>
      </dl>

      <fieldset className="mt-6">
        <legend className="mb-2 text-sm text-ink-muted">Forma de pagamento</legend>
        <div className="flex flex-wrap gap-2">
          {PAYMENT_METHODS.map((method) => (
            <button
              key={method}
              onClick={() => setPayment(method)}
              className={`rounded-full px-4 py-2 text-sm ${
                payment === method
                  ? 'bg-glow-rare text-arcade-bg'
                  : 'border border-arcade-panel-light text-ink-muted'
              }`}
            >
              {method}
            </button>
          ))}
        </div>
      </fieldset>

      <p className="mt-6 text-sm text-ink-muted">
        Seu saldo: <span className="font-mono-tabular text-ink">{user.balance} PC</span>
      </p>
      {error && <p className="mt-2 text-sm text-glow-common">{error}</p>}

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={handleConfirm}
          disabled={processing || lines.length === 0}
          className="rounded-full bg-glow-rare px-5 py-2 font-semibold text-arcade-bg disabled:opacity-50"
        >
          Confirmar compra
        </button>
        <Link to="/carrinho" className="text-sm text-ink-muted hover:text-ink">
          Voltar ao carrinho
        </Link>
      </div>
    </div>
  )
}
