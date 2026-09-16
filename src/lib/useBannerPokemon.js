import { useEffect, useState } from 'react'
import { getArtworkUrl, modelExists } from '../api/pokemon3d'

const MAX_SLIDES = 6
const MAX_CANDIDATES = 20

// Deriva os Pokémon do banner a partir das cartas em destaque: extrai os
// números de pokédex únicos, confirma quais têm modelo 3D disponível (nem
// todos têm — ver src/api/pokemon3d.js) e devolve os primeiros com modelo.
export function useBannerPokemon(highlightCards) {
  const [slides, setSlides] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    if (highlightCards.length === 0) return

    let cancelled = false

    const seen = new Set()
    const candidates = []
    for (const card of highlightCards) {
      const dexId = card.nationalPokedexNumbers?.[0]
      if (!dexId || seen.has(dexId)) continue
      seen.add(dexId)
      candidates.push({ dexId, name: card.name })
      if (candidates.length >= MAX_CANDIDATES) break
    }

    Promise.all(
      candidates.map(async (candidate) => ({
        ...candidate,
        hasModel: await modelExists(candidate.dexId),
      })),
    ).then((results) => {
      if (cancelled) return
      const withModel = results
        .filter((c) => c.hasModel)
        .slice(0, MAX_SLIDES)
        .map((c) => ({ ...c, artworkUrl: getArtworkUrl(c.dexId) }))

      setSlides(withModel)
      setStatus('ready')
    })

    return () => {
      cancelled = true
    }
  }, [highlightCards])

  return { slides, status }
}
