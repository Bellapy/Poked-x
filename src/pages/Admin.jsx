import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCards } from '../context/CardsContext'
import {
  getCollection,
  getListings,
  getUsers,
  isForSale,
  LISTING_TYPES,
  removeListing,
  updateListing,
  updateUser,
} from '../lib/market'
import { KEYS, readJSON, writeJSON } from '../lib/storage'
import { useReload } from '../lib/useReload'

const TABS = [
  { id: 'users', label: 'Usuários' },
  { id: 'listings', label: 'Cartas anunciadas' },
]

export default function Admin() {
  const { user, logout } = useAuth()
  const { getCard, status } = useCards()
  const [tab, setTab] = useState('users')
  const [version, reload] = useReload()

  const { users, listings, userNames } = useMemo(() => {
    const users = getUsers()
    return {
      users,
      listings: getListings(),
      userNames: new Map(users.map((u) => [u.id, u.name])),
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, status])

  function handleToggleBlock(target) {
    updateUser(target.id, { status: target.status === 'blocked' ? 'active' : 'blocked' })
    reload()
  }

  function handleRemoveUser(target) {
    writeJSON(
      KEYS.users,
      getUsers().filter((u) => u.id !== target.id),
    )

    // Uma conta removida não pode deixar anúncios órfãos no mercado.
    for (const listing of getListings().filter((l) => l.ownerId === target.id)) {
      removeListing(listing.id)
    }

    const collections = readJSON(KEYS.collections, {})
    delete collections[target.id]
    writeJSON(KEYS.collections, collections)

    reload()
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-bold text-ink">Administração</h1>

      <nav className="mt-6 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-2 text-sm ${
              tab === t.id
                ? 'bg-glow-rare text-arcade-bg'
                : 'border border-arcade-panel-light text-ink-muted hover:text-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'users' ? (
        <ul className="mt-6 space-y-3">
          {users.map((u) => (
            <li
              key={u.id}
              className="rounded-2xl border border-arcade-panel-light bg-arcade-panel p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">
                    {u.name}{' '}
                    <span className="text-xs text-ink-muted">
                      {u.role === 'admin' ? '· administrador' : ''}
                    </span>
                  </p>
                  <p className="text-xs text-ink-muted">{u.email}</p>
                  <p className="font-mono-tabular text-xs text-glow-rare">
                    {u.balance} PC · {getCollection(u.id).length} carta(s) na coleção
                  </p>
                  {u.status === 'blocked' && (
                    <p className="text-xs text-glow-common">Conta bloqueada</p>
                  )}
                </div>

                {u.id === user.id ? (
                  <span className="text-xs text-ink-muted">Você</span>
                ) : (
                  <div className="flex gap-3 text-xs">
                    <button
                      onClick={() => handleToggleBlock(u)}
                      className="text-ink-muted hover:text-ink"
                    >
                      {u.status === 'blocked' ? 'Desbloquear' : 'Bloquear'}
                    </button>
                    <button
                      onClick={() => handleRemoveUser(u)}
                      className="text-glow-common hover:text-ink"
                    >
                      Remover
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="mt-6 space-y-3">
          {listings.length === 0 && <p className="text-ink-muted">Nenhum anúncio no sistema.</p>}
          {listings.map((listing) => (
            <AdminListingRow
              key={listing.id}
              listing={listing}
              card={getCard(listing.cardId)}
              ownerName={userNames.get(listing.ownerId) ?? 'Conta removida'}
              onReload={reload}
            />
          ))}
        </ul>
      )}

      <button onClick={logout} className="mt-8 text-xs text-ink-muted hover:text-ink">
        Sair da conta
      </button>
    </div>
  )
}

function AdminListingRow({ listing, card, ownerName, onReload }) {
  const [editing, setEditing] = useState(false)
  const [price, setPrice] = useState(listing.price ?? 0)

  function handleSave() {
    updateListing(listing.id, { price: Math.max(1, Number(price)) })
    setEditing(false)
    onReload()
  }

  function handleRemove() {
    removeListing(listing.id)
    onReload()
  }

  return (
    <li className="flex items-center gap-4 rounded-2xl border border-arcade-panel-light bg-arcade-panel p-3">
      {card && <img src={card.images.small} alt={card.name} className="w-12 rounded-lg" />}

      <div className="min-w-0 flex-1">
        <Link to={`/carta/${listing.cardId}`} className="truncate font-medium text-ink">
          {card?.name ?? listing.cardId}
        </Link>
        <p className="text-xs text-ink-muted">
          {listing.condition} · {LISTING_TYPES[listing.type]} · {ownerName}
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
              className="w-24 rounded bg-arcade-bg px-2 py-1 text-sm text-ink"
            />
            <button onClick={handleSave} className="text-xs text-glow-rare">
              Salvar
            </button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="font-mono-tabular text-sm text-glow-rare">
            {listing.price} PC · editar
          </button>
        ))}

      <button onClick={handleRemove} className="text-xs text-ink-muted hover:text-ink">
        Remover
      </button>
    </li>
  )
}
