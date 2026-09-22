import { useMemo, useState } from 'react'
import { lazy, Suspense } from 'react'
import Button from '../components/Button'
import { ChevronDownIcon, PlusIcon, SearchIcon } from '../components/icons'
import ListingTile from '../components/ListingTile'
import RareCardsCarousel from '../components/RareCardsCarousel'
import { useAuth } from '../context/AuthContext'
import { useCards } from '../context/CardsContext'
import { isRare } from '../lib/cardRarity'
import { CONDITIONS, getCollection, getListings, isForSale, isForTrade } from '../lib/market'
import { shuffle } from '../lib/shuffle'

// O banner arrasta o three.js junto, que sozinho é a maior parte do bundle.
// Carregando sob demanda, o mercado aparece sem esperar por ele -- diferença
// enorme em conexão lenta.
const HeroBanner = lazy(() => import('../components/HeroBanner'))

const ALL = 'Todos'

// Filtro de exibição: escolhe quais seções da vitrine aparecem. Um anúncio do
// tipo "both" pertence às duas, de propósito.
const VIEW_OPTIONS = {
  [ALL]: 'all',
  'Só venda': 'sale',
  'Só troca': 'trade',
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="relative flex flex-col gap-1.5 text-xs font-light text-ink-muted">
      {label}
      <select
        value={value}
        onChange={onChange}
        className="appearance-none rounded-full border border-arcade-panel-light bg-arcade-panel py-2.5 pl-5 pr-10 text-sm font-light text-ink backdrop-blur-md"
      >
        {options.map((option) => (
          <option key={option} value={option} className="bg-arcade-bg">
            {option}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-4 top-9 text-ink-muted" />
    </label>
  )
}

export default function Home() {
  const { cards, cardsById, status, error, marketVersion } = useCards()
  const { user } = useAuth()

  const [search, setSearch] = useState('')
  const [type, setType] = useState(ALL)
  const [set, setSet] = useState(ALL)
  const [rarity, setRarity] = useState(ALL)
  const [condition, setCondition] = useState(ALL)
  const [listingType, setListingType] = useState(ALL)
  const [maxPrice, setMaxPrice] = useState('')

  const { listings, ownedCardIds } = useMemo(() => {
    if (status !== 'ready') return { listings: [], ownedCardIds: new Set() }
    return {
      listings: getListings(),
      ownedCardIds: new Set(getCollection(user.id).map((i) => i.cardId)),
    }
    // marketVersion não é lido aqui de propósito: ele é o sinal de que o
    // localStorage mudou, que o React não tem como observar sozinho.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, user.id, marketVersion])

  const types = useMemo(() => [ALL, ...new Set(cards.flatMap((c) => c.types ?? []))].sort(), [cards])
  const sets = useMemo(
    () => [ALL, ...new Set(cards.map((c) => c.set?.name).filter(Boolean))].sort(),
    [cards],
  )
  const rarities = useMemo(
    () => [ALL, ...new Set(cards.map((c) => c.rarity).filter(Boolean))].sort(),
    [cards],
  )

  const highlights = useMemo(() => shuffle(cards.filter(isRare)).slice(0, 14), [cards])

  const filtered = listings.filter((listing) => {
    const card = cardsById.get(listing.cardId)
    if (!card) return false

    if (search && !card.name.toLowerCase().includes(search.toLowerCase())) return false
    if (type !== ALL && !card.types?.includes(type)) return false
    if (set !== ALL && card.set?.name !== set) return false
    if (rarity !== ALL && card.rarity !== rarity) return false
    if (condition !== ALL && listing.condition !== condition) return false
    if (maxPrice && (!isForSale(listing) || listing.price > Number(maxPrice))) return false
    return true
  })

  const view = VIEW_OPTIONS[listingType]
  const forSale = filtered.filter(isForSale)
  const forTrade = filtered.filter(isForTrade)

  if (status === 'loading') {
    return (
      <div className="flex h-[60vh] items-center justify-center font-light text-ink-muted">
        Ligando a máquina...
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-2 text-center">
        <p className="text-glow-common">A máquina travou ao buscar as cartas.</p>
        <p className="text-sm text-ink-muted">{error}</p>
      </div>
    )
  }

  return (
    <div>
      <Suspense fallback={<div className="h-[52vh] max-h-[560px] min-h-[380px] w-full" />}>
        <HeroBanner />
      </Suspense>

      <section className="w-full">
        <RareCardsCarousel cards={highlights} />
      </section>

      <section className="mx-auto mt-20 max-w-[1600px] px-8">
        <h2 className="text-3xl font-bold tracking-tight text-ink">Mercado</h2>
        <p className="mt-1 text-sm font-light text-ink-muted">
          Cartas anunciadas por colecionadores.
        </p>

        <div className="mt-8 flex flex-wrap items-end gap-4">
          <div className="relative min-w-[260px] flex-1">
            <SearchIcon className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              type="text"
              placeholder="Buscar por nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-arcade-panel-light bg-arcade-panel py-3 pl-12 pr-5 text-sm font-light text-ink backdrop-blur-md placeholder:text-ink-muted"
            />
          </div>
          <Select label="Tipo" value={type} onChange={(e) => setType(e.target.value)} options={types} />
          <Select label="Edição" value={set} onChange={(e) => setSet(e.target.value)} options={sets} />
          <Select
            label="Raridade"
            value={rarity}
            onChange={(e) => setRarity(e.target.value)}
            options={rarities}
          />
          <Select
            label="Conservação"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            options={[ALL, ...CONDITIONS]}
          />
          <Select
            label="Mostrar"
            value={listingType}
            onChange={(e) => setListingType(e.target.value)}
            options={Object.keys(VIEW_OPTIONS)}
          />
          <label className="flex flex-col gap-1.5 text-xs font-light text-ink-muted">
            Preço até
            <input
              type="number"
              min="0"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="PC"
              className="w-28 rounded-full border border-arcade-panel-light bg-arcade-panel px-5 py-2.5 text-sm font-light text-ink backdrop-blur-md"
            />
          </label>
        </div>

        {filtered.length === 0 && (
          <p className="mt-16 text-center font-light text-ink-muted">
            Nenhum anúncio bateu com esses filtros — tente outra combinação.
          </p>
        )}
      </section>

      {(view === 'all' || view === 'sale') && (
        <MarketSection
          title="À venda"
          subtitle="Pague em PokeCoins e a carta vai direto para a sua coleção."
          accent="var(--color-glow-rare)"
          action={{ to: '/publicar?tipo=sale', label: 'Vender uma carta' }}
          listings={forSale}
          cardsById={cardsById}
          ownedCardIds={ownedCardIds}
          userId={user.id}
        />
      )}

      {(view === 'all' || view === 'trade') && (
        <MarketSection
          title="Abertas a troca"
          subtitle="Ofereça cartas da sua coleção no lugar de PokeCoins."
          accent="var(--color-glow-ultra-a)"
          action={{ to: '/publicar?tipo=trade', label: 'Colocar carta para troca' }}
          listings={forTrade}
          cardsById={cardsById}
          ownedCardIds={ownedCardIds}
          userId={user.id}
        />
      )}
    </div>
  )
}

function MarketSection({
  title,
  subtitle,
  accent,
  action,
  listings,
  cardsById,
  ownedCardIds,
  userId,
}) {
  // A seção aparece mesmo vazia quando tem ação: é por ela que o usuário
  // publica a primeira carta, então esconder deixaria o caminho inacessível.
  if (listings.length === 0 && !action) return null

  return (
    <section className="mx-auto mt-24 max-w-[1600px] px-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-arcade-panel-light pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: accent, boxShadow: `0 0 16px ${accent}` }}
            />
            <h2 className="text-5xl font-bold tracking-tight" style={{ color: accent }}>
              {title}
            </h2>
          </div>
          <p className="mt-2 font-light text-ink-muted">{subtitle}</p>
        </div>

        <div className="flex items-center gap-5">
          <span className="font-mono-tabular text-sm text-ink-muted">
            {listings.length} carta(s)
          </span>
          {action && (
            <Button to={action.to} variant="ghost" size="sm">
              <PlusIcon width={14} height={14} />
              {action.label}
            </Button>
          )}
        </div>
      </header>

      {listings.length === 0 && (
        <p className="mt-12 text-center font-light text-ink-muted">
          Nenhuma carta nesta seção ainda.
        </p>
      )}

      <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 lg:grid-cols-5">
        {listings.map((listing) => (
          <ListingTile
            key={listing.id}
            listing={listing}
            card={cardsById.get(listing.cardId)}
            owned={ownedCardIds.has(listing.cardId)}
            isOwn={listing.ownerId === userId}
          />
        ))}
      </div>
    </section>
  )
}
