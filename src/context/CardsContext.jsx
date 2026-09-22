import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getCards } from '../api/pokemonTcg'
import { ensureMarketSeed } from '../lib/seed'
import { useAuth } from './AuthContext'

const CardsContext = createContext(null)

// Catálogo da Pokémon TCG API carregado uma única vez para o app inteiro —
// antes cada página refazia o fetch por conta própria.
export function CardsProvider({ children }) {
  const { user } = useAuth()
  const [cards, setCards] = useState([])
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [error, setError] = useState(null)
  const [marketVersion, setMarketVersion] = useState(0)

  useEffect(() => {
    let cancelled = false

    getCards()
      .then((data) => {
        if (cancelled) return
        // Semeia ANTES de liberar o status. Se isto ficasse num efeito, as
        // páginas renderizariam com status 'ready' e leriam o mercado ainda
        // vazio — efeito de pai roda depois do render dos filhos, e nada
        // dispararia uma nova leitura.
        ensureMarketSeed(data)
        setCards(data)
        setStatus('ready')
      })
      .catch((err) => {
        if (cancelled) return
        setError(err.message)
        setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [])

  // Quem acabou de se registrar precisa ganhar a coleção inicial, e o catálogo
  // só existe aqui. O contador avisa as páginas de que os dados mudaram.
  useEffect(() => {
    if (status !== 'ready' || !user?.id) return
    ensureMarketSeed(cards)
    setMarketVersion((v) => v + 1)
  }, [status, cards, user?.id])

  const cardsById = useMemo(() => new Map(cards.map((card) => [card.id, card])), [cards])

  const value = useMemo(
    () => ({
      cards,
      cardsById,
      status,
      error,
      marketVersion,
      getCard: (id) => cardsById.get(id) ?? null,
    }),
    [cards, cardsById, status, error, marketVersion],
  )

  return <CardsContext.Provider value={value}>{children}</CardsContext.Provider>
}

export function useCards() {
  const ctx = useContext(CardsContext)
  if (!ctx) throw new Error('useCards precisa estar dentro de um CardsProvider')
  return ctx
}
