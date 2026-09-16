import { useMemo, useState } from 'react'
import { isRare } from '../api/pokemonTcg'
import CardTile from '../components/CardTile'
import HeroBanner from '../components/HeroBanner'
import { ChevronDownIcon, SearchIcon } from '../components/icons'
import { shuffle } from '../lib/shuffle'
import { useCards } from '../lib/useCards'

const ALL = 'Todos'

function Select({ value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="appearance-none rounded-full border border-arcade-panel-light bg-arcade-panel py-2 pl-4 pr-9 text-sm text-ink focus-visible:ring-2 focus-visible:ring-glow-rare"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted" />
    </div>
  )
}

export default function Home() {
  const { cards, status, error } = useCards()

  const [search, setSearch] = useState('')
  const [type, setType] = useState(ALL)
  const [set, setSet] = useState(ALL)
  const [rarity, setRarity] = useState(ALL)

  const types = useMemo(
    () => [ALL, ...new Set(cards.flatMap((c) => c.types ?? []))].sort(),
    [cards],
  )
  const sets = useMemo(
    () => [ALL, ...new Set(cards.map((c) => c.set?.name).filter(Boolean))].sort(),
    [cards],
  )
  const rarities = useMemo(
    () => [ALL, ...new Set(cards.map((c) => c.rarity).filter(Boolean))].sort(),
    [cards],
  )

  // Destaques: mistura de cartas raras, embaralhadas a cada carregamento da página.
  const highlights = useMemo(() => shuffle(cards.filter(isRare)).slice(0, 10), [cards])

  const filtered = cards.filter((card) => {
    if (search && !card.name.toLowerCase().includes(search.toLowerCase())) return false
    if (type !== ALL && !card.types?.includes(type)) return false
    if (set !== ALL && card.set?.name !== set) return false
    if (rarity !== ALL && card.rarity !== rarity) return false
    return true
  })

  if (status === 'loading') {
    return (
      <div className="flex h-[60vh] items-center justify-center text-ink-muted">
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
    <div className="mx-auto max-w-6xl p-6">
      <HeroBanner highlightCards={highlights} />

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-ink">Vitrines em destaque</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10">
          {highlights.map((card) => (
            <CardTile key={card.id} card={card} />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-ink">Procurar cartas</h2>

        <div className="mt-4 flex flex-wrap gap-3">
          <div className="relative min-w-[220px] flex-1">
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              type="text"
              placeholder="Buscar por nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-arcade-panel-light bg-arcade-panel py-2 pl-11 pr-4 text-sm text-ink placeholder:text-ink-muted focus-visible:ring-2 focus-visible:ring-glow-rare"
            />
          </div>
          <Select value={type} onChange={(e) => setType(e.target.value)} options={types} />
          <Select value={set} onChange={(e) => setSet(e.target.value)} options={sets} />
          <Select value={rarity} onChange={(e) => setRarity(e.target.value)} options={rarities} />
        </div>

        <p className="mt-4 font-mono-tabular text-xs text-ink-muted">
          {filtered.length} carta(s) na vitrine
        </p>

        {filtered.length === 0 ? (
          <p className="mt-10 text-center text-ink-muted">
            Nenhuma carta acendeu com esses filtros — tente outra combinação.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {filtered.slice(0, 60).map((card) => (
              <CardTile key={card.id} card={card} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
