import { useEffect, useState } from 'react'
import { getCards } from '../api/pokemonTcg'

export function useCards() {
  const [cards, setCards] = useState([])
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    getCards()
      .then((data) => {
        if (cancelled) return
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

  return { cards, status, error }
}
