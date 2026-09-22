import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/Button'
import { PlusIcon, TrashIcon, WalletIcon } from '../components/icons'
import { useAuth } from '../context/AuthContext'
import { useCards } from '../context/CardsContext'
import {
  adjustBalance,
  estimateValue,
  getCollection,
  getListings,
  getUserTransactions,
  isForSale,
  LISTING_TYPES,
  removeListing,
  updateListing,
} from '../lib/market'
import { useReload } from '../lib/useReload'

const TOPUP_AMOUNT = 500

const TABS = [
  { id: 'collection', label: 'Minha coleção' },
  { id: 'listings', label: 'Meus anúncios' },
  { id: 'history', label: 'Histórico' },
]

const TRANSACTION_LABEL = {
  purchase: 'Compra',
  sale: 'Venda',
  trade_sent: 'Troca enviada',
  trade_received: 'Troca recebida',
}

const TRANSACTION_TONE = {
  purchase: 'text-glow-common',
  sale: 'text-glow-rare',
  trade_sent: 'text-glow-ultra-a',
  trade_received: 'text-glow-ultra-b',
}

export default function Profile() {
  const { user, refreshUser } = useAuth()
  const { getCard, status, marketVersion } = useCards()
  const [tab, setTab] = useState('collection')
  const [version, reload] = useReload()

  const data = useMemo(() => {
    const listings = getListings().filter((l) => l.ownerId === user.id)
    return {
      collection: getCollection(user.id),
      listings,
      listedItemIds: new Set(listings.map((l) => l.itemId)),
      transactions: getUserTransactions(user.id),
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id, version, status, marketVersion])

  function handleTopUp() {
    adjustBalance(user.id, TOPUP_AMOUNT)
    refreshUser()
  }

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-14">
      <TrainerCard
        user={user}
        collectionSize={data.collection.length}
        listingCount={data.listings.length}
        onTopUp={handleTopUp}
      />

      <nav className="mt-10 flex flex-wrap gap-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`relative rounded-full px-6 py-3 text-sm transition-colors duration-300 ${
              tab === t.id ? 'text-white' : 'text-ink-muted hover:text-ink'
            }`}
          >
            {/* layoutId faz o fundo da pill DESLIZAR de uma aba para a outra em
                vez de só trocar de cor — é o que dá a transição contínua. */}
            {tab === t.id && (
              <motion.span
                layoutId="profile-tab-pill"
                className="absolute inset-0 rounded-full bg-gradient-to-r from-glow-common via-magenta to-glow-ultra-b"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            )}
            {tab !== t.id && (
              <span className="glass absolute inset-0 rounded-full border border-arcade-panel-light" />
            )}
            <span className="relative font-medium">{t.label}</span>
          </button>
        ))}
      </nav>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10"
        >
          {tab === 'collection' && (
            <CollectionTab
              items={data.collection}
              listedItemIds={data.listedItemIds}
              getCard={getCard}
            />
          )}
          {tab === 'listings' && (
            <ListingsTab
              listings={data.listings}
              getCard={getCard}
              onRemove={(id) => {
                removeListing(id)
                reload()
              }}
              onReload={reload}
            />
          )}
          {tab === 'history' && <HistoryTab transactions={data.transactions} getCard={getCard} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function TrainerCard({ user, collectionSize, listingCount, onTopUp }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="glass relative overflow-hidden rounded-3xl border border-arcade-panel-light p-10"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-glow-ultra-a/20 blur-3xl"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-glow-common/15 blur-3xl"
      />

      <div className="relative flex flex-wrap items-start justify-between gap-10">
        <div className="flex items-center gap-6">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-glow-common via-magenta to-glow-ultra-b text-3xl font-bold text-white">
            {user.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <p className="font-mono-tabular text-[11px] tracking-[0.3em] text-ink-muted">
              CARTÃO DE TREINADOR
            </p>
            <h1 className="mt-1.5 text-4xl font-bold tracking-tight text-ink">{user.name}</h1>
            <p className="mt-1 text-sm font-light text-ink-muted">{user.email}</p>

            <div className="mt-4 flex flex-wrap gap-6 text-xs font-light text-ink-muted">
              <span>
                <strong className="font-mono-tabular text-base font-normal text-ink">
                  {collectionSize}
                </strong>{' '}
                cartas
              </span>
              <span>
                <strong className="font-mono-tabular text-base font-normal text-ink">
                  {listingCount}
                </strong>{' '}
                anúncios ativos
              </span>
              {user.role === 'admin' && (
                <span className="rounded-full border border-glow-ultra-a/40 px-3 py-0.5 text-glow-ultra-a">
                  administrador
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Carteira digital: o saldo é a informação mais importante da página. */}
        <div className="rounded-2xl border border-[#3ddbe0]/25 bg-[#3ddbe0]/[0.06] p-6">
          <div className="flex items-center gap-2 text-[#7ef0f2]">
            <WalletIcon width={16} height={16} />
            <span className="text-[11px] font-light uppercase tracking-[0.2em]">Carteira</span>
          </div>

          <p
            className="font-mono-tabular mt-3 text-5xl leading-none text-[#5ee9ec]"
            style={{ textShadow: '0 0 28px rgba(61,219,224,0.45)' }}
          >
            {user.balance}
          </p>
          <p className="mt-1 text-xs font-light text-ink-muted">PokeCoins disponíveis</p>

          <Button variant="ghost" size="sm" onClick={onTopUp} className="mt-5 w-full">
            <PlusIcon width={14} height={14} />
            Recarregar {TOPUP_AMOUNT}
          </Button>
        </div>
      </div>
    </motion.section>
  )
}

function CollectionTab({ items, listedItemIds, getCard }) {
  if (items.length === 0) {
    return <EmptyState text="Sua coleção está vazia." />
  }

  return (
    <>
      <div className="mb-8 flex flex-wrap gap-3">
        <Button to="/publicar?tipo=sale" variant="ghost" size="sm">
          <PlusIcon width={14} height={14} />
          Vender uma carta
        </Button>
        <Button to="/publicar?tipo=trade" variant="ghost" size="sm">
          <PlusIcon width={14} height={14} />
          Colocar carta para troca
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((item) => {
        const card = getCard(item.cardId)
        const listed = listedItemIds.has(item.id)

        return (
          <div key={item.id} className="group">
            {card && (
              <img
                src={card.images.small ?? card.images.large}
                alt={card.name}
                loading="lazy"
                className="w-full transition-transform duration-500 ease-out group-hover:-translate-y-2"
                style={{
                  borderRadius: '4.55% / 3.5%',
                  boxShadow: '0 18px 40px -18px rgba(0,0,0,0.9)',
                }}
              />
            )}

            <p className="mt-3 truncate px-1 text-[15px] font-medium text-ink">
              {card?.name ?? item.cardId}
            </p>
            <p className="px-1 text-xs font-light text-ink-muted">
              {item.condition}
              {card && ` · ~${estimateValue(card, item.condition)} PC`}
            </p>

            {listed ? (
              <p className="mt-3 rounded-full border border-glow-common/30 py-2 text-center text-xs text-glow-common">
                Já anunciada
              </p>
            ) : (
              <Button to={`/publicar/${item.id}`} size="sm" className="mt-3 w-full">
                Anunciar
              </Button>
            )}
          </div>
          )
        })}
      </div>
    </>
  )
}

function ListingsTab({ listings, getCard, onRemove, onReload }) {
  if (listings.length === 0) {
    return <EmptyState text="Você ainda não tem anúncios ativos." />
  }

  return (
    <ul className="space-y-4">
      {listings.map((listing) => (
        <ListingRow
          key={listing.id}
          listing={listing}
          card={getCard(listing.cardId)}
          onRemove={onRemove}
          onReload={onReload}
        />
      ))}
    </ul>
  )
}

function ListingRow({ listing, card, onRemove, onReload }) {
  const [editing, setEditing] = useState(false)
  const [price, setPrice] = useState(listing.price ?? 0)

  function handleSave() {
    updateListing(listing.id, { price: Math.max(1, Number(price)) })
    setEditing(false)
    onReload()
  }

  return (
    <li className="glass flex flex-wrap items-center gap-5 rounded-2xl border border-arcade-panel-light p-4">
      {card && <img src={card.images.small} alt={card.name} className="w-16 rounded-xl" />}

      <div className="min-w-0 flex-1">
        <Link to={`/carta/${listing.cardId}`} className="truncate font-medium text-ink">
          {card?.name ?? listing.cardId}
        </Link>
        <p className="mt-1 text-xs font-light text-ink-muted">
          {listing.condition} · {LISTING_TYPES[listing.type]}
        </p>
      </div>

      {isForSale(listing) &&
        (editing ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-28 rounded-full border border-arcade-panel-light bg-arcade-panel px-4 py-2 text-sm text-ink"
            />
            <Button size="sm" onClick={handleSave}>
              Salvar
            </Button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="font-mono-tabular text-lg text-ink transition-colors duration-300 hover:text-glow-rare"
          >
            {listing.price} PC
            <span className="ml-2 text-xs font-light text-ink-muted">editar</span>
          </button>
        ))}

      <Button variant="danger" size="sm" onClick={() => onRemove(listing.id)}>
        <TrashIcon width={14} height={14} />
        Remover
      </Button>
    </li>
  )
}

function HistoryTab({ transactions, getCard }) {
  if (transactions.length === 0) {
    return <EmptyState text="Nenhuma transação ainda." />
  }

  return (
    <ul className="space-y-3">
      {transactions.map((tx) => (
        <li
          key={tx.id}
          className="glass flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-arcade-panel-light p-5"
        >
          <div className="min-w-0">
            <p className={`text-sm font-medium ${TRANSACTION_TONE[tx.type] ?? 'text-ink'}`}>
              {TRANSACTION_LABEL[tx.type] ?? tx.type}
            </p>
            <p className="mt-0.5 truncate text-sm font-light text-ink-muted">
              {tx.cards.map((id) => getCard(id)?.name ?? id).join(', ')}
            </p>
            <p className="font-mono-tabular mt-1 text-[11px] text-ink-muted">
              {new Date(tx.date).toLocaleString('pt-BR')}
            </p>
          </div>
          <span className="font-mono-tabular text-xl text-ink">{tx.value} PC</span>
        </li>
      ))}
    </ul>
  )
}

function EmptyState({ text }) {
  return (
    <div className="glass rounded-3xl border border-arcade-panel-light px-10 py-16 text-center">
      <p className="font-light text-ink-muted">{text}</p>
    </div>
  )
}
