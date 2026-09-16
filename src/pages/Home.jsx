import { useMemo, useState } from 'react'
import { isRare } from '../api/pokemonTcg'
import CardTile from '../components/CardTile'
import HeroBanner from '../components/HeroBanner'
import { shuffle } from '../lib/shuffle'
import { useCards } from '../lib/useCards'

const ALL = 'Todos'

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
    return <div className="p-6 text-white/50">Carregando cartas...</div>
  }

  if (status === 'error') {
    return <div className="p-6 text-pokedex-red">Erro ao carregar cartas: {error}</div>
  }

  return (
    <div className="p-6">
      <HeroBanner highlightCards={highlights} />

      <section className="mt-10">
        <h2 className="text-2xl font-bold mb-4">Cartas em destaque</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-3">
          {highlights.map((card) => (
            <CardTile key={card.id} card={card} />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-bold mb-4">Buscar cartas</h2>

        <div className="flex flex-wrap gap-3 mb-6">
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white/10 rounded px-3 py-2 flex-1 min-w-[200px]"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="bg-white/10 rounded px-3 py-2"
          >
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            value={set}
            onChange={(e) => setSet(e.target.value)}
            className="bg-white/10 rounded px-3 py-2"
          >
            {sets.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={rarity}
            onChange={(e) => setRarity(e.target.value)}
            className="bg-white/10 rounded px-3 py-2"
          >
            {rarities.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <p className="text-white/40 text-sm mb-4">{filtered.length} carta(s) encontrada(s)</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {filtered.slice(0, 60).map((card) => (
            <CardTile key={card.id} card={card} />
          ))}
        </div>
      </section>
    </div>
  )
}
